// service/adoption.js 做資料正確的判斷
const { adoptionModel, animalListModel } = require('../models')
const AnimalStates = require('../constants/animalStates')
const Sequelize = require('sequelize')

class AdoptionService {
  async adoptAnimal(adoptionData) {
    const { animal_list_id } = adoptionData

    // 確認動物存在且狀態不為 "已領養"
    const animal = await animalListModel.findByPk(animal_list_id)
    if (!animal) throw new Error('動物不存在')
    if (animal.state !== AnimalStates.AVAILABLE)
      throw new Error('該動物目前無法領養')

    // 新增領養紀錄
    const adoption = await adoptionModel.create(adoptionData)

    //更新動物狀態
    animal.state = AnimalStates.IN_CONTACT
    await animal.save()

    return adoption
  }

  async getAdoptions() {
    return await adoptionModel.findAll({
      include: { model: animalListModel, as: 'animal' }
    })
  }

  async getAvailableAnimals() {
    const animals = await animalListModel.findAll({
      where: { state: AnimalStates.AVAILABLE }
    })

    return animals.map((animal) => {
      return {
        ...animal.toJSON(),
        state: AnimalStates.toText[animal.state]
      }
    })
  }
}

const adoptionService = new AdoptionService()
module.exports = adoptionService
