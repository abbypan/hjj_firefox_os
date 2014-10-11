var HJJ='http://bbs.jjwxc.net';
var RECENT_HOT_THREAD_SEC = 1000*60*60*24*3; //最近x天热贴
var THREAD_CACHE_MINUTE = 60*24*7; //默认缓存帖子x天
var THREAD_MARK_MINUTE =  60*24*7;  //记住上回看到哪一楼x天
var BOARD_MENU_MINUTE = 60*24*7; //版块列表缓存x天
var MAX_HISTORY_CNT = 300; //历史记录最多x条
var HISTORY_CNT = lscache.get('history_cnt') || -1;
var FILTER_THREAD_KEYWORD_LIST;
var INIT = 0;
var SHARE_WEIBO = '@hjjtz';
var SHARE_WEIBO_URL = 'http://v.t.sina.com.cn/share/share.php';
var README_URL='https://github.com/abbypan/hjj_firefox_os/blob/master/README.md';

//var IMGUR_CLIENT_ID = lscache.get('imgur_client_id') || '4c649ea4735c42a';
var DEFAULT = {
    username : '==',
    filter_thread_keyword : '',
    loadimg : 'on',
    share_tz : 'on', 
    auto_jump_mark_floor : 'off',
    mail : 'xxx@kindle.cn', 
    thread_to_kindle_dom : 'xxx.com', 
    night_color : 'off', 
    showmsg_jump_height : 0.6,
    showmsg_jump_floor : 50,
    showmsg_dewater_wordnum : 50, 
};
for(var k in DEFAULT){
    var v = lscache.get(k);
    if(v) DEFAULT[k] = v;
}
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
    return diff<RECENT_HOT_THREAD_SEC ? 1 : 0;
}

function get_rem_key(x){
    var u = x.url;
    var k = x.key;
    return (k==undefined)? u : k;
}

function readFile(f)
{
    var files = $(f).files;
    if (!files.length)
        {
            alert('Please select a file!');
            return;
        }

        var file = files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            var d = event.target.result;     
        };

        reader.readAsText(file);
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
    return s.join("_");
}

//}}
// {{ imgur
//function upload_imgur (file) {
//xhttp = new XMLHttpRequest(),
//fd = new FormData();
//fd.append('image', file);
//xhttp.open('POST', 'https://api.imgur.com/3/image');
//xhttp.setRequestHeader('Authorization', 'Client-ID '+ IMGUR_CLIENT_ID); 
//xhttp.onreadystatechange = function () {
//if (xhttp.status === 200 && xhttp.readyState === 4) {
//var res = JSON.parse(xhttp.responseText), link, p, t;
//link = res.data.link;
//$('.upload_pic_status').html(link);
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
function get_hjj_url(u, succ_cb){
     var xhr = (XMLHttpRequest.noConflict ? new XMLHttpRequest.noConflict() : new XMLHttpRequest({mozSystem: true}));

    xhr.open("GET", u , true);

    if(xhr.overrideMimeType) 
        xhr.overrideMimeType('text/plain; charset=gbk');
    xhr.withCredentials = true;

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            succ_cb(xhr.responseText);
        }
    };

    xhr.send();
}

function parse_home(data){
    h = $.parseHTML(data);

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

function home() {
    var rem = lscache.get('home');
    if(rem) $('#home_content').html(rem);

    $('#manual_jump').find('input').eq(0).val('');

    var u = HJJ;
    get_hjj_url(u, parse_home);
}
// }}}
//  {{{ board_menu
function board_menu_zone(zone_li) {
    var id = zone_li.attr("zid");
    if(id==undefined) return;

    var zone_cb = function(d) {
        var tm = d.match(/<font color=red size=\+1>([^<]+)<\/font>/);
        var t = tm[1].replace(/<[^>]+>/g,'');
        var s ='<h3>' + 
            t + '</h3><ul data-role="listview" data-inset="false">';

        var m = d.match(/<center>[^<]+(<a href="board.php\?board=\d+&page=\d+">[^<]+<\/a>)[^<]+<\/center>/g);
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
    };

    var u = HJJ +"/index"+id+".htm";
    get_hjj_url(u, zone_cb);
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
    $('#fav_board').find('#fav_board_ul').html(s);
    $('#fav_board').find('#fav_board_ul').trigger('create');
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
    toggle_action_html(k, '#board_save',  '&#9734;', '&#9733;');
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
        url : info.local_url,
        board: info.board 
    });
    toggle_action_html(k, '#board_save',  '&#9734;', '&#9733;');
    fav_board();
}

