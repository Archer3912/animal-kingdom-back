//model/variety.js 做數據管理
const { DataTypes } = require('sequelize')
const sequelize = require('../util/db')

// 定義 animal 模型
const varietyModel = sequelize.define(
  'varietyModel',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    kind_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    variety: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'variety', // 資料表名稱
    timestamps: false // 如果不需要自動生成 createdAt 和 updatedAt 時間戳欄位
  }
)

module.exports = varietyModel
