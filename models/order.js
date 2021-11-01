const {Schema, model} = require('mongoose')

const orderSchema = new Schema({
  user: {
    name: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  courses: [
    {
      title: {type: String, required: true},
      price: {type: String, required: true},
      img: {type: String, required: true},
      count: {type: Number, required: true}
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = model('Order', orderSchema)