function sub_board_check_all(act){
        $("#sub_board").find('input[type="checkbox"]').each(function(){     
            if(act=="none"){
                $(this).prop("checked",false); 
            }else{
                $(this).prop("checked",true);
            }
        });     
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
                if(d) {
                    var tag_key = format_cache_key('thread_tag', d, ["board", "id"]);
                    var tag = lscache.get(tag_key);
                    if(tag) d["title"] += '#' + tag + '#';
                    x.push(d);
                }
            }
            s += format_url_title(x);
        }
    }

    $('#fav_thread').find('#fav_thread_ul').html(s);
    $('#fav_thread').find('#fav_thread_ul').trigger('create');
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
    toggle_action_html(k, '#thread_cache', '&#9831; 缓存贴子', '&#9827; 已缓存贴子');
}

function check_save_thread(){
    var info = get_showmsg_info();
    var k = format_cache_key('thread_save', info, ["board", "id"]);
    toggle_action_html(k, '#thread_save',  '&#9825;', '&hearts;');
}

function thread_save(){
    var info = get_showmsg_info();
    var k = format_cache_key('thread_save', info, ["board", "id"]);

    toggle_action(k, '#thread_save', 'thread_save', { 
        title : thread_save_title(info, info), 
        url : info.local_url, 
        board : info.board,
        id : info.id
    });
    toggle_action_html(k, '#thread_save',  '&#9825;', '&hearts;');
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
        s += '<li><a href="' + d["url"] + '">' + d["title"]  + '</a></li>';
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
    $('#recent_history').find('#recent_history_ul').html(s);
    $('#recent_history').find('#recent_history_ul').trigger('create');
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
    if(! DEFAULT["filter_thread_keyword"]) return false;
    if(! FILTER_THREAD_KEYWORD_LIST) 
        FILTER_THREAD_KEYWORD_LIST = DEFAULT["filter_thread_keyword"].split(/,/);
    return is_key_match_list(title, FILTER_THREAD_KEYWORD_LIST);
}

function format_thread_info_bottom(info){
        return info.poster + '<br>' + 
        '<div style="font-size: small">'+
        '热:<span class="hot">' + info.hot + '</span>;' + 
        '回:<span class="reply">' + info.reply + '</span>;' + 
        info.time + '</div>';
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
        '<span class="left_string">' + info.tag+ '</span>: ' + 
        '<a href="'+ info.url + '">' + info.title + '</a> '+ href_list + recent_img +
        '<br>' + 
        format_thread_info_bottom(info)+
        '</div>';
    return is_filter_thread(info.title) ? null : s;
}


