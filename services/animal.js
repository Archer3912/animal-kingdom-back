//service/animal.js 做資料正確的判斷
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

        const varietyKey = item.animal_Variety || '其他'
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

        const existingAnimal = await originalAnimalModel.findByPk(
          item.animal_id
        )
        const apiUpdateStr = item.animal_update
          ? formatDate(item.animal_update)
          : null
        const dbUpdateStr =
          existingAnimal && existingAnimal.animal_update
            ? existingAnimal.animal_update
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

        if (!existingAnimal) {
          changes.push({ animal_id: item.animal_id, changes: '新增動物資料' })
          await originalAnimalModel.create(newAnimalData)
        } else if (
          apiUpdateStr &&
          (!dbUpdateStr || apiUpdateStr > dbUpdateStr)
        ) {
          // 比對改變欄位
          const changedFields = {}
          for (const key in newAnimalData) {
            if (newAnimalData[key] != existingAnimal[key]) {
              changedFields[key] = {
                old: existingAnimal[key],
                new: newAnimalData[key]
              }
            }
          }
          changes.push({
            animal_id: item.animal_id,
            changes: changedFields
          })
          await existingAnimal.update(newAnimalData)
        }
      }
      try {
        await animalListService.syncAnimalList()
        await resourceService.saveResources()
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
