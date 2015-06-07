// {{ config
var HJJ='http://bbs.jjwxc.net';
var SHARE_WEIBO = '@hjjtz';
var SHARE_WEIBO_URL = 'http://v.t.sina.com.cn/share/share.php';
var README_URL='https://github.com/abbypan/hjj_firefox_os/blob/master/README.md';
var MOBILE_INIT = 0;
var FILTER_THREAD_KEYWORD_LIST;
var DEFAULT = {
    //qq_openid : "261C940CFAB529378377526B945F61EA", 
    //qq_access_token : "86cb477f384ff56fadff73ff1bf3f637", 
    //qq_appkey : "801058005", 
    qq_openid : "", 
    qq_access_token : "", 
    qq_appkey : "", 
    history_cnt : -1, 
    max_history_cnt : 300, //历史记录最多x条 
    board_menu_minute : 60*24*7, //版块列表缓存x天
    thread_cache_minute : 60*24*7, //默认缓存帖子x天
    thread_mark_minute : 60*24*7, //记住上回看到哪一楼x天
    recent_hot_thread_second : 1000*60*60*24*3, //最近x天热贴
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
    showmsg_view_img : 'off', 
    showmsg_only_poster : 'off', 
    showmsg_min_wordnum : 'off' 
    //showmsg_view_img : 0, 
    //showmsg_only_poster : 0, 
    //showmsg_min_wordnum : 0 
};
for(var k in DEFAULT){
    var v = lscache.get(k);
    if(v) DEFAULT[k] = v;
}
// }} 
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
    return diff < DEFAULT["recent_hot_thread_second"] ? 1 : 0;
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

function get_url(u, succ_cb, charset){
    var xhr = (XMLHttpRequest.noConflict ? new XMLHttpRequest.noConflict() : new XMLHttpRequest({mozSystem: true}));

    xhr.open("GET", u , true);

    if(xhr.overrideMimeType) 
        xhr.overrideMimeType('text/plain; charset='+charset);
    xhr.withCredentials = true;

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            succ_cb(xhr.responseText);
        }
    };

    xhr.send();
}

//}}
// {{ img
function get_latest_img(filename, place){
    var param = {
        "reqnum": "1",
        "type": "3",
        "contenttype": "4",
        "format": "json",
        "access_token": DEFAULT["qq_access_token"],
        "oauth_consumer_key": DEFAULT["qq_appkey"],
        "openid": DEFAULT["qq_openid"],
        "oauth_version": "2.a",
        "lastid": "0",
        "scope": "all",
        "appfrom": "php-sdk2.0beta"
    };
    var param_str = format_para_string(param);

    var charset='utf-8';
    var url = 'https://open.t.qq.com/api/statuses/broadcast_timeline?'+param_str;
    get_url(url, function(c){
        $('.upload_img_status').html(c);
        var d = $.parseJSON(c);
        var img = d["data"]["info"][0]["image"][0] + '/2000';

        if(img.match(/^http/)){
            $('.upload_img_status').html("上传成功" + filename);
            var x = "<p><a data-role='button' href='#' place='" + place + "' url='" +
        img + "' class='insert_img'>" + filename + "</a></p>";
    $(place).find('.uploaded_img').eq(0).append(x);
        }else{
            $('.upload_img_status').html("上传失败: " + filename);
        }
    }, charset);
}

function upload_img_form(file, msg){
    var fd = new FormData();
    fd.append("openid",DEFAULT["qq_openid"]);
    fd.append("access_token",DEFAULT["qq_access_token"]);
    fd.append("oauth_consumer_key",DEFAULT["qq_appkey"]);

    fd.append("appfrom","php-sdk2.0beta");
    fd.append("oauth_version","2.a");
    fd.append("scope","all");
    fd.append("format","json");
    fd.append('content', msg);
    fd.append('pic', file);
    return fd;
}

function upload_img(file, place) {
    var msg = $('#remote_url_short').html();
    $('.upload_img_status').html('uploading...' + msg);
    var fd = upload_img_form(file,msg);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://open.t.qq.com/api/t/add_pic", true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            get_latest_img(file.name, place);
        } else {
            $('.upload_img_status').html("Error " + xhr.status + ',' + msg);
        }
    };

    xhr.send(fd);
}

