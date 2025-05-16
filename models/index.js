const animalModel = require('./animal')
const areaModel = require('./area')
const shelterModel = require('./shelter')
const userModel = require('./user')
const animalListModel = require('./animalList')
const kindModel = require('./kind')
const resourceModel = require('./resource')
const varietyModel = require('./variety')
require('./associations')

module.exports = {
  animalModel,
  areaModel,
  shelterModel,
  userModel,
  animalListModel,
  kindModel,
  resourceModel,
  varietyModel
}
