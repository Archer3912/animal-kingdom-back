// service/article.js 做資料正確的判斷
const {articleModel} = require('../models')

class ArticleService {
  async getAllArticle() {
    return articleModel.findAll()
  }

  async getArticleById(id) {
    const article = await articleModel.findByPk(id)
    if (!article) {
      throw new Error('查無此文章')
    }
    return article
  }

  async createArticle(data) {
    return await articleModel.create({
      ...data,
      createTime: new Date(),
      updateTime: new Date()
    })
  }
}

const articleService = new ArticleService()
module.exports = articleService
