//service/originalAnimal.js 做資料正確的判斷
//顯示錯誤的訊息做分類
const axios = require('axios')
const { originalAnimalModel, kindModel, varietyModel } = require('../models')
const getKindByVariety = require('../util/kind')
const animalListService = require('./animalList')
const resourceService = require('./resource')

class OriginalAnimalService {
  constructor() {
    this.animalCache = null
    this.animalCacheTimestamp = 0
    this.cacheTTL = 60 * 1000 // 緩存有效時間（60秒）
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

      const apiAnimalIds = animalData.map((item) => item.animal_id)

      const existingAnimals = await originalAnimalModel.findAll({ raw: true })
      const existingAnimalMap = new Map(
        existingAnimals.map((item) => [item.animal_id, item])
      )
      const existingAnimalIds = existingAnimals.map((item) => item.animal_id)

      const kinds = await kindModel.findAll({ raw: true })
      const kindCache = new Map(kinds.map((k) => [k.kind, k]))

      const varieties = await varietyModel.findAll({ raw: true })
      const varietyCache = new Map(varieties.map((v) => [v.variety, v]))

      const animalsToCreate = []
      const animalsToUpdate = []

      const formatDate = (date) => {
        if (!date) return null
        return date.split('/').join('-')
      }

      for (const item of animalData) {
        item.animal_Variety = cleanVariety(item.animal_Variety)

        // 取得 kind，快取或新增
        const detectedKind = getKindByVariety(item.animal_Variety)
        let kindRecord = kindCache.get(detectedKind)
        if (!kindRecord) {
          kindRecord = await kindModel.create({ kind: detectedKind })
          kindCache.set(detectedKind, kindRecord.get({ plain: true })) // 將 Sequelize 實例轉成物件
        }

        // 取得 variety，快取或新增
        const varietyKey = item.animal_Variety || '其他'
        let varietyRecord = varietyCache.get(varietyKey)
        if (!varietyRecord) {
          varietyRecord = await varietyModel.create({
            variety: varietyKey,
            kind_id: kindRecord.id
          })
          varietyCache.set(varietyKey, varietyRecord.get({ plain: true }))
        }

        const apiUpdateStr = item.animal_update
          ? formatDate(item.animal_update)
          : null

        // **插入或更新動物資料**
        const newAnimalData = {
          animal_id: item.animal_id,
          animal_subid: item.animal_subid,
          animal_area_pkid: item.animal_area_pkid,
          animal_shelter_pkid: item.animal_shelter_pkid,
          animal_place: item.animal_place,
          animal_kind: detectedKind,
          animal_Variety: item.animal_Variety || '其他',
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

        const existingAnimal = existingAnimalMap.get(item.animal_id)
        const dbUpdateStr = existingAnimal ? existingAnimal.animal_update : null

        if (!existingAnimal) {
          animalsToCreate.push(newAnimalData)
          changes.push({ animal_id: item.animal_id, changes: '新增動物資料' })
        } else if (
          apiUpdateStr &&
          (!dbUpdateStr || apiUpdateStr > dbUpdateStr)
        ) {
          // 比較有變更欄位才更新
          const changedFields = {}
          for (const key in newAnimalData) {
            if (newAnimalData[key] != existingAnimal[key]) {
              changedFields[key] = {
                old: existingAnimal[key],
                new: newAnimalData[key]
              }
            }
          }
          changes.push({ animal_id: item.animal_id, changes: changedFields })
          animalsToUpdate.push({
            animal_id: item.animal_id,
            data: newAnimalData
          })
        }
      }

      if (animalsToCreate.length > 0) {
        await originalAnimalModel.bulkCreate(animalsToCreate)
      }

      for (const updateItem of animalsToUpdate) {
        await originalAnimalModel.update(updateItem.data, {
          where: { animal_id: updateItem.animal_id }
        })
      }

      // 刪除 API 裡已不存在的資料
      const removedAnimalIds = existingAnimalIds.filter(
        (id) => !apiAnimalIds.includes(id)
      )
      if (removedAnimalIds.length > 0) {
        await originalAnimalModel.destroy({
          where: { animal_id: removedAnimalIds }
        })

        await animalListService.markRemovedAnimals(removedAnimalIds)

        changes.push(
          ...removedAnimalIds.map((id) => ({
            animal_id: id,
            changes: '已從 API 消失，從original_animals裡移除'
          }))
        )
      }

      try {
        const changedIds = changes.map((c) => c.animal_id)
        await animalListService.syncAnimalList(changedIds)
        await resourceService.saveResources(changedIds)
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
}

const originalAnimalService = new OriginalAnimalService()

module.exports = originalAnimalService
