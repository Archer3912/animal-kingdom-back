//model/kind.js 做數據管理
const { DataTypes } = require('sequelize')
const sequelize = require('../util/db')

// 定義 animal 模型
const kindModel = sequelize.define(
  'kindModel',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    kind: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'kind', // 資料表名稱
    timestamps: false // 如果不需要自動生成 createdAt 和 updatedAt 時間戳欄位
  }
)

module.exports = kindModel
