var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content');
var data = {};
/**
 * 处理通用的数据
 */
router.use(function (req,res,next) {
       data.id = req.query.id || '';
       data.userInfo = req.userInfo;
       data.categories = [];         //分类列表信息
       Category.find().then(function (categories) {
           data.categories = categories;
           next();
       });
});

/**
 * 首页
 */
router.get('/',function (req,res,next) {
    /**
     * 从数据库中查找分类列表渲染
     * 从数据库中查找分类内容渲染
     */
    var where = {};
        data.contents=[];                        //分类内容信息
        data.count=0;
        data.page = Number(req.query.page || 1); //初始页
        data.limit = 2;                          //每页展示的条数
        data.pages = 0;                         //总页数

    data.id && (where.category = data.id);
    Content.where(where).count().then(function (count) {
        data.count = count;
        data.pages = Math.ceil(data.count/data.limit); //向上取整
        //取值不能大于pages
        data.page = Math.min(data.page,data.pages);
        //取值不能小于1
        data.page = Math.max(data.page,1);
        var skip = (data.page-1)*data.limit;            //忽略的条数
        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category','user']).sort({addTime:-1});
    }).then(function (contents) {
        data.contents = contents;
        res.render('main/index',data);
    });
});

/**
 * 阅读全文
 */
router.get('/view',function (req,res,next) {
       var contentid = req.query.contentid || '';
       Content.findOne({
           _id:contentid
       }).then(function (content) {
           data.content = content;
           content.views++;
           content.save();
           res.render('main/view',data);
       });
});

module.exports = router;