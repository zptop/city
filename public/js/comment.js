var perpage = 2; //每页的条数
var page = 1;    //当前页数
var pages = 0;   //总页数
var comments = [];

$("#basic-addon2").on('click',function () {
    $.ajax({
        type:'post',
        url:'/api/comment/post',
        data:{
            contentId:$('#contentId').val(),
            content:$('#messageContent').val()
        },
        success:function (res) {
            $('#messageContent').val('');
            if(res.code==0){
                if(res.data.comments.length>0){
                    comments = res.data.comments.reverse();
                    renderComment();
                }
            }
        }
    })
});

/**
 * 页面初始化时获取评论信息
 */
$.ajax({
    url:'/api/comment',
    data:{
      contentId:$('#contentId').val()
    },
    success:function (res) {
        if(res.code==0){
            if(res.data.length>0){
                comments = res.data.reverse();
                renderComment();
            }
        }
    }
});

/**
 * 点击上一页或下一页
 */
$('.pager li').on('click',function () {
   if($(this).hasClass('previous')){
       page--;
   } else {
       page++;
   }
    renderComment();
});

function renderComment() {
    var start = Math.max(0,(page-1)*perpage);
    var end =  Math.min(start + perpage,comments.length);
    pages = Math.max(1,Math.ceil(comments.length/perpage));
    var $lis = $('.pager li');
    $lis.eq(1).html(page+'/'+pages);

    if(page<=1){
        page = 1;
        $lis.eq(0).html('<span>没有上一页了</span>');
    }else{
        $lis.eq(0).html('<a href="javascript:;">上一页</a>');
    }
    if(page>=pages){
        page = pages;
        $lis.eq(2).html('<span>没有下一页了</span>');
    }else{
        $lis.eq(2).html('<a href="javascript:;">下一页</a>');
    }

    if(comments.length>0){
        var html = '';
        for(var i=start;i<end;i++){
            html += '<div class="list-group">\n' +
                '        <div class="list-group-item clear-fix">\n' +
                '            <h4 class="list-group-item-heading">'+comments[i].username+'</h4>\n' +
                '            <time>'+formateDate(comments[i].postTime)+'</time>\n' +
                '        </div>\n' +
                '        <p class="list-group-item-text">'+comments[i].content+'</p>\n' +
                '    </div>';
        }
        $(".comment-list").html(html);
        $('.no-leave-comments').html('');
    }else{
        $('.no-leave-comments').html('还没有留言');
        $(".comment-list").html('<span>一共 <b class="comment-list-num"></b> 条评论</span>');
    }
}

function formateDate(date) {
    var objDate = new Date(date);
    return objDate.getFullYear()+'年'+(objDate.getMonth()+1)+'月'+objDate.getDate()+'日 '+objDate.getHours()+'时'+objDate.getMinutes()+'分'+objDate.getSeconds()+'秒';
}