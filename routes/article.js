//route/article.js
const { Router } = require('express')
const router = Router()
const { articleService } = require('../services')
const auth = require('../middlewares/auth')


router.get('/', async (req, res) => {
  try {
    const articles = await articleService.getAllArticle()
    res.json(articles)
  } catch (err) {
    res.status(500).json({ error: '訊息錯誤' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const article = await articleService.getArticleById(id)
    res.json(article)
  } catch (err) {
    res.status(500).json({ error: '取得文章時發生錯誤' })
  }
})

router.post('/', auth.verifyToken(), async (req, res) => {
  try {
    const user = req.user 
    if (!user || !user.username) {
      return res.status(401).json({ message: '請先登入' })
    }

    const article = await articleService.createArticle({
      ...req.body,
      author: user.username
    })

    res.status(201).json(article)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router