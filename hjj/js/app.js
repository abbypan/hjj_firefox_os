// {{ config
var HJJ='http://bbs.jjwxc.net';
var SHARE_WEIBO = '@hjjtz';
var SHARE_WEIBO_URL = 'http://v.t.sina.com.cn/share/share.php';
var FAQ_URL='https://github.com/abbypan/hjj_firefox_os/blob/master/README.md';
var MOBILE_INIT = 0;
var FILTER_THREAD_KEYWORD_LIST;
var DEFAULT = {
    fav_board_list : '', //保存的版块列表
    fav_thread_list : '', //保存的贴子列表
    recent_history_list : '', //访问历史
    font_size: '112%', 
    max_history_cnt : 300, //历史记录最多x条 
    thread_cache_minute : 60*24*7, //默认缓存帖子x天
    thread_mark_minute : 60*24*7, //记住上回看到哪一楼x天
    recent_hot_thread_second : 1000*60*60*24*3, //最近x天热贴
    filter_thread_keyword : '', //过滤版块贴子，标题含指定关键字
    share_tz : 'on',
    auto_jump_mark_floor : 'off',
    night_color : 'off', //黑夜模式
    tap_jump_height : 0.6,
    showmsg_all_floor: 0, //不做任何处理，显示所有楼层
    showmsg_dewater_wordnum : 50, //默认脱水字数
    showmsg_dewater : 0, //自动脱水
    showmsg_only_poster : 0, //只看楼主
    showmsg_only_img : 0, //只看图
    showmsg_grep_floor : 0, //提取楼层
    showmsg_grep_floor_keyword : '', //提取楼层，含指定关键字
    showmsg_filter_floor : 0, //过滤楼层
    showmsg_filter_floor_keyword : '', //过滤楼层，含指定关键字
    showmsg_reverse_floor: 0,  //是否倒序
    showmsg_jump_floor : 50 //箭头跳转楼层数
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
    var t = dt.replace(/-/g,'/').replace(/^/,'20');
    var diff = new Date() - new Date(t);
    return parseInt(diff) < parseInt(DEFAULT["recent_hot_thread_second"]) ? 1 : 0;
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
            if((x[k]!=undefined) && (x[k]!='')) {
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

function get_event_zone(ee){
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

function tap_to_scroll_screen(e) {
    var ee = get_event_zone(e);
    var jh = (ee.yzone=='bottom' && ee.xzone=='left') ? -1 : 
        (ee.yzone=='bottom' && ee.xzone=='right') ? 1 : 
        0;
    if(jh==0) return;
    jh = jh * screen.height*DEFAULT["tap_jump_height"];
    if(jh>0) {
        $.mobile.silentScroll(e.pageY-0.1*screen.height);
    }else{
        $.mobile.silentScroll(e.pageY+2*jh);
    }
}
//}}
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
    $('#manual_jump').find('input').eq(0).val('');
    var rem = lscache.get('home');
    if(rem && ! refresh_flag) {
        $('#home_content').html(rem);
    }else{
        var u = HJJ;
        get_hjj_url(u, parse_home);
    }
}
// }}}

//  {{{ board_menu
function board_menu(){
    var blist = [
        ['2' , '网友留言区'], 
        ['3' , '闲情'], 
        ['7' , '连载文库'], 
        ['17', '碧水江汀'], 
        ['36', '同人文库'], 
        ['44', '留声花园'], 
        ['52', '优声由色'], 
    ];
    var s = '';
    for(var i in blist){
        var b = blist[i];
        s += '<div class="smallbox"><a href="#board?board=' + b[0] + '&page=1">' + b[1] + "</a></div>\n";
    }
    $('#board_menu_content').html(s); 
}
// }}}

// {{ fav_board
function get_board_info(){
    var x = {
        title : $('#board_title').html(),
        board : $('#board_id').html()
    };
    x["local_url"] = "#board?" + board_para_string(x, { page : 1 });
    x["fav_url"] = "#board?board=" + x["board"] + "&page=1";
    return x;
}

function check_fav_board(){
    var info = get_board_info();
    var find_s = 'a[href="' + info["fav_url"] + '"]';
    var s = $('#fav_board_list').find(find_s);

    var s_status = s.length>0 ? '&hearts;' : '&#9825;';
    $('#board_save').html(s_status);

    if(s.length==0) return;
    return find_s;
}

function toggle_fav_board(){
    var elem = check_fav_board();

    if(elem){//已存过
        $('#fav_board_list').find(elem).parent().remove();
    }else{
        var info = get_board_info();
        var s = '<li><a class="fav_item" href="' + info["fav_url"] + '">[' + info["board"] + ']' + info["title"] + '</a><li>';
        $('#fav_board_list').append(s); 
    }

    DEFAULT['fav_board_list'] = $('#fav_board_list').html();
    lscache.set('fav_board_list', DEFAULT['fav_board_list']);

    check_fav_board();
    $('#fav_board_list').load();
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
    x["fav_url"] = '#showmsg?board=' + x["board"] + '&id=' + x["id"];
    return x;
}


function check_fav_thread(){
    var info = get_showmsg_info();
    var find_s = 'a[href="' + info["fav_url"] + '"]';
    var s = $('#fav_thread_list').find(find_s);

    var s_status = s.length>0 ? '&starf;' : '&star;';
    $('#thread_save').html(s_status);

    if(s.length==0) return;
    return find_s;
}

function toggle_fav_thread(){
    var elem = check_fav_thread();

    if(elem){//已存过
        $('#fav_thread_list').find(elem).parent().remove();
    }else{
        var info = get_showmsg_info();
        var s = '<li><a class="fav_item" href="' + info["fav_url"] + '">[' + info["board"] + ']{' + info["id"] + '}' + info["title"] + '</a><li>';
        $('#fav_thread_list').append(s); 
    }

    DEFAULT['fav_thread_list'] = $('#fav_thread_list').html();
    lscache.set('fav_thread_list', DEFAULT['fav_thread_list']);

    check_fav_thread();
    $('#fav_thread_list').load();
}
// }}

// {{ recent_history
function add_history(x){
    $('#recent_history_list').find('a[href="'+x["url"]+'"]').parent().remove();

    var s = '<li><a href="' + x["url"] + '">' + x["title"] + '</a><li>';
    $('#recent_history_list').prepend(s); 

    n = $('#recent_history_list').find('li').length;
    if(n > DEFAULT["max_history_cnt"]){
        $('#recent_history_list').find('li').last().remove();
    }

    DEFAULT["recent_history_list"] = $('#recent_history_list').html();
    lscache('recent_history_list', DEFAULT['recent_history_list']);
    $('#recent_history_list').load();
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

function format_onethread_div(info){
    info.recent_status = info.recent_status || 'no';
    info.href_list = info.href_list || '';
    info.recent_img = info.recent_img || '';

    var tag = info.tag ? ('[' + info.tag+ ']') : '';

    var s = '<div class="onethread" recent="' + info.recent_status + '">' + 
        tag + info.poster +
        '&nbsp;&nbsp;<a href="'+ info.url + '">' + info.title + '</a> '+ info.href_list + info.recent_img +
        '<br>' + 
        '<div style="font-size: small">'+
        '回:<span class="reply">' + info.reply + '</span>;&nbsp;&nbsp;时间: ' + 
        info.time + '</div>' + 
        '</div>';
    return s;
}

function toggle_recent_thread() {
    var ss = $('#only_recent_thread').text();

    $('.onethread').each(function() {
        if(ss=='no'){
            if($(this).attr('recent')=='no') $(this).hide();
        }else{
            $(this).show();
        }
    }).promise().done(function(){
        var new_status = ss=='no' ? 'yes' : 'no';
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
        tag : tr.children('td').eq(0).text().trim(),
        title : tr.find('a').eq(0).text().trim(),
        url : tr.find('a').eq(0).attr('href').replace(/showmsg.php/, '#showmsg'),
        poster : tr.children('td').eq(2).text().trim(),
        time : tr.children('td').eq(3).text().trim(),
        reply : tr.children('td').eq(4).text().trim(),
        reply_time : tr.children('td').eq(5).text().trim()
    };

    info.href_list = href_list;
    info.recent_status = is_recent(info.time) ? 'yes' : 'no';
    info.recent_img = is_recent(info.time) ? '<img class="smallgif" src="icons/new.gif" />' : '';
    return is_filter_thread(info.title) ? null : format_onethread_div(info);
}


function sub_board_action(){
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
}

function sub_board(para, html){
    var url = "#board?" + board_para_string(para, { page : 1 });
    $('#sub_board').find('input[name="url"]').attr("value", url);
    var sm = html.match(/本版所属子论坛[^<]+<\/font>([\s\S]*?)<\/span>/);
    var u = sm[1];

    $('#sub_board').find('fieldset').html(u);
    $("#sub_board").find("input[type='checkbox']").css("width", '50%'); 
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

function thread_type(para){
    var typelist = [
        [ '全部', {} ],
        [ '加精', { type : 'wonderful' } ], 
        [ '套红', { type : 'red' } ], 
        [ '加☆', { type : 'star' } ]
    ];

    var s='';
    for(var i in typelist){
        var tr = typelist[i];
        var r = tr[1];
        r['page'] = 1;
        s += '<a href="#board?' + board_para_string(para, r) + '">' + tr[0] + '</a>&nbsp;&nbsp;' ;
    }

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

    $('#manual_jump').find('input').eq(0).val(para.board);

    var u = HJJ + "/board.php?" + board_para_string(para);
    $('#remote_url').html(u);
    $('#remote_url_short').html(['HJJ', para.board ].join(","));

    var local_url = '#board?' + board_para_string(para);
    $('#local_board_url').attr('href', local_url);

    var thread_info = '';

    var board_cb = function(d){
        var h = jQuery.parseHTML(d);
        $(h).find('tr[valign="middle"][bgcolor="#FFE7F7"]')
            .each(function(){
                var ti = board_thread_info($(this));
                if(ti) thread_info += ti;
            });

        $('#thread_list').html(thread_info);

        board_title(para, h);

        add_history({
            url : "#board?" + board_para_string(para), 
            title : board_save_title()
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
        .replace(/<(div|table|tr|td|font)[^>]*>/ig, "<$1>")
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


function showmsg_grep_floor(){
    var k = $('#showmsg_grep_floor_keyword').val();
    if(!k) return;

    var is_to_filter = function(f){
        var c = f.find('.flcontent').text().match(k);
        var p =  f.find('.floor_poster').text().match(k);
        return  (c || p) ? false : true;
    };

    filter_floor(is_to_filter, '抽取' + k);
}

function showmsg_filter_floor(){
    var k = $('#showmsg_filter_floor_keyword').val();
    if(!k) return;

    var is_to_filter = function(f){
        var c = f.find('.flcontent').text().match(k);
        var p =  f.find('.floor_poster').text().match(k);
        return  (c || p) ? true : false;
    };

    filter_floor(is_to_filter, '过滤' + k);
}

function showmsg_dewater(min){
    if(! min){
        min = $('#showmsg_dewater_wordnum').val();
    }

    var is_to_filter = function(f){
        var c = f.find('.flcontent').attr('wordnum');
        return  parseInt(c)<parseInt(min);
        return  c<min;
    };

    filter_floor(is_to_filter, '最少' + min + '字');
}

function showmsg_all_floor(){
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

function showmsg_only_img(){
    var is_to_filter = function(f){
        var c = f.find('.flcontent').eq(0).html();
        return  c.match(/\<img /i) ? 0 : 1;
    };
    filter_floor(is_to_filter, '只看图');
}

function showmsg_only_poster(){
    var poster = get_showmsg_poster();
    var is_to_filter = function(f){
        var flposter = f.find('.floor_poster').text();
        return  flposter!=poster ;
    };

    filter_floor(is_to_filter, '只看楼主');
}

function showmsg_reverse_floor(){
    $('#thread_action_temp').html('倒序');

    var fst = $('.floor').eq(1);
    var snd = $('.floor').eq(2);
    if(! snd) return;
    if(snd.prop('id')<fst.prop('id')) return;

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
        '&nbsp;&nbsp;&nbsp;' +
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
            para.page = 0;
            local_url = get_showmsg_local_url(para);

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


function get_current_floor(e, delta_height){
    var sh = screen.height;

    var eh = $(window).scrollTop();

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

function get_current_position(e){
    if(! e.originalEvent) return e;
    return e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] || e;
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


function showmsg_toggle_footer(ee){
    var jh = (ee.yzone=='middle' && ee.xzone=='middle') ? 1 : 0;
    if(jh==0) return;
    $("#showmsg_footer").toggle();
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
    $.mobile.silentScroll(pos);
}

function jump_to_next(f){
    var x = f.nextAll();
    var i = parseInt(DEFAULT["showmsg_jump_floor"]) -1;

    var pos = x[i] ? $(x[i]).offset().top : $(document).height();
    $.mobile.silentScroll(pos);
}

function showmsg_click() {
    $('#showmsg').on('vclick', '.thread_jump_page', function(){
        thread_jump_page($(this)); return false;
    });

    //$('#showmsg').on('vclick', '#thread_cache', function(){ 
    //thread_cache(); return false;
    //});

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

    $('#showmsg').on('vclick', '.floor', function(e){ tap_to_scroll_screen(e); return false; });

    $('#showmsg').on('vclick', '#jump_to_bottom', function(){
        $(document).scrollTop($(document).height());return false; 
    });

    $('#showmsg').on('vclick', '#jump_to_top', function(){
        $.mobile.silentScroll(0);return false; 
    });

    $('#showmsg').on('vclick', '#jump_to_prev', function(e){
        jump_to_prev(get_current_floor(e, -screen.height*2));
        return false; 
    });
    $('#showmsg').on('vclick', '#jump_to_next', function(e){
        jump_to_next(get_current_floor(e, -screen.height*2));
        return false; 
    });

}

function extract_showmsg_content(d){
    var res = {};

    var pm = d.match(/\>(共\d+页:.+?)<\/div>/);
    res["pager"] = pm ? pm[1].replace(/href=(.+?)>/g, "href=\"#showmsg$1\">").replace(/<\/a>/g, '</a>&nbsp;') : '';
    if(res["pager"].match(/共/)){
        res["pager"] += "<a action='-1' class='thread_jump_page'>&lt;</a>&nbsp;&nbsp;" + 
            "<a action='1' class='thread_jump_page'>&gt;</a>";
    }

    var h = $.parseHTML(d.replace(/<font color='gray' size='-1'>本帖尚未审核,若发布24小时后仍未审核通过会被屏蔽<\/font><br\/>/g,''));

    res["title"] = $(h).find('div[id="msgsubject"]').html().replace(/\<font.*/,'').replace(/^\s+/,'').replace('主题：','');

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
    check_fav_thread();
    //check_cache_thread();

    $('#remote_url_title').html(res["title"]);
    $('#thread_title').html( res["title"] );

    $('#thread_pager_top').html( res["pager"] );
    $('#thread_pager_bottom').html( res["pager"]);
    $('#thread_floor_list').html(res["floor_list"]);

    $('#thread_floor_list').find('a').each(function(){
        var href = $(this).attr('href');
        if(href.match(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/)){ 
            href = href.replace(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/g, '#showmsg?')
            $(this).attr('href', href);
            $(this).removeAttr('target');
            $(this).removeAttr('rel');
        }
    });

    var local_url = get_showmsg_local_url(para);

    add_history({
        url : local_url, 
        title : thread_save_title(para, res)
    });

    if(para.fid){
        showmsg_jump_floor_simple(para.fid);
    }else if(DEFAULT["auto_jump_mark_floor"]=='on'){
        setTimeout(function(){ thread_mark_floor(); }, 300);
    }else{
        $.mobile.silentScroll(0);
    }

    showmsg_main_floor();
}

function showmsg_main_floor(){
    showmsg_all_floor();

    if(DEFAULT["showmsg_all_floor"]==1){
        return;
    }

    if(DEFAULT["showmsg_dewater"]==1){
        showmsg_dewater();
    }

    if(DEFAULT["showmsg_only_poster"]==1){
        showmsg_only_poster();
    }

    if(DEFAULT["showmsg_only_img"]==1){
        showmsg_only_img();
    }

    if(DEFAULT["showmsg_grep_floor"]==1){
        showmsg_grep_floor();
    }

    if(DEFAULT["showmsg_filter_floor"]==1){
        showmsg_filter_floor();
    }

    if(DEFAULT["showmsg_reverse_floor"]==1){
        showmsg_reverse_floor();
    }
}


function showmsg_header(para){
    $('#remote_url_short').html([ 'HJJ', para.board, para.id ].join(","));

    var up_url = "#board?board=" + para.board + '&page=1';
    if($('#board_id').html()==para.board){
        up_url = $('#local_board_url').attr('href');
    }
    $('#thread_to_board').attr('href', up_url);

    $('#manual_jump').find('input').eq(0).val(para.board);
    $('#remote_url').html(get_showmsg_remote_url(para)); 

}


function showmsg_banner(para){
    var local_url = get_showmsg_local_url(para);
    var u = get_showmsg_remote_url(para);
    $('#thread_title').attr('href', local_url + '&refresh=1');

    $('#thread_bid').html(para.board);
    $('#thread_tid').html(para.id);
    $('#thread_pid').html(para.page || 0);



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
        tag : sprintf("%03d", tr.children('td').eq(0).text()),
        title : tr.find('a').eq(0).text().trim(),
        url : tr.find('a').eq(0).attr('href').replace(/showmsg.php/, '#showmsg').replace(/&keyword=[^&]+/, ''),
        poster : tr.children('td').eq(2).text().trim(),
        time : tr.children('td').eq(3).text(),
        reply : tr.children('td').eq(5).text(),
        reply_time : tr.children('td').eq(6).text()
    };
    return format_onethread_div(info);
}

function search(para){

    var s = 'search[' + para.board + '](' + para.topic + ')' + para.keyword;
    add_history({
        url : "#search?" + search_para_string(para), 
        title : s
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
        var unit = thisEle.slice(-2); 
        var cName = $(this).attr("type");
        if(cName == "bigger"){
            textFontSize += 2;
        }else{
            textFontSize -= 2;
        }
        var sz = textFontSize + unit;
        $(e).css( "font-size" , sz );

        lscache.set('font_size', sz);
        return false;
    });
}

function default_checkbox_init(){
    $('[data-role="page"]').find(".default_checkbox").each(
        function(){
            var k = $(this).attr('id');
            $(this).prop("checked",DEFAULT[k]==1 ? true : false); 
            $(this).on("change", function () {
                DEFAULT[k] = $(this).prop("checked") ? 1 : 0;
                lscache.set(k, DEFAULT[k]);
                showmsg_main_floor();
            });
        });

    $('[data-role="page"]').find(".default_checkbox_btn").each(
        function(){
            var k = $(this).attr('name');
            var color = DEFAULT[k]==1 ? 'red' : 'black';
            $(this).css('color', color);

            $(this).on("vclick", function () {
                var k = $(this).attr('name');
                $('#' + k).click();
                var color = DEFAULT[k]==1 ? 'red' : 'black';
                $(this).css('color', color);
                return false;
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

function setting_text_init(){
    $('[data-role="page"]').find(".setting_text").each(
        function(){
            var k = $(this).attr('id');
            $(this).val(DEFAULT[k]);
            $(this).on('change', function(){
                DEFAULT[k] = $(this).val();
                lscache.set(k, DEFAULT[k]);
                showmsg_main_floor();
            });
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
    var font_size = lscache.get('font_size') || '112%';
    $("body").css( "font-size" , font_size );
    lscache.set('font_size', font_size);
    $('#setting').on('vclick', '.change_font_size', function(){
        var thisEle = $('body').css("font-size"); 
        var textFontSize = parseFloat(thisEle , 10);
        var unit = thisEle.slice(-2); 
        var cName = $(this).attr("type");
        if(cName == "bigger"){
            textFontSize += 2;
        }else{
            textFontSize -= 2;
        }
        var sz = textFontSize + unit;
        $('body').css( "font-size" , sz );

        lscache.set('font_size', sz);
        return false;
    });
}

function setting_init(){
    //setting
    night_color_init();
    change_font_size_init();
    $('#faq_url').attr('href', FAQ_URL);
    $('#setting').on('vclick', '#suggest', function(){
        var st = encodeURIComponent(SHARE_WEIBO + ' ');
        var wu = SHARE_WEIBO_URL + '?title=' + st;
        window.open(wu, '_blank');
    });

    //showmsg
    $('#showmsg_panel').find('select').css('width', '50%');
    $('#showmsg_panel').find('input[type="text"]').css('width', '50%');
    $(document).find('input[type="checkbox"]').css('style', 'float: left');

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
    $.mobile.paramsHandler.addPage( "board",                      
        ["board", "page"],       
        ["type", "subid"],                     
        function (para) { board(para); });

    $.mobile.paramsHandler.addPage( "showmsg",                      
        ["board", "id"],       
        ["page", "boardpagemsg", "keyword", "refresh", "fid"],                     
        function (para) { showmsg(para); });

    $.mobile.paramsHandler.addPage( "search",                      
        ["board", "keyword"],       
        ["topic", "page", "act"],                     
        function (para) { search(para); });

    $.mobile.paramsHandler.init();
}

function main(){
    params_page();

    //首页
    home(0); 
    $('#home').on('vclick', '#refresh_home', function(){ home(1); return false; });

    //版块列表
    board_menu(); 

    //查询
    $('#search_form').on('vclick', '#search_form_btn', function() { search_form(); return false; });
    $('#search').on('vclick', '.board_url', function(){
        var id = $('#board_id').val();
        var u = '#board?' + 'board=' + id;
        $.mobile.pageContainer.pagecontainer('change', u);
        return false;
    });

    //设置
    setting_init(); 

    //手动跳转
    manual_jump_init(); 

    //收藏版块
    $('#fav_board_list').append(DEFAULT["fav_board_list"]);
    $('#board').on('vclick', '#board_save', function(){ toggle_fav_board();return false; }); 

    //收藏贴子
    $('#fav_thread_list').append(DEFAULT["fav_thread_list"]);
    $('#showmsg').on('vclick', '#thread_save', function() { toggle_fav_thread(); return false; });

    //近期访问
    $('#recent_history_list').append(DEFAULT["recent_history_list"]);

    //版块
    $('#board').on('vclick', '#not_rem_sub_board', function(){
        var bid = $('#board_id').html();
        lscache.remove( 'rem_sub_board_' + bid);
        $.mobile.pageContainer.pagecontainer('change', '#board?board=' + bid + '&page=1');
        return false;
    });
    $('#board').on('vclick', '#sub_board_btn', function(){ sub_board_action(); return false;}); 
    $('#board').on('vclick', '.sub_board_check_all', function() { 
        var act = $(this).attr('action');
        sub_board_check_all(act); 
        return false;
    });
    $('#board').on('vclick', '#toggle_recent_thread', function() { toggle_recent_thread(); return false;});
    //$('#board').on('vclick', '.onethread', function(e){ tap_to_scroll_screen(e); return false; });

    $('body').on('vclick', '.format_url_code', function(){
        var area = $(this).parent().find('textarea').eq(0);
        var f = area.val()
            .replace(/\s(http:\/\/.*?\.(jpg|gif|png|jpeg))\s/ig , "<img src='$1' />\n")
            .replace(/\s(http:\/\/[^\s'"]+)\s/ig , "<a href='$1'>$1</a>\n");
        area.val(f);
        return false;
    });

    showmsg_click(); //贴子
    default_checkbox_init();
    setting_text_init();
}

//jQuery doc.ready
$(document).bind('pageinit',function(e){
    if(MOBILE_INIT>0) return;
    main(); 
    MOBILE_INIT=1;
});
// }}
