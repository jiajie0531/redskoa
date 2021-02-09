const weibo = require('weibo');
const axios = require('axios');
const router = require('koa-router')()

router.prefix('/weibo')
// change appkey to yours
var appkey = '1120585538';
var secret = '36ba3598818d0fef65809e8d03305be1';
var oauth_callback_url = 'https://redsapi-9gtejk3n12548b8d-1258543641.ap-shanghai.app.tcloudbase.com/redskoa/weibo/cb';

router.get('/login', async function (ctx, next) {  
  let myrsp;
  await axios.get('https://api.weibo.com/oauth2/authorize', {
    params: {
      client_id: appkey,
      redirect_uri: 'https://redsapi-9gtejk3n12548b8d-1258543641.ap-shanghai.app.tcloudbase.com/redskoa/weibo/cb',
      response_type: 'code'
    }
  })
  .then(function (response) {
    console.log(response); 
    ctx.body = response.data;
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });  
  // ctx.body = "ok";
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

router.get('/oauth2/access_token', function (ctx, next) { 
  let url = 'https://api.weibo.com/oauth2/access_token?client_id=1120585538&client_secret=36ba3598818d0fef65809e8d03305be1&grant_type=authorization_code&redirect_uri=https://redsapi-9gtejk3n12548b8d-1258543641.ap-shanghai.app.tcloudbase.com/redskoa/weibo/cb&code=b96cec8eebfc13017343542251f30cf1'
  axios.post(url, {
    client_id: appkey,
    client_secret: secret,
    grant_type: 'authorization_code',
    code: 'b96cec8eebfc13017343542251f30cf1',
    redirect_uri: oauth_callback_url
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
})

router.get('/users/show', function (ctx, next) { 
  axios.get('https://api.weibo.com/2/users/show.json', {
    params: {
      appkey: '1120585538',
      access_token: '2.00JRBECCSUrpNBf94ad565f3jIhkBB',
      uid: 1404376560  
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
  
})

module.exports = router