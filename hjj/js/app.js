var HJJ='http://bbs.jjwxc.net';
var THREAD_HISTORY_MINUTE = 60*24*10;
var MAX_HISTORY_CNT = 100;
var JUMP_FLOOR_CNT = 50;
var INIT = 0;
var DEFAULT_USERNAME = '==';
var LOADIMG = lscache.get('loadimg') || 'on';
// {{ base
function save_storage(key, v){
    var s = JSON.stringify(v);
    //lscache.set(key, s);
    window.localStorage.setItem(key, s);
}

function read_storage(key, default_v) {
    //var xdata = lscache.get(key);
    var xdata = window.localStorage.getItem(key);
    var x = xdata ? JSON.parse(xdata) : 
        (default_v ? default_v : []);
    return x;
}

function get_remember_key(x){
    var u = x.url;
    var k = x.key;
    return (k==undefined)? u : k;
}

function check_remember_list(rem_list, d){
    var key = get_remember_key(d);
    for(var x in rem_list){
        var rem_key = get_remember_key(rem_list[x]);
        if(rem_key==key) return x;
    }
    return ;
}

function format_remember_list(para) {
    var s = '';
    var rem = {};
    var update = [];

    for(x in para["data"]){
        var u = para["data"][x].url;
        var k = para["data"][x].key;

        var key = get_remember_key(para["data"][x]);
        if(rem[key]!=undefined) continue;

        if(update.length>para["max_length"]) break;

        s += '<li><a href="' + u + '">' +
            para["data"][x].title + '</a></li>';
        rem[key]=1;
        update.push(para["data"][x]);
    }

    para["data"] = update;
    save_storage(para["key"], update);

    return s;
}

function merge_hash(para, other){
    other = other || {};

    var x = {};
    for(k in para){
        x[k]=para[k];
    }
    for(k in other){
        x[k] = other[k];
    }
    return x;
}

function format_para_string(x, klist){
    var s = [];

    if(klist==undefined){
        for(var k in x){
            if(x[k]!=undefined) {
                s.push(k+'='+x[k]);
            }
        }
    }else{
        for(var i in klist){
            var k = klist[i];
            if(x[k]!=undefined) {
                s.push(k+'='+x[k]);
            }
        }
    }

    var ss = s.join('&');
    return ss;
}

var HISTORY= read_storage('history', []);
var FAV_BOARD=read_storage('fav_board', []);
var FAV_THREAD = read_storage('fav_thread', []);
//}}
// {{{ home
function home() {
    $('#manual_jump').find('input').eq(0).val('');

    var xhr;
    if(window.XMLHttpRequest){
        xhr = new XMLHttpRequest({mozSystem: true}) || new XMLHttpRequest();
    }

    try{
        xhr.open("GET", HJJ, true);
    }catch(e){
        xhr._url = HJJ;
    }

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
            $('#home_mt').html( $(h).find('.cont04').eq(2).html());
            $('#home_ss').html( $(h).find('.cont05').eq(2).html());
            $('#home_yl').html( $(h).find('.cont04').eq(1).html());
            $('#home_pt').html( $(h).find('.cont05').eq(1).html());
            $('#home_qg').html( $(h).find('.cont04').eq(0).html());
            $('#home_cz').html( $(h).find('.cont05').eq(0).html());

            var body_h = $('#home_content').html().replace(
                /http:\/\/bbs.jjwxc.net\/showmsg.php/g, 
                '#showmsg').replace(/target="_blank"/g,'');;
                $('#home_content').html(body_h);
        }
    }
    xhr.send();

}
// }}}
//  {{{ board_menu
function board_menu_zone(zone_li) {
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
        }
    }
    xhr.send();
}

function board_menu(){
    $('#board_menu').find("div").each(
        function(){
        board_menu_zone($(this));
    });

    $("#filter_board").on( "filterablefilter", function( event, ui ) {
        ui.items.each(function( index ) {
            $(this).collapsible("option", "collapsed", $(this).hasClass("ui-screen-hidden")).removeClass("ui-screen-hidden");
        });
    });
}
// }}}
// {{ fav_board
function fav_board() {
    var s = format_remember_list({
        "key" : 'fav_board', 
        "data" : FAV_BOARD, 
        "max_length" : 30,
    });
    $('#fav_board').find('ul').html(s);
    $('#fav_board').find('ul').trigger('create');
}

