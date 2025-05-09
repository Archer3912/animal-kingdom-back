//model/animal_list.js 做數據管理
const { DataTypes } = require('sequelize')
const sequelize = require('../util/db')

// 定義 animal 模型
const animalListModel = sequelize.define(
  'animalListModel',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    animal_id: {
      type: DataTypes.INTEGER
    },
    shelter_pkid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    variety_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sex: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: {
      type: DataTypes.STRING
    },
    bodytype: {
      type: DataTypes.STRING,
      allowNull: false
    },
    colour: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'animal_list', // 資料表名稱
    timestamps: false // 如果不需要自動生成 createdAt 和 updatedAt 時間戳欄位
  }
)

module.exports = animalListModel
