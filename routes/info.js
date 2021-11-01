const {Router} = require('express')
const router = Router()
const Technology = require('../models/technology')

router.get('/', async (req, res) => {
  const technologies = await Technology.find()
  res.render('info', {
    title: 'Информация',
    isInfo: true,
    technologies
  })
})

module.exports = router
