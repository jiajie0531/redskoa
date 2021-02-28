const router = require('koa-router')()
const axios = require('axios');
const md5 = require('md5'); 
const { Op } = require("sequelize");
const cheerio = require('cheerio');
const BaiduText = require('../models/baidu-text-model');
const WeiboText = require('../models/weibo-text-model');

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
        // console.log(response.data.showapi_res_body.pagebean.contentlist);
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

router.get('/news/info', async function (ctx, next) {
    let whereObj = {}
    let page_size = 1, page_index = 1;
    if (ctx.query.page_size) page_size = Number(ctx.query.page_size)
    if (ctx.query.page_index) page_index = Number(ctx.query.page_index)

    let items = await BaiduText.findAll({
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

    await items.forEach(async it => {
        // console.log(it);
        let url = it.dataValues.link;
        await axios.get(url)
            .then(async function (response) {
                //  console.log(response.data);
                let $ = cheerio.load(response.data);
                // console.log($('div #artibody > p').text());
                let newsDetail = $('div #artibody > p').text();

                await BaiduText.update({ detail: newsDetail, isDetailed: 1 }, {
                    where: {
                        id: it.dataValues.id
                    }
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    ctx.status = 200
    ctx.body = {
        code: 200,
        msg: 'ok',
        data: ctx.query
    }
})

router.get('/news/sync', async function (ctx, next) {
    let whereObj = {}
    let page_size = 1, page_index = 1;
    if (ctx.query.page_size) page_size = Number(ctx.query.page_size)
    if (ctx.query.page_index) page_index = Number(ctx.query.page_index)

    let items = await BaiduText.findAll({
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

    await items.forEach(async it => {
        //console.log('*** ');
        //console.log(it.dataValues);

        let {
            channelName,
            id,
            title,
            titleMd5,
            pubDate,
            link,
            img,
            detail
        } = it.dataValues

        let uid = 1;
        let uname = channelName;
        let mid = 'baidu_' + id;
        let text = title;
        let textLength = 99;
        let textMd5 = titleMd5;
        let textHref = link;
        let thumbnail_pic = img;
        let bmiddle_pic = img;
        let original_pic = img;
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

            await BaiduText.update({ isSynced: 1 }, {
                where: {
                    id: it.dataValues.id
                }
            });
        }
    })
    
    ctx.status = 200
    ctx.body = {
        code: 200,
        msg: 'ok',
        data: ctx.query
    }
})

module.exports = router