const {Router} = require('express')
const router = Router()
const Order = require('../models/order')
const auth = require('../middleware/auth')

const computePrice = courses =>
  courses.reduce((total, c) => (total += c.price * c.count), 0)

const mapCartItems = cart =>
  cart.items.map(({courseId, count}) => ({
    ...courseId._doc,
    count
  }))

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({'user.userId': req.user._id}).populate(
      'user.userId'
    )
    res.render('orders', {
      isOrders: true,
      title: 'Заказы',
      orders: orders.map(o => ({
        ...o._doc,
        price: computePrice(o.courses)
      }))
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.courseId')
    const courses = mapCartItems(user.cart)
    const order = await new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      courses
    })
    await order.save()
    await req.user.clearCart()

    res.redirect('/orders')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
