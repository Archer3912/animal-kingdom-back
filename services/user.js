//service/user.js 做資料正確的判斷
//顯示錯誤的訊息做分類
const { userModel } = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const SECRET_KEY = process.env.SECRET_KEY

class UserService {
  async registerUser(username, password) {
    // 驗證密碼長度
    if (password.length < 6) {
      throw new Error('密碼長度需至少6個字元')
    }

    // 檢查用戶是否已存在
    const existingUser = await userModel.findOne({ where: { username } })
    if (existingUser) {
      throw new Error('帳號已被使用')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    return await userModel.create({ username, password: hashedPassword })
  }

  async loginUser(username, password) {
    //查找
    const user = await userModel.findOne({ where: { username } })
    if (!user) throw new Error('用戶不存在')

    //驗證
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('密碼錯誤')

    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: '1d' }
    )
    return { token, user }
  }
}

const userService = new UserService()
module.exports = userService
