const {Router} = require('express')
const router = Router()
const auth = require('../middleware/auth')
const User = require('../models/user')

router.get('/', auth, (req, res) => {
  res.render('profile', {
    title: 'Страница профиля',
    isProfile: true,
    user: req.user.toObject()
  })
})

router.post('/', auth, async (req, res) => {
  const user = await User.findById(req.user._id)

  const toChange = {
    name: req.body.name
  }
  if (req.file) {
    toChange.avatarUrl = req.file.path
  }

  Object.assign(user, toChange)
  await user.save()
  res.redirect('/profile')
})

module.exports = router
