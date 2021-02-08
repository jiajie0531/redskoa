const weibo = require('weibo');
const router = require('koa-router')()

router.prefix('/weibo')

router.get('/login', function (ctx, next) {
  // change appkey to yours
  var appkey = '1120585538';
  var secret = '36ba3598818d0fef65809e8d03305be1';
  var oauth_callback_url = 'https://redsapi-9gtejk3n12548b8d-1258543641.ap-shanghai.app.tcloudbase.com/redskoa/weibo/cb';
  weibo.init('weibo', appkey, secret, oauth_callback_url);

  var user = { blogtype: 'weibo' };
  var cursor = { count: 20 };
  weibo.public_timeline(user, cursor, function (err, statuses) {
    if (err) {
      console.error(err);
    } else {
      console.log(statuses);
    }
  });
  ctx.body = 'this is a users/bar response'
})

router.get('/cb', function (ctx, next) {
  let url = ctx.url
  // 从上下文的request对象中获取
  let request = ctx.request
  let req_query = request.query
  let req_querystring = request.querystring

  // 从上下文中直接获取
  let ctx_query = ctx.query
  let ctx_querystring = ctx.querystring

  ctx.body = {
    url,
    req_query,
    req_querystring,
    ctx_query,
    ctx_querystring
  }
})

module.exports = router