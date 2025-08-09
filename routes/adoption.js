const { Router } = require('express')
const router = Router()
const {adoptionService} = require('../services')

// 領養動物
router.post('/', async (req, res) => {
  try {
    const {username, email, phone} = req.body
    if (!username) {
      return res.status(400).json({ error: '請輸入姓名' })
    }
    if (!email) {
      return res.status(400).json({ error: '請輸入電子郵件' })
    }
    if (!phone) {
      return res.status(400).json({ error: '請輸入電話' })
    }

    const result = await adoptionService.adoptAnimal(req.body)
    res
      .status(201)
      .json({ message: `成功申請領養${req.body.animal_list_id}`, result })
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

// 查詢可領養的動物
router.get('/available', async (req, res) => {
  try {
    const availableAnimals = await adoptionService.getAvailableAnimals()
    res.json(availableAnimals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})




module.exports = router
