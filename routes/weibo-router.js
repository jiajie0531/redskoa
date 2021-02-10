const axios = require('axios');
const router = require('koa-router')() 
const config = require('../config/weibo-config')
const passport = require('l-passport');
const WeiboSdk = require('../models/weibo-sdk-model');

router.prefix('/weibo')

passport.initialize({
  provider: 'weibo',
  appId: config.appkey,
  appSecret: config.secret,
  redirect: config.oauth_callback_url
});

router.get('/login/oath', passport.authorization('weibo'), async (ctx) => { 
  ctx.body = ctx.state.passport;
});

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

router.get('/cb', async function (ctx, next) {
  let url = ctx.url
  // 从上下文的request对象中获取
  let request = ctx.request
  let req_query = request.query
  console.log(req_query);
  let req_querystring = request.querystring

  // 从上下文中直接获取
  let ctx_query = ctx.query
  let ctx_querystring = ctx.querystring

  let weiboSdkOld = await WeiboSdk.findOne({
    where: {
      appkey: config.appkey
    }
  });

  if (!weiboSdkOld) {
    let weiboSdkCreateRes = await WeiboSdk.create({
      code: ctx.request.query.code,
      appkey: config.appkey,
      token: '0'
    });
  } else {
    await WeiboSdk.update({
      code: ctx.request.query.code
    }, {
      where: {
        appkey: config.appkey
      }
    });
  }

  ctx.body = {
    url,
    req_query,
    req_querystring,
    ctx_query,
    ctx_querystring
  }
})

router.get('/oauth2/access_token', async function (ctx, next) { 
  let url = 'https://api.weibo.com/oauth2/access_token?client_id=' + config.appkey + 
  '&client_secret=' + config.secret + 
  '&grant_type=authorization_code&redirect_uri=' + config.oauth_callback_url + 
  '&code=f9ecd947740158d33eae094c9ac72c55'
  
  await axios.post(url, {
  })
  .then(function (response) {
    console.log(response);
    ctx.body = response.data;
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

router.get('/home_timeline', async function (ctx, next) { 
  let url = 'https://api.weibo.com/2/statuses/home_timeline.json';

  await axios.get(url, {
    params: { 
      access_token: '2.00JRBECCSUrpNBf94ad565f3jIhkBB',
      feature: 1  
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
})

router.get('/user_timeline', async function (ctx, next) { 
  let url = 'https://api.weibo.com/2/statuses/user_timeline.json';

  await axios.get(url, {
    params: { 
      access_token: '2.00JRBECCSUrpNBf94ad565f3jIhkBB',
      uid: 1862776555,
      feature: 1  
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
})

router.get('/entry', async function (ctx, next) {
  let n = ctx.session.views || 0;
  ctx.session.views = ++n;
 
  ctx.body = n + ' views';
})
 

module.exports = router