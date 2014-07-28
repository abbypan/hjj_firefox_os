var HJJ='http://bbs.jjwxc.net';
// 首页 {{{
function home() {

    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.open("GET", HJJ, true);
    xhr.overrideMimeType('text/plain; charset=gb2312');

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            h = $.parseHTML(xhr.responseText);

            var top_h = $(h).find('.cont01 div').eq(2).html();
            top_h = 
                '<div class="headline"><strong>置顶</strong></div>' + 
                top_h.replace(/height:130px;/g,'');
            $('#home_top').html( top_h );

            $('#home_hot').html( $(h).find('.cont03').html());

            $('#home_watch').html( $(h).find('.cont05').eq(2).html());

            var body_h = $('#home_content').html().replace(
                    /http:\/\/bbs.jjwxc.net\/showmsg.php/g, 
                    '#showmsg').replace(/target="_blank"/g,'');;
            $('#home_content').html(body_h);
        }
    }
    xhr.send();

}

// }}}
// 交流区版块列表 {{{

function board_menu(zone_li) {
    var id = zone_li.attr("zid");
    if(id==undefined) return;

    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.open("GET", HJJ +"/index"+id+".htm", true);
    xhr.overrideMimeType('text/html; charset=gb2312'); 

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var tm = xhr.responseText.match(/<font color=red size=\+1>([^<]+)<\/font>/);
            var t = tm[1].replace(/<[^>]+>/g,'');
            var s ='<h3>' + 
                 t + '</h3><ul data-role="listview" data-inset="false">';

            var m = xhr.responseText.match(/<center>[^<]+(<a href="board.php\?board=\d+&page=\d+">[^<]+<\/a>)[^<]+<\/center>/g);
            $.each(m, function(i, v)
                   {
                       var vm = v.replace(/center>/g, 'li>')
.replace(/board.php/, '#board')
;
                       s+=vm;
                   });
                   s+="</ul>";
    $('#board_menu').find('div[zid='+id+']').html(s);
    //$("#board_menu").find('div[zid='+id+']').collapsible().trigger('create');
    //$("#board_menu").find('div[zid='+id+']').parent().collapsibleset().trigger('create');
        }
    }
    xhr.send();
}

function save_storage(key, x){
    var s = JSON.stringify(x);
    localStorage.setItem(key, s);
}

function read_storage(key) {
    var xdata = localStorage.getItem(key);
    var x = xdata ? JSON.parse(xdata) : {};
    return x;
}

function fav_board() {
    var x = read_storage('fav_board');
    var s = '';
//s+='<li data-role="divider" data-theme="e">Choose an action</li>';
    for(k in x){
        s += '<li><a href="#board?board=' + k + '&page=1">' +
            x[k] + '</a></li>';
    }

    $('#fav_board').find('ul').html(s);
}

function fav_thread() {
    var x = read_storage('fav_thread');
    var s = '';
    for(var b in x){
        for(var t in x[b]){
        s += '<li><a href="#showmsg?board=' + b + '&id='+ t + '&page=1">' +
            x[b][t] + '</a></li>';
        }
    }


    $('#fav_thread').find('ul').html(s);
    $('#fav_thread').find('ul').trigger('create');
}

function check_fav_board(){
        var id = $('#board_id').text();
        var title = $('#board_title').text();
        var x = read_storage('fav_board');
        if(x[id]){
            $('#toggle_fav_board').html('取消收藏');
        }else{
            $('#toggle_fav_board').html('收藏');
        }
}

function check_fav_thread(){
        var bid = $('#thread_bid').text();
        var tid = $('#thread_tid').text();
        var title = $('#thread_title').text();
        var x = read_storage('fav_thread');
        if(x[bid] && x[bid][tid]){
            $('#toggle_fav_thread').html('取消收藏');
        }else{
            $('#toggle_fav_thread').html('收藏');
        }
}

function toggle_fav_board() {
    $('#toggle_fav_board').click(function(){
        var id = $('#board_id').text();
        var title = $('#board_title').text();
        var x = read_storage('fav_board');
        if(x[id]){
            delete(x[id]);
            $('#toggle_fav_board').html('收藏');
        }else{
            x[id] = title;
            $('#toggle_fav_board').html('取消收藏');
        }
        save_storage('fav_board', x);
        fav_board();
    });
}

function toggle_fav_thread() {
    $('#toggle_fav_thread').click(function(){
        var bid = $('#thread_bid').text();
        var tid = $('#thread_tid').text();
        var title = $('#thread_title').text();
        var x = read_storage('fav_thread');
        if(x[bid] && x[bid][tid]){
            delete(x[bid][tid]);
            $('#toggle_fav_thread').html('收藏');
        }else{
            if(! x[bid]) x[bid] = {};
            x[bid][tid] = title;
            $('#toggle_fav_thread').html('取消收藏');
        }
        save_storage('fav_thread', x);
        fav_thread();
    });
}

