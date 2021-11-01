const express = require('express')
const csrf = require('csurf')
const flash = require('connect-flash')
const Handlebars = require('handlebars')
const helmet = require('helmet')
const compression = require('compression')
const exhbs = require('express-handlebars')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongodb-session')(session)
const {
  allowInsecurePrototypeAccess
} = require('@handlebars/allow-prototype-access')
const path = require('path')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const fileMiddleware = require('./middleware/file')
const handleError = require('./middleware/error')
const keys = require('./keys')
const homeRoutes = require('./routes/home')
const coursesRoutes = require('./routes/courses')
const addRoutes = require('./routes/add')
const cartRoutes = require('./routes/cart')
const ordersRoutes = require('./routes/orders')
const profileRoutes = require('./routes/profile')
const infoRoutes = require('./routes/info')
const authRoutes = require('./routes/auth')

const app = express()

const hbs = exhbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require('./utils/hbs-helpers')
})
const store = new MongoStore({
  collection: 'session',
  uri: keys.MONGODB_URI
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(
  express.urlencoded({
    extended: true
  })
)
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
  })
)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'https:'],
        'script-src-elem': [
          "'self'",
          'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
          "'unsafe-inline'"
        ]
      }
    }
  })
)
app.use(compression())
app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes)
app.use('/courses', coursesRoutes)
app.use('/add', addRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', ordersRoutes)
app.use('/profile', profileRoutes)
app.use('/info', infoRoutes)
app.use('/auth', authRoutes)

app.use(handleError)

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlparser: true
    })

    app.listen(PORT, () => {
      console.log(`Server has been started on port ${PORT}...`)
    })
  } catch (e) {
    console.log(e)
  }
}

start()
