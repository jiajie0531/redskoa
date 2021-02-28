const router = require('koa-router')()
const axios = require('axios');
const md5 = require('md5'); 
const { Op } = require("sequelize");
const BaiduText = require('../models/baidu-text-model');

router.prefix('/baidu')

router.get('/newsQuery', async function (ctx, next) {
    let url = 'http://gwgp-ndvcksqx6ho.n.bdcloudapi.com/newsQuery';

    await axios.get(url, {
        headers: {'X-Bce-Signature': 'AppCode/bc6971fc0ba44b759b841cd41110fd83'},
        params: {
            "title": "曼联",
            "page": "1",
            "needContent": "0",
            "needHtml": "0",
            "needAllList": "0",
            "maxResult": "20"
        }
    })
    .then(async function (response) {
        console.log(response.data.showapi_res_body.pagebean.contentlist);
        response.data.showapi_res_body.pagebean.contentlist.forEach(async element => {
            let {
                link,
                source,
                channelId,
                img,
                havePic,
                channelName,
                title,
                pubDate
            } = element;

            let titleMd5 = md5(title);

            let md5count = await BaiduText.count({
                where: {
                    titleMd5: {
                        [Op.eq]: titleMd5
                    }
                }
            });

            if (md5count == 0) {
                await BaiduText.create({
                    link,
                    source,
                    channelId,
                    img,
                    havePic,
                    channelName,
                    title,
                    titleMd5,
                    pubDate
                })
            }
        });
        
        // ctx.status = 200
        // ctx.body = {
        //     code: 200,
        //     msg: 'ok',
        //     data: response.data.showapi_res_body.pagebean.contentlist
        // }
    })
    .catch(function (error) {
        console.log(error);
    })
    .then(function () {
        // always executed
        ctx.status = 200
        ctx.body = {
            code: 200,
            msg: 'ok',
            data: ctx.query
        }
    });
})

module.exports = router