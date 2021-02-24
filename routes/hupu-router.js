const router = require('koa-router')()
const axios = require('axios');
const cheerio = require('cheerio'); 
const md5 = require('md5'); 
const { Op } = require("sequelize");
const HupuText = require('../models/hupu-text-model');

router.prefix('/hupu')

router.get('/title/list', async function (ctx, next) {
  await axios.get('https://bbs.hupu.com/manutd')
  .then( async function (response) {
    // console.log(response);
    let $ = cheerio.load(response.data); 
    let newsData = []; 
    $('div > ul > li > div').each(async function (i, e) {
      if ($(this).find('a.truetit').html()) {
        // console.log(i + 
        //   ':' + $(this).find('a.truetit').html() +  
        //   ':' + 'https://bbs.hupu.com' + $(this).find('a.truetit').attr('href')) 
      
        let news = {};
        news.title = $(this).find('a.truetit').html();
        let titleMd5 = md5($(this).find('a.truetit').html());
        news.titleMd5 =  titleMd5;
        let hrefUrl = $(this).find('a.truetit').attr('href');
        news.href = 'https://bbs.hupu.com' + hrefUrl;
        news.uname = 'hupu';
        news.isDetailed = 0;
        news.isSynced = 0;
        
        newsData.push(news);

        let md5count = await HupuText.count({
          where: {
            titleMd5: {
              [Op.gt]: titleMd5
            }
          }
        }); 

        if (md5count == 0) {
          let res = HupuText.create({
            title: news.title,
            titleMd5: news.titleMd5,
            titleLength: news.title.length,
            href: news.href,
            hrefUrl: hrefUrl,
            uname: news.uname
          })
        }
      }
    });
    return newsData;
  }).then(async function (response) {
    // console.log(response);
    ctx.status = 200
    ctx.body = {
      code: 200,
      msg: response ? 'ok' : '',
      data: response
    }
  })
  .catch(function (error) {
    console.log(error);
  });
})

router.get('/title/info', async function (ctx, next) {
  let hrefUrl;
  if (ctx.query.hrefUrl) hrefUrl = ctx.query.hrefUrl;
  let url = 'https://bbs.hupu.com/' + hrefUrl;
  await axios.get(url)
  .then(function (response) {
    // console.log(response);
    let $ = cheerio.load(response.data); 
    let newsData = []; 
    $('div #container .quote-content').each(function (i, e) {
      // hobbies[i] = $(this).text();
        console.log(i + 
          ':' + $(this).text()); 
        let news = {};
        news.content = $(this).text() 
        newsData.push(news);
    });
    return newsData;
  })
  .then(function (response) {
    // console.log(response);
    ctx.status = 200
    ctx.body = {
      code: 200,
      msg: response ? 'ok' : '',
      data: response
    }
  })
  .catch(function (error) {
    console.log(error);
  });
})

module.exports = router