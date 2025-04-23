// tests/doctor_interface_test.js - 醫生端界面測試腳本

// 模擬微信環境
const wx = require('../mocks/wx-mock.js');
const cloud = require('../mocks/cloud-mock.js');

// 測試批量生成時段功能
function testGenerateTimeslots() {
  console.log('開始測試批量生成時段功能...');
  
  // 模擬頁面實例
  const page = require('../pages/doctor/generate_timeslots/index.js');
  
  // 初始化數據
  page.data = {
    year: 2025,
    month: 4,
    nextMonth: 5,
    nextYear: 2025,
    days: [],
    selectedDays: [],
    startTime: '09:00',
    endTime: '18:00',
    timeSlotDuration: 60,
    loading: false,
    doctorInfo: {
      _id: 'doctor123',
      name: '測試醫生'
    }
  };
  
  // 測試生成日曆天數
  page.generateCalendarDays();
  console.log(`生成的天數: ${page.data.days.length}`);
  if (page.data.days.length !== 31) {
    console.error('日曆天數生成錯誤，期望31天，實際：' + page.data.days.length);
    return false;
  }
  
  // 測試選擇工作日
  page.selectAllWeekdays();
  console.log(`選擇的工作日數量: ${page.data.selectedDays.length}`);
  if (page.data.selectedDays.length !== 22) { // 假設5月有22個工作日
    console.error('工作日選擇錯誤，期望22天，實際：' + page.data.selectedDays.length);
    return false;
  }
  
  // 測試計算時段
  const timeslots = page.calculateTimeslots();
  console.log(`生成的時段數量: ${timeslots.length}`);
  
  // 檢查第一個時段的格式
  const firstTimeslot = timeslots[0];
  if (!firstTimeslot.doctor_id || !firstTimeslot.date || !firstTimeslot.start_time || !firstTimeslot.end_time) {
    console.error('時段格式錯誤：', firstTimeslot);
    return false;
  }
  
  console.log('批量生成時段功能測試通過！');
  return true;
}

// 測試預約列表查看功能
function testAppointmentList() {
  console.log('開始測試預約列表查看功能...');
  
  // 模擬頁面實例
  const page = require('../pages/doctor/appointment_list/index.js');
  
  // 初始化數據
  page.data = {
    doctorInfo: {
      _id: 'doctor123',
      name: '測試醫生'
    },
    appointments: [],
    patients: {},
    currentDate: '2025-04-23',
    loading: false,
    currentTab: 0,
    tabs: ['今日', '明日', '本週', '本月', '全部']
  };
  
  // 模擬雲函數返回數據
  cloud.mockCallFunctionResult('getAppointments', {
    data: [
      {
        _id: 'appointment1',
        doctor_id: 'doctor123',
        patient_id: 'patient1',
        timeslot_id: 'timeslot1',
        date: '2025-04-23',
        start_time: '09:00',
        end_time: '10:00',
        status: 0
      },
      {
        _id: 'appointment2',
        doctor_id: 'doctor123',
        patient_id: 'patient2',
        timeslot_id: 'timeslot2',
        date: '2025-04-23',
        start_time: '10:00',
        end_time: '11:00',
        status: 0
      }
    ]
  });
  
  cloud.mockCallFunctionResult('getPatients', {
    data: [
      {
        _id: 'patient1',
        name_decrypted: '測試患者1',
        phone_decrypted: '13800138001'
      },
      {
        _id: 'patient2',
        name_decrypted: '測試患者2',
        phone_decrypted: '13800138002'
      }
    ]
  });
  
  // 測試加載預約列表
  page.loadAppointments();
  
  // 檢查預約數據
  if (page.data.appointments.length !== 2) {
    console.error('預約列表加載錯誤，期望2條記錄，實際：' + page.data.appointments.length);
    return false;
  }
  
  // 測試切換標籤頁
  page.switchTab({ currentTarget: { dataset: { index: 1 } } });
  if (page.data.currentTab !== 1) {
    console.error('標籤頁切換錯誤，期望1，實際：' + page.data.currentTab);
    return false;
  }
  
  console.log('預約列表查看功能測試通過！');
  return true;
}

// 測試導出預約表功能
function testExportAppointments() {
  console.log('開始測試導出預約表功能...');
  
  // 模擬頁面實例
  const page = require('../pages/doctor/export_appointments/index.js');
  
  // 初始化數據
  page.data = {
    doctorInfo: {
      _id: 'doctor123',
      name: '測試醫生'
    },
    dateRange: {
      start: '2025-04-01',
      end: '2025-04-30'
    },
    qrCodeUrl: '',
    exportStatus: 'ready',
    loading: false
  };
  
  // 模擬雲函數返回數據
  cloud.mockCallFunctionResult('exportAppointments', {
    qrCodeUrl: 'https://example.com/qrcode.jpg'
  });
  
  // 測試生成導出二維碼
  page.generateExportQRCode();
  
  // 檢查結果
  if (page.data.qrCodeUrl !== 'https://example.com/qrcode.jpg') {
    console.error('導出二維碼生成錯誤，期望URL：https://example.com/qrcode.jpg，實際：' + page.data.qrCodeUrl);
    return false;
  }
  
  if (page.data.exportStatus !== 'success') {
    console.error('導出狀態錯誤，期望：success，實際：' + page.data.exportStatus);
    return false;
  }
  
  console.log('導出預約表功能測試通過！');
  return true;
}

// 執行所有測試
function runAllTests() {
  console.log('開始執行醫生端界面測試...');
  
  let allPassed = true;
  
  if (!testGenerateTimeslots()) {
    allPassed = false;
  }
  
  if (!testAppointmentList()) {
    allPassed = false;
  }
  
  if (!testExportAppointments()) {
    allPassed = false;
  }
  
  if (allPassed) {
    console.log('所有醫生端界面測試通過！');
  } else {
    console.error('醫生端界面測試存在失敗項！');
  }
  
  return allPassed;
}

// 導出測試函數
module.exports = {
  testGenerateTimeslots,
  testAppointmentList,
  testExportAppointments,
  runAllTests
};
