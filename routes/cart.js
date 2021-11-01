const {Router} = require('express')
const Course = require('../models/course')
const router = Router()
const auth = require('../middleware/auth')

// Helper Function
const computePrice = courses =>
  courses.reduce((total, c) => (total += c.price * c.count), 0)

const mapCartItems = cart =>
  cart.items.map(({courseId, count}) => ({
    ...courseId._doc,
    id: courseId.id,
    count
  }))

router.post('/add', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.body.id)
    await req.user.addToCart(course)
    res.redirect('/cart')
  } catch (e) {
    console.log(e)
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.courseId')
    const courses = mapCartItems(user.cart)
    res.render('cart', {
      title: 'Корзина',
      isCart: true,
      courses,
      price: computePrice(courses)
    })
  } catch (e) {
    console.log(e)
  }
})

router.delete('/remove/:id', auth, async (req, res) => {
  await req.user.removeFromCart(req.params.id)
  const user = await req.user.populate('cart.items.courseId')
  const courses = mapCartItems(user.cart)

  res.json({courses, price: computePrice(courses), csrf: req.csrfToken()})
})

module.exports = router
