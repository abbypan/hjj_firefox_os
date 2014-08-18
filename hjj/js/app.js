var HJJ='http://bbs.jjwxc.net';
//var IMGUR_CLIENT_ID = lscache.get('imgur_client_id') || '4c649ea4735c42a';
var RECENT_MSEC = 1000*60*60*24*3;
var THREAD_HISTORY_MINUTE = 60*24*10;
var THREAD_FLOOR_MINUTE =  60*24*7;
var RECENT_THREAD_SECOND = 3*24*60*60;
var BOARD_MENU_MINUTE = 5*24*60;
var MAX_HISTORY_CNT = 300;
var HISTORY_CNT = lscache.get('history_cnt') || -1;
var JUMP_FLOOR_CNT = lscache.get('showmsg_jump_floor') || 50;
var FILTER_THREAD_KEYWORD = lscache.get('filter_thread_keyword') || '';
var FILTER_THREAD_KEYWORD_LIST;
var INIT = 0;
var DEFAULT_USERNAME = '==';

var DEFAULT = {};
DEFAULT["loadimg"] = lscache.get('loadimg') || 'on';
DEFAULT["share_tz"] = lscache.get('share_tz') || 'on';
PAGE_TYPE = '';
// {{ base
function is_key_match_list(k, list){
    for(var i in list){
        var m = list[i];
        if(k.match(m)) return true;
    }
    return false;
}

function is_recent(dt){
    var t = dt.replace(/-/g,'/');
    var diff = new Date() - new Date(t);
    return diff<RECENT_MSEC ? 1 : 0;
}

function get_rem_key(x){
    var u = x.url;
    var k = x.key;
    return (k==undefined)? u : k;
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

function format_cache_key(head, data, keylist){
    var s = [ head ];
    for(var i in keylist){
        var k = keylist[i];
        s.push(data[k]);
    }
    return s.join(",");
}
//}}
// {{ imgur
//function upload_imgur (file) {
    //xhttp = new XMLHttpRequest(),
    //fd = new FormData();
    //fd.append('image', file);
    //xhttp.open('POST', 'https://api.imgur.com/3/image');
    //xhttp.setRequestHeader('Authorization', 'Client-ID '+ IMGUR_CLIENT_ID); 
    //alert(fd);
    //xhttp.onreadystatechange = function () {
        //if (xhttp.status === 200 && xhttp.readyState === 4) {
            //var res = JSON.parse(xhttp.responseText), link, p, t;
            //link = res.data.link;
            //$('.upload_pic_status').html(link);
            //alert(link);
        //}
    //};
    //xhttp.send(fd);
//}

//function upload_init(){
    //var fileinput = document.querySelector('.upload_pic_btn'),
    //self = this;
    //fileinput.addEventListener('change', function (e) {
        //var files = e.target.files, file, p, t, i, len;
        //for (i = 0, len = files.length; i < len; i += 1) {
            //file = files[i];
            //if (file.type.match(/image.*/)) {
            //$('.upload_pic_status').html('upload...');
            //upload_imgur(file);
            //} else {
                //$('.upload_pic_status').html('err...');
            //}
        //}
    //}, false);
//}

// }}
// {{{ home
function home() {
    var rem = lscache.get('home');
    if(rem) $('#home_content').html(rem);

    $('#manual_jump').find('input').eq(0).val('');

    var xhr = (XMLHttpRequest.noConflict ? new XMLHttpRequest.noConflict() : new XMLHttpRequest({mozSystem: true}));

    xhr.open("GET", HJJ, true);
    xhr.overrideMimeType('text/plain; charset=gb2312');
    xhr.withCredentials = true;

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

            var body_h = $('#home_content').html()
                .replace(/http:\/\/bbs.jjwxc.net\/showmsg.php/g, '#showmsg')
                .replace(/target="_blank"/g,'')
                .replace(/<\/?ul>/g, '')
                .replace(/<\/li>/g, '<br />')
                .replace(/<li>/g, '');
            $('#home_content').html(body_h);
            lscache.set('home', body_h);
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
            lscache.set('board_menu', $('#board_menu_content').html(), BOARD_MENU_MINUTE);
        }
    }
    xhr.send();
}