function sub_board_action(){
    $('#sub_board').popup('close');
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

    $('#sub_board_url').attr('href' , url);
    $('#sub_board_url').click();
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
    var u = HJJ + "/postbypolice.php?board="+ para.board;


    $('#new_thread').html(
        '<form enctype="multipart/form-data" method="post"  \
        action="/postbypolice.php?board=" data-ajax="false"  \
        target="_newtab"> \
        <input type="hidden" value="→发布新贴子" name="msg"> \
        <input placeholder="名字" type="text" name="username" >\
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
        input_init('#new_thread', 'username');

        $('#new_thread').find('form').attr("action", u);
}

function thread_type(para){
    var s = '<a href="#board?' + 
        board_para_string(para, { page : 1 }) + 
        '">全部</a>' +
        '&nbsp;&nbsp;' +
        '<a href="#board?' + 
        board_para_string(para, { page : 1 , type : 'wonderful' }) + 
        '">加精</a>' +
        '&nbsp;&nbsp;' +
        '<a href="#board?' + 
        board_para_string(para, { page : 1 , type : 'red' }) + 
        '">套红</a>' +
        '&nbsp;&nbsp;' +
        '<a href="' + 
        board_para_string(para, { page : 1 , type : 'star' }) + 
        '">加☆</a>' ;
    $('#thread_type').html(s);
}

function board_save_title(info){
    if(!info) info = get_board_info();
    return '[' + info.board + ']' + info.title;
}

function board(para) {
    thread_type(para);
    new_thread(para);

    $('#manual_jump').find('input').eq(0).val(para.board);

    var u = HJJ + "/board.php?" + board_para_string(para);

    var thread_info = '';

    var board_cb = function(d){
            var h = jQuery.parseHTML(d);
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

            board_pager(d);
            sub_board(para, d);
        };
        get_hjj_url(u, board_cb);
}

// -- }}
//  {{{ showmsg
function extract_floor_info(info) {
    var c = info.html()
    .replace(/<(table|tr|td|font)[^>]*>/ig, "<$1>")
    .replace(/<\/?marquee[^>]*>/ig, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/ig, "")
    ;
    var w = info.text().replace(/\s/g, '').length;
    var meta = info.parents("tr:eq(1)").next().text();

    var m = meta.match(/№(\d+).+?☆☆☆(.*?)于([\d\s:-]+)留言☆☆☆/);
    return {
        content: c,
        wordnum: w,
        id: parseInt(m[1]),
        poster: m[2] || ' ',
        time: m[3]
    };
}
function filter_floor(is_to_filter,msg) {
    var i = 0;
    $('.floor').each(function() {
        if(i>0 && is_to_filter($(this))) $(this).hide(); 
        i=1;
    });

    if(msg) $('#thread_action_temp').html(msg);
}

function view_img(){
    var is_to_filter = function(f){
        var c = f.find('.flcontent').eq(0).html();
        return  c.match(/\<img /i) ? 0 : 1;
    };

    filter_floor(is_to_filter, '只看图');
}

function floor_grep(){
    var k = $('#floor_keyword').val();

    var is_to_filter = function(f){
        var c = f.find('.flcontent').text().match(k);
        var p =  f.find('.floor_poster').text().match(k);
        return  (c || p) ? false : true;
    };

    filter_floor(is_to_filter, '抽取' + k);
}

function floor_filter(){
    var k = $('#floor_keyword').val();

    var is_to_filter = function(f){
        var c = f.find('.flcontent').text().match(k);
        var p =  f.find('.floor_poster').text().match(k);
        return  (c || p) ? true : false;
    };

    filter_floor(is_to_filter, '过滤' + k);
}

function min_wordnum(min){
    var is_to_filter = function(f){
        var c = f.find('.flcontent').attr('wordnum');
        return  parseInt(c)<parseInt(min);
        return  c<min;
    };

    filter_floor(is_to_filter, '最少' + min + '字');
}

function view_all_floor(){
    $('.floor').each(function() {
        $(this).show();
    });
    $('#thread_action_temp').html('所有楼层');
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

    filter_floor(is_to_filter, '只看楼主');
}

function reverse_floor(){
    $('#thread_action_temp').html('倒序');
    var s = [];
    $('.floor').each(function(){
        s.push($(this).prop('outerHTML'));
    });
    var c = s.reverse().join("\n");
    $('#thread_floor_list').html(c);
}


function format_floor_content(f) {
    var html = '<div class="floor" id="floor' + f.id + '" fid="'+ f.id +'">' +
        '<div class="flcontent" wordnum="' + f.wordnum + '">' + f.content + '</div>' +
        '<span class="chapter">№' + f.id + '<span class="star">☆</span><span class="floor_poster">' + f.poster + '</span><span class="star">☆</span>' + f.time + '<span class="star">☆</span></span>' +
        '&nbsp;' +
        '<a class="mark_floor" href="#">&#9875;</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '<span class="temp_floor"></span>' + 
        '</div>';
        //'<a  class="reply_thread_floor" action="cite" href="#">&raquo;</a>' + 
        //'&nbsp;&nbsp;&nbsp;' +
        //'<a  class="reply_thread_floor" action="default" href="#">&rsaquo;</a>' + 
        //'&nbsp;&nbsp;&nbsp;' +
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

    var share_tz = DEFAULT["share_tz"]=='on' ? SHARE_WEIBO : '';
    var title = thread_save_title(info, info);
    var st = encodeURIComponent(share_tz + ' ' + title);
    var wu = SHARE_WEIBO_URL + '?title=' + st + '&url=' + su;
    window.open(wu, '_blank');
}

function showmsg_jump_floor(dst_f) {
    if(dst_f==undefined) return false;
    var k = '#floor' + dst_f.toString();
    if($(k).length>0){
        setTimeout(function(){
            $.mobile.silentScroll($(k).offset().top);
        }, 100);
        return true;
    }
    return false;
}

function showmsg_jump_page(dst_f){
    var page = parseInt((parseInt(dst_f)-1) / 300);
    var now_page = parseInt($('#thread_pid').html());

    if(page==now_page){
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
    window.location.href=u;
}

function showmsg_jump_page_popup(){
    var dst_f = $('#dst_floor').val().toString();
    $('#dst_floor').val('');
    $('#jump_floor').popup('close');
    if(dst_f) showmsg_jump_page(dst_f);
}

function thread_save_title(para, res){
    var s = '[' + para.board + '](' + para.id + '){' +
        res.poster + '}' + res.title;
    return s;
}

function showmsg_cache(para) {
    var u = HJJ+'/showmsg.php?' + showmsg_para_string(para); 

    var showmsg_cb = function(d){
            var res = extract_showmsg_content(d);

            var local_url = "#showmsg?" + showmsg_para_string(para); 
            lscache.set(local_url, res);

            $('#thread_action_temp').html('已缓存'+para.page);

            para.page  = para.page + 1;
            if(para.page<para.page_num) {
                showmsg_cache(para);
            }else{
                var k = format_cache_key('thread_cache', para, ["board", "id"]);
                para.page = 0;
                local_url = "#showmsg?" + showmsg_para_string(para); 

                toggle_action(k, '#thread_cache', 'thread_cache', {
                    title : thread_save_title(para, res),
                    url : local_url,
                    board : para.board,
                    id : para.id
                });

                toggle_action_html(k, '#thread_cache', '&#9831; 缓存贴子', '&#9827; 已缓存贴子');
                fav_thread();
            }
        };
    get_hjj_url(u, showmsg_cb);
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
            $('#thread_action_temp').html('已移除缓存'+p.page);
        }

        var k = format_cache_key('thread_cache', p, ["board", "id"]);
        toggle_action(k, '#thread_cache', 'thread_cache', {});
        toggle_action_html(k, '#thread_cache', '&#9831; 缓存贴子', '&#9827; 已缓存贴子');
        fav_thread();
    }else{
        showmsg_cache(p);
    }
}

