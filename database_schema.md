# 心理諮詢預約微信小程式數據庫設計

## 數據庫集合設計

基於微信雲開發的雲數據庫，我們將設計以下集合（Collections）來支持心理諮詢預約系統的功能需求：

### 1. doctors（醫生集合）

```javascript
{
  _id: "string", // 系統自動生成的唯一ID
  openid: "string", // 醫生的微信openid，用於身份驗證
  name: "string", // 醫生姓名
  phone: "string", // 醫生聯繫電話
  title: "string", // 醫生職稱（可選）
  introduction: "string", // 醫生簡介（可選）
  avatar: "string", // 醫生頭像URL（可選）
  created_at: "timestamp", // 創建時間
  updated_at: "timestamp" // 更新時間
}
```

### 2. timeslots（可預約時段集合）

```javascript
{
  _id: "string", // 系統自動生成的唯一ID
  doctor_id: "string", // 關聯的醫生ID
  date: "string", // 日期，格式：YYYY-MM-DD
  start_time: "string", // 開始時間，格式：HH:MM
  end_time: "string", // 結束時間，格式：HH:MM
  status: "number", // 狀態：0-可預約，1-已預約，2-已取消
  created_at: "timestamp", // 創建時間
  updated_at: "timestamp" // 更新時間
}
```

### 3. appointments（預約記錄集合）

```javascript
{
  _id: "string", // 系統自動生成的唯一ID
  timeslot_id: "string", // 關聯的時段ID
  doctor_id: "string", // 關聯的醫生ID
  patient_id: "string", // 關聯的患者ID
  status: "number", // 狀態：0-已預約，1-已完成，2-已取消
  reminder_sent: "boolean", // 是否已發送提醒
  created_at: "timestamp", // 創建時間
  updated_at: "timestamp" // 更新時間
}
```

### 4. patients（患者集合）

```javascript
{
  _id: "string", // 系統自動生成的唯一ID
  openid: "string", // 患者的微信openid，用於身份關聯
  name_encrypted: "string", // 加密存儲的患者姓名
  phone_encrypted: "string", // 加密存儲的患者電話
  created_at: "timestamp", // 創建時間
  updated_at: "timestamp" // 更新時間
}
```

### 5. notifications（通知記錄集合）

```javascript
{
  _id: "string", // 系統自動生成的唯一ID
  appointment_id: "string", // 關聯的預約ID
  patient_id: "string", // 關聯的患者ID
  type: "number", // 通知類型：0-預約成功，1-預約提醒，2-預約取消
  status: "number", // 狀態：0-待發送，1-已發送，2-發送失敗
  scheduled_time: "timestamp", // 計劃發送時間
  sent_time: "timestamp", // 實際發送時間
  created_at: "timestamp", // 創建時間
  updated_at: "timestamp" // 更新時間
}
```

## 數據關係圖

```
doctors (1) ------ (n) timeslots
                       |
                       | (1)
                       |
                       v
patients (1) ----- (n) appointments (1) ----- (n) notifications
```

## 數據加密策略

為保護患者隱私，我們將對患者的敏感信息進行加密存儲：

1. **加密方法**：使用微信雲開發提供的加密API
2. **加密字段**：患者姓名（name_encrypted）和電話（phone_encrypted）
3. **解密權限**：只有授權的醫生端可以解密查看患者信息

## 數據操作權限設計

### 醫生端權限

1. 讀取和修改自己創建的時段
2. 讀取關聯到自己的預約記錄
3. 解密查看患者信息
4. 導出預約表

### 患者端權限

1. 只讀取可預約的時段
2. 創建新的預約記錄
3. 查看自己的預約記錄
4. 無法直接取消預約（需通過其他方式聯繫醫生）

## 索引設計

為提高查詢效率，我們將創建以下索引：

1. timeslots 集合：
   - doctor_id + date（複合索引）
   - status（單字段索引）

2. appointments 集合：
   - timeslot_id（單字段索引）
   - patient_id（單字段索引）
   - doctor_id + status（複合索引）

3. notifications 集合：
   - status + scheduled_time（複合索引）

## 數據一致性保障

為確保數據一致性，特別是防止重複預約，我們將：

1. 使用雲數據庫事務功能
2. 在預約時進行狀態檢查和原子更新
3. 使用樂觀鎖機制處理並發預約請求
