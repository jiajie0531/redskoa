const router = require('koa-router')()
const WeiboText = require('../models/weibo-text-model');

router.prefix('/news')

router.get("/list", async function(ctx){
  let whereObj = {}
  let page_size = 20, page_index = 1;
  if (ctx.query.page_size) page_size = Number(ctx.query.page_size)
  if (ctx.query.page_index) page_index = Number(ctx.query.page_index) 

  let items = await WeiboText.findAndCountAll({
    where: {},
    order: [
      ['id', 'desc']
    ],
    limit: page_size,
    offset: (page_index-1)*page_size, 
    distinct:true
  })

  console.log(page_size, page_index, whereObj);

  ctx.status = 200
  ctx.body = {
    coce:200,
    msg:'ok',
    data:items
  }
})

module.exports = router