function upload_img_init(){
    self = this;
    $(document).on('change', '.upload_img_btn', function (e) {
        var place = $(this).attr('place');
        var files = e.target.files, file, p, t, i, len;
        for (i = 0, len = files.length; i < len; i += 1) {
            file = files[i];
            $('.upload_img_status').html(file.name);
            if (file.name.match(/(png|jpg|jpeg|gif)$/i)) {
                upload_img(file, place);
            } else {
                $('.upload_img_status').html('err...');
            }
        }
        return false;
    });

    $('#reply_thread').on('vclick', '.insert_img', function(){
        var place=$(this).attr('place');
        var img = $(this).attr('url');

        var tr = $(place).find('textarea');
        c = tr.val() + "\n<img src='" + img + "' />\n";
        tr.val(c);
        return false;
    });


}


// }}
// {{{ home


function get_hjj_url(u, succ_cb, charset){
    get_url(u, succ_cb, 'gbk');
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
        .replace(/\/showmsg.php/g, '#showmsg')
        .replace(/target="_blank"/g,'')
        .replace(/<\/?ul>/g, '')
        .replace(/<\/li>/g, '<br />')
        .replace(/<li>/g, '');
    $('#home_content').html(body_h);
    lscache.set('home', body_h);
}

function home(refresh_flag) {
    var rem = lscache.get('home');
    if(rem && ! refresh_flag) $('#home_content').html(rem);

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
        lscache.set('board_menu', $('#board_menu_content').html(), DEFAULT["board_menu_minute"]);
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
        return false;
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
    toggle_action_html(k, '#board_save',  '&#9825;', '&hearts;');
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
    toggle_action_html(k, '#board_save',  '&#9825;', '&hearts;');
    fav_board();
}

