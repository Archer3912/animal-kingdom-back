//route/animal.js      檢查欄位
//const express = require('express')
//const router = express.Router()
const { Router } = require('express')
const router = Router()
const { animalService } = require('../services')
const upload = require('../util/upload')
const uploadFile = upload('images').single('img')

//路由這邊檢查參數，有無參數跟參數是否在合理範圍內
// http return 400是用戶端錯誤 500是伺服器端錯誤
// 獲取所有動物
router.get('/', async (req, res) => {
  try {
    const animals = await animalService.getAllAnimal()
    res.json(animals)
  } catch (err) {
   res.status(500).json({ error: '取得動物資料時發生錯誤' })
  }
})

// 獲取單一動物
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const animal = await animalService.getAnimalById(id)
    res.json(animal)
  } catch (err) {
    res.status(500).json({ error: '取得動物資料時發生錯誤' })
  }
})


// 手動更新動物資料
router.post('/fetch', async (req, res) => {
  try {
    const result = await animalService.fetchAndSaveAnimals();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: '更新動物資料時發生錯誤' });
  }
});

// 更新動物資料
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    //確認更改的內容

    const result = await animalService.updateAnimal(id, updateData)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 刪除動物資料
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await animalService.deleteAnimal(id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


module.exports = router