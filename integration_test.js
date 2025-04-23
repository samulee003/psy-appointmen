// tests/integration_test.js - 集成測試腳本

// 模擬微信環境
const wx = require('../mocks/wx-mock.js');
const cloud = require('../mocks/cloud-mock.js');

// 引入各模塊測試
const doctorTests = require('./doctor_interface_test.js');
const patientTests = require('./patient_interface_test.js');
const notificationTests = require('./notification_system_test.js');

// 測試完整預約流程
function testCompleteAppointmentFlow() {
  console.log('開始測試完整預約流程...');
  
  // 步驟1: 醫生生成時段
  console.log('步驟1: 醫生生成時段');
  const doctorPage = require('../pages/doctor/generate_timeslots/index.js');
  
  // 初始化醫生數據
  doctorPage.data = {
    year: 2025,
    month: 4,
    nextMonth: 5,
    nextYear: 2025,
    days: [],
    selectedDays: ['2025-05-01'],
    startTime: '09:00',
    endTime: '18:00',
    timeSlotDuration: 60,
    loading: false,
    doctorInfo: {
      _id: 'doctor123',
      name: '測試醫生'
    }
  };
  
  // 生成時段
  const timeslots = doctorPage.calculateTimeslots();
  const timeslotId = 'generated_timeslot_123';
  
  // 模擬雲函數返回數據
  cloud.mockCallFunctionResult('batchCreateTimeslots', {
    success: true,
    timeslotIds: [timeslotId]
  });
  
  doctorPage.generateTimeslots();
  
  // 步驟2: 患者預約
  console.log('步驟2: 患者預約');
  const patientPage = require('../pages/patient/index.js');
  
  // 初始化患者數據
  patientPage.data = {
    loading: false,
    currentDate: '2025-05-01',
    selectedDate: '2025-05-01',
    availableDates: ['2025-05-01'],
    timeslots: [{
      _id: timeslotId,
      doctor_id: 'doctor123',
      date: '2025-05-01',
      start_time: '09:00',
      end_time: '10:00',
      status: 0
    }],
    selectedTimeslot: null,
    showForm: false,
    patientInfo: {
      name: '',
      phone: ''
    }
  };
  
  // 選擇時段
  patientPage.selectTimeslot({ currentTarget: { dataset: { index: 0 } } });
  
  // 填寫患者信息
  patientPage.inputName({ detail: { value: '測試患者' } });
  patientPage.inputPhone({ detail: { value: '13800138000' } });
  
  // 模擬創建預約結果
  const appointmentId = 'test_appointment_123';
  cloud.mockCallFunctionResult('createAppointment', {
    success: true,
    appointmentId: appointmentId
  });
  
  // 提交預約
  patientPage.submitAppointment();
  
  // 步驟3: 醫生查看預約
  console.log('步驟3: 醫生查看預約');
  const appointmentListPage = require('../pages/doctor/appointment_list/index.js');
  
  // 初始化預約列表數據
  appointmentListPage.data = {
    doctorInfo: {
      _id: 'doctor123',
      name: '測試醫生'
    },
    appointments: [],
    patients: {},
    currentDate: '2025-05-01',
    loading: false,
    currentTab: 0,
    tabs: ['今日', '明日', '本週', '本月', '全部']
  };
  
  // 模擬預約列表查詢結果
  cloud.mockCallFunctionResult('getAppointments', {
    data: [{
      _id: appointmentId,
      doctor_id: 'doctor123',
      patient_id: 'patient123',
      timeslot_id: timeslotId,
      date: '2025-05-01',
      start_time: '09:00',
      end_time: '10:00',
      status: 0
    }]
  });
  
  cloud.mockCallFunctionResult('getPatients', {
    data: [{
      _id: 'patient123',
      name_decrypted: '測試患者',
      phone_decrypted: '13800138000'
    }]
  });
  
  // 加載預約列表
  appointmentListPage.loadAppointments();
  
  // 檢查預約是否顯示
  if (appointmentListPage.data.appointments.length !== 1) {
    console.error('預約列表加載錯誤，期望1條記錄，實際：' + appointmentListPage.data.appointments.length);
    return false;
  }
  
  // 步驟4: 系統發送通知
  console.log('步驟4: 系統發送通知');
  const notificationFunction = require('../functions/notification/index.js');
  
  // 模擬數據庫查詢結果
  cloud.mockDatabaseQueryResult('appointments', {
    data: {
      _id: appointmentId,
      patient_id: 'patient123',
      timeslot_id: timeslotId,
      status: 0
    }
  });
  
  cloud.mockDatabaseQueryResult('patients', {
    data: {
      _id: 'patient123',
      openid: 'patient_openid_123',
      name_encrypted: 'encrypted_name',
      phone_encrypted: 'encrypted_phone'
    }
  });
  
  cloud.mockDatabaseQueryResult('timeslots', {
    data: {
      _id: timeslotId,
      date: '2025-05-01',
      start_time: '09:00',
      end_time: '10:00'
    }
  });
  
  // 模擬訂閱消息發送結果
  cloud.mockOpenApiResult('subscribeMessage.send', {
    errCode: 0,
    errMsg: 'ok'
  });
  
  // 發送預約成功通知
  const notificationResult = notificationFunction.main({
    action: 'sendAppointmentSuccess',
    appointmentId: appointmentId
  });
  
  if (!notificationResult.success) {
    console.error('通知發送失敗：', notificationResult.message);
    return false;
  }
  
  console.log('完整預約流程測試通過！');
  return true;
}

