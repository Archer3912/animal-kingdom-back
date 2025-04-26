//service/animal.js 做資料正確的判斷
//顯示錯誤的訊息做分類
const axios = require('axios')
const { Op } = require('sequelize')
const {
  animalModel,
  areaModel,
  shelterModel,
  kindModel,
  varietyModel,
  animalListModel
} = require('../models')
const getKindByVariety = require('../util/kind')

class AnimalService {
  constructor() {
    this.animalCache = null
    this.animalCacheTimestamp = 0
    this.cacheTTL = 60 * 1000 // 緩存有效時間（60秒）
  }

  async getAllAnimal(filters) {
    try {
      const whereClause = {}
      if (filters.id) whereClause.id = filters.id
      if (filters.shelter_pkid) whereClause.shelter_pkid = filters.shelter_pkid
      if (filters.bigint) whereClause.bigint = filters.bigint
      if (filters.sex) whereClause.sex = filters.sex
      if (filters.age) whereClause.age = filters.age
      if (filters.bodytype) whereClause.bodytype = filters.bodytype
      if (filters.colour) whereClause.colour = filters.colour

      const kindFilter = filters.kind
      const varietyFilter = filters.variety

      const page = filters.page || 1
      const limit = filters.limit || 10
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
        bigint: animal.bigint,
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
        bigint: animal.bigint,
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

  async fetchAndSaveAnimals() {
    let changes = []
    const kindCache = new Map()
    const varietyCache = new Map()
    const cleanVariety = (str) => {
      return (str || '')
        .replace(/[\s\u3000]/g, '') // 去除所有半形與全形空白
        .replace(/\r?\n|\r/g, '') // 去除換行符
        .trim()
    }
    try {
      const response = await axios.get(process.env.ANIMAL_API_URL)
      const animalData = response.data

      if (!Array.isArray(animalData) || animalData.length === 0) {
        throw new Error('API 沒有回傳有效的動物資料')
      }

      for (const item of animalData) {
        item.animal_Variety = cleanVariety(item.animal_Variety)
        const detectedKind = getKindByVariety(item.animal_Variety)
        let kindRecord = kindCache.get(detectedKind)
        if (!kindRecord) {
          kindRecord = await kindModel.findOne({
            where: { kind: detectedKind }
          })
          if (!kindRecord) {
            kindRecord = await kindModel.create({ kind: detectedKind })
          }
          kindCache.set(detectedKind, kindRecord)
        }

        const varietyKey = item.animal_Variety || '未確認'
        let varietyRecord = varietyCache.get(varietyKey)

        if (!varietyRecord) {
          varietyRecord = await varietyModel.findOne({
            where: { variety: item.animal_Variety }
          })

          if (!varietyRecord) {
            varietyRecord = await varietyModel.create({
              variety: item.animal_Variety,
              kind_id: kindRecord.id
            })
          }
          varietyCache.set(varietyKey, varietyRecord)
        }

        const formatDate = (date) => {
          if (!date) return null
          return date.split('/').join('-')
        }
        // **插入或更新動物資料**
        const existingAnimal = await animalModel.findByPk(item.animal_id)
        const newAnimalData = {
          animal_id: item.animal_id,
          animal_subid: item.animal_subid,
          animal_area_pkid: item.animal_area_pkid,
          animal_shelter_pkid: item.animal_shelter_pkid,
          animal_place: item.animal_place,
          animal_kind: detectedKind,
          animal_Variety: item.animal_Variety || '未確認',
          animal_sex: item.animal_sex,
          animal_bodytype: item.animal_bodytype,
          animal_colour: item.animal_colour,
          animal_age: item.animal_age,
          animal_sterilization: item.animal_sterilization,
          animal_bacterin: item.animal_bacterin,
          animal_foundplace: item.animal_foundplace,
          animal_title: item.animal_title,
          animal_status: item.animal_status,
          animal_remark: item.animal_remark,
          animal_caption: item.animal_caption,
          animal_opendate: formatDate(item.animal_opendate),
          animal_closeddate: formatDate(item.animal_closeddate),
          animal_update: formatDate(item.animal_update),
          animal_createtime: formatDate(item.animal_createtime),
          shelter_name: item.shelter_name,
          album_file: item.album_file,
          album_update: formatDate(item.album_update),
          cDate: formatDate(item.cDate),
          shelter_address: item.shelter_address,
          shelter_tel: item.shelter_tel
        }

        if (existingAnimal) {
          // 比對舊資料與新資料
          const changedFields = {}
          for (const key in newAnimalData) {
            if (newAnimalData[key] !== existingAnimal[key]) {
              changedFields[key] = {
                old: existingAnimal[key],
                new: newAnimalData[key]
              }
            }
          }

          if (Object.keys(changedFields).length > 0) {
            const changeLog = {
              animal_id: item.animal_id,
              changes: changedFields
            }
            changes.push(changeLog)
            await existingAnimal.update(newAnimalData)
          }
        } else {
          const newAnimalLog = {
            animal_id: item.animal_id,
            changes: '新增動物資料'
          }
          changes.push(newAnimalLog)
          await animalModel.create(newAnimalData)
        }
      }
      try {
        await this.syncAnimalList()
      } catch (err) {
        console.error('同步 animal_list 資料失敗:', err.message)
        return { message: '動物資料導入失敗', error: err.message, changes: [] }
      }

      return { message: '資料更新成功', changes }
    } catch (error) {
      console.error('動物資料導入失敗:', error)
      return { message: '動物資料導入失敗', error: error.message, changes: [] }
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

        const kind = animal.animal_kind
        const shelterPkid = animal.animal_shelter_pkid
        const varietyId = variety.id
        const newId = await this.createId(kind, shelterPkid, varietyId)

        const listData = {
          id: newId,
          shelter_pkid: animal.animal_shelter_pkid,
          variety_id: variety.id,
          //bigint: ,
          sex: animal.animal_sex,
          age: animal.animal_age,
          bodytype: animal.animal_bodytype,
          colour: animal.animal_colour
        }
        await animalListModel.upsert(listData)
      }

      return { message: 'animal_list 資料同步成功' }
    } catch (error) {
      console.error('同步 animal_list 資料失敗:', error)
      throw new Error('同步 animal_list 資料失敗')
    }
  }

  async createId(kind, shelterPkid, varietyId) {
    // 先把動物類型轉成代號
    const kindPrefixMap = {
      狗: 'd',
      貓: 'c',
      鳥: 'b',
      兔: 'r',
      其他: 'o'
    }
    const kindPrefix = kindPrefixMap[kind]

    // 把收容所和品種的編號補零
    const shelterStr = String(shelterPkid)
    const varietyStr = String(varietyId).padStart(2, '0')

    // 做出前綴：像 d01002
    const prefix = kindPrefix + shelterStr + varietyStr

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
      if (animalData.bigint) updatedData.bigint = animalData.bigint
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

const animalService = new AnimalService()

module.exports = animalService
