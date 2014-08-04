var HJJ='http://bbs.jjwxc.net';
var THREAD_HISTORY_MINUTE = 60*24*10;
// {{ base
function save_storage(key, v){
    var s = JSON.stringify(v);
    localStorage.setItem(key, s);
}

function read_storage(key, default_v) {
    var xdata = localStorage.getItem(key);
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

var MAX_HISTORY_CNT = 100;
var HISTORY= read_storage('history', []);
var FAV_BOARD=read_storage('fav_board', []);
var FAV_THREAD = read_storage('fav_thread', []);
var INIT = 0;
//}}
// {{{
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
//  {{{

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
        }
    }
    xhr.send();
}


function fav_board() {
    var s = format_remember_list({
        "key" : 'fav_board', 
        "data" : FAV_BOARD, 
        "max_length" : 30,
    });
    $('#fav_board').find('ul').html(s);
    $('#fav_board').find('ul').trigger('create');
}

function fav_thread() {
    var s = format_remember_list({
        "key" : 'fav_thread', 
        "data" : FAV_THREAD, 
        "max_length" : 1000,
    });

    $('#fav_thread').find('ul').html(s);
    $('#fav_thread').find('ul').trigger('create');
    showmsg_click();
}

function check_fav_board(){
    var x = check_remember_list(FAV_BOARD, {
        "key" : $('#board_id').text()
    });

    if(x!=undefined){
        $('#toggle_fav_board').html('取消收藏');
    }else{
        $('#toggle_fav_board').html('收藏');
    }
    board_click();
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
    showmsg_click();
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
// -- }}}

// {{{

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

// -- }}}

//  {{{
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
    //$('#view_all_floor').show();
    var i = 0;
    $('.floor').each(function() {
        if(i>0 && is_to_filter($(this))) $(this).hide(); 
        i=1;
    });
    showmsg_click();
}

