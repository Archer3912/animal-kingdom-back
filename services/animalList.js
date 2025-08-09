// service/animalList.js 做資料正確的判斷
const { Op, Sequelize } = require('sequelize')
const {
  sequelize,
  originalAnimalModel,
  animalListModel,
  shelterModel,
  varietyModel,
  kindModel,
  resourceModel,
  areaModel,
  surrenderModel
} = require('../models')
const getKindByVariety = require('../util/kind')
const AnimalStates = require('../constants/animalStates')

class AnimalListService {
  async getAllAnimal(filters) {
    try {
      const whereClause = {}
      if (filters.shelter_pkid) whereClause.shelter_pkid = filters.shelter_pkid
      if (filters.sex) whereClause.sex = filters.sex
      if (filters.age) whereClause.age = filters.age
      if (filters.bodytype) whereClause.bodytype = filters.bodytype
      if (filters.colour) whereClause.colour = filters.colour
      if (filters.state) {
        // 如果 filters.state 是中文，就轉成對應數字
        if (AnimalStates.fromText.hasOwnProperty(filters.state)) {
          whereClause.state = AnimalStates.fromText[filters.state]
        } else if (!isNaN(filters.state)) {
          // 若是數字字串，轉成數字（ex: "0" -> 0）
          whereClause.state = parseInt(filters.state)
        } else {
          // 無效的值，略過
          whereClause.state = AnimalStates.AVAILABLE
        }
      } else {
        whereClause.state = AnimalStates.AVAILABLE
      }

      const kindFilter = filters.kind
      const varietyFilter = filters.variety

      const page = Number(filters.page) || 1
      const limit = 10
      const offset = (page - 1) * limit

      let areaIdFilter = undefined
      if (filters.areas) {
        if (!isNaN(filters.areas)) {
          areaIdFilter = parseInt(filters.areas)
        } else {
          const areaRecord = await areaModel.findOne({
            where: { name: filters.areas },
            attributes: ['id']
          })
          if (areaRecord) {
            areaIdFilter = areaRecord.id
          }
        }
      }

      const { count, rows } = await animalListModel.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        include: [
          {
            model: varietyModel,
            attributes: ['variety'],
            required: true,
            where: varietyFilter
              ? {
                  variety: {
                    [Op.like]: `%${varietyFilter}%`
                  }
                }
              : undefined,
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
            required: true,
            where: filters.areas_id ? { areas_id: filters.areas_id } : undefined
          },
          {
            model: resourceModel,
            attributes: ['type', 'URL'],
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
        state: AnimalStates.toText[animal.state],
        shelter_name: animal.shelterModel.shelter_name,
        shelter_address: animal.shelterModel.shelter_address,
        shelter_tel: animal.shelterModel.shelter_tel,
        resources: animal.resourceModels.map((r) => ({
          type: r.type,
          url: r.URL
        }))
      }))

      return {
        data: results,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
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
          },
          {
            model: resourceModel,
            attributes: ['type', 'URL'],
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
        state: AnimalStates.toText[animal.state],
        shelter_name: animal.shelterModel.shelter_name,
        shelter_address: animal.shelterModel.shelter_address,
        shelter_tel: animal.shelterModel.shelter_tel,
        resources: animal.resourceModels.map((r) => ({
          type: r.type,
          url: r.URL
        }))
      }
    } catch (error) {
      console.error('取得動物資料失敗:', error)
      throw new Error('取得動物資料失敗')
    }
  }

  async getEnumOptions() {
    try {
      const kinds = await kindModel.findAll({
        attributes: ['id', 'kind']
      })

      const varieties = await varietyModel.findAll({
        attributes: ['id', 'variety', 'kind_id']
      })

      const shelters = await shelterModel.findAll({
        attributes: ['id', 'shelter_name']
      })

      const areas = await areaModel.findAll({
        attributes: ['id', 'name']
      })

      const rawColours = await animalListModel.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('colour')), 'colour']
        ],
        where: {
          colour: {
            [Op.not]: null
          }
        },
        raw: true
      })

      const colourList = rawColours
        .map((c) => c.colour?.trim())
        .filter((c) => !!c && c !== '')

      return {
        sex: ['M', 'F', 'N'],
        age: ['CHILD', 'ADULT'],
        bodytype: ['SMALL', 'MEDIUM', 'BIG'],
        colour: colourList,
        kind: kinds.map((k) => ({ id: k.id, kind: k.kind })),
        variety: varieties.map((v) => ({
          id: v.id,
          variety: v.variety,
          kind_id: v.kind_id
        })),
        shelter_pkid: shelters.map((s) => ({
          id: s.id,
          name: s.shelter_name
        })),
        areas_id: areas.map((a) => ({
          id: a.id,
          name: a.name
        })),
        state: Object.entries(AnimalStates.toText).map(([value, text]) => ({
          value: parseInt(value),
          text
        }))
      }
    } catch (error) {
      console.error('取得 ENUM 選項失敗:', error)
      throw new Error('無法取得 ENUM 選項')
    }
  }

  async syncAnimalList(changedIds) {
    if (!Array.isArray(changedIds) || changedIds.length === 0) {
      console.log('沒有動物資料異動')
      return
    }
    try {
      for (const animalId of changedIds) {
        const animal = await originalAnimalModel.findByPk(animalId)

        if (!animal) {
          console.warn(`找不到原始動物資料，animal_id: ${animalId}`)
          continue
        }

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

        const newId = await this.createId(variety.id, {
          source: 'sync',
          createTime: animal.animal_createtime // 已是 YYYY-MM-DD
        })

        const listData = {
          id: newId,
          animal_id: animal.animal_id,
          shelter_pkid: animal.animal_shelter_pkid,
          variety_id: variety.id,
          sex: animal.animal_sex,
          age: animal.animal_age,
          bodytype: animal.animal_bodytype,
          colour: animal.animal_colour,
          state: animal.animal_state || AnimalStates.AVAILABLE
        }

        if (existingListItem) {
          await existingListItem.update(listData)
        } else {
          await animalListModel.create(listData)
        }
      }

      return { message: 'animal_list 資料同步成功' }
    } catch (error) {
      console.error('同步 animal_list 資料失敗:', error)
      throw new Error('同步 animal_list 資料失敗')
    }
  }

  async markRemovedAnimals(removedAnimalIds) {
    if (!removedAnimalIds || removedAnimalIds.length === 0) return

    await animalListModel.update(
      { state: AnimalStates.REMOVED_FROM_API },
      { where: { animal_id: removedAnimalIds } }
    )
  }

  async createId(varietyId, options = {}) {
    let dateStr

    if (options.source === 'sync' && options.createTime) {
      // syncAnimalList，取 originalAnimalModel.animal_createtime
      dateStr = options.createTime.replace(/-/g, '').slice(2)
    } else {
      // createAnimal ，取用系統日期
      const now = new Date()
      const yyyy = now.getFullYear().toString().slice(2) // '25'
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      dateStr = `${yyyy}${mm}${dd}`
    }

    const varietyStr = String(varietyId).padStart(3, '0')
    const prefix = dateStr + varietyStr

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
    const transaction = await sequelize.transaction()

    try {
      const sex = ['M', 'F', 'N']
      const defaultSex = 'N'
      const bodyType = ['SMALL', 'MEDIUM', 'BIG']

      data.sex = sex.includes(data.sex) ? data.sex : defaultSex

      if (!bodyType.includes(data.bodytype)) {
        throw new Error(`體型只能是 ${bodyType.join('/')} 其中之一`)
      }

      if (!data.userId) throw new Error('尚未登入會員')

      let varietyEntry = await varietyModel.findOne({
        where: { variety: data.variety },
        transaction
      })

      if (!varietyEntry) {
        const kindName = getKindByVariety(data.variety)
        const kindEntry = await kindModel.findOne({
          where: { kind: kindName },
          transaction
        })

        varietyEntry = await varietyModel.create(
          {
            variety: data.variety,
            kind_id: kindEntry.id
          },
          { transaction }
        )
      }

      const newId = await this.createId(varietyEntry.id, {
        source: 'manual'
      })

      const newAnimal = await animalListModel.create(
        {
          id: newId,
          shelter_pkid: data.shelter_pkid,
          variety_id: varietyEntry.id,
          sex: data.sex,
          age: data.age,
          bodytype: data.bodytype,
          colour: data.colour,
          userId: data.userId,
          state: data.state
        },
        { transaction }
      )

      await surrenderModel.create(
        {
          animal_list_id: newAnimal.id,
          username: data.username,
          email: data.email,
          phone: data.phone,
          address: data.address,
          profession: data.profession,
          reason: data.reason
        },
        { transaction }
      )

      await transaction.commit()
      return { message: '動物送養資料新增成功', id: newAnimal.id }

    } catch (error) {
      await transaction.rollback()
      console.error('動物送養資料新增失敗:', error)
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
      if (animalData.state) updatedData.state = animalData.state

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
