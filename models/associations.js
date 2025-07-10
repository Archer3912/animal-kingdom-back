const shelterModel = require('./shelter')
const animalListModel = require('./animalList')
const varietyModel = require('./variety')
const kindModel = require('./kind')
const resourcesModel = require('./resource')
const areaModel = require('./area')

varietyModel.hasMany(animalListModel, {
  foreignKey: 'variety_id',
  sourceKey: 'id'
})

animalListModel.belongsTo(varietyModel, {
  foreignKey: 'variety_id',
  targetKey: 'id'
})

shelterModel.hasMany(animalListModel, {
  foreignKey: 'shelter_pkid',
  sourceKey: 'id'
})

animalListModel.belongsTo(shelterModel, {
  foreignKey: 'shelter_pkid',
  targetKey: 'id'
})

kindModel.hasMany(varietyModel, {
  foreignKey: 'kind_id',
  sourceKey: 'id'
})

varietyModel.belongsTo(kindModel, {
  foreignKey: 'kind_id',
  targetKey: 'id'
})

animalListModel.hasMany(resourcesModel, {
  foreignKey: 'animal_list_id',
  sourceKey: 'id'
})

resourcesModel.belongsTo(animalListModel, {
  foreignKey: 'animal_list_id',
  targetKey: 'id'
})

areaModel.hasMany(shelterModel, {
  foreignKey: 'areas_id',
  sourceKey: 'id'
})

shelterModel.belongsTo(areaModel, {
  foreignKey: 'areas_id',
  targetKey: 'id'
})