const router = require('koa-router')()
const WechatConfig = require('../models/wechat-config-model');
const { Op } = require("sequelize");

router.prefix('/wechat')

router.get('/approve/config', async function (ctx, next) {
  let whereObj = {}
  let page_size = 20, page_index = 1;
  if (ctx.query.page_size) page_size = Number(ctx.query.page_size)
  if (ctx.query.page_index) page_index = Number(ctx.query.page_index)

  let items = await WechatConfig.findAndCountAll({
    where: {
      appId: {
        [Op.eq]: 'wx8354590d1f69d999'
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
    data: items
  }
})

module.exports = router

