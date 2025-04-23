# 心理諮詢預約微信小程式部署指南

## 前置準備

### 1. 微信開發者賬號
- 確保您已註冊微信開發者賬號
- 登錄微信公眾平台 (https://mp.weixin.qq.com/)
- 選擇「小程序」並完成開發者資質認證

### 2. 開發工具安裝
- 下載並安裝最新版本的微信開發者工具 (https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 使用您的微信開發者賬號登錄開發者工具

### 3. 獲取小程式 AppID
- 登錄微信公眾平台
- 進入「開發」-「開發設置」
- 記錄您的 AppID，這將用於小程式的配置

## 雲開發環境設置

### 1. 創建雲開發環境
- 在微信開發者工具中，導入本項目
- 點擊「雲開發」按鈕
- 點擊「創建環境」，建議環境名稱設為 `appointment-system-env`
- 選擇合適的計費模式（基礎版足夠日常使用）

### 2. 初始化數據庫
- 在雲開發控制台中，選擇「數據庫」
- 創建以下集合：
  - `doctors`（醫生集合）
  - `timeslots`（可預約時段集合）
  - `appointments`（預約記錄集合）
  - `patients`（患者集合）
  - `notifications`（通知記錄集合）
- 設置集合的權限：
  - `doctors`: 僅創建者可讀寫
  - `timeslots`: 所有用戶可讀，僅創建者可寫
  - `appointments`: 僅創建者可讀寫
  - `patients`: 僅創建者可讀寫
  - `notifications`: 僅創建者可讀寫

### 3. 上傳雲函數
- 在雲開發控制台中，選擇「雲函數」
- 點擊「新建雲函數」
- 上傳以下雲函數：
  - `login`（用於用戶登錄）
  - `batchCreateTimeslots`（批量創建時段）
  - `getAppointments`（獲取預約列表）
  - `getPatients`（獲取患者信息）
  - `getAvailableDates`（獲取可預約日期）
  - `getAvailableTimeslots`（獲取可預約時段）
  - `createAppointment`（創建預約）
  - `getAppointmentDetail`（獲取預約詳情）
  - `getMyAppointments`（獲取我的預約）
  - `cancelAppointment`（取消預約）
  - `exportAppointments`（導出預約表）
  - `notification`（通知系統）

### 4. 配置雲函數觸發器
- 為 `notification` 雲函數配置定時觸發器
- 觸發器名稱：`dailyReminder`
- 觸發周期：每天早上8點（Cron 表達式：`0 0 8 * * * *`）

### 5. 配置訂閱消息模板
- 登錄微信公眾平台
- 進入「開發」-「接口設置」-「訂閱消息」
- 添加以下模板：
  - 預約成功通知
  - 預約提醒通知
  - 預約取消通知
- 記錄各模板的 ID，並更新到 `notification` 雲函數中

## 小程式配置

### 1. 修改項目配置
- 打開 `project.config.json` 文件
- 將 `appid` 修改為您的小程式 AppID

### 2. 修改雲環境 ID
- 打開 `app.js` 文件
- 將 `env: 'appointment-system-env'` 修改為您創建的雲環境 ID

### 3. 更新訂閱消息模板 ID
- 打開 `functions/notification/index.js` 文件
- 將以下模板 ID 替換為您申請的模板 ID：
  - `APPOINTMENT_SUCCESS_TEMPLATE_ID`
  - `APPOINTMENT_REMINDER_TEMPLATE_ID`
  - `APPOINTMENT_CANCEL_TEMPLATE_ID`

### 4. 配置醫生信息
- 在雲開發控制台中，打開 `doctors` 集合
- 添加醫生記錄，包含以下字段：
  - `openid`：醫生的微信 openid（可通過調試獲取）
  - `name`：醫生姓名
  - `phone`：醫生聯繫電話
  - `title`：醫生職稱（可選）
  - `introduction`：醫生簡介（可選）
  - `avatar`：醫生頭像 URL（可選）
  - `created_at`：創建時間
  - `updated_at`：更新時間

## 部署與發布

### 1. 上傳代碼
- 在微信開發者工具中，點擊「上傳」按鈕
- 填寫版本號和項目備註
- 點擊「確定」上傳代碼

### 2. 提交審核
- 登錄微信公眾平台
- 進入「管理」-「版本管理」
- 選擇剛上傳的版本，點擊「提交審核」
- 填寫必要的審核信息
- 提交審核

### 3. 發布上線
- 審核通過後，點擊「發布」按鈕
- 確認發布信息
- 點擊「确定」完成發布

## 常見問題與解決方案

### 1. 雲函數部署失敗
- 檢查雲函數代碼是否有語法錯誤
- 確認雲開發環境是否正確配置
- 檢查雲函數依賴是否完整

### 2. 訂閱消息發送失敗
- 確認訂閱消息模板 ID 是否正確
- 檢查用戶是否已授權接收訂閱消息
- 確認發送時間是否在用戶授權的有效期內

### 3. 預約功能異常
- 檢查數據庫集合權限設置
- 確認時段狀態更新邏輯是否正確
- 檢查並發預約處理機制

### 4. 小程式無法正常啟動
- 確認 AppID 配置是否正確
- 檢查雲環境 ID 是否正確
- 確認小程式是否已發布上線

## 聯繫與支持

如有任何問題或需要技術支持，請聯繫：

- 技術支持郵箱：support@example.com
- 技術支持電話：+123 456 7890

我們將在工作時間內盡快回復您的問題。
