const { Sequelize } = require('sequelize')

// 使用 process.env 來讀取環境變數
const sequelize = new Sequelize(
  process.env.DB_NAME, // 資料庫名稱
  process.env.DB_USER, // 資料庫使用者
  process.env.DB_PASSWORD, // 資料庫密碼
  {
    host: process.env.DB_HOST, // 主機
    dialect: process.env.DB_DIALECT , // 資料庫類型
    dialectOptions: {
      charset: 'utf8mb4' // 支援更多字元集
    },
    logging: false // 禁用 SQL 日誌
  }
)

module.exports = sequelize
