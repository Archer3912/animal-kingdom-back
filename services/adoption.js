// service/adoption.js 做資料正確的判斷
const { adoptionModel, animalListModel } = require('../models')

class AdoptionService {
  async adoptAnimal({
    animal_list_id,
    username,
    email,
    phone,
    address,
    profession,
    reason
  }) {
    // 確認動物存在且狀態不為 "已領養"
    const animal = await animalListModel.findByPk(animal_list_id)
    if (!animal) throw new Error('動物不存在')
    if (animal.state === '已領養') throw new Error('該動物已被領養')

    // 新增領養紀錄
    const adoption = await adoptionModel.create({
      animal_list_id,
      username,
      email,
      phone,
      address,
      profession,
      reason
    })

    //更新動物狀態
    animal.state = '聯絡中'
    await animal.save()

    return adoption
  }

  async getAdoptions() {
    return await adoptionModel.findAll({
      include: { model: animalListModel, as: 'animal' }
    })
  }
}

const adoptionService = new AdoptionService()
module.exports = adoptionService


