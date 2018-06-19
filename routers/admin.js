var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

router.use(function (req,res,next) {
   if(!req.userInfo.isAdmin){
      res.send('您没有访问权限');
      return;
   }
   next();
});

/**
 * 首页
 */
router.get('/',function (req,res,next) {
   res.render('admin/index',{
      userInfo:req.userInfo
   })
});

/**
 * 用户管理
 */
router.get('/user',function (req,res,next) {
    /**
     * 从数据库中读取所有的用户数据
     * limit(Number):限制获取的数据条数
     * skip(2):忽略数据的系数 若参数为2，表示忽略前两条，从第三条开始取
     * 每页显示2条
     * 1: 1-2 skip:0 ->(当前页面-1)*limit
     * 2: 3-4 skip:2
     */

    var page = Number(req.query.page || 1);  //初始页
    var limit = 2;                           //每页展示的条数
    var pages = 0;                           //总页数

    //查询数据库总条数
    User.count().then(function (count) {

        pages = Math.ceil(count/limit); //向上取整
        //取值不能大于pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);
        var skip = (page-1)*limit;               //忽略的条数

        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users:users,
                count:count,
                pages:pages,
                limit:limit,
                page:page,
                curPage:'user'
            })
        });
    });
});

/**
 * 分类首页
 */
router.get('/category',function (req,res,next) {
    var page = Number(req.query.page || 1);  //初始页
    var limit = 2;                           //每页展示的条数
    var pages = 0;                           //总页数

    //查询数据库总条数
    Category.count().then(function (count) {

        pages = Math.ceil(count/limit); //向上取整
        //取值不能大于pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);
        var skip = (page-1)*limit;               //忽略的条数

        /**
         * 1:升序
         * -1：降序
         * _id中含有时间戳
         */
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function (categories) {
            res.render('admin/category_index',{
                userInfo:req.userInfo,
                categories:categories,
                count:count,
                pages:pages,
                limit:limit,
                page:page,
                curPage:'category'
            })
        });
    });
});

/**
 * 添加分类
 */
router.get('/category/add',function (req,res,next) {
   res.render('admin/category_add',{
       userInfo:req.usreInfo
   })
});

/**
 * 分类保存
 */
router.post('/category/add',function (req,res,next) {
    var name = req.body.name || '';
    if(name==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            msg:'名称不能为空'
        });
        return;
    }
    
    //到数据库中查询是否有同名的分类
    Category.findOne({
        name:name
    }).then(function (result) {
        if(result){
            res.render('admin/error',{
                userInfo:req.userInfo,
                msg:'已存在同名的分类'
            });
            return Promise.reject();
        }else{
            return new Category({
                name:name
            },false).save();
        }
    }).then(function (newCategory) {
        if(newCategory){
            res.render('admin/success',{
                userInfo:req.userInfo,
                msg:'分类保存成功',
                url:'/admin/category'
            })
        }
    })

});

/**
 * 修改分类
 */
router.get('/category/edit',function (req,res,next) {
    var id = req.query.id;
    Category.findOne({
        _id:id
    }).then(function (category) {
        if(category){
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            });
        }
    });
});

/**
 * 分类修改保存
 */
router.post('/category/edit',function (req,res,next) {
    var id = req.query.id || '';
    var name = req.body.name || '';

    //在数据库中查找要修改的数据信息是否存在
    Category.findOne({
        _id:id
    }).then(function (category) {
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                msg:'分类信息不存在'
            });
            return Promise.reject();
        }else{
            //如果用户没有做任何修改
            if(name == category.name){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    msg:'修改成功',
                    url:'/admin/category'
                });
                return Promise.reject();
            }else{
                //要修改的分类名称是否在数据库中已经存在
                return Category.findOne({
                    _id:{$ne:id},
                    name:name
                });
            }
        }
    }).then(function (sameCategory) {
        if(sameCategory){
            res.render('admin/error',{
                userInfo:req.userInfo,
                msg:'数据库中已存在同名的分类'
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id:id
            },{
                name:name
            });
        }
    }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            msg:'保存成功',
            url:'/admin/category'
        });
    });
});

