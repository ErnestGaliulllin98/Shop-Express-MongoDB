const {Schema, model} = require('mongoose')

const technologySchema = new Schema({
  title: String,
  img: String
})

module.exports = model('Technology', technologySchema)