function check_fav_board(){
    var x = check_remember_list(FAV_BOARD, {
        "key" : $('#board_id').text()
    });

    var v = x!=undefined ? '取消收藏' : '收藏';
    $('#toggle_fav_board').html(v);
}

function toggle_fav_board(){
        var id = $('#board_id').text();
        var x = check_remember_list(FAV_BOARD, { key : id });
        if(x!=undefined){
            delete(FAV_BOARD[x]);
            $('#toggle_fav_board').html('收藏');
        }else{
            FAV_BOARD.unshift({ 
                key : id, 
                url: '#board?page=1&board=' + id, 
                title : $('#board_title').text()
            });

            $('#toggle_fav_board').html('取消收藏');
        }
        save_storage('fav_board', FAV_BOARD);
        fav_board();
}
// }}
// {{ fav_thread
function fav_thread() {
    var s = format_remember_list({
        "key" : 'fav_thread', 
        "data" : FAV_THREAD, 
        "max_length" : 1000,
    });

    $('#fav_thread').find('ul').html(s);
    $('#fav_thread').find('ul').trigger('create');
}

function check_fav_thread(){
    var bid = $('#thread_bid').text();
    var tid = $('#thread_tid').text();

    var x = check_remember_list(FAV_THREAD, {
        "key" : bid+','+tid
    });

    if(x!=undefined){
        $('#toggle_fav_thread').html('取消收藏');
    }else{
        $('#toggle_fav_thread').html('收藏');
    }
}

function toggle_fav_thread(){
    var bid = $('#thread_bid').text();
    var tid = $('#thread_tid').text();
    var title = $('#thread_title').text();

    var x = check_remember_list(FAV_THREAD, {
        "key" : bid+','+tid
    });

    if(x!=undefined){
        delete(FAV_THREAD[x]);
        $('#toggle_fav_thread').html('收藏');
    }else{
        FAV_THREAD.unshift({
            "key" : bid+','+tid, 
            "title" : title, 
            "url" : '#showmsg?board=' + bid + '&id=' + tid
        });
        $('#toggle_fav_thread').html('取消收藏');
    }
    save_storage('fav_thread', FAV_THREAD);
    fav_thread();
}
// }}
// {{ recent_history
function recent_history() {
    var s = format_remember_list(
        {
        "key" : 'history', 
        "data" : HISTORY, 
        "max_length" : MAX_HISTORY_CNT
    }
    );
    $('#recent_history').find('ul').html(s);
    $('#recent_history').find('ul').trigger('create');
}
// }}
// {{ board
function board_para_string(para, other){
    var x = merge_hash(para, other);
    x.type = x.type || '';
    x.page = x.page || 1;
    return format_para_string(x, [ "board", "type", "page", "subid" ]);
}

