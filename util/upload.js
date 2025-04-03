const multer = require('multer')

//丟進util
function upload(destinationPath) {
  // 配置 multer 用來處理文件上傳，並將文件保存到 `images` 資料夾中
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationPath) // 上傳文件儲存路徑
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname) // 文件名
    }
  })

  return multer({ storage: storage })
}

module.exports = upload
