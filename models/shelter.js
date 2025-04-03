//model/shelter.js 做數據管理
const { DataTypes } = require('sequelize')
const sequelize = require('../util/db')

// 定義 animal 模型
const shelterModel = sequelize.define(
  'shelterModel',
  {
    //動物所屬收容所代碼04
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    //收容所名稱 23
    shelter_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //收容所地址 27
    shelter_address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //收容所電話 28
    shelter_tel: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'shelters', // 資料表名稱
    timestamps: false // 如果不需要自動生成 createdAt 和 updatedAt 時間戳欄位
  }
)


module.exports = shelterModel