function board_thread_info(tr) {
    var href_list = '';
    var i = 0;
    tr.find('a').each(function(){
        if(i>0){
            href_list += ' <a href="' + $(this).attr('href').replace(/showmsg.php/, '#showmsg') + '">' + $(this).text() + '</a>';
        }
        i=1;
    });

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
        info.tag+ ': <a href="'+ info.url + '">' + info.title + '</a> '+ href_list +'<br>' + 
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
    var sm = html.match(/本版所属子论坛[^<]+<\/font>([\s\S]*?)<\/span>/);
    var u = sm[1];
    $('#sub_board').find('fieldset').html(u);

    var options = u.replace(/<input.+?value=(\S+)[^>]+>([^<]+)/g, "<option value='$1'>$2</option>")
    .replace(/<option/, '<option selected="selected"')
    ;
    $('#new_thread_subid').html(options);
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

function new_thread(para){
    var username = lscache.get('username') || DEFAULT_USERNAME;
    var u = HJJ + "/postbypolice.php?board="+ para.board;
$('#new_thread').html(
            '<form enctype="multipart/form-data" method="post"  \
            action="/postbypolice.php?board=" data-ajax="false"  \
                target="_newtab"> \
                <input type="hidden" value="→发布新贴子" name="msg"> \
                <input placeholder="名字" type="text" name="username" value="' + username + '">\
                <select id="new_thread_subid" name="subid"> \
                </select> \
                <input type="text" name="subject" placeholder="主题"> \
                <textarea rows=12 placeholder="内容" name="body" ></textarea> \
                <input type="submit" value="发贴"> \
            </form>');
    $('#new_thread').find('input[name="username"]').on('change', function(){
        lscache.set('username', $(this).val());
    });
    $('#new_thread').find('form').attr("action", u);
}

function thread_type(para){
    var s = 
        '<li><a href="#board?' + 
        board_para_string(para, { page : 1 }) + 
        '">所有类别</a></li>' +
        '<li><a href="#board?' + 
        board_para_string(para, { page : 1 , type : 'wonderful' }) + 
        '">加精</a></li>' +
        '<li><a href="#board?' + 
        board_para_string(para, { page : 1 , type : 'red' }) + 
        '">套红</a></li>' +
        '<li><a href="' + 
        board_para_string(para, { page : 1 , type : 'star' }) + 
        '">加☆</a></li>' ;
    $('#thread_type').find('ul').html(s);
}

function board(para) {
    thread_type(para);
    new_thread(para);

    $('#manual_jump').find('input').eq(0).val(para.board);

    var url = HJJ + "/board.php?" + board_para_string(para);

    var thread_info = '';
    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.open("GET", url , true);
    xhr.overrideMimeType('text/html; charset=gb2312'); 

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var h = jQuery.parseHTML(xhr.responseText);
            $(h).find('tr[valign="middle"][bgcolor="#FFE7F7"]')
            .each(function(){
                thread_info += board_thread_info($(this));
            });

            $('#thread_list').html(thread_info);
            $('#new_thread').find('textarea').val('');

            board_title(para, h);
            if(para.page==undefined || para.page==1){
                HISTORY.unshift({
                    url : "#board?" + board_para_string(para), 
                    title : $('#board_title').text()
                });
            }


            board_pager(xhr.responseText);
            sub_board(para, xhr.responseText);
        }
    }
    xhr.send();
}
// -- }}
//  {{{ showmsg
function extract_floor_info(info) {
    var c = info.html()
    .replace(/<(table|tr|td|font)[^>]*>/ig, "<$1>")
    .replace(/<\/?marquee[^>]*>/ig, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/ig, "")
    ;
    var w = info.text().length;
    var meta = info.parents("tr:eq(1)").next().text();

    var m = meta.match(/№(\d+).+?☆☆☆(.*?)于([\d\s:-]+)留言☆☆☆/);
    return {
        content: c,
        word_num: w,
        id: parseInt(m[1]),
        poster: m[2] || ' ',
        time: m[3]
    };
}
function filter_floor(is_to_filter) {
    var i = 0;
    $('.floor').each(function() {
        if(i>0 && is_to_filter($(this))) $(this).hide(); 
        i=1;
    });
}

function view_img(){
    var is_to_filter = function(f){
        var c = f.find('.flcontent').eq(0).html();
        return  c.match(/\<img /i) ? 0 : 1;
    };

    filter_floor(is_to_filter);
}

function floor_keyword(){
    var k = $('#floor_keyword_input').val();

    var is_to_filter = function(f){
        var c = f.find('.flcontent').text().match(k);
        return  c ? false : true;
    };

    filter_floor(is_to_filter);
}

function floor_filter(){
    var k = $('#floor_keyword_input').val();

    var is_to_filter = function(f){
        var c = f.find('.flcontent').text().match(k);
        return  c ? true : false;
    };

    filter_floor(is_to_filter);
}

function min_word_num(){
    var min = $('#min_word_num_input').val();

    var is_to_filter = function(f){
        var c = f.find('.flcontent').attr('word_num');
        return  c<min;
    };

    filter_floor(is_to_filter);
}

function view_all_floor(){
    $('.floor').each(function() {
        $(this).show();
    });
}

function only_poster(){
    var poster = $('.floor').eq(0).find('.floor_poster').text();
    var is_to_filter = function(f){
        var flposter = f.find('.floor_poster').text();
        return  flposter!=poster ;
    };

    filter_floor(is_to_filter);
}