/**
 * 删除分类
 */
router.get('/category/delete',function (req,res,next) {
     var id = req.query.id;
     Category.remove({
         _id:id
     }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            msg:'删除成功',
            url:'/admin/category'
        })
     });
});

/**
 * 内容首页
 */
router.get('/content',function (req,res,next) {

    var page = Number(req.query.page || 1);  //初始页
    var limit = 3;                           //每页展示的条数
    var pages = 0;                           //总页数

    //查询数据库总条数
    Content.count().then(function (count) {
        pages = Math.ceil(count/limit); //向上取整
        //取值不能大于pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);
        var skip = (page-1)*limit;               //忽略的条数

        Content.find().limit(limit).skip(skip).populate(['category','user']).sort({addTime:-1}).then(function (contents){
            res.render('admin/content_index',{
                userInfo:req.userInfo,
                contents:contents,
                count:count,
                pages:pages,
                limit:limit,
                page:page,
                curPage:'content'
            })
        });
    });
});

/**
 * 添加内容
 */
router.get('/content/add',function (req,res,next) {
   Category.find().sort({_id:-1}).then(function (categories) {
       res.render('admin/content_add',{
           userInfo:req.userInfo,
           categories:categories
       })
   });
});
/**
 * 内容保存
 */
router.post('/content/add',function (req,res,next) {
    if(req.body.category==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            msg:'分类不能为空！'
        });
        return;
    }
    if(req.body.title==''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            msg:'分类标题不能为空！'
        });
        return;
    }
    //保存到数据库
    new Content({
        category:req.body.category,
        title:req.body.title,
        user:req.userInfo._id.toString(),
        description:req.body.description,
        content:req.body.content
    },false).save().then(function (rs) {
         res.render('admin/success',{
             userInfo:req.userInfo,
             msg:'保存成功',
             url:'/admin/content'
         });
    });
});

/***
 * 内容修改
 */
router.get('/content/edit',function (req,res,next) {
    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({_id:-1}).then(function (rs) {
        categories = rs;
        return Content.findOne({
            _id:id
        }).populate('category');
    }).then(function (content) {
        if(!content){
            res.render('admin/error',{
                userInfo:req.userInfo,
                msg:'不存在指定的内容'
            });
        }else{
            res.render('admin/content_edit',{
                userInfo:req.userInfo,
                categories:categories,
                content:content
            });
        }
    });
});

/**
 * 保存修改内容
 */
router.post('/content/edit',function (req,res,next) {
     var id = req.query.id;
     if(req.body.category==''){
         res.render('admin/error',{
             userInfo:req.userInfo,
             msg:'分类名称不能为空'
         });
         return;
     }
     if(req.body.title==''){
         res.render('admin/error',{
             userInfo:req.userInfo,
             msg:'分类标题不能为空'
         });
         return;
     }
     Content.findOne({
         _id:id
     }).then(function (content) {
        if(!content){
            res.render('admin/error',{
                userInfo:req.userInfo,
                msg:'指定修改的内容不存在'
            });
            return Promise.reject();
        }else{
            return Content.update({
                _id:id
            },{
                category:req.body.category,
                title:req.body.title,
                description:req.body.description,
                content:req.body.content
            });
         }
     }).then(function () {
         res.render('admin/success',{
             userInfo:req.userInfo,
             msg:'修改成功',
             url:'/admin/content'
         })
     });
});

/**
 * 内容删除
 */
router.get('/content/delete',function (req,res,next) {
      var id = req.query.id;
      Content.remove({
          _id:id
      }).then(function () {
         res.render('admin/success',{
             userInfo:req.userInfo,
             msg:'删除成功',
             url:'/admin/content'
         });
      });
});

module.exports = router;