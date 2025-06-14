//model/article.js 做數據管理
const { DataTypes } = require('sequelize')
const sequelize = require('../util/db')

// 定義 article 模型
const articleModel = sequelize.define(
  'articleModel',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updateTime: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: 'article', // 資料表名稱
    timestamps: false // 如果不需要自動生成 createdAt 和 updatedAt 時間戳欄位
  }
)

module.exports = articleModel