function format_floor_content(f) {
    var html = '<div class="floor" id="floor' + f.id + '" fid="'+ f.id +'">' +
        '<div class="flcontent" word_num="' + f.word_num + '">' + f.content + '</div>' +
        '<span class="chapter">№' + f.id + '<span class="star">☆</span><span class="floor_poster">' + f.poster + '</span><span class="star">☆</span>' + f.time + '<span class="star">☆</span></span>' +
        '&nbsp;' +
        '<a  class="reply_thread_floor" reply_type="cite" href="#">&raquo;</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '<a  class="reply_thread_floor" reply_type="default" href="#">&gt;</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '<a class="jump_to_top" href="#">&uArr;</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '<a class="jump_to_bottom" href="#">&dArr;</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '<a class="jump_to_prev" href="#">&uarr;</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '<a class="jump_to_next" href="#">&darr;</a>' + 
        '</div>';
    return html;
}

function showmsg_para_string(para, other){
    var x = merge_hash(para, other);
    x.page = x.page || 0;
    return format_para_string(x, [ "board", "id", "page" ]);
}

function share_thread() {
    var share_wb = lscache.get('share_tz') || '@hjjtz';
    var u = 'http://v.t.sina.com.cn/share/share.php';
    var title = $('#thread_title').html();
    var poster = $('.floor').eq(0).find('.floor_poster').text();
    var url = encodeURIComponent($('#thread_title').attr('href'));

    var st = encodeURIComponent(share_wb + ' {' + title + '} {' + poster + '} ');
    var wu = u + '?title=' + st + '&url=' + url;
    window.open(wu, '_blank');
}

function showmsg_click() {

    $('#showmsg').on('click', '.jump_to_top', function(){
        $.mobile.silentScroll(0);
        return false;
    });
    $('#showmsg').on('click', '.jump_to_bottom', function(){
        $(document).scrollTop($(document).height());
        return false;
    });

    $('#showmsg').on('click', '.jump_to_prev', function(){
        var fid = $(this).parent().attr('fid');
        var step = lscache.get('showmsg_subpage') || JUMP_FLOOR_CNT;
        var nid = parseInt(fid) - step;
        var k = '#floor' + nid;
        if($(k).length>0){
            $.mobile.silentScroll($(k).offset().top);
        }else{
            $.mobile.silentScroll(0);
        }
        return false;
    });

    $('#showmsg').on('click', '.jump_to_next', function(){
        var fid = parseInt($(this).parent().attr('fid'));
        if(fid==0){
            fid = parseInt($(this).parent().next().attr('fid'));
        }

        var step = lscache.get('showmsg_subpage') || 50;
        var nid = fid + step;
        var k = '#floor' + nid;
        if($(k).length>0){
            $.mobile.silentScroll($(k).offset().top);
        }else{
            $(document).scrollTop($(document).height());
        }
        return false;
    });
    
    $('#showmsg').on('click', '#view_img', function(){
        view_img();
    });

    $('#showmsg').on('click', '.reply_thread_floor', function(){
        $('#reply_thread').find('textarea').val('');
        var reply_type = $(this).attr("reply_type");
        var c = $(this).parent().children('.chapter').text().replace(/\n/g, ' ');
        if(reply_type=="cite") 
            c = "" + 
            $(this).parent().children('.flcontent').text().replace(/(\s*\n)+/g, "\n").trim().substr(0, 100) + 
        "......\n\n" + c ;
        $('#reply_thread').find('textarea').val(c.trim()+"\n");

        $('#reply_thread_a').click();
    });

    $('#showmsg').on('click', 
        '#toggle_fav_thread', function(){
        toggle_fav_thread();
        return false;
    });

    $('#showmsg').on('click', 
        '#share_thread', function(){
        share_thread();
        return false;
    });
    
    $('#showmsg').on('click', '#only_poster', function(){ only_poster(); return false; });
    $('#showmsg').on('click', '#min_word_num',function(){ min_word_num(); return false; });
    $('#showmsg').on('click', '#floor_keyword',function(){ floor_keyword(); return false; });
    $('#showmsg').on('click', '#floor_filter',function(){ floor_filter(); return false; });
    $('#showmsg').on('click', '#view_all_floor', function(){ view_all_floor();return false; });
}

