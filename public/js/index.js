
$(function () {
   var $loginBox = $('#loginBox');
   var $registerBox = $('#registerBox');
   var $loginSuc = $('.login-suc');

    /**
     * 注册和登录切换
     */
    $registerBox.find('.sign-in').on('click',function () {
        $registerBox.hide();
        $loginBox.show();
    });
    $loginBox.find('.sign-up').on('click',function () {
        $registerBox.show();
        $loginBox.hide();
    });

    /**
     * 注册模块
     */
    $registerBox.find('.sign-up').on('click',function () {
       $.ajax({
           type:'post',
           url:'/api/user/register',
           data:{
               username:$registerBox.find('[name="username"]').val(),
               password:$registerBox.find('[name="password"]').val(),
               repassword:$registerBox.find('[name="repassword"]').val()
           },
           dataType:'json',
           success:function (result) {
               $registerBox.find('.msg-tips').html(result.msg);
               if(result.code == 0){
                   setTimeout(()=>{
                       $registerBox.hide();
                       $loginBox.show();
                   },1000)
               }
           }
       })
    });

    /**
     * 登录模块
     */
    $loginBox.find('.sign-in').on('click',function () {
           $.ajax({
               type:'post',
               url:'/api/user/login',
               data:{
                   username:$loginBox.find('[name="username"]').val(),
                   password:$loginBox.find('[name="password"]').val()
               },
               dataType:'json',
               success:function(result){
                   $loginBox.find('.msg-tips').html(result.msg);
                   if(result.code == 0){
                       window.location.reload(true);
                   }
               }
           })
    });

    /**
     * 退出
     */
    $loginSuc.find('a.logout-btn').on('click',function () {
           $.ajax({
               url:'/api/user/logout',
               success:function (result) {
                   if(result.code == 0){
                       window.location.reload(true);
                   }
               }
           })
    });
});