// service/animalList.js 做資料正確的判斷
const { Op } = require('sequelize')
const {
  animalModel,
  animalListModel,
  shelterModel,
  varietyModel,
  kindModel
} = require('../models')
const getKindByVariety = require('../util/kind')

class AnimalListService {
  async getAllAnimal(filters) {
    try {
      const whereClause = {}
      if (filters.shelter_pkid) whereClause.shelter_pkid = filters.shelter_pkid
      if (filters.sex) whereClause.sex = filters.sex
      if (filters.age) whereClause.age = filters.age
      if (filters.bodytype) whereClause.bodytype = filters.bodytype
      if (filters.colour) whereClause.colour = filters.colour

      const kindFilter = filters.kind
      const varietyFilter = filters.variety

      const page = Number(filters.page) || 1
      const limit = 10
      const offset = (page - 1) * limit

      const { count, rows } = await animalListModel.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        include: [
          {
            model: varietyModel,
            attributes: ['variety'],
            required: true,
            where: varietyFilter ? { variety: varietyFilter } : undefined,
            include: {
              model: kindModel,
              attributes: ['kind'],
              required: true,
              where: kindFilter ? { kind: kindFilter } : undefined
            }
          },
          {
            model: shelterModel,
            attributes: ['shelter_name', 'shelter_address', 'shelter_tel'],
            required: false
          }
        ]
      })

      const results = rows.map((animal) => ({
        id: animal.id,
        variety: animal.varietyModel.variety,
        kind: animal.varietyModel.kindModel.kind,
        sex: animal.sex,
        age: animal.age,
        bodytype: animal.bodytype,
        colour: animal.colour,
        shelter_name: animal.shelterModel.shelter_name,
        shelter_address: animal.shelterModel.shelter_address,
        shelter_tel: animal.shelterModel.shelter_tel
      }))

