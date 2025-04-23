// tests/notification_system_test.js - 通知系統測試腳本

// 模擬微信環境
const wx = require('../mocks/wx-mock.js');
const cloud = require('../mocks/cloud-mock.js');

// 測試預約成功通知
function testAppointmentSuccessNotification() {
  console.log('開始測試預約成功通知...');
  
  // 模擬雲函數環境
  const notificationFunction = require('../functions/notification/index.js');
  
  // 模擬預約數據
  const appointmentId = 'appointment123';
  
  // 模擬數據庫查詢結果
  cloud.mockDatabaseQueryResult('appointments', {
    data: {
      _id: appointmentId,
      patient_id: 'patient123',
      timeslot_id: 'timeslot123',
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
      _id: 'timeslot123',
      date: '2025-04-23',
      start_time: '09:00',
      end_time: '10:00'
    }
  });
  
  // 模擬訂閱消息發送結果
  cloud.mockOpenApiResult('subscribeMessage.send', {
    errCode: 0,
    errMsg: 'ok'
  });
  
  // 測試發送預約成功通知
  const result = notificationFunction.main({
    action: 'sendAppointmentSuccess',
    appointmentId: appointmentId
  });
  
  // 檢查結果
  if (!result.success) {
    console.error('預約成功通知發送失敗：', result.message);
    return false;
  }
  
  console.log('預約成功通知測試通過！');
  return true;
}

// 測試預約提醒通知
function testAppointmentReminderNotification() {
  console.log('開始測試預約提醒通知...');
  
  // 模擬雲函數環境
  const notificationFunction = require('../functions/notification/index.js');
  
  // 模擬預約數據
  const appointmentId = 'appointment123';
  
  // 模擬數據庫查詢結果
  cloud.mockDatabaseQueryResult('appointments', {
    data: {
      _id: appointmentId,
      patient_id: 'patient123',
      timeslot_id: 'timeslot123',
      status: 0,
      reminder_sent: false
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
      _id: 'timeslot123',
      date: '2025-04-24', // 明天的日期
      start_time: '09:00',
      end_time: '10:00'
    }
  });
  
  // 模擬訂閱消息發送結果
  cloud.mockOpenApiResult('subscribeMessage.send', {
    errCode: 0,
    errMsg: 'ok'
  });
  
  // 測試發送預約提醒通知
  const result = notificationFunction.main({
    action: 'sendAppointmentReminder',
    appointmentId: appointmentId
  });
  
  // 檢查結果
  if (!result.success) {
    console.error('預約提醒通知發送失敗：', result.message);
    return false;
  }
  
  // 檢查預約記錄是否更新了提醒狀態
  const updatedAppointment = cloud.getUpdatedDocument('appointments', appointmentId);
  if (!updatedAppointment || !updatedAppointment.reminder_sent) {
    console.error('預約提醒狀態更新失敗');
    return false;
  }
  
  console.log('預約提醒通知測試通過！');
  return true;
}

// 測試預約取消通知
function testAppointmentCancelNotification() {
  console.log('開始測試預約取消通知...');
  
  // 模擬雲函數環境
  const notificationFunction = require('../functions/notification/index.js');
  
  // 模擬預約數據
  const appointmentId = 'appointment123';
  const cancelReason = '醫生臨時有事';
  
  // 模擬數據庫查詢結果
  cloud.mockDatabaseQueryResult('appointments', {
    data: {
      _id: appointmentId,
      patient_id: 'patient123',
      timeslot_id: 'timeslot123',
      status: 2 // 已取消
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
      _id: 'timeslot123',
      date: '2025-04-23',
      start_time: '09:00',
      end_time: '10:00'
    }
  });
  
  // 模擬訂閱消息發送結果
  cloud.mockOpenApiResult('subscribeMessage.send', {
    errCode: 0,
    errMsg: 'ok'
  });
  
  // 測試發送預約取消通知
  const result = notificationFunction.main({
    action: 'sendAppointmentCancel',
    appointmentId: appointmentId,
    cancelReason: cancelReason
  });
  
  // 檢查結果
  if (!result.success) {
    console.error('預約取消通知發送失敗：', result.message);
    return false;
  }
  
  console.log('預約取消通知測試通過！');
  return true;
}

// 測試定時提醒功能
function testScheduleDailyReminders() {
  console.log('開始測試定時提醒功能...');
  
  // 模擬雲函數環境
  const notificationFunction = require('../functions/notification/index.js');
  
  // 獲取明天的日期
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = formatDate(tomorrow);
  
  // 模擬數據庫查詢結果 - 明天有兩個預約需要提醒
  cloud.mockDatabaseQueryResult('appointments', {
    data: [
      {
        _id: 'appointment1',
        patient_id: 'patient1',
        timeslot_id: 'timeslot1',
        date: tomorrowDate,
        status: 0,
        reminder_sent: false
      },
      {
        _id: 'appointment2',
        patient_id: 'patient2',
        timeslot_id: 'timeslot2',
        date: tomorrowDate,
        status: 0,
        reminder_sent: false
      }
    ]
  });
  
  // 模擬發送提醒的結果
  cloud.mockFunctionResult('sendAppointmentReminder', { success: true });
  
  // 測試執行定時提醒任務
  const result = notificationFunction.main({
    action: 'scheduleDailyReminders'
  });
  
  // 檢查結果
  if (!result.success) {
    console.error('定時提醒任務執行失敗：', result.message);
    return false;
  }
  
  if (result.results.length !== 2) {
    console.error('提醒數量錯誤，期望2個提醒，實際：' + result.results.length);
    return false;
  }
  
  console.log('定時提醒功能測試通過！');
  return true;
}

// 格式化日期輔助函數
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 執行所有測試
function runAllTests() {
  console.log('開始執行通知系統測試...');
  
  let allPassed = true;
  
  if (!testAppointmentSuccessNotification()) {
    allPassed = false;
  }
  
  if (!testAppointmentReminderNotification()) {
    allPassed = false;
  }
  
  if (!testAppointmentCancelNotification()) {
    allPassed = false;
  }
  
  if (!testScheduleDailyReminders()) {
    allPassed = false;
  }
  
  if (allPassed) {
    console.log('所有通知系統測試通過！');
  } else {
    console.error('通知系統測試存在失敗項！');
  }
  
  return allPassed;
}

// 導出測試函數
module.exports = {
  testAppointmentSuccessNotification,
  testAppointmentReminderNotification,
  testAppointmentCancelNotification,
  testScheduleDailyReminders,
  runAllTests
};
