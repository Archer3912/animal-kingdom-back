// service/resources.js 做資料正確的判斷
const { resourceModel, animalModel, animalListModel } = require('../models')

class ResourceService {
  async saveResources() {
    try {
      const animals = await animalModel.findAll({
        attributes: ['animal_id', 'album_file']
      })

      for (const animal of animals) {
        if (!animal.album_file) continue

        // 依 animal_id 對應 animal_list.id
        const animalList = await animalListModel.findOne({
          where: { animal_id: animal.animal_id }
        })

        // 避免重複插入
        const existing = await resourceModel.findOne({
          where: {
            animal_list_id: animalList.id,
            URL: animal.album_file
          }
        })
        if (!existing) {
          await resourceModel.create({
            animal_list_id: animalList.id,
            type: 1,
            URL: animal.album_file
          })
        }
      }
      return { message: `圖片儲存完成` }
    } catch (error) {
      console.error('儲存圖片失敗:', error)
      throw new Error('儲存圖片失敗')
    }
  }

  async uploadResource(resourceData, files) {
    const { animal_list_id, type, urls } = resourceData
    const newResources = []

    // 儲存網址
    for (const url of urls) {
      const resource = await resourceModel.create({
        animal_list_id,
        type,
        URL: url
      })
      newResources.push(resource)
    }
    //把圖片轉成網址
    if (type == 1 && Array.isArray(files)) {
      for (const file of files) {
        const url = `http://localhost:3000/images/${file.originalname}`
        const resource = await resourceModel.create({
          animal_list_id,
          type,
          URL: url
        })
        newResources.push(resource)
      }
    }

    return newResources
  }
}

const resourceService = new ResourceService()
module.exports = resourceService