function view_img(){
    var is_to_filter = function(f){
        var c = f.find('.flcontent').eq(0).html();
        return  c.match(/\<img /i) ? 0 : 1;
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
    //$('#view_all_floor').hide();

    $('.floor').each(function() {
        $(this).show();
    });
    showmsg_click();
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
    var html = '<div class="floor" id="floor' + f.id + '">' +
        '<div class="flcontent" word_num="' + f.word_num + '">' + f.content + '</div>' +
        '<span class="chapter">№' + f.id + '<span class="star">☆</span><span class="floor_poster">' + f.poster + '</span><span class="star">☆</span>' + f.time + '<span class="star">☆</span></span>' +
        '&nbsp;&nbsp;' +
        '<a  class="reply_thread_floor" reply_type="cite" href="#">引用</a>' + 
        '&nbsp;&nbsp;' +
        '<a  class="reply_thread_floor" reply_type="default" href="#">回复</a>' + 
        '&nbsp;&nbsp;' +
        '<a class="jump_to_top" href="#">顶部</a>' + 
        '&nbsp;&nbsp;' +
        '<a class="jump_to_bottom" href="#">底部</a>' + 
        '</div>';
    return html;
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
    fav_thread();
    showmsg_click();
    save_storage('fav_thread', FAV_THREAD);
}

function showmsg_click() {
    $('#showmsg').on('click', 
        '#only_poster', 
        function(){ only_poster(); });

    $('#showmsg').on('click', 
        '#min_word_num', function(){ min_word_num(); });

    $('#thread_content').on(
        'click', '#view_all_floor', function(){ view_all_floor();});
    //$('#view_all_floor').hide();
    $('#thread_content').on('click', '.jump_to_top', function(){
        $.mobile.silentScroll(0);
    });
    $('#thread_content').on('click', '.jump_to_bottom', function(){
        $(document).scrollTop($(document).height());
    });
    
    $('#thread_content').on('click', '#view_img', function(){
        view_img();
    });

    $('#thread_content').on('click', '.reply_thread_floor', function(){
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

    $('#thread_content').on('click', 
    '#toggle_fav_thread', function(){
        toggle_fav_thread();
    });
}


function showmsg_refresh(local_url, para) {
    var u = HJJ+'/showmsg.php?' + showmsg_para_string(para); 
    $('#thread_refresh').attr('href', local_url + '&refresh=1');

    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.open("GET", u, true);
    xhr.overrideMimeType('text/plain; charset=gb2312');

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {

            h = $.parseHTML(xhr.responseText);

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
            if(pm){
                var page_h = pm[1].replace(/href=(.+?)>/g, "href=\"#showmsg$1\">");
                $('#thread_pager_top').html( page_h );
                $('#thread_pager_bottom').html( page_h );
            }

            var floors_info = new Array();
            $(h).find('td[class="read"]').each(function() {
                var bot = $(this);
                var f_i =  extract_floor_info(bot);
                var html = format_floor_content(f_i);
                floors_info.push(html);
            }).promise().done(function(){
                $('#thread_floor_list').html(floors_info.join("\n"));

                $('#thread_floor_list').find('a').each(function(){
                    var href = $(this).attr('href');
                    if(! href.match(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/)) return;
                    href = href.replace(/http:\/\/bbs.jjwxc.net\/showmsg.php\?/g, '#showmsg?')
                    $(this).attr('href', href);
                    $(this).removeAttr('target');
                    $(this).removeAttr('rel');
                });

                showmsg_click();
                check_fav_thread();
                lscache.set(local_url, $('#thread_content').html(), THREAD_HISTORY_MINUTE);

            });


        }
    }
    xhr.send();
}


function showmsg(para){
    $('#thread_bid').html(para.board);
    $('#thread_tid').html(para.id);
    $('#reply_thread').find('form').attr('action', HJJ + "/reply.php?board="+ para.board + '&id=' + para.id);
    $('#thread_to_board').attr('href', "#board?board=" + para.board + '&page=1');

    $('#thread_floor_list').html('');

    var local_url = "#showmsg?" + showmsg_para_string(para); 

    var x = lscache.get(local_url);
    if(x && para.refresh==undefined){
        $('#thread_content').html(x);
        check_fav_thread();
        showmsg_click();
    }else{
        showmsg_refresh(local_url, para);
    }

}

// -- }}}
// {{{
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
// -- }}}
// {{{
function search_para_string(para, other){
    other = other || {};

    var x = {};
    for(k in para){
        x[k]=para[k];
    }
    for(k in other){
        x[k] = other[k];
    }

    x.act = x.act || 'search';
    x.topic = x.topic!=undefined ? x.topic : 3;
    x.page = x.page || 1;

    s = [];
    for(var k in x){
        s.push(k + '=' + x[k]);
    }
    return s.join('&');
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
    //$("html, body").animate({ scrollTop: 0 }, "slow");

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
    //$.mobile.navigate( url );
    $.mobile.changePage( url );
}
// }}}
// {{ 
function board_click() {
    $('#board').on('click', 
    '#toggle_fav_board', function(){
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
    });
}

function main(){
    fav_board();
    fav_thread();
    home();

    $.mobile.defaultPageTransition = 'none';
    params_page();

    board_click();

    $('#recent_history').on('click', '#recent_history', function(){
        recent_history();
    });
    recent_history();

    $('#board_menu').find("div").each(
        function(){
        board_menu($(this));
    });

    $("#filter_board").on( "filterablefilter", function( event, ui ) {
        ui.items.each(function( index ) {
            $(this).collapsible("option", "collapsed", $(this).hasClass("ui-screen-hidden")).removeClass("ui-screen-hidden");
        });
    });

    $('textarea').elastic(); 

    $("#night_bgcolor").on("change", function () {
        var s= $(this).val()=='on' ?  $('#night_css').html() : ""; 
        $('head').find('style').html(s);

        var t = $(this).val()=='on' ? 'e' : 'a';
        $.mobile.changeGlobalTheme(t);
    });
}
//}}
//{{
$(document).bind('pageinit',function(e ){
    if(INIT>0) return;
    main(); 
    INIT=1;
});
// }}