function main(){
    params_page();
    home();
    $('#go_home').click(function(){
        home();
    });

    $('#board_menu').find("div").each(
        function(){
        board_menu($(this));
    });

    $("#filter_board").on( "filterablefilter", function( event, ui ) {
        ui.items.each(function( index ) {
            $(this).collapsible("option", "collapsed", $(this).hasClass("ui-screen-hidden")).removeClass("ui-screen-hidden");
        });
    });




    fav_board();
    toggle_fav_board();
    fav_thread();
    toggle_fav_thread();
}

// -- }}}

// 版块帖子列表 {{{

function board_para_string(para, other){
    para.type = para.type || '';
    other = other || {};

    var x = {};
    for(k in para){
        x[k]=para[k];
    }
    for(k in other){
        x[k] = other[k];
    }

    x.page = x.page || 1;

    var p = "board="+ x.board +
        '&type=' + x.type +
        '&page=' + x.page;
    if(x.subid!==undefined){
        p += '&subid=' + x.subid;
    }
    return p;
}

function board_thread_info(tr) {
    var info =  {
        tag : tr.children('td').eq(0).text(),
        title : tr.find('a').eq(0).text(),
        url : tr.find('a').eq(0).attr('href').replace(/showmsg.php/, '#showmsg'),
        poster : tr.children('td').eq(2).text(),
        time : tr.children('td').eq(3).text(),
        reply : tr.children('td').eq(4).text(),
        hot : tr.children('td').eq(5).text()
    };
    var s = '<div class="onethread">' + 
        info.tag+ ': <a href="'+ info.url + '">' + info.title + '</a><br>' + 
        info.poster + '; 热:' + info.hot + '; 回:' + info.reply + '; ' + info.time + '<br>'+
        '</div>';
    return s;
}


function sub_board_action(){
    var url =$("#sub_board").find("input[name='url']").attr("value"); 

    var id_list = [];
    $("#sub_board").find("input[type='checkbox']")
    .each(function(){
        if($(this).prop("checked")){
            id_list.push($(this).prop("value"));
        }
    });

    if(id_list.length>0){
        var id = id_list.join(',');
        url+='&subid=' + id;
    }

    $.mobile.navigate( url );
}


function sub_board(para, html){
    var url = "#board?" + board_para_string(para, { page : 1 });
    $('#sub_board').find('input[name="url"]').attr("value", url);
    var sm = html.match(/本版所属子论坛｜<\/font>([\s\S]*?)<\/span>/);
    //var u = sm[1].replace(/(<input[^>]+>[^<]+)/g, "<li>$1</li>") ;
    //$('#sub_board').find('fieldset').html("<ul>"+u+"</ul>");
    var u = sm[1];
    $('#sub_board').find('fieldset').html(u);
}

function board_pager(html){
    var pm = html.match(/<div align="right">[^<]+(<a  href=board.php\?board=[\s\S]*?)<\/div>/);
    var u = pm[1].replace(/board.php/g, '#board');
    $('#board_pager_top').html(u);
    $('#board_pager_bottom').html(u);
}

function board_title(para, h){
    var t = $(h).find('font[color="red"]').eq(0).text().trim();
    $('#board_title').html(t);
    $('#board_id').html(para.board);
    check_fav_board();
}

function new_post(para){
    var u = HJJ + "/postbypolice.php?board="+ 
    para.board + "&act=mainpage";
    $('#new_post').find('iframe').attr("src", u);
    //var u = "http://bbs.jjwxc.net/postbypolice.php?board=" + para.board;
    //$('#new_post').find('form').attr("action", u);
}

function thread_type(para){
    var s = 
        '<li><a href="#board?' + board_para_string(para, { page : 1 }) + '">所有类别</a></li>' +
        '<li><a href="#board?' + board_para_string(para, { page : 1 , 
                                                   type : 'wonderful'
    }) + '">加精</a></li>' +
        '<li><a href="#board?' + 
        board_para_string(para, { page : 1 , 
                          type : 'red'
    }) 
    + '">套红</a></li>' +
        '<li><a href="' + 
        board_para_string(para, { page : 1 , 
                          type : 'star'
    }) 

    + '">加☆</a></li>' 
    ;
    $('#thread_type').find('ul').html(s);
    //$('#thread_type').find('ul').listview('refresh');
}