function thread_mark_floor(){
    var info = get_showmsg_info();
    var k = format_cache_key('thread_mark_floor', info, ["board", "id"]);
    var fid = lscache.get(k);
    if(fid) {
        showmsg_jump_page(fid);
    }else{
        $.mobile.silentScroll(0);
    }
}

function mark_floor(x) {
    var fid = x.parent().attr('fid');
    var info = get_showmsg_info();
    var k = format_cache_key('thread_mark_floor', 
                             info, ["board", "id"]);
                             lscache.set(k, fid, THREAD_MARK_MINUTE);
}

function get_current_position(e){
    if(! e.originalEvent) return e;
    return e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] || e;
}

function get_current_floor(ee, delta_height){
    var sh = screen.height;
    //var ee = get_current_position(e);

    var eh = ee.pageY;
    if(delta_height) eh=eh+delta_height;

    var i=0; 
    $('#showmsg').find('div[class="floor"]').each(function(){
        var h =$(this).offset().top; 
        if(h>eh) return false;
        if(h+sh>eh) {
            i = $(this).attr('fid');
        }
    });

    var k = '#floor' + i;
    return $(k);
}

function get_screen_top_floor(e) {

    var sh = screen.height;
    var ee = get_current_position(e);
    var eh = ee.pageY;
        
    var i = 0;
    $('#showmsg').find('div[class="floor"]').each(function(){
        var h =$(this).offset().top; 
        if(h+sh>eh) {
            i = $(this).attr('fid');
            return false;
        }
    });
    var k = '#floor' + i;
    return $(k);
}

function reply_thread(f, reply_type){
    $('#reply_thread').find('textarea').val('');
    var c = f.find('.chapter').text().replace(/\n/g, ' ');
    if(reply_type=="cite") 
        c = "" + 
            f.children('.flcontent').text().replace(/(\s*\n)+/g, "\n").trim().substr(0, 100) + 
            "......\n\n" + c ;
    $('#reply_thread').find('textarea').val(c.trim()+"\n");

    $('#reply_thread_a').click();
}

