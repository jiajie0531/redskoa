const router = require('koa-router')()
const axios = require('axios');
const cheerio = require('cheerio');
const md5 = require('md5');
const { Op } = require("sequelize");
const HupuText = require('../models/hupu-text-model');
const WeiboText = require('../models/weibo-text-model');

router.prefix('/hupu')

router.get('/title/list', async function (ctx, next) {
  await axios.get('https://bbs.hupu.com/manutd')
    .then(async function (response) {
      // console.log(response);
      let $ = cheerio.load(response.data); 
      let textCount = 0;
      $('div > ul > li > div').each(async function (i, e) {
        if ($(this).find('a.truetit').html()) { 
          let news = {};
          news.title = $(this).find('a.truetit').html();
          let titleMd5 = md5($(this).find('a.truetit').html());
          news.titleMd5 = titleMd5;
          let hrefUrl = $(this).find('a.truetit').attr('href');
          news.href = 'https://bbs.hupu.com' + hrefUrl;
          news.uname = 'hupu';
          news.isDetailed = 0;
          news.isSynced = 0; 

          let md5count = await HupuText.count({
            where: {
              titleMd5: {
                [Op.eq]: titleMd5
              }
            }
          });

          if (md5count == 0) {
            await HupuText.create({
              title: news.title,
              titleMd5: news.titleMd5,
              titleLength: news.title.length,
              href: news.href,
              hrefUrl: hrefUrl,
              uname: news.uname
            })
            textCount++;
          }
        }
      }); 
      return textCount;
    }).then(async function (response) {
      // console.log(response);
      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: 'ok',
        data: response
      }
    })
    .catch(function (error) {
      console.log(error);
    });
})

router.get('/title/info', async function (ctx, next) {
  let whereObj = {}
  let page_size = 3, page_index = 1;
  if (ctx.query.page_size) page_size = Number(ctx.query.page_size)
  if (ctx.query.page_index) page_index = Number(ctx.query.page_index)

  let items = await HupuText.findAll({
    where: {
      isDetailed: {
        [Op.eq]: 0
      }
    },
    order: [
      ['id', 'desc']
    ],
    limit: page_size,
    offset: (page_index - 1) * page_size,
    distinct: true
  })

  // console.log(items);
  let infoCount = 0;
  await items.forEach(async it => {
    // console.log(it.dataValues);
    let url = it.dataValues.href;
    await axios.get(url)
      .then(function (response) {
        //console.log(response);
        let $ = cheerio.load(response.data);
        $('div #container .quote-content').each(async function (i, e) {
          // console.log(i + ':' + $(this).text());
          let news = {};
          news.id = it.dataValues.id
          news.content = $(this).text()
          await HupuText.update({ detail: $(this).text(), isDetailed:1 }, {
            where: {
              id: it.dataValues.id
            }
          });
          infoCount += 1;
          console.log('*** infoCount is ' + infoCount);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  console.log('=== infoCount is ' + infoCount);
  ctx.status = 200
  ctx.body = {
    code: 200,
    msg: 'ok',
    data: infoCount
  }
})

router.get('/title/sync', async function (ctx, next) {
  let whereObj = {}
  let page_size = 1, page_index = 1;
  if (ctx.query.page_size) page_size = Number(ctx.query.page_size)
  if (ctx.query.page_index) page_index = Number(ctx.query.page_index)

  let items = await HupuText.findAll({
    where: {
      isDetailed: {
        [Op.eq]: 1
      },
      isSynced: {
        [Op.eq]: 0
      }
    },
    order: [
      ['id', 'desc']
    ],
    limit: page_size,
    offset: (page_index - 1) * page_size,
    distinct: true
  });

  // console.log(items);

  await items.forEach(async it => {
    //console.log('*** ');
    //console.log(it.dataValues);

    let {
      uname,
      id,
      title,
      titleMd5,
      titleLength,
      href,
      detail 
    } = it.dataValues

    let uid = 0; 
    let mid = 'hupu_' + id; 
    let text = title;
    let textLength = titleLength;
    let textMd5 = titleMd5;
    let textHref = href;
    let thumbnail_pic ='';
    let bmiddle_pic ='';
    let original_pic ='';
    let textDetail = detail;

    const amount = await WeiboText.count({
      where: {
        textMd5: {
          [Op.eq]: titleMd5
        }
      }
    });

    if (amount == 0) {
      await WeiboText.create({
        uid,
        uname,
        mid,
        text,
        textLength,
        textMd5,
        textHref,
        thumbnail_pic,
        bmiddle_pic,
        original_pic,
        textDetail
      });
    }
 
    await HupuText.update({ isSynced:1 }, {
      where: {
        id: it.dataValues.id
      }
    });
  });

  ctx.status = 200
  ctx.body = {
    code: 200,
    msg: 'ok'
  }
})


module.exports = router