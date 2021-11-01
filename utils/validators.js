const {body} = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .custom(async value => {
      try {
        const candidate = await User.findOne({email: value})
        if (candidate) {
          return Promise.reject('Пользователь с таким email уже существует')
        }
      } catch (e) {
        console.log(e)
      }
    })
    .normalizeEmail(),
  body('password', 'Пароль должены быть минимум 6 символов')
    .isLength({min: 6, max: 56})
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Пароли должны совпадать')
      }
      return true
    })
    .trim(),
  body('name')
    .isLength({min: 3})
    .withMessage('Имя должно быть минимум 3 символа')
    .trim()
]

exports.courseValidators = [
  body('title', 'Минимальная длина название должно быть 3 символа')
    .isLength({min: 3})
    .trim(),
  body('price', 'Введите корректную цену').isNumeric(),
  body('img', 'Введите корректный URL картинки').isURL()
]
