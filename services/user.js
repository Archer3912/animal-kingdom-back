//service/user.js 做資料正確的判斷
//顯示錯誤的訊息做分類
const { userModel } = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const SECRET_KEY = process.env.SECRET_KEY

class UserService {
  async startRegister(username, email) {
    // 檢查用戶是否已存在
    const existingUser = await userModel.findOne({ where: { username } })
    if (existingUser) {
      throw new Error('帳號已被使用')
    }
    const existingEmail = await userModel.findOne({ where: { email } })
    if (existingEmail) {
      throw new Error('信箱已被使用')
    }
    // 產生 JWT，內容帶 username, email，1小時有效
    const token = jwt.sign({ username, email }, SECRET_KEY, { expiresIn: '1h' })
    await this.sendEmail(email, token)
    return token
  }

  async completeRegister(token, password, role = 'user') {
    if (!password || password.length < 6) {
      throw new Error('密碼長度需至少6個字元')
    }

    let payload
    try {
      payload = jwt.verify(token, SECRET_KEY)
    } catch (err) {
      throw new Error('驗證連結無效或已過期')
    }

    const { username, email } = payload

    // 再次檢查帳號信箱是否存在（避免重複建立）
    const existingUser = await userModel.findOne({ where: { username } })
    if (existingUser) {
      throw new Error('帳號已被使用')
    }
    const existingEmail = await userModel.findOne({ where: { email } })
    if (existingEmail) {
      throw new Error('信箱已被使用')
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10)

    // 建立使用者
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role
    })

    return user
  }

  async loginUser(username, password) {
    //查找
    const user = await userModel.findOne({ where: { username } })
    if (!user) throw new Error('用戶不存在')

    //驗證
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('密碼錯誤')

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: '1d' }
    )
    return { token, user }
  }

  async sendEmail(email, token) {
    //設置郵件發送配置
    const transporter = nodemailer.createTransport({
      service: 'gmail', //根據需求換其他信箱服務
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
    //發送郵件的函數
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `動物王國會員驗證，請驗證您的電子郵件`,
      text: `請點擊連結驗證您的電子郵件並設定密碼: ${process.env.VERIFY_URL}?token=${token}`
    }
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err)
        return 'Error sending email'
      } else {
        console.log(info)
        return 'Email sent'
      }
    })
  }

  checkEmail(email) {
    const atIndex = email.indexOf('@')
    if (atIndex === -1) {
      return true
    }
    const domain = email.substring(atIndex + 1)
    if (domain.length === 0) {
      return true
    }
    const userName = email.substring(0, atIndex)
    if (userName.length === 0) {
      return true
    }
    const dot = domain.indexOf('.')
    if (dot === -1) {
      return true
    }
    const dotDomain = domain.substring(dot + 1)
    if (dotDomain.length === 0) {
      return true
    }
    return false
  }
}

const userService = new UserService()
module.exports = userService
