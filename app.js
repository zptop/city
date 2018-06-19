/**
 * 应用程序入口文件
 */
var express = require('express');
//加载模板
var swig = require('swig');

//导入数据库连接
var mongoose = require('mongoose');

//处理post请求的参数
var bodyParser = require('body-parser');

var User = require('./models/User');

//cookies,记录登录状态
var Cookies = require('cookies');

//创建app应用->nodejs
var app = express();

//设置静态文件托管
//当用户访问的url以/public开始，那么直接返回对应的__dirname+'/public'下的文件
app.use('/public',express.static(__dirname+'/public'));

//配置应用模板
//定义当前应用所使用的模板引擎
//第一个参数：模板引擎的名称，同时也是模板文件的后缀;第二个参数表示用于解析处理模板内容的方法
app.engine('html',swig.renderFile);

//设置模板文件存放的目录，第一个参数必须是views,第二个参数是目录
app.set('views','./views');

//注册所使用的模板引擎，第一个参数必须是view engine,第二个参数和app.engine这个方法中定义的模板引擎的名称(第一个参数)是一致的
app.set('view engine','html');

//在开发过程中需要取消模板缓存的限制
swig.setDefaults({cache:false});

//body-parser设置
app.use(bodyParser.urlencoded({extended:true}));

//设置cookies
app.use(function (req,res,next) {
   req.cookies = new Cookies(req,res);
   req.userInfo = {};
   if(req.cookies.get('userInfo')){
       try{
           req.userInfo = JSON.parse(req.cookies.get('userInfo'));

           //从数据库中获取当前登录用户的类型，是否是管理员,我们已经知道当前用户的登录_id了，在数据库中能过_id查询用户的类型
           User.findById(req.userInfo._id).then(function (userInfo) {
              req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
           });
           next();
       }catch (e){
           next();
       }
   }else{
       next();
   }
});

/**
 * 根据不同的功能划分模块
 */
app.use('/admin',require('./routers/admin')); //用户管理
app.use('/api',require('./routers/api'));     //接口
app.use('/',require('./routers/main'));       //首页

//连接数据库
mongoose.connect('mongodb://localhost:27018',function (err) {
    if(err){
        console.log('数据库连接失败');
    }else{
        console.log('数据库连接成功');
        //监听http请求
        app.listen(8081);
    }
});

/**
 * 用户发送http请求-> url -> 解析路由 -> 找到匹配的规则 -> 执行指定的绑定函数，返回对应内容至用户
 * /public -> 静态 -> 直接读取指定目录下的文件，返回给用户 ->
 * 动态 -> 处理业务逻辑，加载模板，解析模板 -> 返回数据给
 */