      return {
        data: results,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    } catch (error) {
      console.error('取得 animalList 資料失敗:', error)
      throw new Error('取得 animalList 資料失敗，請稍後再試')
    }
  }

  async getAnimalById(id) {
    try {
      const animal = await animalListModel.findOne({
        where: { id: id },
        include: [
          {
            model: varietyModel,
            attributes: ['variety'],
            required: true,
            include: [
              {
                model: kindModel,
                attributes: ['kind'],
                required: true
              }
            ]
          },
          {
            model: shelterModel,
            attributes: ['shelter_name', 'shelter_address', 'shelter_tel'],
            required: false
          }
        ]
      })

      if (!animal) {
        throw new Error(`找不到 ID 為 ${id} 的動物資料`)
      }

      return {
        id: animal.id,
        variety: animal.varietyModel.variety,
        kind: animal.varietyModel.kindModel.kind,
        sex: animal.sex,
        age: animal.age,
        bodytype: animal.bodytype,
        colour: animal.colour,
        shelter_name: animal.shelterModel.shelter_name,
        shelter_address: animal.shelterModel.shelter_address,
        shelter_tel: animal.shelterModel.shelter_tel
      }
    } catch (error) {
      console.error('取得動物資料失敗:', error)
      throw new Error('取得動物資料失敗')
    }
  }
  async syncAnimalList() {
    try {
      const animals = await animalModel.findAll()

      for (const animal of animals) {
        const variety = await varietyModel.findOne({
          where: { variety: animal.animal_Variety }
        })

        if (!variety) {
          // 找不到對應的 variety，記錄錯誤並拋出錯誤
          const errorMsg = `找不到 variety: ${animal.animal_Variety}，animal_id: ${animal.animal_id}`
          console.error(errorMsg) // 錯誤訊息顯示
          throw new Error(errorMsg) // 拋出錯誤
        }
        const existingListItem = await animalListModel.findOne({
          where: { animal_id: animal.animal_id }
        })

        const shelterPkid = animal.animal_shelter_pkid
        const varietyId = variety.id
        const newId = await this.createId(shelterPkid, varietyId)

        const listData = {
          id: newId,
          animal_id: animal.animal_id,
          shelter_pkid: animal.animal_shelter_pkid,
          variety_id: variety.id,
          sex: animal.animal_sex,
          age: animal.animal_age,
          bodytype: animal.animal_bodytype,
          colour: animal.animal_colour
        }

        if (existingListItem) {
          await existingListItem.update(listData)
        } else {
          const newId = await this.createId(
            animal.animal_shelter_pkid,
            variety.id
          )
          listData.id = newId
          await animalListModel.create(listData)
        }
      }

      return { message: 'animal_list 資料同步成功' }
    } catch (error) {
      console.error('同步 animal_list 資料失敗:', error)
      throw new Error('同步 animal_list 資料失敗')
    }
  }

  async createId(shelterPkid, varietyId) {
    // 把收容所和品種的編號補零
    const shelterStr = String(shelterPkid)
    const varietyStr = String(varietyId).padStart(2, '0')

    // 做出前綴：像 48002
    const prefix = shelterStr + varietyStr

    // 找出目前已有的最大 ID
    const lastEntry = await animalListModel.findOne({
      where: {
        id: { [Op.like]: prefix + '%' }
      },
      order: [['id', 'DESC']]
    })

    // 取出最新的流水號
    let serial = 1
    if (lastEntry) {
      const lastId = lastEntry.id
      const lastSerial = parseInt(lastId.slice(-4))
      serial = lastSerial + 1
    }

    // 把流水號補零
    const serialStr = String(serial).padStart(4, '0')

    // 組出完整 ID
    return prefix + serialStr
  }

  async createAnimal(data) {
    try {
      const sex = ['M', 'F', 'N']
      const defaultSex = 'N'
      const bodyType = ['SMALL', 'MEDIUM', 'BIG']

      data.sex = sex.includes(data.sex) ? data.sex : defaultSex

      if (!bodyType.includes(data.bodytype)) {
        throw new Error(`體型只能是 ${bodyType.join('/')} 其中之一`)
      }

      let varietyEntry = await varietyModel.findOne({
        where: { variety: data.variety }
      })

      if (!varietyEntry) {
        const kindName = getKindByVariety(data.variety)
        const kindEntry = await kindModel.findOne({ where: { kind: kindName } })

        varietyEntry = await varietyModel.create({
          variety: data.variety,
          kind_id: kindEntry.id
        })
      }

      const newId = await this.createId(
        data.shelter_pkid,
        varietyEntry.id
      )

      const newAnimal = await animalListModel.create({
        id: newId,
        shelter_pkid: data.shelter_pkid,
        variety_id: varietyEntry.id,
        sex: data.sex,
        age: data.age,
        bodytype: data.bodytype,
        colour: data.colour
      })

      return { message: '新增成功', id: newAnimal.id }
    } catch (error) {
      console.error('手動新增 animalList 錯誤:', error)
      throw new Error(error.message || '手動新增 animalList 失敗')
    }
  }

  async updateAnimal(id, animalData) {
    try {
      const animal = await animalListModel.findByPk(id)
      if (!animal) {
        throw new Error(`查無 ID 為 ${id} 的動物資料`)
      }

      // 只更新傳入的字段
      const updatedData = {}

      if (animalData.shelter_pkid)
        updatedData.shelter_pkid = animalData.shelter_pkid
      if (animalData.variety_id) updatedData.variety_id = animalData.variety_id
      if (animalData.sex) updatedData.sex = animalData.sex
      if (animalData.age) updatedData.age = animalData.age
      if (animalData.bodytype) updatedData.bodytype = animalData.bodytype
      if (animalData.colour) updatedData.colour = animalData.colour

      // 更新資料
      if (Object.keys(updatedData).length > 0) {
        await animal.update(updatedData)
      }

      return { message: `動物 ID ${id} 資料更新成功` }
    } catch (error) {
      console.error(`更新動物資料失敗: ${error.message}`)
      throw new Error('更新動物資料失敗')
    }
  }

  async deleteAnimal(id) {
    try {
      const animal = await animalListModel.findByPk(id)
      if (!animal) {
        throw new Error(`查無 ID 為 ${id} 的動物資料`)
      }

      await animal.destroy()
      return { message: `動物 ID ${id} 刪除成功` }
    } catch (error) {
      console.error(`刪除動物資料失敗: ${error.message}`)
      throw new Error('刪除動物資料失敗')
    }
  }
}

const animalListService = new AnimalListService()
module.exports = animalListService