function showmsg_refresh(local_url, para) {
    var u = HJJ+'/showmsg.php?' + showmsg_para_string(para); 
    $('#thread_refresh').attr('href', local_url + '&refresh=1');

    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.open("GET", u, true);
    xhr.overrideMimeType('text/plain; charset=gb2312');

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {

            h = $.parseHTML(xhr.responseText.replace(/<font color='gray' size='-1'>本帖尚未审核,若发布24小时后仍未审核通过会被屏蔽<\/font><br\/>/g,''));

            var tm = xhr.responseText.match(/<title>(.+?)<\/title>/);
            var title_h = tm[1].replace(/ —— 晋江文学城网友交流区/,'');
            $('#thread_title').html( title_h );

            if(para.page==undefined || para.page==0){
                HISTORY.unshift({
                    url : local_url, 
                    title : title_h
                });
            }

            var pm = xhr.responseText.match(/\>(共\d+页:.+?)<\/div>/);
            var page_h = pm ? pm[1].replace(/href=(.+?)>/g, "href=\"#showmsg$1\">").replace(/<\/a>/g, '</a>&nbsp;') : '';
            $('#thread_pager_top').html( page_h );
            $('#thread_pager_bottom').html( page_h );

            var floors_info = new Array();
            $(h).find('td[class="read"]').each(function() {
                var bot = $(this);
                var f_i =  extract_floor_info(bot);
                var html = format_floor_content(f_i);
                floors_info.push(html);
            }).promise().done(function(){
                var all_floor = floors_info.join("\n");
                if(LOADIMG!="on"){ //不看图
                    all_floor = all_floor.replace(/<img [\s\S]*?>/ig, '');
                }

                $('#thread_floor_list').html(all_floor);

                $('#thread_floor_list').find('a').each(function(){
                    var href = $(this).attr('href');
                    if(! href.match(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/)) return;
                    href = href.replace(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/g, '#showmsg?')
                    $(this).attr('href', href);
                    $(this).removeAttr('target');
                    $(this).removeAttr('rel');
                });

                check_fav_thread();
                lscache.set(local_url, $('#thread_content').html(), THREAD_HISTORY_MINUTE);

            });


        }
    }
    xhr.send();
}


function showmsg(para){
    var local_url = "#showmsg?" + showmsg_para_string(para); 
    var remote_url = HJJ + '/showmsg.php?' + showmsg_para_string(para);
    $('#manual_jump').find('input').eq(0).val(para.board);

    $('#thread_info').html(
            '<a target="_blank" href="' + remote_url + '" id="thread_title"></a><br> \
             <span id="thread_bid"></span>, \
            <span id="thread_tid"></span>, &nbsp; \
            <a id="toggle_fav_thread" href="#">...</a> \
            &nbsp; \
            <a id="share_thread" href="#">分享</a> \
            &nbsp; \
            <a id="thread_refresh" href="#">刷新</a> '
    );

    $('#thread_bid').html(para.board);
    $('#thread_tid').html(para.id);

    var username = lscache.get('username') || DEFAULT_USERNAME;
    $('#reply_thread').html(
        '<form enctype="multipart/form-data" method="post" action="reply.php?board=&id=" data-ajax="false" target="_newtab"> \
            <input placeholder="名字" type="text" name="username" value="' + username + '">\
            <textarea rows=12 placeholder="内容" name="body"></textarea> <br> \
            <input type="submit" value="回贴"> \
        </form>'
    );

    $('#reply_thread').find('input[name="username"]').on('change', function(){
        lscache.set('username', $(this).val());
    });

    $('#reply_thread').find('form').attr('action', HJJ + "/reply.php?board="+ para.board + '&id=' + para.id);

    $('#thread_to_board').attr('href', "#board?board=" + para.board + '&page=1');
    
    $('#thread_action').html(
            '<input data-role="none" type="text" name="word_num" value=50 id="min_word_num_input"> \
            <a href="#" id="min_word_num">字数</a>\
            &nbsp; \
            <input data-role="none" type="text" name="floor_keyword" id="floor_keyword_input" placeholder="关键字"> \
            <a href="#" id="floor_keyword">抽取</a> \
            &nbsp; \
            <a href="#" id="floor_filter">过滤</a> \
            <br>\
            <a href="#" id="only_poster">只看楼主</a> \
            &nbsp; \
            <a href="#" id="view_img">看图</a> \
            &nbsp; \
            <a id="view_all_floor" href="#">全部显示</a>'
    );

    $('#thread_floor_list').html('');


    var x = lscache.get(local_url);
    if(x && para.refresh==undefined){
        $('#thread_content').html(x);
        check_fav_thread();
    }else{
        showmsg_refresh(local_url, para);
    }

}
// -- }}}
// {{{ search
function search_init(){
    $('#search_form').html(
        '<form action="javascript:search_thread_action();"> \
            <div> \
                <input type="text" name="keyword" value="" /> \
                <div data-role="fieldcontain"> \
                    <select name="topic" id="search_type"> \
                        <option value="3">贴子主题</option> \
                        <option value="1">主题贴内容</option> \
                        <option value="4">主题贴发贴人</option> \
                        <option value="2">跟贴内容</option> \
                        <option value="5">跟贴发贴人</option> \
                    </select> \
                </div> \
                <button type="submit">查询</button> \
            </div> \
        </form>'
    );
}

