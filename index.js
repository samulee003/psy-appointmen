// pages/doctor/index.js - 醫生端首頁

Page({
  data: {
    doctorInfo: null,
    appointmentStats: {
      today: 0,
      tomorrow: 0,
      thisWeek: 0,
      thisMonth: 0
    },
    loading: true
  },

  onLoad: function() {
    // 獲取全局數據
    const app = getApp();
    
    // 檢查是否為醫生
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        const openid = res.result.openid;
        app.checkDoctorStatus(openid).then(isDoctor => {
          if (isDoctor) {
            this.setData({
              doctorInfo: app.globalData.doctorInfo,
              loading: false
            });
            this.loadAppointmentStats();
          } else {
            wx.showModal({
              title: '提示',
              content: '您不是系統註冊的醫生，無法訪問此頁面',
              showCancel: false,
              success: () => {
                wx.redirectTo({
                  url: '/pages/index/index',
                });
              }
            });
          }
        }).catch(err => {
          console.error('檢查醫生狀態失敗', err);
          this.setData({ loading: false });
        });
      },
      fail: err => {
        console.error('調用雲函數失敗', err);
        this.setData({ loading: false });
      }
    });
  },

  onShow: function() {
    if (this.data.doctorInfo) {
      this.loadAppointmentStats();
    }
  },

  // 加載預約統計數據
  loadAppointmentStats: function() {
    const db = wx.cloud.database();
    const _ = db.command;
    const doctorId = this.data.doctorInfo._id;
    
    // 獲取當前日期
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 獲取本週開始和結束日期
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    // 獲取本月開始和結束日期
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // 查詢今日預約
    db.collection('appointments')
      .where({
        doctor_id: doctorId,
        status: 0, // 已預約狀態
        date: today.toISOString().split('T')[0]
      })
      .count()
      .then(res => {
        this.setData({
          'appointmentStats.today': res.total
        });
      });
    
    // 查詢明日預約
    db.collection('appointments')
      .where({
        doctor_id: doctorId,
        status: 0, // 已預約狀態
        date: tomorrow.toISOString().split('T')[0]
      })
      .count()
      .then(res => {
        this.setData({
          'appointmentStats.tomorrow': res.total
        });
      });
    
    // 查詢本週預約
    db.collection('appointments')
      .where({
        doctor_id: doctorId,
        status: 0, // 已預約狀態
        date: _.gte(weekStart.toISOString().split('T')[0]).and(_.lt(weekEnd.toISOString().split('T')[0]))
      })
      .count()
      .then(res => {
        this.setData({
          'appointmentStats.thisWeek': res.total
        });
      });
    
    // 查詢本月預約
    db.collection('appointments')
      .where({
        doctor_id: doctorId,
        status: 0, // 已預約狀態
        date: _.gte(monthStart.toISOString().split('T')[0]).and(_.lt(monthEnd.toISOString().split('T')[0]))
      })
      .count()
      .then(res => {
        this.setData({
          'appointmentStats.thisMonth': res.total
        });
      });
  },

  // 跳轉到批量生成時段頁面
  navigateToGenerateTimeslots: function() {
    wx.navigateTo({
      url: '/pages/doctor/generate_timeslots/index',
    });
  },

  // 跳轉到預約列表頁面
  navigateToAppointmentList: function() {
    wx.navigateTo({
      url: '/pages/doctor/appointment_list/index',
    });
  },

  // 跳轉到導出預約表頁面
  navigateToExportAppointments: function() {
    wx.navigateTo({
      url: '/pages/doctor/export_appointments/index',
    });
  },

  // 跳轉到時段管理頁面
  navigateToTimeslotManagement: function() {
    wx.navigateTo({
      url: '/pages/doctor/timeslot_management/index',
    });
  }
});
