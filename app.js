// app.js - 小程式全局配置文件

App({
  onLaunch: function() {
    // 初始化雲開發環境
    if (!wx.cloud) {
      console.error('請使用 2.2.3 或以上的基礎庫以使用雲能力');
    } else {
      wx.cloud.init({
        env: 'appointment-system-env', // 雲開發環境ID，需要替換為實際環境ID
        traceUser: true,
      });
    }
    
    // 獲取用戶信息
    this.globalData = {
      userInfo: null,
      isDoctor: false, // 標記當前用戶是否為醫生
      doctorInfo: null // 存儲醫生信息
    };
  },
  
  // 檢查用戶是否為醫生
  checkDoctorStatus: function(openid) {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database();
      db.collection('doctors').where({
        openid: openid
      }).get().then(res => {
        if (res.data.length > 0) {
          this.globalData.isDoctor = true;
          this.globalData.doctorInfo = res.data[0];
          resolve(true);
        } else {
          this.globalData.isDoctor = false;
          resolve(false);
        }
      }).catch(err => {
        console.error('檢查醫生狀態失敗', err);
        reject(err);
      });
    });
  }
});