function get_event_zone(e){
    var ee = get_current_position(e);
    var w = screen.width;
    ee.xzone = (ee.clientX < 0.3*w) ? 'left' : 
        (ee.clientX > 0.7*w) ? 'right' : 
        'middle';

    var h = screen.height;
    ee.yzone = (ee.clientY < 0.3*h) ? 'top' : 
        (ee.clientY > 0.7*h) ? 'bottom' : 
        'middle';
    return ee;
}


function showmsg_scroll_screen(ee) {
    var jh = (ee.yzone=='bottom' && ee.xzone=='left') ? -1 : 
        (ee.yzone=='bottom' && ee.xzone=='right') ? 1 : 
        0;
    if(jh==0) return;
    jh = jh * screen.height*DEFAULT["showmsg_jump_height"];
    if(jh>0) {
        $.mobile.silentScroll(ee.pageY-0.1*screen.height);
    }else{
        $.mobile.silentScroll(ee.pageY+2*jh);
    }
}

function jump_floor(f, arrow, step){
    var x = arrow=='prev' ? f.prevAll() : f.nextAll();
    var i = parseInt(step) -1;
    var pos = x[i] ? $(x[i]).offset().top : 0;
    $.mobile.silentScroll(pos);
}

function jump_to_prev(f){
    var x = f.prevAll();
    var i = parseInt(DEFAULT["showmsg_jump_floor"])-1;

    var pos = x[i] ? $(x[i]).offset().top : 0;

    var fid = x[i] ? $(x[i]).attr('fid') : 0;
    $('#showmsg_floor_slider').val(fid);
    $.mobile.silentScroll(pos);
}

function jump_to_next(f){
    var x = f.nextAll();
    var i = parseInt(DEFAULT["showmsg_jump_floor"]) -1;

    var pos = x[i] ? $(x[i]).offset().top : $(document).height();
    var fid = x[i] ? $(x[i]).attr('fid') : $('#showmsg_floor_slider').attr('max');
    $('#showmsg_floor_slider').val(fid);
    $.mobile.silentScroll(pos);
}

function showmsg_click() {
    $('#showmsg').on('click', '#thread_cache', function(){ thread_cache() });

    $('#showmsg').on('click', '#thread_mark_floor', function(){ 
        thread_mark_floor();
    });

    $('#showmsg').on('click', '.mark_floor', function(){ 
        $('#showmsg').find('.temp_floor').html('');
        mark_floor($(this));
        $(this).next().html('记住第' + $(this).parent().attr('fid') + '楼'); 
    });

    $('#showmsg').on('click', '#view_img', function(){ view_img(); });
    $('#showmsg').on('click', '#thread_save', function(){ thread_save(); });
    $('#showmsg').on('click', '#share_thread', function(){ share_thread(); });
    $('#showmsg').on('click', '#only_poster', function(){ only_poster(); });
    $('#showmsg').on('click', '#min_wordnum_btn',function(){ 
        var min = $('#min_wordnum').val();
        min_wordnum(min);
    });
    $('#showmsg').on('click', '#thread_dewater', function(){ 
        var min = $('#showmsg_dewater_wordnum').val();
        min_wordnum(min);
    });
    $('#showmsg').on('click', '#floor_grep',function(){ floor_grep();});
    $('#showmsg').on('click', '#floor_filter',function(){ floor_filter(); });
    $('#showmsg').on('click', '#view_all_floor', function(){ view_all_floor();});
    $('#showmsg').on('click', '#reverse_floor', function(){ reverse_floor();});
    $('#showmsg').on('click', '.showmsg_jump_page_btn', function(){ showmsg_jump_page_popup();});
    
    $('#showmsg').on('click', '.reply_thread_floor', function(){
        reply_thread($(this).parent(), $(this).attr('action'));
    });

    $('#showmsg').on('swiperight', '.floor', function(e){ 
        reply_thread($(this), 'cite');
    });

    $('#showmsg').on('swipeleft', '.floor', function(e){ 
        reply_thread($(this), 'reply');
    });

    $('#showmsg').on('tap', '.floor', function(e){ 
        var z = get_event_zone(e);
        showmsg_scroll_screen(z); 
        return false;
    });
    
    $('#showmsg').on("change", '#showmsg_floor_slider', function () {
        var v = parseInt($(this).val()) - parseInt($(this).attr('min'));
        jump_floor($('#floor0'), 'next', v);
    });

    $('#showmsg').on('click', '.jump_to_bottom', function(){
        $('#showmsg_floor_slider').val($('#showmsg_floor_slider').attr('max'));
        $(document).scrollTop($(document).height());
    });
    $('#showmsg').on('click', '.jump_to_top', function(){
        $('#showmsg_floor_slider').val(0);
        $.mobile.silentScroll(0);
    });

    $('#showmsg').on('click', '.jump_to_prev', function(e){
        jump_to_prev(get_current_floor(e), -screen.height*2);
    });
    $('#showmsg').on('click', '.jump_to_next', function(e){
        jump_to_next(get_current_floor(e), -screen.height*2);
    });

    $('#showmsg').on('click', '#thread_to_kindle_btn', function(){ thread_to_kindle();});
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
    var u = HJJ+'/showmsg.php?' + showmsg_para_string(para); 

    if(para.refresh) $('#thread_action_temp').html('刷新');

    var showmsg_f5_cb = function(d){
            var res = extract_showmsg_content(d);
            showmsg_tail(para, res);

            var local_url = "#showmsg?" + showmsg_para_string(para); 
            lscache.set(local_url, res, THREAD_CACHE_MINUTE);
    }
    get_hjj_url(u, showmsg_f5_cb);
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

    var min =0;
    var max = 0;
    $('#thread_floor_list').find('.floor').each(function(){
        var id = parseInt($(this).attr('fid'));
        if(! min) min = id;
        max = id;
    }).promise().done(function(){
        $('#showmsg_floor_slider').attr('min', min);
        $('#showmsg_floor_slider').attr('max', max);
        $('#showmsg_floor_slider').val(min);
    });


    check_save_thread();
    check_cache_thread();

    var local_url = "#showmsg?" + showmsg_para_string(para); 
    add_history({
        url : local_url, 
        title : thread_save_title(para, res), 
        key : 'showmsg,' + para.board + ',' + para.id
    });
    
    $("#thread_floor_list").niceScroll();
    $("#thread_floor_list").getNiceScroll().resize();

    if(para.fid){
        showmsg_jump_floor(para.fid);
    }else if(DEFAULT["auto_jump_mark_floor"]=='on'){
        setTimeout(function(){ thread_mark_floor(); }, 300);
    }else{
        $.mobile.silentScroll(0);
    }
}

