const animalModel = require('./animal')
const areaModel = require('./area')
const shelterModel = require('./shelter')
const userModel = require('./user')
require('./associations')

module.exports = {
  animalModel,
  areaModel,
  shelterModel,
  userModel
}