function search_para_string(para, other){
    var x = merge_hash(para, other);
    x.act = x.act || 'search';
    x.topic = x.topic!=undefined ? x.topic : 3;
    x.page = x.page || 1;
    return format_para_string(x);
}

function search_thread_info(tr) {
    var info =  {
        id : tr.children('td').eq(0).text(),
        title : tr.find('a').eq(0).text(),
        url : tr.find('a').eq(0).attr('href').replace(/showmsg.php/, '#showmsg').replace(/&keyword=[^&]+/, ''),
        poster : tr.children('td').eq(2).text(),
        time : tr.children('td').eq(3).text(),
        reply : tr.children('td').eq(5).text(),
        hot : tr.children('td').eq(6).text()
    };
    var s = '<div class="onethread">[' + 
        info.id+ '] <a href="'+ info.url + '">' + info.title + '</a><br>' + 
        info.poster + '; 热:' + info.hot + '; 回:' + info.reply + '; ' + info.time + '<br>'+
        '</div>';
    return s;
}

function search(para){
    var xhr = new XMLHttpRequest({mozSystem: true});
    var u = HJJ+'/search.php?' + search_para_string(para); 
    xhr.open("GET", u, true);
    xhr.overrideMimeType('text/plain; charset=gb2312');

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {


            var tm = xhr.responseText.match(/查询到的信息([\s\S]+?)<\/td>/);
            var title_h = tm[1];
            $('#search_info').html( title_h );

            var h = $.parseHTML(xhr.responseText);
            var pager = $(h).find('td[valign="bottom"]').eq(0);
            if(pager){
                var page_h = pager.html().replace(/\/search.php/g, "#search").replace(/\<a\=\"\"/g,'');
                $('#search_pager_top').html( page_h );
                $('#search_pager_bottom').html( page_h );
            }

            $('#search_thread_list').html('');
            var ts = '';
            $(h).find('tr[align="left"]').each(function() {
                var bot = $(this);
                var f_i = search_thread_info(bot);
                ts+=f_i;
            }).promise().done(function(){
                $('#search_thread_list').html(ts);
            });
        }
    }
    xhr.send();
}

function search_thread_action(){
    var x = {};
    x["board"] = $("#board_id").text();
    x["keyword"] =$("#search_form").find("input[name='keyword']").val(); 
    x["topic"] =$("#search_type").val(); 

    HISTORY.unshift({
        url : "#search?" + search_para_string(x), 
        title : 'search: ' + x.keyword
    });

    var url = '#search?board=' + x["board"] + '&keyword=' + x["keyword"] + '&topic=' + x["topic"];
    $("#search_banner").html('查: ' + x["board"] + ',' + x["topic"] + ',' + x["keyword"]);
    $.mobile.changePage( url );
}
// }}}
// {{ setting 
function font_click(ce, e){
        $(ce).click(function(){
            var thisEle = $(e).css("font-size"); 
            var textFontSize = parseFloat(thisEle , 10);
            var unit = thisEle.slice(-2); //获取单位
            var cName = $(this).attr("type");
            if(cName == "bigger"){
                    textFontSize += 2;
            }else if(cName == "smaller"){
                    textFontSize -= 2;
            }
            var sz = textFontSize + unit;
            $(e).css( "font-size" , sz );

            lscache.set('font-size', sz);
        });
}