function showmsg_header(para){
    $('#reply_thread').html(
        '<form enctype="multipart/form-data" method="post" action="reply.php?board=&id=" data-ajax="false" target="_newtab"> \
        <input placeholder="名字" type="text" name="username" >\
        <a href="#" class="textarea_format">自动贴图/链接</a> \
        <textarea rows=12 placeholder="内容" name="body"></textarea> <br> \
        <input type="submit" value="回贴"> \
        </form> \
        ');

        //<input type="file" class="upload_pic_btn" value="上传"> \
        //<div class="upload_pic_status">...</div> \
        //upload_init();

        input_init('#reply_thread', 'username');

        $('#reply_thread').find('form').attr('action', HJJ + "/reply.php?board="+ para.board + '&id=' + para.id);

        $('#thread_to_board').attr('href', "#board?board=" + para.board + '&page=1');

        $('#manual_jump').find('input').eq(0).val(para.board);

}

function thread_to_kindle(){
    $('#thread_to_kindle').popup('close');

    $('#export_thread').html('kindle');

    var formData = new FormData();
    $('#thread_to_kindle').find('input').each(function(){
        var k = $(this).attr('name');
        if(k) {
            formData.append(k, $(this).val());
        }
    });

    var u = 'http://' + DEFAULT["thread_to_kindle_dom"] + '/novel_robot';

 var xhr = (XMLHttpRequest.noConflict ? new XMLHttpRequest.noConflict() : new XMLHttpRequest({mozSystem: true}));
    xhr.open("POST", u);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            $('#export_thread').html('&#9873; 已推送到kindle');
        }
    };
    xhr.send(formData);

}

function showmsg_banner(para){
    var local_url = "#showmsg?" + showmsg_para_string(para); 
    var u = HJJ+'/showmsg.php?' + showmsg_para_string(para); 
    $('#thread_title').attr('href', u);

    $('#thread_bid').html(para.board);
    $('#thread_tid').html(para.id);
    $('#thread_pid').html(para.page || 0);

    $('#thread_refresh').attr('href', local_url + '&refresh=1');

    var tag_key = format_cache_key('thread_tag', para, ["board", "id"]);
    $('#thread_tag_popup').html( input_div_html(tag_key, '标签') + 
                                '<input type="button" value="返回" id="thread_tag_close">'
                               );
                               tags_input_init(tag_key);
                               $( "#thread_tag_close" ).on('click', function(){ $('#thread_tag_popup').popup( "close" ); });
                               $('#thread_tag_list').text( DEFAULT[tag_key] );

                               $('#thread_to_kindle').find('input').eq(0).val(u);
                               $('#kindle_mail').attr('maxlength', "30");
}


