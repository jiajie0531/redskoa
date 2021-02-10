const Koa = require('koa')
const middleware = require("./middleware")
const routers = require("./routes")
const initDb = require("./models/init-db")
const onerror = require('koa-onerror')

const app = new Koa()

// error handler
onerror(app)
// middlewares
middleware(app)
// routes
routers(app)
// initDb
initDb()

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
