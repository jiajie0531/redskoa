const weibo = require('weibo');
const axios = require('axios');
const router = require('koa-router')()

router.prefix('/weibo')

router.get('/login', function (ctx, next) {
  // change appkey to yours
  var appkey = '1120585538';
  var secret = '36ba3598818d0fef65809e8d03305be1';
  var oauth_callback_url = 'https://redsapi-9gtejk3n12548b8d-1258543641.ap-shanghai.app.tcloudbase.com/redskoa/weibo/cb';
  
  axios.get('https://api.weibo.com/oauth2/authorize', {
    params: {
      client_id: appkey,
      redirect_uri: 'https://redsapi-9gtejk3n12548b8d-1258543641.ap-shanghai.app.tcloudbase.com/redskoa/weibo/cb',
      response_type: 'code'
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });  
  ctx.body = 'this is a users/bar response'
})

router.get('/cb', function (ctx, next) {
  let url = ctx.url
  // 从上下文的request对象中获取
  let request = ctx.request
  let req_query = request.query
  console.log(req_query);
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