function board(para) {
    thread_type(para);

    var url = HJJ + "/board.php?" + board_para_string(para);

    var thread_info = '';
    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.open("GET", url
        , true);
    xhr.overrideMimeType('text/html; charset=gb2312'); 

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var h = jQuery.parseHTML(xhr.responseText);
            $(h).find('tr[valign="middle"][bgcolor="#FFE7F7"]')
            .each(function(){
                thread_info += board_thread_info($(this));
            });

            $('#thread_list').html(thread_info);

            board_title(para, h);

            if(! para.page || para.page==1){
                $('#recent_history').find('ul').prepend('<li><a href="#board?' + board_para_string(para) + 
                        '">' + $('#board_title').text() +
                        '</a></li>');
            }

            board_pager(xhr.responseText);
            sub_board(para, xhr.responseText);
            new_post(para);
        }
    }
    xhr.send();
}

// -- }}}

// 帖子 {{{
function extract_floor_info(info) {
    var c = info.html();
    var w = info.text().length;
    var meta = info.parents("tr:eq(1)").next().text();
    var m = meta.match(/№(\d+).+?☆☆☆(.*?)于([\d\s:-]+)留言☆☆☆/);
    return {
        content: c,
            word_num: w,
            id: parseInt(m[1]),
            poster: m[2] || '无名氏',
            time: m[3]
    };
}

function add_floor_content(dst, f) {
    var html = '<div class="floor" id="floor' + f.id + '">' +
        '<div class="flcontent">' + f.content + '</div>' +
        '<div class="chapter">№' + f.id + '<span class="star">☆</span>' + f.poster + '<span class="star">☆</span>' + f.time + '<span class="star">☆</span></div>' +
        '</div>';
    $floor = $(html);
    $(dst).append($floor);
}

function showmsg_para_string(para, other){
    para.page = para.page || 0;
    other = other || {};

    var x = {};
    for(k in para){
        x[k]=para[k];
    }
    for(k in other){
        x[k] = other[k];
    }

    var p = "board="+ x.board +
        '&id=' + x.id +
        '&page=' + x.page;
    return p;
}

function showmsg(para){
    $('#thread_bid').html(para.board);
    $('#thread_tid').html(para.id);

    $('#thread_floor_list').html('');

    var xhr = new XMLHttpRequest({mozSystem: true});
    var u = HJJ+'/showmsg.php?' + showmsg_para_string(para); 
    xhr.open("GET", u, true);
    xhr.overrideMimeType('text/plain; charset=gb2312');

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {

    $('#thread_to_board').attr('href', "#board?board=" + para.board + '&page=1');


    h = $.parseHTML(xhr.responseText);


    var tm = xhr.responseText.match(/<title>(.+?)<\/title>/);
    var title_h = tm[1].replace(/ —— 晋江文学城网友交流区/,'');
    $('#thread_title').html( title_h );
    $('#reply_thread').find('form').attr('action', 
            HJJ + "/reply.php?board="+ para.board + '&id=' + para.id);
    check_fav_thread();

    if(para.page==undefined || para.page==0){
        $('#recent_history').find('ul').prepend('<li><a href="#showmsg?' + showmsg_para_string(para) +
                '">' + title_h +
                '</a></li>');
    }

    var pm = xhr.responseText.match(/\>(共\d+页:.+?)<\/div>/);
    if(pm){
        var page_h = pm[1].replace(/href=(.+?)>/g, "href=\"#showmsg$1\">");
        $('#thread_pager_top').html( page_h );
        $('#thread_pager_bottom').html( page_h );
    }

    var floors_info = new Array();
    $(h).find('td[class="read"]').each(function() {
        var bot = $(this);
        var f_i = extract_floor_info(bot);
        floors_info.push(f_i);
    });

    for (var i in floors_info) {
        var f = floors_info[i];
        add_floor_content('#thread_floor_list', f);
    }

    $('#thread_floor_list').find('a').each(function(){
        var href = $(this).attr('href');
        if(! href.match(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/)) return;
        href = href.replace(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/g, '#showmsg?')
        $(this).attr('href', href);
        $(this).removeAttr('target');
        $(this).removeAttr('rel');
    });
    }
    }
    xhr.send();
    $("html, body").animate({ scrollTop: 0 }, "slow");

}
// -- }}}
// 初始化 {{{
function params_page(){

    $.mobile.paramsHandler.addPage(
        "board",                      
        ["board", "page"],       
        ["type", "subid"],                     
        function (para) {
            board(para);
        }
    );

    $.mobile.paramsHandler.addPage(
        "showmsg",                      
        ["board", "id"],       
        ["page", "boardpagemsg"],                     
        function (para) {
            showmsg(para);
        }
    );

    $.mobile.paramsHandler.init();
}
// -- }}}
// 配置项增强 {{
// }}
// {{ 初始化
   $(document).bind('pageinit',function(e ){
main(); });
// }}
