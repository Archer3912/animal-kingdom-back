//service/animal.js 做資料正確的判斷
//顯示錯誤的訊息做分類
const axios = require('axios')
const { animalModel, areaModel, shelterModel } = require('../models')

class AnimalService {
  async getAllAnimal(filters) {
    try {
      const whereClause = {}
      if (filters.animal_kind) whereClause.animal_kind = filters.animal_kind
      if (filters.animal_sex) whereClause.animal_sex = filters.animal_sex
      if (filters.animal_bodytype)
        whereClause.animal_bodytype = filters.animal_bodytype
      if (filters.animal_colour)
        whereClause.animal_colour = filters.animal_colour
      if (filters.animal_age) whereClause.animal_age = filters.animal_age
      if (filters.animal_shelter_pkid)
        whereClause.animal_shelter_pkid = filters.animal_shelter_pkid

      const animalList = await animalModel.findAll({
        where: whereClause
      })

      return animalList.map((animal) => ({
        animal_id: animal.animal_id,
        animal_subid: animal.animal_subid,
        animal_area_pkid: animal.animal_area_pkid,
        animal_shelter_pkid: animal.animal_shelter_pkid,
        animal_place: animal.animal_place,
        animal_kind: animal.animal_kind,
        animal_Variety: animal.animal_Variety,
        animal_sex: animal.animal_sex,
        animal_bodytype: animal.animal_bodytype,
        animal_colour: animal.animal_colour,
        animal_age: animal.animal_age,
        animal_sterilization: animal.animal_sterilization,
        animal_bacterin: animal.animal_bacterin,
        animal_foundplace: animal.animal_foundplace,
        animal_title: animal.animal_title,
        animal_status: animal.animal_status,
        animal_remark: animal.animal_remark,
        animal_caption: animal.animal_caption,
        animal_opendate: animal.animal_opendate,
        animal_closeddate: animal.animal_closeddate,
        animal_update: animal.animal_update,
        animal_createtime: animal.animal_createtime,
        shelter_name: animal.shelterModel,
        album_file: animal.album_file,
        album_update: animal.album_update,
        cDate: animal.cDate,
        shelter_address: animal.shelterModel,
        shelter_tel: animal.shelterModel
      }))
    } catch (error) {
      console.error('取得動物資料失敗:', error)
      throw new Error('取得動物資料失敗')
    }
  }

  async getAnimalById(id) {
    try {
      const animal = await animalModel.findOne({
        where: { animal_id: id },
        include: [
          {
            model: areaModel,
            attributes: ['name']
          },
          {
            model: shelterModel,
            attributes: ['id', 'shelter_name', 'shelter_address', 'shelter_tel']
          }
        ]
      })

      if (!animal) {
        throw new Error(`找不到 ID 為 ${id} 的動物資料`)
      }

      return {
        animal_id: animal.animal_id,
        animal_subid: animal.animal_subid,
        animal_area_pkid: animal.animal_area_pkid,
        animal_shelter_pkid: animal.animal_shelter_pkid,
        animal_place: animal.animal_place,
        animal_kind: animal.animal_kind,
        animal_Variety: animal.animal_Variety,
        animal_sex: animal.animal_sex,
        animal_bodytype: animal.animal_bodytype,
        animal_colour: animal.animal_colour,
        animal_age: animal.animal_age,
        animal_sterilization: animal.animal_sterilization,
        animal_bacterin: animal.animal_bacterin,
        animal_foundplace: animal.animal_foundplace,
        animal_title: animal.animal_title,
        animal_status: animal.animal_status,
        animal_remark: animal.animal_remark,
        animal_caption: animal.animal_caption,
        animal_opendate: animal.animal_opendate,
        animal_closeddate: animal.animal_closeddate,
        animal_update: animal.animal_update,
        animal_createtime: animal.animal_createtime,
        shelter_name: animal.shelterModel,
        album_file: animal.album_file,
        album_update: animal.album_update,
        cDate: animal.cDate,
        shelter_address: animal.shelterModel,
        shelter_tel: animal.shelterModel
      }
    } catch (error) {
      console.error('取得動物資料失敗:', error)
      throw new Error('取得動物資料失敗')
    }
  }

  async fetchAndSaveAnimals() {
    let changes = []
    try {
      const response = await axios.get(process.env.ANIMAL_API_URL)
      const animalData = response.data

      if (!Array.isArray(animalData) || animalData.length === 0) {
        throw new Error('API 沒有回傳有效的動物資料')
      }

      for (const item of animalData) {
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
          animal_kind: item.animal_kind,
          animal_Variety: item.animal_Variety,
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

      return { message: '資料更新成功', changes }
    } catch (error) {
      console.error('動物資料導入失敗:', error)
      return { message: '動物資料導入失敗', error: error.message, changes: [] }
    }
  }
  async updateAnimal(id, animalData) {
    try {
      const animal = await animalModel.findByPk(id)
      if (!animal) {
        throw new Error(`查無 ID 為${id}的動物資料`)
      }

      await animal.update(animalData)
      return { message: `動物 ID ${id} 資料更新成功` }
    } catch (error) {
      console.error(`更新動物資料失敗: ${error.message}`)
      throw new Error('更新動物資料失敗')
    }
  }

  async deleteAnimal(id) {
    try {
      const animal = await animalModel.findByPk(id)
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