// 測試並發預約處理
function testConcurrentAppointments() {
  console.log('開始測試並發預約處理...');
  
  // 模擬時段數據
  const timeslotId = 'timeslot_concurrent_test';
  
  // 模擬多個患者同時預約同一時段
  const patientPage1 = require('../pages/patient/index.js');
  const patientPage2 = require('../pages/patient/index.js');
  
  // 初始化患者1數據
  patientPage1.data = {
    selectedTimeslot: {
      _id: timeslotId,
      doctor_id: 'doctor123',
      date: '2025-05-01',
      start_time: '09:00',
      end_time: '10:00',
      status: 0
    },
    patientInfo: {
      name: '患者1',
      phone: '13800138001'
    }
  };
  
  // 初始化患者2數據
  patientPage2.data = {
    selectedTimeslot: {
      _id: timeslotId,
      doctor_id: 'doctor123',
      date: '2025-05-01',
      start_time: '09:00',
      end_time: '10:00',
      status: 0
    },
    patientInfo: {
      name: '患者2',
      phone: '13800138002'
    }
  };
  
  // 模擬第一個患者預約成功
  cloud.mockCallFunctionResult('createAppointment', {
    success: true,
    appointmentId: 'appointment_patient1'
  }, 0); // 第一次調用結果
  
  // 模擬第二個患者預約失敗（時段已被預約）
  cloud.mockCallFunctionResult('createAppointment', {
    success: false,
    message: '該時段已被預約'
  }, 1); // 第二次調用結果
  
  // 患者1提交預約
  const result1 = patientPage1.submitAppointment();
  
  // 患者2提交預約
  const result2 = patientPage2.submitAppointment();
  
  // 檢查結果
  if (!cloud.getCallFunctionParams('createAppointment', 0).timeslotId === timeslotId) {
    console.error('患者1預約參數錯誤');
    return false;
  }
  
  if (!cloud.getCallFunctionParams('createAppointment', 1).timeslotId === timeslotId) {
    console.error('患者2預約參數錯誤');
    return false;
  }
  
  console.log('並發預約處理測試通過！');
  return true;
}

// 執行所有測試
function runAllTests() {
  console.log('開始執行集成測試...');
  
  let allPassed = true;
  
  // 先執行各模塊的單元測試
  console.log('執行醫生端界面測試...');
  if (!doctorTests.runAllTests()) {
    allPassed = false;
  }
  
  console.log('執行患者端界面測試...');
  if (!patientTests.runAllTests()) {
    allPassed = false;
  }
  
  console.log('執行通知系統測試...');
  if (!notificationTests.runAllTests()) {
    allPassed = false;
  }
  
  // 執行集成測試
  console.log('執行完整預約流程測試...');
  if (!testCompleteAppointmentFlow()) {
    allPassed = false;
  }
  
  console.log('執行並發預約處理測試...');
  if (!testConcurrentAppointments()) {
    allPassed = false;
  }
  
  if (allPassed) {
    console.log('所有測試通過！');
  } else {
    console.error('測試存在失敗項！');
  }
  
  return allPassed;
}

// 導出測試函數
module.exports = {
  testCompleteAppointmentFlow,
  testConcurrentAppointments,
  runAllTests
};
