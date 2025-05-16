const shelterModel = require('./shelter')
const animalListModel = require('./animalList')
const varietyModel = require('./variety')
const kindModel = require('./kind')
const resourcesModel = require('./resource')

varietyModel.hasMany(animalListModel, {
  foreignKey: 'variety_id',
  sourceKey: 'id',
  timestamps: false
})

animalListModel.belongsTo(varietyModel, {
  foreignKey: 'variety_id',
  targetKey: 'id',
  timestamps: false
})

shelterModel.hasMany(animalListModel, {
  foreignKey: 'shelter_pkid',
  sourceKey: 'id',
  timestamps: false
})

animalListModel.belongsTo(shelterModel, {
  foreignKey: 'shelter_pkid',
  targetKey: 'id',
  timestamps: false
})

kindModel.hasMany(varietyModel, {
  foreignKey: 'kind_id',
  sourceKey: 'id',
  timestamps: false
})

varietyModel.belongsTo(kindModel, {
  foreignKey: 'kind_id',
  targetKey: 'id',
  timestamps: false
})

animalListModel.hasMany(resourcesModel, {
  foreignKey: 'animal_list_id',
  sourceKey: 'id',
  timestamps: false
})

resourcesModel.belongsTo(animalListModel, {
  foreignKey: 'animal_list_id',
  targetKey: 'id',
  timestamps: false
})
