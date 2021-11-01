const {Router} = require('express')
const router = Router()
const Course = require('../models/course.js')
const auth = require('../middleware/auth')
const {validationResult} = require('express-validator')
const {courseValidators} = require('../utils/validators.js')

const isOwner = (course, req) =>
  course.userId.toString() === req.user._id.toString()

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
    res.render('courses', {
      title: 'Страница курсов',
      isCourses: true,
      courses,
      userId: req.user ? req.user._id.toString() : null
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    res.render('course', {
      layout: 'empty',
      title: `Курс по ${course.title}`,
      course
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.render('/')
  }
  try {
    const course = await Course.findById(req.params.id)
    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }
    res.render('course-edit', {
      title: `Редактировать курс ${course.title}`,
      course
    })
  } catch (e) {
    console.log(e)
  }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
  try {
    const course = await Course.findById(req.body.id)
    if (!isOwner(course, req)) {
      return res.redirect('/courses')
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).render('course-edit', {
        title: `Редактировать курс ${course.title}`,
        course: {...req.body},
        error: errors.array()[0].msg
      })
    }
    delete req.body.id
    Object.assign(course, req.body)
    await course.save()
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

router.post('/remove', auth, async (req, res) => {
  await Course.deleteOne({_id: req.body.id, userId: req.user._id})
  res.redirect('/courses')
})

module.exports = router