function board_menu(){
    var rem = lscache.get('board_menu');
    if(rem){
        $('#board_menu_content').html(rem);
    }else{
        $('#board_menu').find("div").each(
                function(){
                    board_menu_zone($(this));
                });
    }

    $("#filter_board").on( "filterablefilter", function( event, ui ) {
        ui.items.each(function( index ) {
            $(this).collapsible("option", "collapsed", $(this).hasClass("ui-screen-hidden")).removeClass("ui-screen-hidden");
        });
    });
}
// }}}
// {{ fav_board
function fav_board() {
    var s= '';
    var cnt = lscache.get('board_save_cnt') || 0;
    if(cnt>0){
        var x = [];
        for(var i=1;i<=cnt;i++){
            var d = lscache.get( 'board_save_' + i);
            if(d) x.push(d);
        }
        s += format_url_title(x);
    }
    $('#fav_board').find('ul').html(s);
    $('#fav_board').find('ul').trigger('create');
}

function toggle_action_html(key, elem, add_s, del_s){
    if(lscache.get(key)){
        $(elem).html(del_s);
        $(elem).attr('action', 'del');
    }else{
        $(elem).html(add_s);
        $(elem).attr('action', 'add');
    }
}

function toggle_action(k, elem, cache_k, data){
    var save_i = lscache.get(k);
    var act_cnt = lscache.get(cache_k + '_cnt') || 0;

    var act = $(elem).attr('action');
    if(act && act=='del'){
        if(save_i && act_cnt!=save_i){
            var m = lscache.get(cache_k + '_' + act_cnt);
            lscache.set( cache_k + '_' + save_i, m);
            lscache.set(m, save_i);
        }
        lscache.remove(k);
        lscache.set(cache_k + '_cnt', act_cnt-1);
        lscache.remove(cache_k + '_' + act_cnt);
    }else{
        act_cnt++;
        lscache.set(k, act_cnt);
        lscache.set(cache_k + '_cnt', act_cnt);
        lscache.set( cache_k + '_' + act_cnt, data);
    }
}

function check_fav_board(){
    var info = get_board_info();
    var k = format_cache_key('board_save', info, ["board"]);
    toggle_action_html(k, '#board_save', '收藏', '取消收藏');
}

function get_board_info(){
    var x = {
        title : $('#board_title').html(),
        board : $('#board_id').html()
    };
    x["local_url"] = "#board?" + board_para_string(x, { page : 1 });
    return x;
}

function board_save(){
    var info = get_board_info();
    var k = format_cache_key('board_save', info, ["board"]);

    toggle_action(k, '#board_save', 'board_save', { 
        title : board_save_title(info), 
        url : info.local_url 
    });
    toggle_action_html(k, '#board_save', '收藏', '取消收藏');
    fav_board();
}
// }}
// {{ fav_thread
function fav_thread() {
    var s = '';
    var klist = [ "thread_save", "thread_cache" ];
    for(var i in klist){
        var k = klist[i];
        var cnt = lscache.get(k+'_cnt') || 0;
        if(cnt>0){
            var x = [];
            for(var i=1;i<=cnt;i++){
                var d = lscache.get( k + '_' + i);
                if(d) x.push(d);
            }
            s += format_url_title(x);
        }
    }

    $('#fav_thread').find('ul').html(s);
    $('#fav_thread').find('ul').trigger('create');
}

function get_showmsg_info(){
    var x = {
        board : $('#thread_bid').text(),
        id : $('#thread_tid').text(),
        page : $('#thread_pid').text(),
        title : $('#thread_title').text()
    };
    x["local_url"] = "#showmsg?" + showmsg_para_string(x); 
    x["remote_url"] = HJJ + "/showmsg.php?" + showmsg_para_string(x); 

    var poster = get_showmsg_poster();
    if(poster) x["poster"] = poster;

    return x;
}

function check_cache_thread(){
    var info = get_showmsg_info();
    var k = format_cache_key('thread_cache', info, ["board", "id"]);
    toggle_action_html(k, '#thread_cache', '缓存', '清空缓存');
}

function check_save_thread(){
    var info = get_showmsg_info();
    var k = format_cache_key('thread_save', info, ["board", "id"]);
    toggle_action_html(k, '#thread_save', '收藏', '取消收藏');
}