function showmsg(para){
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

function search_para_string(para, other){
    var x = merge_hash(para, other);
    x.act = x.act || 'search';
    x.topic = x.topic!=undefined ? x.topic : 3;
    x.page = x.page || 1;
    return format_para_string(x);
}

function search_thread_info(tr) {
    var info =  {
        id : sprintf("%03d", tr.children('td').eq(0).text()),
        title : tr.find('a').eq(0).text(),
        url : tr.find('a').eq(0).attr('href').replace(/showmsg.php/, '#showmsg').replace(/&keyword=[^&]+/, ''),
        poster : tr.children('td').eq(2).text(),
        time : tr.children('td').eq(3).text(),
        reply : tr.children('td').eq(5).text(),
        hot : tr.children('td').eq(6).text()
    };
    var s = '<div class="onethread">' + 
        '[' + info.id+ ']' + 
        '<a href="'+ info.url + '">' + info.title + '</a><br>' + 
        format_thread_info_bottom(info) + 
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

    var search_cb = function(d){
            var tm = d.match(/查询到的信息([\s\S]+?)<\/td>/);
            var title_h = tm[1];
            $('#search_info').html( title_h );

            var h = $.parseHTML(d);
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
        };
    get_hjj_url(u, search_cb);
}

function search_form(){
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

function suggest_html(){
    return '<div id="suggest_d" class="setting"> \
    <a href="' + README_URL + 
    '" data-role="button" target="_blank">使用说明</a> \
    <a href="#" data-role="button" id="suggest">反馈意见</a> \
    </div>';
}

function input_div_html(key, label){
    return  '<div id="' + key + '_d" class="setting"> \
    <label for="' + key + '">' + label + '</label> \
    <input id="' + key + '" name="' + key + '" > \
    </div>';
}

function slider_init(key, elem){
    $(elem).find('option[value="'+DEFAULT[key]+'"]').attr('selected', 'selected');
    $(elem).on("change", function () {
        DEFAULT[key] = $(this).val();
        lscache.set(key, DEFAULT[key]);
    });
}

function change_font_size_html(){
    return '<div id="font_size_d" class="setting"> \
    字号： \
    <a class="change_font_size" type="bigger">放大</a> \
    &nbsp; \
    <a class="change_font_size" type="smaller">缩小</a> \
    </div>' ; 
}

function input_init(page,key){
    $(page).find('input[name="'+key+'"]').val(DEFAULT[key]);
    $(page).find('input[name="'+key+'"]').on('change', function(){
        DEFAULT[key] = $(this).val();
        lscache.set(key, DEFAULT[key]);
    });
}

function tags_input_init(key){
    if(! DEFAULT[key]) DEFAULT[key] = lscache.get(key);

    if(DEFAULT[key]) $('#'+key).val(DEFAULT[key]);
    $('#'+key).tagsInput({
        'height':'100px',
        'width':'92%',
        'defaultText':'添加',
        'onChange' : function(){
            DEFAULT[key] = $(this).val();
            lscache.set(key, DEFAULT[key]);
        }
    });
}

function night_color_css() {
return '.ui-bar-f,.ui-body-f,.ui-page-theme-f, \
.ui-btn,.ui-btn-b, \
p,body,div,table,ul,li,input,textarea  { \
    background-color: #333333 !important; \
    color: #a0a0a0 !important; \
} \
a:link  { color: #93bcec !important; } \
a:hover { \
    color: #1f72d0 !important; \
    background-color: #c0c0c0 !important; \
}';
}

function night_color_init(){
    var v = DEFAULT['night_color'];
    $('#night_color').find('option[value="' + v + '"]').attr('selected', 'selected');
    var s = (v=='on') ? night_color_css() : ""; 
    $('head').find('style').html(s);

    $("#night_color").on("change", function () {
        var v = $(this).val();
        DEFAULT[k] = v;
        lscache.set('night_color', v);

        var s = (v=='on') ? night_color_css() : ""; 
        $('head').find('style').html(s);
    });
}

function change_font_size_init() {
    var font_size = lscache.get('font-size') || '112%';
    $("body").css( "font-size" , font_size );
    lscache.set('font-size', font_size);
    font_click(".change_font_size", "body");
}

function setting_init(){
    $('#setting_content').html(
        '<div class="containing-element">' + 
        slider_div_html('night_color', '', '黑夜', '白天') +
        slider_div_html('loadimg', '', '看图', '不看图') + 
        input_div_html('filter_thread_keyword', '贴子标题过滤')  +
        change_font_size_html() +
        '<br>' + 
        suggest_html() +
        '<br>' + 
        slider_div_html('auto_jump_mark_floor', '贴子上次阅读的位置', '自动跳转', '不自动跳转') + 
        slider_div_html('share_tz', '分享时是否 @hjjtz', '@', '不@') + 
        input_div_html('showmsg_jump_height', '贴子页每次触屏单击翻页高度') + 
        input_div_html('showmsg_jump_floor', '贴子页每次触屏双击跳转N楼') + 
        input_div_html('showmsg_dewater_wordnum', '贴子页脱水的最小字数') + 
        input_div_html('thread_to_kindle_dom', 'kindle推送站点域名') + 
        '</div>'  
    );

    night_color_init();
    change_font_size_init();
    slider_init('loadimg','#loadimg');
    slider_init('auto_jump_mark_floor', '#auto_jump_mark_floor');
    input_init('#setting', 'showmsg_jump_floor');
    input_init('#setting', 'showmsg_jump_height');
    input_init('#setting', 'showmsg_dewater_wordnum');
    input_init('#setting', 'thread_to_kindle_dom');
    slider_init('share_tz','#share_tz');
    tags_input_init('filter_thread_keyword');

    $('#setting').on('click', '#suggest', function(){
        var st = encodeURIComponent(SHARE_WEIBO + ' ');
        var wu = SHARE_WEIBO_URL + '?title=' + st;
        window.open(wu, '_blank');
    });
}
// }}
// {{ manual_jump
function manual_jump_init(){
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
    $.mobile.buttonMarkup.hoverDelay = "false";

    $.mobile.defaultPageTransition = 'none';
    $.mobile.buttonMarkup.hoverDelay = "false";

    $('textarea').elastic(); 
    //$(document).bind('swiperight', function () {
        //window.history.back();
    //});
    //$(document).bind('swipeleft', function () {
        //window.history.forward();
    //});

    params_page();

    home(); //首页
    board_menu(); //版块列表

    //查询
    $('#search_form').on('click', '#search_form_btn', function() { search_form() });

    setting_init(); //设置
    manual_jump_init(); //手动跳转

    fav_board(); //收藏版块
    $('#fav_board').on('click', '.refresh_fav_board', function() { fav_board() });

    fav_thread(); //收藏贴子
    $('#fav_thread').on('click', '.refresh_fav_thread', function() { fav_thread() });

    recent_history(); //近期访问
    $('#recent_history').on('click', '.refresh_recent_history', function() { recent_history() });

    //版块
    $('#recent_history').click(function(){ recent_history(); });

    $('#board').on('click', '#sub_board_btn', function(){ sub_board_action(); }); 
    $('#board').on('click', '#board_save', function(){ board_save(); }); 
    $('#board').on('click', '.sub_board_check_all', function() { 
        var act = $(this).attr('action');
        sub_board_check_all(act); 
    });

    //$('#board').on('swipeleft', function(e){ 
        //$('#search_form_a').click();
    //});

    //$('#board').on('swiperight', function(e){ 
        //$('#new_thread_a').click();
    //});

    $('body').on('click', '.textarea_format', function(){
        var area = $(this).parent().find('textarea').eq(0);
        var f = area.val()
        .replace(/\b(http:\/\/.*?\.(jpg|gif|png|jpeg))\b/ig , "<img src='$1' />\n")
        .replace(/\b(http:\/\/[^\s'"]+)\s/ig , "<a href='$1'>$1</a>\n");
        area.val(f);
    });

    showmsg_click(); //贴子
    input_init('#showmsg', 'mail');
}


$(document).bind('pageinit',function(e){
    if(INIT>0) return;
    main(); 
    INIT=1;
});
// }}

