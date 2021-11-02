const {Router} = require('express')
const router = Router()
const bcript = require('bcryptjs')
const nodemailer = require('nodemailer')
const {validationResult} = require('express-validator')
const User = require('../models/user')
const keys = require('../keys')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const {registerValidators} = require('../utils/validators')
const crypto = require('crypto')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: keys.EMAIL,
    pass: keys.EMAIL_KEY
  }
})

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Авторизация',
    isLogin: true,
    success: req.flash('success'),
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError')
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login')
  })
})

router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body
    const candidate = await User.findOne({email})
    if (candidate) {
      const areSame = await bcript.compare(password, candidate.password)

      if (areSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save(err => {
          if (err) {
            throw err
          }
          res.redirect('/')
        })
      } else {
        req.flash(
          'loginError',
          'Ваше имя пользователя или пароль недействительны.'
        )
        res.redirect('/auth/login/#login')
      }
    } else {
      req.flash('loginError', 'Пользователь с таким email не существует')
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.post('/register', registerValidators, async (req, res) => {
  try {
    const {email, name, password} = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login/#register')
    }
    const hashPassword = await bcript.hash(password, 10)
    const user = new User({email, name, password: hashPassword})
    await user.save()
    req.flash('success', 'Регистрация прошла успешно')
    res.redirect('/auth/login#login')
    await transporter.sendMail(regEmail(email))
  } catch (e) {
    console.log(e)
  }
})

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    res.redirect('/auth/login')
  }
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetToken: {$gt: Date.now()}
    })

    if (!user) {
      return res.redirect('/auth/login')
    } else {
      res.render('auth/password', {
        title: 'Восстановить доступ',
        error: req.flash('error'),
        userId: user._id.toString(),
        token: req.params.token
      })
    }
  } catch (e) {
    console.log(e)
  }
})

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: {$gt: Date.now()}
    })
    if (user) {
      user.password = await bcript.hash(req.body.password, 10)
      user.resetToken = undefined
      user.resetTokenExp = undefined
      await user.save()
      req.flash('success', 'Вы успешно сменили пароль')
      res.redirect('/auth/login')
    } else {
      req.flash('loginError', 'Время жизни вашего токена истекло')
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Забыли пароль?',
    error: req.flash('error')
  })
})

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Что-то пошло не так, попробуйте снова.')
        return res.redirect('/auth/reset')
      }
      const token = buffer.toString('hex')
      const candidate = await User.findOne({email: req.body.email})

      if (candidate) {
        candidate.resetToken = token
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
        await candidate.save()
        req.flash(
          'success',
          'Вам на почту отправлено письмо с инструкцией по восстановлению пароля'
        )
        res.redirect('/auth/login')
        await transporter.sendMail(resetEmail(candidate.email, token))
      } else {
        req.flash('error', 'К сожалению пользователя с таким email не найдено.')
        res.redirect('/auth/reset')
      }
    })
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