function thread_save(){
    var info = get_showmsg_info();
    var k = format_cache_key('thread_save', info, ["board", "id"]);

    toggle_action(k, '#thread_save', 'thread_save', { 
        title : thread_save_title(info, info), 
        url : info.local_url
    });
    toggle_action_html(k, '#thread_save', '收藏', '取消收藏');
    fav_thread();
}
// }}
// {{ recent_history
function add_history(x){
    HISTORY_CNT= ( HISTORY_CNT + 1 ) % MAX_HISTORY_CNT;

    var d = new Date();
    x["time"] = d.getTime();

    lscache.set('history,' + HISTORY_CNT, x);
    lscache.set('history_cnt', HISTORY_CNT);
}

function format_url_title(update){
    var s='';
    for(var i in update){
        var d = update[i];
        s += '<li><a href="' + d["url"] + '">' + d["title"] + '</a></li>';
    }
    return s;
}

function format_cache_list(para) {
    var rem = {};

    var sort_time = function (a, b){
        return b["time"]-a["time"]
    };

    var w = 0;
    for(var i=0; i< para["max_length"]; i++){
        var n = para["key"] + "," + i;
        var d = lscache.get(n);
        if(d==undefined) continue;

        var key = get_rem_key(d);
        var time = d["time"];
        if(rem[key]!=undefined && rem[key]["time"]>time) continue;
        rem[key]=d;

        w=1;
    }

    if(w==0) return '';

    var update = [];
    for(var k in rem){
        update.push(rem[k]);
    }
    update.sort(sort_time);

    return format_url_title(update);
}

function recent_history() {
    var s = format_cache_list( {
        "key" : 'history', 
        "max_length" : MAX_HISTORY_CNT
    });
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

function is_filter_thread(title) {
    if(! FILTER_THREAD_KEYWORD) return false;
    if(! FILTER_THREAD_KEYWORD_LIST) 
        FILTER_THREAD_KEYWORD_LIST = FILTER_THREAD_KEYWORD.split(/,/);
    return is_key_match_list(title, FILTER_THREAD_KEYWORD_LIST);
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
        title : tr.find('a').eq(0).text().trim(),
        url : tr.find('a').eq(0).attr('href').replace(/showmsg.php/, '#showmsg'),
        poster : tr.children('td').eq(2).text(),
        time : tr.children('td').eq(3).text(),
        reply : tr.children('td').eq(4).text(),
        hot : tr.children('td').eq(5).text()
    };

    var recent_img = is_recent(info.time) ? '<img class="smallgif" src="icons/new.gif" />' : '';

    var s = '<div class="onethread">' + 
        info.tag+ ': <a href="'+ info.url + '">' + info.title + '</a> '+ href_list + recent_img +
        '<br>' + 
        info.poster + '; 热:' + info.hot + '; 回:' + info.reply + '; ' + info.time + 
        '<br>'+
        '</div>';
    return is_filter_thread(info.title) ? null : s;
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
            <a href="#" class="textarea_format">自动贴图/链接</a> \
            <textarea rows=12 placeholder="内容" name="body" ></textarea> \
            <input type="submit" value="发贴"> \
            </form> \
            ');

            //<input type="file" class="upload_pic_btn" value="上传"> \
            //<div class="upload_pic_status">...</div> \
    //upload_init();

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

function board_save_title(info){
    if(!info) info = get_board_info();
    return '[' + info.board + ']' + info.title;
}

function board(para) {
    PAGE_TYPE='board';
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
                    var ti = board_thread_info($(this));
                    if(ti) thread_info += ti;
                });

            $('#thread_list').html(thread_info);
            $('#new_thread').find('textarea').val('');

            board_title(para, h);

            add_history({
                url : "#board?" + board_para_string(para), 
                title : board_save_title(), 
                key : 'board,' + para.board
            });

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
        var p =  f.find('.floor_poster').text().match(k);
        return  (c || p) ? false : true;
    };

    filter_floor(is_to_filter);
}

