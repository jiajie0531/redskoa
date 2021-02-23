const axios = require('axios');
const router = require('koa-router')() 
const config = require('../config/weibo-config')
const passport = require('l-passport');
const WeiboSdk = require('../models/weibo-sdk-model');
const WeiboText = require('../models/weibo-text-model')
const WeiboToken = require('../models/weibo-token-model');
const md5 = require('md5'); 
const jregex = require('../lib/jregex');

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
  let weiboSdkOld = await WeiboSdk.findOne({
    where: {
      appkey: config.appkey
    }
  });

  let code = "0";
  if (weiboSdkOld) {
    code = weiboSdkOld.code;
  }
  let url = 'https://api.weibo.com/oauth2/access_token?client_id=' + config.appkey + 
  '&client_secret=' + config.secret + 
  '&grant_type=authorization_code&redirect_uri=' + config.oauth_callback_url + 
  '&code=' + code;
  
  await axios.post(url, {
  })
  .then(async function (response) {
    console.log(response);
    let { 
      access_token,
      remind_in,
      expires_in,
      uid,
      isRealName
    } = response.data;
    // 返回成功添加的对象
    let res = await WeiboToken.create({
      access_token,
      remind_in,
      expires_in,
      uid,
      isRealName
    })
    ctx.status = 200
    ctx.body = {
      code: 200,
      msg: res ? 'ok' : '',
      data: response.data
    }
  })
  .catch(function (error) {
    console.log(error);
  });
})

/**
 * 根据用户ID获取用户信息
 */
router.get('/users/show', async function (ctx, next) {
  let res = await WeiboToken.findAll({
    raw: true,
    limit: 1,
    where: {
      //your where conditions, or without them if you need ANY entry
    },
    order: [['id', 'DESC']]
  }); 

  if (!res) {
    ctx.status = 200
    ctx.body = {
      code: 200,
      msg: res ? 'ok' : '',
      data: res
    }
  }

  let lastToken = res[0].access_token;
  ctx.session.access_token = lastToken;
  let uid = res[0].uid
  if (ctx.query.uid) uid = Number(ctx.query.uid)
  // console.log(lastToken);

  await axios.get('https://api.weibo.com/2/users/show.json', {
    params: {
      appkey: config.appId,
      access_token: lastToken,
      uid: uid
    }
  })
  .then(function (response) {
    console.log(response);
    ctx.status = 200
    ctx.body = {
      code: 200,
      msg: response ? 'ok' : '',
      data: response.data
    }
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
      // always executed
  });
})

/**
 * statuses/home_timeline
 * 获取当前登录用户及其所关注（授权）用户的最新微博
 */
router.get('/home_timeline', async function (ctx, next) { 
  let res = await WeiboToken.findAll({
    raw: true,
    limit: 1,
    where: {
      //your where conditions, or without them if you need ANY entry
    },
    order: [['id', 'DESC']]
  }); 

  if (!res) {
    ctx.status = 200
    ctx.body = {
      code: 200,
      msg: res ? 'ok' : '',
      data: res
    }
  }

  let lastToken = res[0].access_token;
  ctx.session.access_token = lastToken;
  console.log('***')
  console.log(ctx.session.access_token)
  console.log('===')
  
  let url = 'https://api.weibo.com/2/statuses/home_timeline.json';

  await axios.get(url, {
    params: { 
      access_token: lastToken,
      count: 99,
      feature: 0,
      base_app: 0,
      trim_user: 0 
    }
  })
  .then(async function (response) {
    console.log(response.data.statuses); 
    response.data.statuses.forEach(element => {
      let { 
        user,
        mid,
        text,
        textLength,
        thumbnail_pic,
        bmiddle_pic,
        original_pic
      } = element;
      let textMd5 = md5(text); 
      let textHref = jregex.urlify(text); 
      if (textLength == null) {
        textLength = 0;
      }
      let uid = user.id;
      let uname = user.name;
      // 返回成功添加的对象
      let res = WeiboText.create({
        uid,
        uname,
        mid,
        text,
        textLength,
        textMd5,
        textHref,
        thumbnail_pic,
        bmiddle_pic,
        original_pic
      })
    });

    ctx.status = 200
    ctx.body = {
      code: 200,
      msg: 'ok',
      data: response.data
    }
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

/**
 * statuses/show
 * 根据微博ID获取单条微博内容
 */
router.get('/statuses/show', async function (ctx, next) { 
  let res = await WeiboToken.findAll({
    raw: true,
    limit: 1,
    where: {
      //your where conditions, or without them if you need ANY entry
    },
    order: [['id', 'DESC']]
  }); 

  if (!res) {
    ctx.status = 200
    ctx.body = {
      code: 200,
      msg: res ? 'ok' : '',
      data: res
    }
  }

  let lastToken = res[0].access_token;
  ctx.session.access_token = lastToken;
  console.log('***')
  console.log(ctx.session.access_token)
  console.log('===')
  
  let url = 'https://api.weibo.com/2/statuses/show.json';

  await axios.get(url, {
    params: { 
      access_token: lastToken,
      id: ctx.request.query.id 
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