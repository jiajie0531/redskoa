const router = require('koa-router')()
const WeiboText = require('../models/weibo-text-model');
const WechatConfig = require('../models/wechat-config-model');
const { Op } = require("sequelize");

router.prefix('/news')

router.get("/list", async function (ctx) {
  let whereObj = {}
  let page_size = 20, page_index = 1;
  if (ctx.query.page_size) page_size = Number(ctx.query.page_size)
  if (ctx.query.page_index) page_index = Number(ctx.query.page_index)

  let countConfig = await WechatConfig.count({
    where: {
      appId: {
        [Op.eq]: 'wx8354590d1f69d999'
      },
      isEnabled: {
        [Op.eq]: 1
      }
    }
  });

  console.log('countConfig is ' + countConfig);
  
  let items = await WeiboText.findAndCountAll({
    where: {
      textLength: {
        [Op.gt]: 0
      }
    },
    order: [
      ['id', 'desc']
    ],
    limit: page_size,
    offset: (page_index - 1) * page_size,
    distinct: true
  })

  console.log(page_size, page_index, whereObj);

  ctx.status = 200
  ctx.body = {
    coce: 200,
    msg: 'ok',
    data: countConfig == 0 ? [] : items
  }
})

module.exports = router