function floor_filter(){
    var k = $('#floor_keyword_input').val();

    var is_to_filter = function(f){
        var c = f.find('.flcontent').text().match(k);
        var p =  f.find('.floor_poster').text().match(k);
        return  (c || p) ? true : false;
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

function get_showmsg_poster(){
    if($('.floor').eq(0).find('.floor_poster').length>0){
        return $('.floor').eq(0).find('.floor_poster').text();
    }
    return;
}

function only_poster(){
    var poster = get_showmsg_poster();
    var is_to_filter = function(f){
        var flposter = f.find('.floor_poster').text();
        return  flposter!=poster ;
    };

    filter_floor(is_to_filter);
}

function reverse_floor(){
    var s = [];
    $('.floor').each(function(){
        s.push($(this).prop('outerHTML'));
    });
    var c = s.reverse().join("\n");
    $('#thread_floor_list').html(c);
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
        '<a href="#jump_floor" data-rel="popup" data-position-to="window" data-transition="pop">N</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '<a class="jump_to_prev" href="#">&uarr;</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '<a class="jump_to_next" href="#">&darr;</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '<a class="mark_floor" href="#">M</a>' + 
        '</div>';
    return html;
}

function showmsg_para_string(para, other){
    var x = merge_hash(para, other);
    x.page = x.page || 0;
    return format_para_string(x, [ "board", "id", "page" ]);
}

function share_thread() {
    var info = get_showmsg_info();
    var su = encodeURIComponent(info.remote_url);

    var share_tz = DEFAULT["share_tz"]=='on' ? '@hjjtz' : '';
    var title = thread_save_title(info, info);
    var st = encodeURIComponent(share_tz + ' ' + title);
    var u = 'http://v.t.sina.com.cn/share/share.php';
    var wu = u + '?title=' + st + '&url=' + su;
    window.open(wu, '_blank');
}

function showmsg_jump_floor(dst_f) {
    if(dst_f==undefined) return;
    var k = '#floor' + dst_f.toString();
    if($(k).length>0){
        $.mobile.silentScroll($(k).offset().top);
        return 1;
    }
    return ;
}

function showmsg_jump_page(dst_f){
    var page = parseInt((parseInt(dst_f)-1) / 300);
    var now_page = parseInt($('#thread_pid').html());

    if(now_page == page) {
        showmsg_jump_floor(dst_f);
        return;
    }

    var x = {
        fid : dst_f.toString(), 
        page : page.toString(),
        board : $('#thread_bid').text(),
        id : $('#thread_tid').text()
    };
    var u = '#showmsg?' + showmsg_para_string(x) + '&fid=' + dst_f;
    $.mobile.changePage(u);
}

function showmsg_jump_page_popup(){
    var dst_f = $('#dst_floor').val().toString();
    $('#dst_floor').val('');
    if(dst_f) showmsg_jump_page(dst_f);
    $('#jump_floor').popup('close');
}

function thread_save_title(para, res){
    var s = '[' + para.board + '](' + para.id + '){' +
        res.poster + '}' + res.title;
        return s;
    }

    function showmsg_cache(para) {
        var xhr = new XMLHttpRequest({mozSystem: true});

        var u = HJJ+'/showmsg.php?' + showmsg_para_string(para); 
        xhr.open("GET", u, true);
        xhr.overrideMimeType('text/plain; charset=gb2312');

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var res = extract_showmsg_content(xhr.responseText);

                var local_url = "#showmsg?" + showmsg_para_string(para); 
                lscache.set(local_url, res);

                $('#thread_cache').html('已缓存'+para.page);

                para.page  = para.page + 1;
                if(para.page<para.page_num) {
                    showmsg_cache(para);
                }else{
                    var k = format_cache_key('thread_cache', para, ["board", "id"]);
                    para.page = 0;
                    local_url = "#showmsg?" + showmsg_para_string(para); 

                    toggle_action(k, '#thread_cache', 'thread_cache', {
                        title : thread_save_title(para, res),
                        url : local_url });

                    toggle_action_html(k, '#thread_cache', '缓存', '清空缓存');
                    fav_thread();
                }
            }
        }
        xhr.send();
    }

    function thread_cache() {
        var p = {};
        p["board"] = $('#thread_bid').html();
        p["id"] = $('#thread_tid').html();
        var nm = $('#thread_pager_top').html().match(/共(\d+)页/);
        p["page_num"] = nm ? nm[1] : 1;
        p["page"] = 0;

        var act = $('#thread_cache').attr('action');
        if(act && act=='del'){
            for(var i=0; i<p["page_num"]; i++){
                p.page = i;
                var local_url = "#showmsg?" + showmsg_para_string(p); 
                lscache.remove(local_url);
                $('#thread_cache').html('已移除'+p.page);
            }

            var k = format_cache_key('thread_cache', p, ["board", "id"]);
            toggle_action(k, '#thread_cache', 'thread_cache', {});
            toggle_action_html(k, '#thread_cache', '缓存', '清空缓存');
            fav_thread();
        }else{
            showmsg_cache(p);
        }
    }

    function thread_mark_floor(){
        var info = get_showmsg_info();
        var k = format_cache_key('thread_mark_floor', 
                info, ["board", "id"]);
        var fid = lscache.get(k);
        if(fid) showmsg_jump_page(fid);
    }

    function mark_floor(x) {
        var fid = x.parent().attr('fid');
        var info = get_showmsg_info();
        var k = format_cache_key('thread_mark_floor', 
                info, ["board", "id"]);
        lscache.set(k, fid, THREAD_FLOOR_MINUTE);
    }

    function showmsg_click() {
        $('#showmsg').on('click', '#thread_cache', function(){ thread_cache() });

        $('#showmsg').on('click', '#thread_mark_floor', function(){ 
            thread_mark_floor();
        });

        $('#showmsg').on('click', '.mark_floor', function(){ 
            mark_floor($(this));
        });

        $('#showmsg').on('click', '.jump_to_top', function(){ $.mobile.silentScroll(0); });
        $('#showmsg').on('click', '.jump_to_bottom', function(){ $(document).scrollTop($(document).height()); });

        $('#showmsg').on('click', '.jump_to_prev', function(){
            var x = $(this).parent().prevAll();
            var i = parseInt(JUMP_FLOOR_CNT)-1;
            if(x[i]) {
                var pos = $(x[i]).offset().top;
                $.mobile.silentScroll(pos);
            }else{
                $.mobile.silentScroll(0);
            }
        });

        $('#showmsg').on('click', '.jump_to_next', function(){
            var x = $(this).parent().nextAll();
            var i = parseInt(JUMP_FLOOR_CNT)-1;
            if(x[i]) {
                var pos = $(x[i]).offset().top;
                $.mobile.silentScroll(pos);
            }else{
                $(document).scrollTop($(document).height());
            }
        });

        $('#showmsg').on('click', '#view_img', function(){ view_img(); });

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

        $('#showmsg').on('click', '#thread_save', function(){ thread_save(); });
        $('#showmsg').on('click', '#share_thread', function(){ share_thread(); });
        $('#showmsg').on('click', '#only_poster', function(){ only_poster(); return false; });
        $('#showmsg').on('click', '#min_word_num',function(){ min_word_num(); return false; });
        $('#showmsg').on('click', '#floor_keyword',function(){ floor_keyword(); return false; });
        $('#showmsg').on('click', '#floor_filter',function(){ floor_filter(); return false; });
        $('#showmsg').on('click', '#view_all_floor', function(){ view_all_floor();return false; });
        $('#showmsg').on('click', '#reverse_floor', function(){ reverse_floor();return false; });
    }

    function extract_showmsg_content(d){
        var res = {};
        var tm = d.match(/<title>(.+?)<\/title>/);
        res["title"]  = tm[1].replace(/ —— 晋江文学城网友交流区/,'');

        var pm = d.match(/\>(共\d+页:.+?)<\/div>/);
        res["pager"] = pm ? pm[1].replace(/href=(.+?)>/g, "href=\"#showmsg$1\">").replace(/<\/a>/g, '</a>&nbsp;') : '';

        var h = $.parseHTML(d.replace(/<font color='gray' size='-1'>本帖尚未审核,若发布24小时后仍未审核通过会被屏蔽<\/font><br\/>/g,''));

        var poster = '';

        var floors_info = new Array();
        $(h).find('td[class="read"]').each(function() {
            var bot = $(this);
            var f_i =  extract_floor_info(bot);
            if(!poster) poster = f_i.poster;

            var html = format_floor_content(f_i);
            floors_info.push(html);
        }).promise().done(function(){
            var all_floor = floors_info.join("\n");
            if(DEFAULT["loadimg"]!="on"){ //不看图
                all_floor = all_floor.replace(/<img [\s\S]*?>/ig, '');
            }
            res["floor_list"] = all_floor;
            res["poster"] = poster;
        });

        return res;
    }

    function showmsg_refresh(para) {
        var xhr = new XMLHttpRequest({mozSystem: true});

        var u = HJJ+'/showmsg.php?' + showmsg_para_string(para); 
        xhr.open("GET", u, true);
        xhr.overrideMimeType('text/plain; charset=gb2312');

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var res = extract_showmsg_content(xhr.responseText);
                showmsg_tail(para, res);

                var local_url = "#showmsg?" + showmsg_para_string(para); 
                lscache.set(local_url, res, THREAD_FLOOR_MINUTE);
            }
        }
        xhr.send();
    }

    function showmsg_tail(para, res){
        $('#thread_title').html( res["title"] );
        $('#thread_pager_top').html( res["pager"] );
        $('#thread_pager_bottom').html( res["pager"]);
        $('#thread_floor_list').html(res["floor_list"]);

        $('#thread_floor_list').find('a').each(function(){
            var href = $(this).attr('href');
            if(! href.match(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/)) return;
            href = href.replace(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/g, '#showmsg?')
            $(this).attr('href', href);
        $(this).removeAttr('target');
        $(this).removeAttr('rel');
        });

        check_save_thread();
        check_cache_thread();


        if(para.fid) showmsg_jump_floor(para.fid);

        var local_url = "#showmsg?" + showmsg_para_string(para); 
        add_history({
            url : local_url, 
            title : thread_save_title(para, res), 
            key : 'showmsg,' + para.board + ',' + para.id
        });
    }

    function showmsg_header(para){
        var username = lscache.get('username') || DEFAULT_USERNAME;
        $('#reply_thread').html(
                '<form enctype="multipart/form-data" method="post" action="reply.php?board=&id=" data-ajax="false" target="_newtab"> \
                <input placeholder="名字" type="text" name="username" value="' + username + '">\
                <a href="#" class="textarea_format">自动贴图/链接</a> \
                <textarea rows=12 placeholder="内容" name="body"></textarea> <br> \
                <input type="submit" value="回贴"> \
                </form> \
                ');

                //<input type="file" class="upload_pic_btn" value="上传"> \
                //<div class="upload_pic_status">...</div> \
                //upload_init();

        $('#reply_thread').find('input[name="username"]').on('change', function(){
            lscache.set('username', $(this).val());
        });

        $('#reply_thread').find('form').attr('action', HJJ + "/reply.php?board="+ para.board + '&id=' + para.id);

        $('#thread_to_board').attr('href', "#board?board=" + para.board + '&page=1');

        $('#manual_jump').find('input').eq(0).val(para.board);

        $('#jump_floor').html(
                '<form action="javascript:showmsg_jump_page_popup();"> \
                <input placeholder="楼层" type="text" id="dst_floor" name="dst_floor"> \
                <input type="submit" value="跳转" > \
                </form>');


    }

    function showmsg_banner(para){
        var local_url = "#showmsg?" + showmsg_para_string(para); 
        var u = HJJ+'/showmsg.php?' + showmsg_para_string(para); 
        $('#thread_info').html(
                '<a target="_blank" href="' + u + '" id="thread_title"></a><br> \
                <span id="thread_bid"></span>, \
                <span id="thread_tid"></span>, \
                <span id="thread_pid"></span>, \
                &nbsp; \
                <a id="thread_cache" href="#">缓存</a> \
                &nbsp; \
                <a id="thread_save" href="#">...</a> \
                &nbsp; \
                <a id="share_thread" href="#">分享</a> \
                &nbsp; \
                <a id="thread_mark_floor" href="#">M</a> \
                &nbsp; \
                <a id="thread_refresh" href="#">刷新</a> '
                );

        $('#thread_bid').html(para.board);
        $('#thread_tid').html(para.id);
        $('#thread_pid').html(para.page || 0);

        $('#thread_action').html(
                '<input data-role="none" type="text" name="word_num" value=50 id="min_word_num_input"> \
                <a href="#" id="min_word_num">字数</a>\
                &nbsp; <input data-role="none" type="text" name="floor_keyword" id="floor_keyword_input" placeholder="关键字"> \
                <a href="#" id="floor_keyword">抽取</a> \
                &nbsp; <a href="#" id="floor_filter">过滤</a> \
                <br>\
                <a href="#" id="only_poster">楼主</a> \
                &nbsp; <a href="#" id="view_img">看图</a> \
                &nbsp; <a href="#" id="reverse_floor">倒序</a> \
                &nbsp; <a id="view_all_floor" href="#">全部</a> \
                '
                );

        $('#thread_refresh').attr('href', local_url + '&refresh=1');
    }


    function showmsg(para){
        PAGE_TYPE = 'showmsg';
        var local_url = "#showmsg?" + showmsg_para_string(para); 
        showmsg_header(para);
        showmsg_banner(para);

        var x = lscache.get(local_url);
        if(x && para.refresh==undefined){
            showmsg_tail(para, x);
        }else{
            showmsg_refresh(para);
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

    var s = 'search[' + para.board + '](' + para.topic + ')' + para.keyword;
            add_history({
                url : "#search?" + search_para_string(para), 
                title : s, 
                key : s
            });

            var u = HJJ+'/search.php?' + search_para_string(para); 

            var xhr = new XMLHttpRequest({mozSystem: true});
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

    var url = '#search?' + format_para_string(x, [ "board", "keyword", "topic" ]);

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

function slider_div_html(key, label, on_s, off_s){
    return '<div id="'+ key + '_d" class="setting">' +
        '<label for="' + key + '">' + label + '</label>' +
        '<select name="' + key + 
        '" data-role="slider" id="' + key + '">' + 
        '<option value="on">' + on_s + '</option>' +
        '<option value="off">' + off_s + '</option>' +
        '</select></div>';
}

function slider_init(key, elem){
    $(elem).find('option[value="'+DEFAULT[key]+'"]').attr('selected', 'selected');
    $(elem).on("change", function () {
        DEFAULT[key] = $(this).val();
        lscache.set(key, DEFAULT[key]);
    });
}

function setting_init(){
    $('#setting_content').html(
            '<div class="containing-element">' + 
            slider_div_html('night_color', '', '黑夜', '白天') +
            '<div id="font_size_d" class="setting"> \
            字号： \
            <a class="change_font_size" type="bigger">放大</a> \
            &nbsp; \
            <a class="change_font_size" type="smaller">缩小</a> \
            </div>' + 
            slider_div_html('loadimg', '', '看图', '不看图') + 
            '<div id="showmsg_jump_floor_d" class="setting"> \
            <label for="showmsg_jump_floor">每次跳转N楼</label> \
            <input placeholder="50" type="text" name="showmsg_jump_floor" > \
            </div>' + 
            slider_div_html('share_tz', '分享时是否 @hjjtz', '@', '不@') + 
            '</div>' +
            '<div id="filter_thread_keyword_d" class="setting"> \
            <label for="filter_thread_keyword">贴子标题过滤</label> \
            <input id="filter_thread_keyword" name="filter_thread_keyword" > \
            </div>'  
            );

    $('#setting').find('input[name="showmsg_jump_floor"]').val(JUMP_FLOOR_CNT);

    if(FILTER_THREAD_KEYWORD) $('#filter_thread_keyword').val(FILTER_THREAD_KEYWORD);
    $('#filter_thread_keyword').tagsInput({
        'height':'100px',
        'width':'92%',
        'onChange' : function(){
            FILTER_THREAD_KEYWORD = $(this).val();
            lscache.set('filter_thread_keyword', FILTER_THREAD_KEYWORD);
        }
    });

    $('#setting').find('input[name="showmsg_jump_floor"]').val(JUMP_FLOOR_CNT);
    $('#setting').find('input[name="showmsg_jump_floor"]').on('change', function(){
        JUMP_FLOOR_CNT = $(this).val();
        lscache.set('showmsg_jump_floor', JUMP_FLOOR_CNT);
    });


    $('#night_color').find('option[value="off"]').attr('selected', 'selected');
    $("#night_color").on("change", function () {
        var s= $(this).val()=='on' ?  $('#night_css').html() : ""; 
        $('head').find('style').html(s);

        var t = $(this).val()=='on' ? 'e' : 'a';
        $.mobile.changeGlobalTheme(t);
    });

    slider_init('loadimg','#loadimg');
    slider_init('share_tz','#share_tz');

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
            ["page", "boardpagemsg", "keyword", "refresh", "fid"],                     
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

    //版块
    $('#recent_history').click(function(){ recent_history(); });

    $('#board').on('click', '#board_save', function(){ board_save(); }); 

    $('body').on('click', '.textarea_format', function(){
        var area = $(this).parent().find('textarea').eq(0);
        var f = area.val()
        .replace(/\b(http:\/\/.*?\.(jpg|gif|png|jpeg))\b/ig , "<img src='$1' />\n")
        .replace(/\b(http:\/\/[^\s'"]+)\s/ig , "<a href='$1'>$1</a>\n");
    area.val(f);
    });

    showmsg_click(); //贴子
}

$(document).bind('pageinit',function(e){
    if(INIT>0) return;
    main(); 
    INIT=1;
});
// }}
