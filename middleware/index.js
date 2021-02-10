const views = require('koa-views')
const json = require('koa-json')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-session')
const store = require('koa-session-local')

module.exports = app => {
  // middlewares
  app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
  }))
  app.use(json())
  app.use(logger())
  app.use(require('koa-static')(__dirname + '/public'))

  app.use(views(__dirname + '/views', {
    extension: 'pug'
  }))

  // logger
  app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
  })

  // 设置签名的 Cookie 密钥
  app.keys = ['koakeys'];
  // session
  // cookie中设置了HttpOnly属性,那么通过js脚本将无法读取到cookie信息
  // signed = false 时，app.keys 不赋值没有关系；如果 signed: true 时，则需要对 app.keys 赋值，否则会报错。
  const CONFIG = {
    store: new store(),
    key: 'koa.sess', /** (string) cookie key (default is koa.sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    autoCommit: true, /** (boolean) automatically commit headers (default true) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: false, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    secure: false, /** (boolean) secure cookie*/
    sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
  };
  // Error: Cannot send secure cookie over unencrypted connection
  // 将 secure 改为false，在本地测试
  app.use(session(CONFIG, app));

  // Cannot set headers after they are sent to the client
  // cookie
  app.use(async function (ctx, next) {
    const n = ~~ctx.cookies.get('view') + 1;
    ctx.cookies.set('view', n, {httpOnly:false});
    // 中间件调用next要加await,否则报错404
    await next();
  });

}