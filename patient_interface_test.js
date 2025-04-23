// tests/patient_interface_test.js - 患者端界面測試腳本

// 模擬微信環境
const wx = require('../mocks/wx-mock.js');
const cloud = require('../mocks/cloud-mock.js');

// 測試時段選擇功能
function testTimeslotSelection() {
  console.log('開始測試時段選擇功能...');
  
  // 模擬頁面實例
  const page = require('../pages/patient/index.js');
  
  // 初始化數據
  page.data = {
    loading: false,
    currentDate: '2025-04-23',
    selectedDate: '2025-04-23',
    availableDates: ['2025-04-23', '2025-04-24', '2025-04-25'],
    timeslots: [],
    selectedTimeslot: null,
    showForm: false,
    patientInfo: {
      name: '',
      phone: ''
    }
  };
  
  // 模擬雲函數返回數據
  cloud.mockCallFunctionResult('getAvailableTimeslots', {
    data: [
      {
        _id: 'timeslot1',
        doctor_id: 'doctor123',
        date: '2025-04-23',
        start_time: '09:00',
        end_time: '10:00',
        status: 0
      },
      {
        _id: 'timeslot2',
        doctor_id: 'doctor123',
        date: '2025-04-23',
        start_time: '10:00',
        end_time: '11:00',
        status: 0
      }
    ]
  });
  
  // 測試加載時段
  page.loadTimeslots();
  
  // 檢查時段數據
  if (page.data.timeslots.length !== 2) {
    console.error('時段加載錯誤，期望2個時段，實際：' + page.data.timeslots.length);
    return false;
  }
  
  // 測試選擇時段
  page.selectTimeslot({ currentTarget: { dataset: { index: 0 } } });
  
  // 檢查選擇結果
  if (!page.data.selectedTimeslot || page.data.selectedTimeslot._id !== 'timeslot1') {
    console.error('時段選擇錯誤，期望選中timeslot1，實際：', page.data.selectedTimeslot);
    return false;
  }
  
  if (!page.data.showForm) {
    console.error('表單顯示錯誤，選擇時段後應顯示表單');
    return false;
  }
  
  console.log('時段選擇功能測試通過！');
  return true;
}

// 測試患者信息填寫功能
function testPatientInfoForm() {
  console.log('開始測試患者信息填寫功能...');
  
  // 模擬頁面實例
  const page = require('../pages/patient/index.js');
  
  // 初始化數據
  page.data = {
    loading: false,
    selectedTimeslot: {
      _id: 'timeslot1',
      doctor_id: 'doctor123',
      date: '2025-04-23',
      start_time: '09:00',
      end_time: '10:00'
    },
    showForm: true,
    patientInfo: {
      name: '',
      phone: ''
    }
  };
  
  // 測試姓名輸入
  page.inputName({ detail: { value: '測試患者' } });
  if (page.data.patientInfo.name !== '測試患者') {
    console.error('姓名輸入錯誤，期望：測試患者，實際：' + page.data.patientInfo.name);
    return false;
  }
  
  // 測試電話輸入
  page.inputPhone({ detail: { value: '13800138000' } });
  if (page.data.patientInfo.phone !== '13800138000') {
    console.error('電話輸入錯誤，期望：13800138000，實際：' + page.data.patientInfo.phone);
    return false;
  }
  
  // 模擬雲函數返回數據
  cloud.mockCallFunctionResult('createAppointment', {
    success: true,
    appointmentId: 'appointment123'
  });
  
  // 測試提交預約
  page.submitAppointment();
  
  console.log('患者信息填寫功能測試通過！');
  return true;
}

// 測試預約成功頁面
function testAppointmentSuccess() {
  console.log('開始測試預約成功頁面...');
  
  // 模擬頁面實例
  const page = require('../pages/patient/appointment_success/index.js');
  
  // 初始化數據
  page.data = {
    appointmentId: 'appointment123',
    appointmentInfo: null,
    loading: true
  };
  
  // 模擬雲函數返回數據
  cloud.mockCallFunctionResult('getAppointmentDetail', {
    data: {
      _id: 'appointment123',
      date: '2025-04-23',
      start_time: '09:00',
      end_time: '10:00',
      patient_name: '測試患者',
      patient_phone: '13800138000'
    }
  });
  
  // 測試加載預約詳情
  page.loadAppointmentInfo();
  
  // 檢查預約信息
  if (!page.data.appointmentInfo || page.data.appointmentInfo._id !== 'appointment123') {
    console.error('預約詳情加載錯誤，期望ID：appointment123，實際：', page.data.appointmentInfo);
    return false;
  }
  
  console.log('預約成功頁面測試通過！');
  return true;
}

// 測試我的預約頁面
function testMyAppointments() {
  console.log('開始測試我的預約頁面...');
  
  // 模擬頁面實例
  const page = require('../pages/patient/my_appointments/index.js');
  
  // 初始化數據
  page.data = {
    appointments: [],
    loading: true
  };
  
  // 模擬雲函數返回數據
  cloud.mockCallFunctionResult('getMyAppointments', {
    data: [
      {
        _id: 'appointment1',
        date: '2025-04-23',
        start_time: '09:00',
        end_time: '10:00',
        status: 0
      },
      {
        _id: 'appointment2',
        date: '2025-04-24',
        start_time: '10:00',
        end_time: '11:00',
        status: 0
      }
    ]
  });
  
  // 測試加載我的預約列表
  page.loadMyAppointments();
  
  // 檢查預約數據
  if (page.data.appointments.length !== 2) {
    console.error('我的預約列表加載錯誤，期望2條記錄，實際：' + page.data.appointments.length);
    return false;
  }
  
  console.log('我的預約頁面測試通過！');
  return true;
}

// 執行所有測試
function runAllTests() {
  console.log('開始執行患者端界面測試...');
  
  let allPassed = true;
  
  if (!testTimeslotSelection()) {
    allPassed = false;
  }
  
  if (!testPatientInfoForm()) {
    allPassed = false;
  }
  
  if (!testAppointmentSuccess()) {
    allPassed = false;
  }
  
  if (!testMyAppointments()) {
    allPassed = false;
  }
  
  if (allPassed) {
    console.log('所有患者端界面測試通過！');
  } else {
    console.error('患者端界面測試存在失敗項！');
  }
  
  return allPassed;
}

// 導出測試函數
module.exports = {
  testTimeslotSelection,
  testPatientInfoForm,
  testAppointmentSuccess,
  testMyAppointments,
  runAllTests
};
