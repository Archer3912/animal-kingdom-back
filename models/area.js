//model/area.js 做數據管理
const { DataTypes } = require('sequelize')
const sequelize = require('../util/db')

// 定義 area 模型
const areaModel = sequelize.define(
  'areaModel',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'areas', // 資料表名稱
    timestamps: false // 如果不需要自動生成 createdAt 和 updatedAt 時間戳欄位
  }
)

module.exports = areaModel
