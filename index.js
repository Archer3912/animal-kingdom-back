// 引用後端框架 express
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cron = require('node-cron') //自動更新
//路由們，底下可以包含多個路由器設定，這邊引用路由設定檔，沒有指定檔案預設就是./routes/index.js
const router = require('./routes')
const { animalService } = require('./services')



// 建立 express 實例
const app = express()

// 使用 cors 中間件，允許不同網域來的請求，免於同源策略的限制
app.use(cors())

//告訴 Express 應用程式要使用 express.json() 中間件來解析請求主體中的 JSON 格式資料
app.use(express.json())

//解析 URL 編碼格式，extended: true 允許解析嵌套物件，false 則只允許字串與陣列
app.use(express.urlencoded({ extended: true }))

//使用路由設定
app.use(router)

// **設定自動更新，每天凌晨12點**  分鐘 小時 日期 月份 星期
const CRON_SCHEDULE = process.env.CRON_SCHEDULE
cron.schedule(CRON_SCHEDULE, async () => {
  //schedule('* * * * *' 放進env 常數不要放程式碼
  console.log('自動更新動物資料...')
  try {
    await animalService.fetchAndSaveAnimals()
    console.log('動物資料自動更新成功')
  } catch (err) {
    console.error('自動更新失敗:', err)
  }
})


// 設置監聽的 port (後端 URL 會是 localhost:[PORT])
const PORT = process.env.PORT  //放進env

app.listen(PORT, () => {
  console.log(`express server is running on http://localhost:${PORT}`)
})
