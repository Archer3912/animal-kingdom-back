//model/animal.js 做數據管理
const { DataTypes } = require('sequelize')
const sequelize = require('../util/db')


// 定義 animal 模型
const animalModel = sequelize.define(
  'animalModel',
  {
    //動物 ID（唯一識別碼）01
    animal_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    //動物編號（各收容所的識別碼）02
    animal_subid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //動物所屬縣市代碼 03
    animal_area_pkid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    //動物所屬收容所代碼 04
    animal_shelter_pkid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    //收容所名稱 05
    animal_place: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //動物類型06
    animal_kind: {
      type: DataTypes.INTEGER, //  const animalKind = ['狗', '貓', '其他']
      allowNull: false
    },
    //動物品種07
    animal_Variety: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //動物性別08
    animal_sex: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //體型09
    animal_bodytype: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //動物毛色10
    animal_colour: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //動物年齡（可能為空）11
    animal_age: {
      type: DataTypes.STRING
    },
    //是否已絕育（T：是，F：否）12
    animal_sterilization: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //是否已施打疫苗（T：是，F：否）13
    animal_bacterin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //發現地點14
    animal_foundplace: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //標題（通常為空）15
    animal_title: {
      type: DataTypes.STRING
    },
    //動物狀態[NONE | OPEN | ADOPTED | OTHER | DEAD]（未公告、開放認養、已認養、其他、死亡)16
    animal_status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //備註17
    animal_remark: {
      type: DataTypes.STRING
    },
    //動物說明（通常為空）18
    animal_caption: {
      type: DataTypes.STRING
    },
    //開放認養日期19
    animal_opendate: {
      type: DataTypes.DATE
    },
    //結束認養日期20
    animal_closeddate: {
      type: DataTypes.DATE
    },
    //動物資料最後更新日期21   updateAt? //Not overriding built-in method from model attribute: update
    animal_update: {
      type: DataTypes.DATE
    },
    //動物資料建立日期22
    animal_createtime: {
      type: DataTypes.DATE
    },
    //收容所名稱 23
    shelter_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    //動物照片網址24
    album_file: {
      type: DataTypes.STRING
    },
    //相簿更新時間25
    album_update: {
      type: DataTypes.DATE
    },
    //資料建立日期（可能與 createtime 相同）26
    cDate: {
      type: DataTypes.DATE
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
    tableName: 'animals', // 資料表名稱
    timestamps: false // 如果不需要自動生成 createdAt 和 updatedAt 時間戳欄位
  }
)


module.exports = animalModel