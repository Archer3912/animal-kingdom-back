const { Router } = require('express')
const router = Router()
const adoptionService = require('../services')

// 領養動物
router.post('/', async (req, res) => {
  try {
    const {
      animal_list_id,
      username,
      email,
      phone,
      address,
      profession,
      reason
    } = req.body
    const adoption = await adoptionService.adoptAnimal({
      animal_list_id,
      username,
      email,
      phone,
      address,
      profession,
      reason
    })
    res.status(201).json({ message: '領養成功', adoption })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// 查詢所有領養紀錄
router.get('/', async (req, res) => {
  try {
    const adoptions = await adoptionService.getAdoptions()
    res.json(adoptions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
