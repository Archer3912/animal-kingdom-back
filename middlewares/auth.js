// middlewares/auth.js 驗證JWT 登入狀態
const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

class Auth {
  verifyToken() {
    return (req, res, next) => {
      const bearerHeader = req.headers['authorization']
      if (!bearerHeader || !bearerHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '尚未登入，請先登入會員' })
      }

      const token = bearerHeader.split(' ')[1]
      try {
        const decoded = jwt.verify(token, SECRET_KEY)
        req.user = decoded 
        next()
      } catch (err) {
        return res.status(401).json({ error: 'Token 無效或已過期' })
      }
    }
  }

  // 檢查使用者角色是否被允許
  authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: '權限不足' })
      }
      next()
    }
  }
}

const auth = new Auth()
module.exports = auth

