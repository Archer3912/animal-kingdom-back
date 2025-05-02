//route/user.js      檢查欄位
//const express = require('express')
//const router = express.Router()
const { Router } = require('express')
const router = Router()
const { userService } = require('../services')

// 註冊
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    // 檢查欄位
    if (!username || !password) {
      return res.status(400).json({ error: '帳號與密碼為必填' })
    }
    const user = await userService.registerUser(username, password)
    // 不回傳密碼資訊，避免洩漏
    const { password: _, ...userData } = user.toJSON()
    res.status(201).json({ message: `username:${userData.username}註冊成功` })
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
    res.json({ message: '登入成功', token})
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
