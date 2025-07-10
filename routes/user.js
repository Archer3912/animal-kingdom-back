//route/user.js      檢查欄位
//const express = require('express')
//const router = express.Router()
const { Router } = require('express')
const router = Router()
const { userService } = require('../services')

// 用戶輸入username及email並發送驗證信
router.post('/start-register', async (req, res) => {
  try {
    const { username, email } = req.body
    // 檢查欄位
    if (!username || !email) {
      return res.status(400).json({ error: '帳號與信箱為必填' })
    }
    if (userService.checkEmail(email)) {
      return res.status(400).json({ error: '信箱格式錯誤' })
    }
    const token = await userService.startRegister(username, email)
    // 不回傳密碼資訊，避免洩漏
    res
      .status(200)
      .json({ message: '驗證信已寄出，請檢查您的電子郵件。', token })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

//點擊驗證碼之後，輸入密碼完成註冊
router.post('/complete-register', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      return res.status(400).json({ error: '驗證 token 與密碼為必填' })
    }
    const result = await userService.completeRegister(token, password)
    const { loginToken, user } = result
    // 不回傳密碼避免洩漏
    const { password: _, ...userData } = user.toJSON()
    res
      .status(201)
      .json({ message: '註冊完成', token: loginToken, user: userData })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// 登入
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    // 檢查欄位
    if (!username || !password) {
      return res.status(400).json({ error: '帳號與密碼為必填' })
    }
    const { token, user } = await userService.loginUser(username, password)
    // 不回傳密碼資訊，避免洩漏
    const { password: _, ...userData } = user.toJSON()
    res.json({
      message: '登入成功',
      token,
      user
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
