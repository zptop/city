var express = require('express');
var router = express.Router();
var Content = require('../models/Content');
var User = require('../models/User');

/**
 * 统一返回格式
 */
var responseData;

router.use(function (req,res,next) {
     responseData = {
         code:0,
         msg:''
     };
     next();
});

/**
 * 注册
 */
router.post('/user/register',function (req,res,next) {

     //校验
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    if(username == ''){
        responseData.code = 1;
        responseData.msg = '用户不能为空';
        res.json(responseData);
        return;
    }
    if(password == ''){
        responseData.code = 2;
        responseData.msg = '密码不能为空';
        res.json(responseData);
        return;
    }
    if(repassword!=password){
        responseData.code = 3;
        responseData.msg = '两次输入的密码不一致';
        res.json(responseData);
        return;
    }

    /**
     * 用户名是否已经被注册了，如果数据库中已经存在和我们要注册的用户同名的数据，表示该用户已经被注册了
     * 若没有注册，则存入数据库
     */
    User.findOne({
        username:username
    }).then(function (userInfo) {
        if(userInfo){
            responseData.code = 4;
            responseData.msg = '该用户已被注册';
            res.json(responseData);
            return;
        }
        //保存用户到数据库
        var user = new User({
            username:username,
            password:password
        },false);
        //返回的是一个promise对象
        return user.save();
    }).then(function (newUserInfo) {
        if(newUserInfo) {
            responseData.msg = '注册成功';
            res.json(responseData);
        }
    });
});

/**
 * 登录
 */
router.post('/user/login',function(req,res,next){
        var username = req.body.username;
        var password = req.body.password;
        if(username==''||password==''){
            responseData.code = 5;
            responseData.msg = '用户名和密码不能为空';
            res.json(responseData);
            return;
        }

        //查询数据库中相同用户名和密码的记录是否存在，如果存在则登录成功
        User.findOne({
            username:username,
            password:password
        }).then(function (userInfo) {
            if(!userInfo){
                responseData.code = 6;
                responseData.msg = '用户名或密码错误';
                res.json(responseData);
                return;
            }
            //登录成功,设置cookies信息
            req.cookies.set('userInfo',JSON.stringify(userInfo));
            responseData.msg = '登录成功';
            res.json(responseData);
            return;
        });
});

/**
 * 获取指定内容的评论
 */
router.get('/comment',function (req,res,next) {
      var contentId = req.query.contentId || '';
      Content.findOne({
          _id:contentId
      }).then(function (content) {
          responseData.data = content.comments;
          res.json(responseData);
      })
});

/**
 * 退出
 */
router.get('/user/logout',function (req,res,next) {
       req.cookies.set('userInfo',null);
       res.json(responseData);
});

/**
 * 提交评论
 */
router.post('/comment/post',function (req,res,next) {
    var contentId = req.body.contentId;
    var postData = {
        username : req.userInfo.username,
        postTime : new Date(),
        content : req.body.content
    };
    Content.findOne({
        _id:contentId
    }).then(function (content) {
        content.comments.push(postData);
        return content.save();
    }).then(function (newContent) {
        responseData.msg = '评论成功';
        responseData.data = newContent;
        res.json(responseData);
    });
});

module.exports = router;