//route/originalAnimal.js      檢查欄位
//const express = require('express')
//const router = express.Router()
const { Router } = require('express')
const router = Router()
const {
  originalAnimalService,
  animalListService,
  resourceService
} = require('../services')
const upload = require('../util/upload')
const auth = require('../middlewares/auth')
const uploadMultiple = upload('images').array('images', 10)

//路由這邊檢查參數，有無參數跟參數是否在合理範圍內
// http return 400是用戶端錯誤 500是伺服器端錯誤
// 獲取所有動物
router.get('/', async (req, res) => {
  try {
    const filters = req.query
    const animals = await animalListService.getAllAnimal(filters)
    res.json(animals)
  } catch (err) {
    res.status(500).json({ error: '取得動物資料時發生錯誤' })
  }
})

router.get('/enums', async (req, res) => {
  try {
    const enums = await animalListService.getEnumOptions()
    res.json(enums)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 獲取單一動物
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const animal = await animalListService.getAnimalById(id)
    res.json(animal)
  } catch (err) {
    res.status(500).json({ error: '取得動物資料時發生錯誤' })
  }
})

//上傳動物照片OR影片
router.post('/resource/:id', uploadMultiple, async (req, res) => {
  try {
    const animal_list_id = req.params.id
    const { type, urls } = req.body
    const files = req.files

    if (!type) {
      return res.status(400).json({ error: '請問提供的是圖片還是影片' })
    }

    //確保url是陣列
    const urlList = Array.isArray(urls) ? urls : urls ? [urls] : []

    // 圖片 (type = 1): 可上傳多張檔案與多個網址
    if (type == 1 && urlList.length === 0 && (!files || files.length === 0)) {
      return res.status(400).json({ error: '圖片上傳需提供檔案或網址' })
    }

    // 影片 (type = 2): 只能接受多個網址
    if (type == 2 && files && files.length > 0) {
      return res.status(400).json({ error: '影片只能提供網址，請勿上傳檔案' })
    }

    if (type == 2 && urlList.length === 0) {
      return res.status(400).json({ error: '影片需提供網址' })
    }

    const result = await resourceService.uploadResource(
      { animal_list_id, type, urls: urlList },
      req.files
    )

    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 手動更新動物API
router.post('/fetch', async (req, res) => {
  try {
    const result = await originalAnimalService.fetchAndSaveAnimals()
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: '更新動物資料時發生錯誤' })
  }
})

//新增動物資料
router.post('/create', auth.verifyToken, async (req, res) => {
  try {
    const { shelter_pkid, variety, age, bodytype, colour } = req.body
    if (!shelter_pkid) {
      return res.status(400).json({ error: '請輸入動物所屬收容所' })
    }
    if (!variety) {
      return res.status(400).json({ error: '請輸入variety' })
    }
    if (!age) {
      return res.status(400).json({ error: '請輸入age' })
    }
    if (!bodytype) {
      return res.status(400).json({ error: '請輸入body type' })
    }
    if (!colour) {
      return res.status(400).json({ error: '請輸入color' })
    }
    const data = {
      ...req.body,
      userId: req.user.id, // 送養人員為當前登入會員
      state: '待領養'
    }
    const result = await animalListService.createAnimal(data)
    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// 更新動物資料
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    const validFields = [
      'shelter_pkid',
      'variety_id',
      'sex',
      'age',
      'bodytype',
      'colour'
    ]
    const updateKeys = Object.keys(updateData)

    // 檢查是否有不合法的字段
    for (let key of updateKeys) {
      if (!validFields.includes(key)) {
        return res.status(400).json({ error: `無效的字段: ${key}` })
      }
    }

    const result = await animalListService.updateAnimal(id, updateData)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 刪除動物資料
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await animalListService.deleteAnimal(id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