function sub_board_check_all(act){
    $("#sub_board_list").find('input[type="checkbox"]').each(function(){     
        if(act=="none"){
            $(this).prop("checked",false); 
        }else{
            $(this).prop("checked",true);
        }
    });     
        return false;
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

function get_showmsg_local_url(x){
    return "#showmsg?" + showmsg_para_string(x); 
}

function get_showmsg_remote_url(x){
    return HJJ + "/showmsg.php?" + showmsg_para_string(x); 
}

function get_showmsg_info(){
    var x = {
        board : $('#thread_bid').text(),
        id : $('#thread_tid').text(),
        page : $('#thread_pid').text(),
        title : $('#thread_title').text()
    };
    var poster = get_showmsg_poster();
    if(poster) x["poster"] = poster;

    x["local_url"] = get_showmsg_local_url(x); 
    x["remote_url"] = get_showmsg_remote_url(x);
    return x;
}

function check_cache_thread(){
    var info = get_showmsg_info();
    var k = format_cache_key('thread_cache', info, ["board", "id"]);
    toggle_action_html(k, '#thread_cache', '缓存贴子', '取消缓存');
}

function check_save_thread(){
    var info = get_showmsg_info();
    var k = format_cache_key('thread_save', info, ["board", "id"]);
    toggle_action_html(k, '#thread_save',  '&star;', '&starf;');
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
    toggle_action_html(k, '#thread_save',  '&star;', '&starf;');
    fav_thread();
}
// }}
// {{ recent_history
function add_history(x){
    DEFAULT["history_cnt"]= ( DEFAULT["history_cnt"] + 1 ) % DEFAULT["max_history_cnt"];

    var d = new Date();
    x["time"] = d.getTime();

    lscache.set('history,' + DEFAULT["history_cnt"], x);
    lscache.set('history_cnt', DEFAULT["history_cnt"]);
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
        "max_length" : DEFAULT["max_history_cnt"]
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

function toggle_recent_thread() {
    var status = $('#only_recent_thread').text();

    $('.onethread').each(function() {
        if(status=='no'){
            if($(this).attr('recent')=='no') $(this).hide();
        }else{
            $(this).show();
        }
    }).promise().done(function(){
        var new_status = status=='no' ? 'yes' : 'no';
        $('#only_recent_thread').text(new_status);
    });
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

    var recent_status = is_recent(info.time) ? 'yes' : 'no';
    var recent_img = is_recent(info.time) ? '<img class="smallgif" src="icons/new.gif" />' : '';

    var s = '<div class="onethread" recent="' + recent_status + '">' + 
        '<span class="left_string">' + info.tag+ '</span>: ' + 
        '<a href="'+ info.url + '">' + info.title + '</a> '+ href_list + recent_img +
        '<br>' + 
        format_thread_info_bottom(info)+
        '</div>';
    return is_filter_thread(info.title) ? null : s;
}


function sub_board_action(){
    //$('#sub_board').popup('close');
    var url =$("#sub_board").find("input[name='url']").attr("value"); 
    var rem =$("#sub_board").find("input[name='rem']").prop("checked"); 

    var id_list = [];
    $("#sub_board_list").find("input[type='checkbox']")
        .each(function(){
            if($(this).prop("checked")){
                id_list.push($(this).prop("value"));
            }
        });

    if(id_list.length>0){
        var id = id_list.join(',');
        url+='&subid=' + id;
        if(rem){
            var bid = $('#board_id').html();
            lscache.set( 'rem_sub_board_' + bid, id);
        }

    }

    $('#sub_board_url').attr('href' , url);
    $.mobile.pageContainer.pagecontainer('change', url);
    //$('#sub_board_url').click();
}

function sub_board(para, html){
    var url = "#board?" + board_para_string(para, { page : 1 });
    $('#sub_board').find('input[name="url"]').attr("value", url);
    var sm = html.match(/本版所属子论坛[^<]+<\/font>([\s\S]*?)<\/span>/);
    var u = sm[1];
    $('#sub_board').find('fieldset').html(u);

    var options = u.replace(/<input.+?value=(\S+)[^>]+>([^<]+)/g, "<option value='$1'>$2</option>")
        .replace(/<option/, '<option selected="selected"');
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
    $('#board_page').html(para.page || 1);
    $('#remote_url_title').html(t);
    check_fav_board();
}

function new_thread(para){
    var u = HJJ + "/postbypolice.php?board="+ para.board;
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
    $.mobile.silentScroll(0);
    if(! para.subid){
        var rem_sub_board = lscache.get( 'rem_sub_board_' + para.board);
        if(rem_sub_board) para.subid = rem_sub_board;
    }
    thread_type(para);
    new_thread(para);

    $('#manual_jump').find('input').eq(0).val(para.board);

    var u = HJJ + "/board.php?" + board_para_string(para);
    $('#remote_url').html(u);
    $('#remote_url_short').html(['HJJ', para.board ].join(","));
    $('#local_board_url').attr('href', '#board?' + board_para_string(para));

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
function thread_jump_page(x){
    var act = parseInt(x.attr('action'));
    var info = get_showmsg_info();
    info.page = parseInt(info.page) + act;
    if(info.page<0) info.page=0;

    var u = get_showmsg_local_url(info);
    $.mobile.pageContainer.pagecontainer('change', u);
}

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
        '<a  class="reply_thread_floor" action="cite" href="#">&#8811;</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '<a  class="reply_thread_floor" action="default" href="#">&gt;</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '&nbsp;' +
        '<a class="mark_floor" href="#">M</a>' + 
        '&nbsp;&nbsp;&nbsp;' +
        '<span class="temp_floor"></span>' + 
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

    var share_tz = DEFAULT["share_tz"]=='on' ? SHARE_WEIBO : '';
    var title = thread_save_title(info, info);
    var st = encodeURIComponent(share_tz + ' ' + title);
    var wu = SHARE_WEIBO_URL + '?title=' + st + '&url=' + su;
    window.open(wu, '_blank');
}

function showmsg_jump_floor_simple(dst_f) {
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



function thread_save_title(para, res){
    var s = '[' + para.board + '](' + para.id + '){' +
        res.poster + '}' + res.title;
        return s;
    }

    function showmsg_cache(para) {
        var u = get_showmsg_remote_url(para);

        var showmsg_cb = function(d){
            var res = extract_showmsg_content(d);

            var local_url = get_showmsg_local_url(para);
            lscache.set(local_url, res);

            $('#thread_action_temp').html('已缓存'+para.page);

            para.page  = para.page + 1;
            if(para.page<para.page_num) {
                showmsg_cache(para);
            }else{
                var k = format_cache_key('thread_cache', para, ["board", "id"]);
                para.page = 0;
                local_url = get_showmsg_local_url(para);

                toggle_action(k, '#thread_cache', 'thread_cache', {
                    title : thread_save_title(para, res),
                    url : local_url,
                    board : para.board,
                    id : para.id
                });

                toggle_action_html(k, '#thread_cache', '缓存贴子', '取消缓存');
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
                var local_url = get_showmsg_local_url(p);
                lscache.remove(local_url);
                $('#thread_action_temp').html('已移除缓存'+p.page);
            }

            var k = format_cache_key('thread_cache', p, ["board", "id"]);
            toggle_action(k, '#thread_cache', 'thread_cache', {});
            toggle_action_html(k, '#thread_cache', '缓存贴子', '取消缓存');
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
            showmsg_jump_floor(fid);
        }else{
            $.mobile.silentScroll(0);
        }
    }

    function mark_floor(x) {
        var fid = x.parent().attr('fid');
        var info = get_showmsg_info();
        var k = format_cache_key('thread_mark_floor', 
                info, ["board", "id"]);
        lscache.set(k, fid, DEFAULT["thread_mark_minute"]);
    }

    function get_current_position(e){
        if(! e.originalEvent) return e;
        return e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] || e;
    }

    function get_current_floor(e, delta_height){
        var sh = screen.height;
        var ee = get_current_position(e);

        var eh = ee.pageY;
        if(delta_height) eh=eh+delta_height;

        var i=0; 
        $('#showmsg').find('div[class="floor"]').each(function(){
            var h =$(this).offset().top; 
            if(h+sh>eh) return false;
            if(h+sh+sh>=eh) {
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

    function showmsg_toggle_footer(ee){
        var jh = (ee.yzone=='middle' && ee.xzone=='middle') ? 1 : 0;
        if(jh==0) return;
        $("#showmsg_footer").toggle();
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

        //var fid = x[i] ? $(x[i]).attr('fid') : 0;
        //$('#showmsg_floor_slider').val(fid);
        $.mobile.silentScroll(pos);
    }

    function jump_to_next(f){
        var x = f.nextAll();
        var i = parseInt(DEFAULT["showmsg_jump_floor"]) -1;

        var pos = x[i] ? $(x[i]).offset().top : $(document).height();
        //var fid = x[i] ? $(x[i]).attr('fid') : $('#showmsg_floor_slider').attr('max');
        //$('#showmsg_floor_slider').val(fid);
        $.mobile.silentScroll(pos);
    }

    function showmsg_click() {
        $('#showmsg').on('vclick', '.thread_jump_page', function(){
            thread_jump_page($(this)); return false;
        });

        $('#showmsg').on('vclick', '#thread_cache', function(){ 
            thread_cache(); return false;
        });

        $('#showmsg').on('vclick', '#thread_mark_floor', function(){ 
            thread_mark_floor();return false;
        });

        $('#showmsg').on('vclick', '.mark_floor', function(){ 
            $('#showmsg').find('.temp_floor').html('');
            mark_floor($(this));
            $(this).next().html('记住第' + $(this).parent().attr('fid') + '楼'); 
            return false;
        });

        $('#showmsg').on('vclick', '#thread_save', function(){ thread_save(); return false; });
        $('#showmsg').on('vclick', '#share_thread', function(){ share_thread(); return false; });
        $('#showmsg').on('vclick', '#only_poster', function(){ only_poster(); return false; });
        $('#showmsg').on('vclick', '#view_img', function(){ view_img(); return false; });

        $('#showmsg').on('vclick', '#min_wordnum_btn',function(){ 
            var min = $('#min_wordnum').val();
            min_wordnum(min);return false; 
        });
        $('#showmsg').on('vclick', '#thread_dewater', function(){ 
            var min = $('#showmsg_dewater_wordnum').val();
            min_wordnum(min);return false; 
        });
        $('#showmsg').on('vclick', '#floor_grep',function(){ 
            floor_grep();return false; });
        $('#showmsg').on('vclick', '#floor_filter',function(){ 
            floor_filter();return false;  });
        $('#showmsg').on('vclick', '#view_all_floor', function(){ view_all_floor();return false; });
        $('#showmsg').on('vclick', '#reverse_floor', function(){ reverse_floor();return false; });

        $('#showmsg').on('vclick', '.reply_thread_floor', function(){
            reply_thread($(this).parent(), $(this).attr('action'));return false; 
        });

        //$('#showmsg').on('swiperight',  '.floor', function(e){ 
        ////e.preventDefault();
        //reply_thread($(this), 'cite');
        //});
        //$('#showmsg').on('swipeleft', '.floor', function(e){ 
        ////e.preventDefault();
        //reply_thread($(this), 'reply');
        //});

        $('#showmsg').on('vclick', '#thread_floor_list', function(e){ 
            //e.preventDefault();
            var z = get_event_zone(e);
            showmsg_scroll_screen(z); //click to prev/next page
            //showmsg_toggle_footer(z); //click to show/hide footer
            return false;
        });

        //$('#showmsg').on("change", '#showmsg_floor_slider', function () {
        //var all = parseInt($(this).attr('max')) - parseInt($(this).attr('min')) + 1;
        //var show = $('#showmsg').find('.floor:visible').length;

        //var v = parseInt($(this).val()) - parseInt($(this).attr('min')) ;
        //v = parseInt(v*show/all);

        //var x = $('#showmsg').find('.floor:visible').eq(v);
        //var pos = x ? x.offset().top : 0;
        //$.mobile.silentScroll(pos);
        //});

        $('#showmsg').on('vclick', '#jump_to_bottom', function(){
            //$('#showmsg_floor_slider').val($('#showmsg_floor_slider').attr('max'));
            $(document).scrollTop($(document).height());return false; 
        });

        $('#showmsg').on('vclick', '#jump_to_top', function(){
            //$('#showmsg_floor_slider').val(0);
            $.mobile.silentScroll(0);return false; 
        });

        $('#showmsg').on('vclick', '#jump_to_prev', function(e){
            jump_to_prev(get_current_floor(e), -screen.height*2);
            //return false; 
        });
        $('#showmsg').on('vclick', '#jump_to_next', function(e){
            jump_to_next(get_current_floor(e), -screen.height*2);
            //return false; 
        });

        $('#showmsg').on('vclick', '#thread_to_kindle_btn', function(){ thread_to_kindle();return false; });
        //$( document ).on( "pageinit", "#showmsg", function() {

        //$( document ).on( "swipeleft swiperight", "#showmsg", function( e ) {
        //if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
        //if ( e.type === "swipeleft"  ) {
        ////$( "#right-panel" ).panel( "open" );
        //$('#showmsg_panel').panel('open');
        //} else if ( e.type === "swiperight" ) {
        ////$( "#left-panel" ).panel( "open" );
        //}
        //}
        //});
        //});
    }

    function extract_showmsg_content(d){
        var res = {};
        var tm = d.match(/<title>(.+?)<\/title>/);
        res["title"]  = tm[1].replace(/ —— 晋江文学城网友交流区/,'');

        var pm = d.match(/\>(共\d+页:.+?)<\/div>/);
        res["pager"] = pm ? pm[1].replace(/href=(.+?)>/g, "href=\"#showmsg$1\">").replace(/<\/a>/g, '</a>&nbsp;') : '';
        if(res["pager"].match(/共/)){
            res["pager"] += "<a action='-1' class='thread_jump_page'>&lt;</a>&nbsp;&nbsp;" + 
                "<a action='1' class='thread_jump_page'>&gt;</a>";
        }

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
        var u = get_showmsg_remote_url(para);

        if(para.refresh) $('#thread_action_temp').html('刷新');

        var showmsg_f5_cb = function(d){
            var res = extract_showmsg_content(d);
            showmsg_tail(para, res);

            var local_url = get_showmsg_local_url(para);
            lscache.set(local_url, res, DEFAULT["thread_cache_minute"]);
        }
        get_hjj_url(u, showmsg_f5_cb);
    }

    function showmsg_tail(para, res){
        $('#remote_url_title').html(res["title"]);
        $('#thread_title').html( res["title"] );

        $('#thread_pager_top').html( res["pager"] );
        $('#thread_pager_bottom').html( res["pager"]);
        $('#thread_floor_list').html(res["floor_list"]);
        
        //$('#thread_floor_list').find('img').lazyload();

        //$("#thread_floor_list").find('img').each(function(){     
            //var img_url = $(this).attr('src');
            ////$(this).attr('src', 'icons/hjj128.png');
            //$(this).attr('data-original', img_url);
            //$(this).removeAttribute('src');
            //$(this).attr('width', '100%');
        //});

        //$("#thread_floor_list").find('img').lazyload();

        //$("img").trigger('unveil');

        $('#thread_floor_list').find('a').each(function(){
            var href = $(this).attr('href');
            if(href.match(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/)){ 
                href = href.replace(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/g, '#showmsg?')
                $(this).attr('href', href);
                $(this).removeAttr('target');
                $(this).removeAttr('rel');
            }
        });


        //var min =0;
        //var max = 0;
        //$('#thread_floor_list').find('.floor').each(function(){
            //var id = parseInt($(this).attr('fid'));
            //if(! min) min = id;
            //max++;
        //}).promise().done(function(){
            //$('#showmsg_floor_slider').attr('min', min);
            //$('#showmsg_floor_slider').attr('max', max+min-1);
            //$('#showmsg_floor_slider').val(min);
        //});

        check_save_thread();
        check_cache_thread();

        var local_url = get_showmsg_local_url(para);
        $('#thread_refresh').attr('href', local_url + '&refresh=1');

        add_history({
            url : local_url, 
            title : thread_save_title(para, res), 
            key : 'showmsg,' + para.board + ',' + para.id
        });

        //$("#thread_floor_list").niceScroll();
        //$("#thread_floor_list").getNiceScroll().resize();

        if(para.fid){
            showmsg_jump_floor_simple(para.fid);
        }else if(DEFAULT["auto_jump_mark_floor"]=='on'){
            setTimeout(function(){ thread_mark_floor(); }, 300);
        }else{
            $.mobile.silentScroll(0);
        }

        //$( '#showmsg_panel' ).panel( "refresh" );
        if(DEFAULT["showmsg_view_img"]==1) view_img();
        if(DEFAULT["showmsg_only_poster"]==1) only_poster();
        if(DEFAULT["showmsg_min_wordnum"]==1) min_wordnum(DEFAULT["showmsg_dewater_wordnum"]);

    }

    function showmsg_header(para){
        $('#remote_url_short').html([ 'HJJ', para.board, para.id ].join(","));

        input_init('#reply_thread', 'username');
        $('#reply_thread').find('form').attr('action', HJJ + "/reply.php?board="+ para.board + '&id=' + para.id);

        var up_url = "#board?board=" + para.board + '&page=1';
        if($('#board_id').html()==para.board){
            up_url = $('#local_board_url').attr('href');
        }
        $('#thread_to_board').attr('href', up_url);

        $('#manual_jump').find('input').eq(0).val(para.board);


        $('#remote_url').html(get_showmsg_remote_url(para)); 
    }

    function thread_to_kindle(){
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
        var local_url = get_showmsg_local_url(para);
        var u = get_showmsg_remote_url(para);
        $('#thread_title').attr('href', u);

        $('#thread_bid').html(para.board);
        $('#thread_tid').html(para.id);
        $('#thread_pid').html(para.page || 0);


        var tag_key = format_cache_key('thread_tag', para, ["board", "id"]);
        $('#thread_tag_popup').html( input_div_html(tag_key, '标签') + 
                '<input type="button" value="返回" id="thread_tag_close">'
                );
        tags_input_init(tag_key);
        $( "#thread_tag_close" ).on('vclick', function(){ 
            $('#thread_tag_popup').popup( "close" ); 
            return false;
        });
        $('#thread_tag_list').text( DEFAULT[tag_key] );

        $('#thread_to_kindle').find('input').eq(0).val(u);
        $('#kindle_mail').attr('maxlength', "30");
    }


    function showmsg(para){
        var local_url = get_showmsg_local_url(para);
        showmsg_header(para);
        showmsg_banner(para);

        var cache = lscache.get(local_url);
        if(cache && para.refresh==undefined){
            showmsg_tail(para, cache);
        }else{
            showmsg_refresh(para);
        }
    }

function showmsg_jump_floor(dst_f){
    var page = parseInt((parseInt(dst_f)-1) / 300);
    var now_page = parseInt($('#thread_pid').html());

    if(page==now_page){
        showmsg_jump_floor_simple(dst_f);
        return false;
    }

    var x = {
        fid : dst_f.toString(), 
        page : page.toString(),
        board : $('#thread_bid').text(),
        id : $('#thread_tid').text(), 
    };
    var u = get_showmsg_local_url(x) + '&fid=' + dst_f;
    $.mobile.pageContainer.pagecontainer('change', u);
    return false;
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
    $.mobile.pageContainer.pagecontainer('change', url);
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
        return false;
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

function input_list_html(key, input_list){
    var s = [];
    for(var i in input_list){
        var x = input_list[i];
        s.push('<label>'+ i + '</label>' + 
                '<input id="' + x + '" name="' + x + 
                '" placeholder="' + x + '">');
    }
    return '<div id="' + key + '" class="setting">' + 
        '<label><b>' + key + '</b></label>' + 
        s.join("\n") + '</div>';
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
        return false;
    });
}

function default_checkbox_init(){
    $('[data-role="page"]').find(".default_checkbox").each(
            function(){
                var k = $(this).attr('name');
                $(this).prop("checked",DEFAULT[k]==1 ? true : false); 
                $(this).on("change", function () {
                    DEFAULT[k] = $(this).prop("checked") ? 1 : 0;
                    lscache.set(k, DEFAULT[k]);
                });
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
            input_list_html('图片上传（腾讯微博oauth2授权）', {
                openid : 'qq_openid', 
            access_token : 'qq_access_token', 
            appkey : 'qq_appkey' 
            }) +
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
            input_init('#setting', 'qq_appkey');
            input_init('#setting', 'qq_access_token');
            input_init('#setting', 'qq_openid');

            slider_init('showmsg_view_img','#showmsg_view_img');
            slider_init('showmsg_only_poster','#showmsg_only_poster');
            slider_init('showmsg_min_wordnum','#showmsg_min_wordnum');

            $('#setting').on('vclick', '#suggest', function(){
                var st = encodeURIComponent(SHARE_WEIBO + ' ');
                var wu = SHARE_WEIBO_URL + '?title=' + st;
                window.open(wu, '_blank');
            });
}
// }}
// {{ manual_jump
function manual_jump_init(){
    $('#manual_jump').on('vclick', '#manual_jump_btn', function(){
        var bid = $('#manual_jump').find('input[name="board"]').val();
        var tid = $('#manual_jump').find('input[name="id"]').val();
        var page = $('#manual_jump').find('input[name="page"]').val();
        var fid = $('#manual_jump').find('input[name="fid"]').val();
        $('#manual_jump').find('input').val('');

        if( fid && ! tid ){
            showmsg_jump_floor(fid);
            return;
        }

        if(! bid) return;
        if(! page) page=0;
        var u = (tid && tid.match(/^\d+$/)) ? ("#showmsg?board=" + bid + '&id=' + tid + '&page=' + page)  : 
        ("#board?board=" + bid + '&page=' + page);

    $.mobile.pageContainer.pagecontainer('change', u);
    });
}


// }}
// {{ main
function params_page(){

    //$(document).bind("popupcreate", function (e) { 
    //var $widget = $(e.target);

    //$widget.delegate(".ui-btn", 'vclick', function ( e ) {
    //setTimeout(function(){  
    //$widget.popup("close");
    //});
    //});
    //});


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

    //$("[data-role=panel]").enhanceWithin().panel();
    //$('textarea').elastic(); 


    //$(document).bind('swiperight', function () { window.history.back(); });
    //$(document).bind('swipeleft', function () { window.history.forward(); });

    params_page();
    upload_img_init();

    home(0); //首页
    $('#home').on('vclick', '#home_content', function(e){ 
        var z = get_event_zone(e);
        showmsg_scroll_screen(z); 
        return false;
    });

    $('#home').on('vclick', '#refresh_home', function(){
        home(1);
        return false;
    });
    
    board_menu(); //版块列表

    //查询
    $('#search_form').on('vclick', '#search_form_btn', function() { search_form(); return false; });
    $('#search').on('vclick', '.board_url', function(){
        var id = $('#board_id').val();
        var u = '#board?' + 'board=' + id;
    $.mobile.pageContainer.pagecontainer('change', u);
        return false;
    });

    setting_init(); //设置
    manual_jump_init(); //手动跳转

    fav_board(); //收藏版块
    $('#fav_board').on('vclick', '.refresh_fav_board', function() { fav_board(); return false; });

    fav_thread(); //收藏贴子
    $('#fav_thread').on('vclick', '.refresh_fav_thread', function() { fav_thread(); return false; });

    recent_history(); //近期访问
    $('#recent_history').on('vclick', '.refresh_recent_history', function() { recent_history(); return false; });

    //版块
    //$('#recent_history').click(function(){ recent_history(); return false;});
    $('#board').on('vclick', '#not_rem_sub_board', function(){
        var bid = $('#board_id').html();
        lscache.remove( 'rem_sub_board_' + bid);
        $.mobile.pageContainer.pagecontainer('change', '#board?board=' + bid + '&page=1');
        return false;
    });
    $('#board').on('vclick', '#sub_board_btn', function(){ sub_board_action(); return false;}); 
    $('#board').on('vclick', '#board_save', function(){ board_save();return false; }); 
    $('#board').on('vclick', '.sub_board_check_all', function() { 
        var act = $(this).attr('action');
        sub_board_check_all(act); 
        return false;
    });
    $('#board').on('vclick', '#toggle_recent_thread', function() { toggle_recent_thread(); return false;});
    $('#board').on('vclick', '#board_content', function(e){ 
        var z = get_event_zone(e);
        showmsg_scroll_screen(z); 
        return false;
    });

    //$('#board').on('swipeleft', function(e){ 
    //$('#search_form_a').click();
    //});

    //$('#board').on('swiperight', function(e){ 
    //$('#new_thread_a').click();
    //});

    $('body').on('vclick', '.format_url_code', function(){
        var area = $(this).parent().find('textarea').eq(0);
        var f = area.val()
        .replace(/\s(http:\/\/.*?\.(jpg|gif|png|jpeg))\s/ig , "<img src='$1' />\n")
        .replace(/\s(http:\/\/[^\s'"]+)\s/ig , "<a href='$1'>$1</a>\n");
    area.val(f);
    return false;
    });

    showmsg_click(); //贴子

    input_init('#showmsg', 'mail');
    default_checkbox_init();


}

//addTouchEvents = function() {
    //var isTouchDevice = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);

    //if (isTouchDevice) {
        ////replace link clicks with ontouchend events for more responsive UI
        //$("a", "[onclick]").on("touchstart",function(e) {
            //$(this).trigger("click");
            //e.preventDefault();
            //return false;
        //});
    //}
//}

//jQuery doc.ready
$(document).bind('pageinit',function(e){
    //addTouchEvents();   
    //FastClick.attach(document.body);
    //$("[data-role=panel]").enhanceWithin().panel();

    if(MOBILE_INIT>0) return;
    main(); 
    MOBILE_INIT=1;
});

//$( document ).on( "pageinit", "#home", function() {
    //$( document ).on( "swipeleft", "#home_content", function( e ) {
        //if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
            //$( "#home_panel" ).panel( "open" );
        //}
    //});
//});

// }}
