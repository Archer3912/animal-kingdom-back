const sequelize = require('../util/db')
const originalAnimalModel = require('./originalAnimal')
const areaModel = require('./area')
const shelterModel = require('./shelter')
const userModel = require('./user')
const animalListModel = require('./animalList')
const kindModel = require('./kind')
const resourceModel = require('./resource')
const varietyModel = require('./variety')
const articleModel = require('./article')
const adoptionModel = require('./adoption')
const surrenderModel = require('./surrender')
require('./associations')

module.exports = {
  sequelize,
  originalAnimalModel,
  areaModel,
  shelterModel,
  userModel,
  animalListModel,
  kindModel,
  resourceModel,
  varietyModel,
  articleModel,
  adoptionModel,
  surrenderModel
}