function setting_init(){
    $('#setting_content').html(
            '<div class="containing-element"> \
            <div id="color_d" class="setting"> \
            <label for="night"></label> \
            <select name="night" data-role="slider" id="night_bgcolor"> \
            <option value="off">白天</option> \
            <option value="on">黑夜</option> \
            </select> \
            </div> \
            <div id="font_size_d" class="setting"> \
            字号： \
            <a class="change_font_size" type="bigger">放大</a> \
            &nbsp; \
            <a class="change_font_size" type="smaller">缩小</a> \
            </div> \
            <div id="loadimg_d" class="setting"> \
            <label for="loadimg"></label> \
            <select name="loadimg" data-role="slider" id="loadimg"> \
            <option value="on">看图</option> \
            <option value="off">不看图</option> \
            </select> \
            </div> \
            <div id="share_d" class="setting"> \
            <label for="share">分享时是否 @hjjtz</label> \
            <select name="share" data-role="slider" id="share_tz"> \
            <option value="on"> @ </option> \
            <option value="off">不 @</option> \
            </select> \
            </div> \
            </div>');

    var share_or_not = lscache.get('share_tz');
    var share_flag = (share_or_not && share_or_not.match(/\S/)) ? 'on' : 'off';
    $('#share_d').find('option[value="'+share_flag+'"]').attr('selected', 'selected');

    $("#share_tz").on("change", function () {
        var s= $(this).val()=='on' ?  '@hjjtz' : ' '; 
        lscache.set('share_tz', s);
    });

    $("#night_bgcolor").on("change", function () {
        var s= $(this).val()=='on' ?  $('#night_css').html() : ""; 
        $('head').find('style').html(s);

        var t = $(this).val()=='on' ? 'e' : 'a';
        $.mobile.changeGlobalTheme(t);
    });

    $('#loadimg').find('option[value="'+LOADIMG+'"]').attr('selected', 'selected');
    $("#loadimg").on("change", function () {
        LOADIMG = $(this).val();
        lscache.set('loadimg', LOADIMG);
    });

    var font_size = lscache.get('font-size') || '112%';
    $("body").css( "font-size" , font_size );
    lscache.set('font-size', font_size);
    font_click(".change_font_size", "body");
}
// }}
// {{ manual_jump
function manual_jump_init(){
    $('#manual_jump_content').html('<input placeholder="大院" type="text" name="board" > \
            <input type="text" name="id" placeholder="门牌"> \
            <input id="manual_jump_btn" type="submit" value="跳转">');

    $('#manual_jump').on('click', '#manual_jump_btn', function(){
            var bid = $('#manual_jump').find('input').eq(0).val();
            $('#manual_jump').find('input').eq(0).val('');
            var tid = $('#manual_jump').find('input').eq(1).val();
            $('#manual_jump').find('input').eq(1).val('');

            if(! bid) return;
            var u = (tid && tid.match(/^\d+$/)) ? ("#showmsg?board=" + bid + '&id=' + tid)  : 
                          ("#board?board=" + bid + '&page=0');

            $.mobile.changePage(u);
    });
}
// }}
// {{ main
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
        ["page", "boardpagemsg", "keyword", "refresh"],                     
        function (para) {
            showmsg(para);
        }
    );

    $.mobile.paramsHandler.addPage(
        "search",                      
        ["board", "keyword"],       
        ["topic", "page", "act"],                     
        function (para) {
            search(para);
        }
    );

    $.mobile.paramsHandler.init();
}
function main(){
    $.support.cors = true;  
    jQuery.support.cors = true;  
    $.mobile.allowCrossDomainPages = true;
    $.mobile.phonegapNavigationEnabled = true;
    $.mobile.ajaxEnabled = true;

    $.mobile.defaultPageTransition = 'none';
    $.mobile.buttonMarkup.hoverDelay = "false";

    $('textarea').elastic(); 
    $(document).bind('swiperight', function () {
        window.history.back();
    });
    $(document).bind('swipeleft', function () {
        window.history.forward();
    });

    params_page();

    home(); //首页
    board_menu(); //版块列表

    search_init(); //查询
    setting_init(); //设置
    manual_jump_init(); //手动跳转
    
    fav_board(); //收藏版块
    fav_thread(); //收藏贴子

    recent_history(); //近期访问
    $('#recent_history').click(function(){ recent_history(); });

    $('#board').on('click', '#toggle_fav_board', function(){
        toggle_fav_board();
    }); //版块
    showmsg_click(); //贴子
}

$(document).bind('pageinit',function(e){
    if(INIT>0) return;
    main(); 
    INIT=1;
});
// }}
