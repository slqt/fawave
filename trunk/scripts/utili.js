// @author qleelulu@gmail.com

//-- 版本号 --
var VERSION = 20110220;
function getVersion(){
    var ver = localStorage.getObject('VERSION');
    return ver;
};

function updateVersion(){
    localStorage.setObject('VERSION', VERSION);
};
//<<--

var _u = {
    //向页面写内容
    w: function(s){
        document.write(s);
    },
    //向页面写本地化后的内容
    wi: function(s, e){
        _u.w(_u.i18n(s, e));
    },
    wia: function(sel, attr, s, e){
        $(sel).attr(attr, _u.i18n(s, e));
    },
    //获取本地化语言
    i18n: function(s, e){
        var re = chrome.i18n.getMessage(s, e);
        if(re){
            return re;
        }else{
            return s;
        }
    }
};

var PAGE_SIZE = 20;
var COMMENT_PAGE_SIZE = 8;
var OAUTH_CALLBACK_URL = chrome.extension.getURL('oauth_cb.html');

var SINA = 'idi_sina';

var SETTINGS_KEY = 'fawave_SETTINGS_KEY';

var UNSEND_TWEET_KEY = 'idi_UNSEND_TWEET_KEY';//未发送的tweet，保存下次显示

var FRIENDS_TIMELINE_KEY = 'idi_friends_timeline';
var REPLIES_KEY = 'idi_replies';
var MESSAGES_KEY = 'idi_messages';

var USER_LIST_KEY = 'idi_userlist';
var CURRENT_USER_KEY = 'idi_current_user';

var LAST_MSG_ID = 'idi_last_msg_id';
var LAST_CURSOR = '_last_cursor';

var LAST_SELECTED_SEND_ACCOUNTS = 'LAST_SELECTED_SEND_ACCOUNTS';

var LOCAL_STORAGE_NEW_TWEET_LIST_KEY = 'idi_LOCAL_STORAGE_NEW_TWEET_LIST_KEY';
var LOCAL_STORAGE_TWEET_LIST_HTML_KEY = 'idi_LOCAL_STORAGE_TWEET_LIST_HTML_KEY';

var UNREAD_TIMELINE_COUNT_KEY = 'idi_UNREAD_TIMELINE_COUNT_KEY';

var IS_SYNC_TO_PAGE_KEY = 'idi_IS_SYNC_TO_PAGE_KEY'; //已读消息是否和新浪微博页面同步

var THEME_LIST = {
	'default':'default', 
	'simple':'simple', 
	'pip_io':'pip_io', 
	'work':'work'
}; //主题列表

var ALERT_MODE_KEY = 'idi_ALERT_MODE_KEY'; //信息提醒模式key
var AUTO_INSERT_MODE_KEY = 'idi_AUTO_INSERT_MODE_KEY'; //新信息是否自动插入

//需要不停检查更新的timeline的分类列表
var T_LIST = {
	'all': ['friends_timeline','mentions','comments_timeline','direct_messages'],
	'digu': ['friends_timeline','mentions', 'direct_messages'],
	'buzz': ['friends_timeline'],
	'facebook': ['friends_timeline'],
	'plurk': ['friends_timeline'],
	'douban': ['friends_timeline', 'direct_messages']
};
T_LIST.t163 = T_LIST.tsina = T_LIST.tsohu = T_LIST.all;
T_LIST.tqq = T_LIST.fanfou = T_LIST.renjian = T_LIST.zuosa 
	= T_LIST.follow5 = T_LIST.leihou = T_LIST.twitter 
	= T_LIST.identi_ca = T_LIST.tumblr = T_LIST.digu;

var T_NAMES = {
	'tsina': '新浪微博',
	'tqq': '腾讯微博',
	'tsohu': '搜狐微博',
	't163': '网易微博',
	'douban': '豆瓣',
	'fanfou': '饭否',
	'digu': '嘀咕',
	'zuosa': '做啥',
	'leihou': '雷猴',
	'renjian': '人间网',
//	'follow5': 'Follow5', // f5的api实在太弱了，无法做完美
	'twitter': 'Twitter',
	'facebook': 'Facebook',
	'plurk': 'Plurk',
	'buzz': 'Google Buzz',
    'identi_ca': 'identi.ca'
//    'tumblr': 'Tumblr'
};

var Languages = {
	'中文': 'zh',
	'Afrikaans': 'af',
	'Albanian': 'sq',
	'Arabic': 'ar',
	'Basque': 'eu',
	'Belarusian': 'be',
	'Bulgarian': 'bg',
	'Catalan': 'ca',
	'Croatian': 'hr',
	'Czech': 'cs',
	'Danish': 'da',
	'Dutch': 'nl',
	'English': 'en',
	'Estonian': 'et',
	'Filipino': 'tl',
	'Finnish': 'fi',
	'French': 'fr',
	'Galician': 'gl',
	'German': 'de',
	'Greek': 'el',
	'Haitian Creole': 'ht',
	'Hebrew': 'iw',
	'Hindi': 'hi',
	'Hungarian': 'hu',
	'Icelandic': 'is',
	'Indonesian': 'id',
	'Irish': 'ga',
	'Italian': 'it',
	'Japanese': 'ja',
	'Latvian': 'lv',
	'Lithuanian': 'lt',
	'Macedonian': 'mk',
	'Malay': 'ms',
	'Maltese': 'mt',
	'Norwegian': 'no',
	'Persian': 'fa',
	'Polish': 'pl',
	'Portuguese': 'pt',
	'Romanian': 'ro',
	'Russian': 'ru',
	'Serbian': 'sr',
	'Slovak': 'sk',
	'Slovenian': 'sl',
	'Spanish': 'es',
	'Swahili': 'sw',
	'Swedish': 'sv',
	'Thai': 'th',
	'Turkish': 'tr',
	'Ukrainian': 'uk',
	'Vietnamese': 'vi',
	'Welsh': 'cy',
	'Yiddish': 'yi'
};

var unreadDes = {
    'friends_timeline': _u.i18n('abb_friends_timeline'), 
    'mentions': '@', 
    'comments_timeline': _u.i18n('abb_comments_timeline'), 
    'direct_messages': _u.i18n('abb_direct_message')
};

var tabDes = {
    'friends_timeline': _u.i18n('comm_TabName_friends_timeline'), 
    'mentions': _u.i18n('comm_TabName_mentions'), 
    'comments_timeline': _u.i18n('comm_TabName_comments_timeline'), 
    'direct_messages': _u.i18n('comm_TabName_direct_messages')
};

//刷新时间限制
var refreshTimeLimit = {
    'tsina':{
        'friends_timeline': 30, 
        'mentions': 30, 
        'comments_timeline': 30, 
        'direct_messages': 30,
        'sent_direct_messages': 60
    },
    'tqq':{
        'friends_timeline': 45, 
        'mentions': 45, 
        'comments_timeline': 45, 
        'direct_messages': 45,
        'sent_direct_messages': 60
    },
    'follow5':{
        'friends_timeline': 45, 
        'mentions': 60, 
        'comments_timeline': 60, 
        'direct_messages': 60,
        'sent_direct_messages': 60
    }
};
refreshTimeLimit.digu = refreshTimeLimit.twitter = refreshTimeLimit.identi_ca = refreshTimeLimit.tsohu = refreshTimeLimit.t163 = refreshTimeLimit.fanfou = refreshTimeLimit.plurk = refreshTimeLimit.tsina;
refreshTimeLimit.renjian = refreshTimeLimit.zuosa = refreshTimeLimit.follow5 = refreshTimeLimit.leihou = refreshTimeLimit.douban = refreshTimeLimit.buzz = refreshTimeLimit.tqq;

function showMsg(msg){
    var popupView = getPopupView();
    if(popupView){
        popupView._showMsg(msg);
    }
};
function _showMsg(msg){
    $('<div class="messageInfo">' + msg + '</div>')
    .appendTo('#msgInfoWarp')
    .fadeIn('slow')
    .animate({opacity: 1.0}, 3000)
    .fadeOut('slow', function() {
      $(this).remove();
    });
};

function showLoading(){
    var popupView = getPopupView();
    if(popupView){
        popupView._showLoading();
    }
};

function hideLoading(){
    var popupView = getPopupView();
    if(popupView){
        popupView._hideLoading();
    }
};

//设置选项
var Settings = {
    defaults: {
        twitterEnabled: true,
        globalRefreshTime:{ //全局的刷新间隔时间
            friends_timeline: 90,
            mentions: 120,
            comments_timeline: 120,
            direct_messages: 120
        },
        isSetBadgeText:{ //是否提醒未读信息数
            friends_timeline: true,
            mentions: true,
            comments_timeline: true,
            direct_messages: true
        },
        isShowInPage:{ //是否在页面上提示新信息
            friends_timeline: true,
            mentions: true,
            comments_timeline: true,
            direct_messages: true
        },
        isEnabledSound:{ //是否开启播放声音提示新信息
            friends_timeline: false,
            mentions: false,
            comments_timeline: false,
            direct_messages: false
        },
        soundSrc: '/sound/d.mp3',
        isDesktopNotifications:{ //是否在桌面提示新信息
            friends_timeline: false,
            mentions: false,
            comments_timeline: false,
            direct_messages: false
        },
        desktopNotificationsTimeout: 5, //桌面提示的延迟关闭时间
        isSyncReadedToSina: false, //已读消息是否和新浪微博页面同步
        isSharedUrlAutoShort: true, //分享正在看的网址时是否自动缩短
        sharedUrlAutoShortWordCount: 15, //超过多少个字则自动缩短URL
        quickSendHotKey: '113', //快速发送微博的快捷键。默认 F2。保存的格式为： 33,34,35 用逗号分隔的keycode
        isSmoothScroller: false, //是否启用平滑滚动
        smoothTweenType: 'Quad', //平滑滚动的动画类型
        smoothSeaeType: 'easeOut', //平滑滚动的ease类型
        sendAccountsDefaultSelected: 'current', //多账号发送的时候默认选择的发送账号
        enableContextmenu: true, //启用右键菜单

        font: 'Arial', //字体
        fontSite: 12, //字体大小
        popupWidth: 480, //弹出窗大小
        popupHeight: 520, 
        theme: 'pip_io', //主题样式
        translate_target: 'zh', // 默认翻译语言
        shorten_url_service: 't.cn', // 默认缩址服务
        image_service: 'Imgur', // 默认的图片服务
        enable_image_service: true, // 默认开启图片服务
        isGeoEnabled: false, //默认不开启上报地理位置信息
        isGeoEnabledUseIP: false, //true 使用ip判断， false 使用浏览器来判断
        geoPosition: null, //获取到的地理位置信息，默认为空

        lookingTemplate: _u.i18n('sett_shared_template')
    },
    init: function(){ //只在background载入的时候调用一次并给 _settings 赋值就可以
        var _sets = localStorage.getObject(SETTINGS_KEY);
        _sets = _sets || {};
        // 兼容不支持的缩址
        if(_sets.shorten_url_service && !ShortenUrl.services[_sets.shorten_url_service]) {
        	delete _sets.shorten_url_service;
        }
        _sets = $.extend({}, this.defaults, _sets);
        
        if(!THEME_LIST[_sets.theme]){
            _sets.theme = this.defaults.theme;
        }

        return _sets;
    },
    get: function(){
        var bg = getBackgroundView();
        //不用判断，已确保init会在background载入的时候调用
        //if(!bg._settings){
        //    bg._settings = this.init();
        //}
        return bg._settings;
    },
    save: function(){
        var _sets = this.get();
        localStorage.setObject(SETTINGS_KEY, _sets);
    },
    /*
    * 获取刷新间隔时间
    */
    getRefreshTime: function(user, t){
        var r = 60;
        if(user && user.refreshTime && user.refreshTime[t]){
            r = user.refreshTime[t];
        }else{
            r = this.get().globalRefreshTime[t];
        }
        if(refreshTimeLimit[user.blogType] && refreshTimeLimit[user.blogType][t] && refreshTimeLimit[user.blogType][t] > r){
            r = refreshTimeLimit[user.blogType][t];
        }
        if(isNaN(r)){
            r = 60;
        }else if(r < 30){
            r = 30;
        }else if(r > 24 * 60 * 60){
            r = 24 * 60 * 60;
        }
        return r;
    }
};


function formatScreenName(user) {
	return '[' + T_NAMES[user.blogType] + ']' + user.screen_name || user.name;
}

///获取当前登陆用户信息
function getUser(){
    var c_user = localStorage.getObject(CURRENT_USER_KEY);
    if(c_user && c_user.uniqueKey){
        window.c_user = c_user;
    }else{
        var userList = getUserList();
        if(userList){
            for(var key in userList){
                c_user = userList[key];
                if(c_user){
                    setUser(c_user);
                    break;
                }
            }
        }
    }
    return c_user;
};

//设置当前登陆用户
function setUser(user){
    localStorage.setObject(CURRENT_USER_KEY, user);
    window.c_user = user;
};

//获取所有用户列表
//@t: all: 全部， send:用于发送的用户列表， show:正常显示的用户。默认为show
function getUserList(t){
    t = t || 'show'; //默认，获取用于显示的列表
    var userList = localStorage.getObject(USER_LIST_KEY) || [];
    if(t==='all' && userList.length != undefined){ // 兼容旧格式
    	return userList;
    }
    var items = [], user = null;
    for(var i in userList){
        user = userList[i];
        if(!user.disabled){
            if(t==='show' && user.only_for_send){ continue; }
        	items.push(userList[i]);
        }
    }
    return items;
};

//保存用户列表
function saveUserList(userlist){
    localStorage.setObject(USER_LIST_KEY, userlist);
};
//根据uniqueKey获取用户
//@t: all: 全部， send:用于发送的用户列表， show:正常显示的用户。默认为show
function getUserByUniqueKey(uniqueKey, t){
    if(!uniqueKey){return null;}
    var userList = getUserList(t);
    for(var i in userList){
    	if(userList[i].uniqueKey == uniqueKey){
    		return userList[i];
    	}
    }
    return null;
}

//获取用户的全部timeline的未读信息数
function getUserUnreadTimelineCount(user_uniqueKey){
    var user = getUserByUniqueKey(user_uniqueKey);
    if(!user){ return 0; }
    var total = 0;
    for(var i in T_LIST[user.blogType]){
        //key 大概如： tsina#11234598_friends_timeline_UNREAD_TIMELINE_COUNT_KEY
        var count = localStorage.getObject(user_uniqueKey + T_LIST[user.blogType][i] + UNREAD_TIMELINE_COUNT_KEY);
        if(!count){
            count = 0;
        }
        total += count;
    }
    return total;
};

//获取用户的某一timeline的未读信息数
function getUnreadTimelineCount(t, user_uniqueKey){
    if(!user_uniqueKey){
        var _user = getUser();
        if(_user){
            user_uniqueKey = _user.uniqueKey;
        }else{
            return 0;
        }
    }
    //key 大概如： tsina#11234598_friends_timeline_UNREAD_TIMELINE_COUNT_KEY
    var count = localStorage.getObject(user_uniqueKey + t + UNREAD_TIMELINE_COUNT_KEY);
    if(!count){
        count = 0;
    }
    return count;
};

//@count: 增加的未读数
//@t: timeline的类型
function setUnreadTimelineCount(count, t, user_uniqueKey){
    if(!user_uniqueKey){
        var _user = getUser();
        if(_user){
            user_uniqueKey = _user.uniqueKey;
        }else{
            return;
        }
    }
    var setBadgeText = Settings.get().isSetBadgeText[t];
    count += getUnreadTimelineCount(t, user_uniqueKey);
    localStorage.setObject(user_uniqueKey + t + UNREAD_TIMELINE_COUNT_KEY, count);
    if(getAlertMode()=='dnd'){ //免打扰模式
        chrome.browserAction.setBadgeText({text: '/'});
    }else{
        if(setBadgeText){
            var total = 0;
            var userList = getUserList();
            for(var j in userList){
                var user = userList[j];
                for(var i in T_LIST[user.blogType]){
                    if(Settings.get().isSetBadgeText[ T_LIST[user.blogType][i] ]){
                        total += getUnreadTimelineCount(T_LIST[user.blogType][i], user.uniqueKey);
                    }
                }
            }
            if(total > 0){
                total = total.toString();
                chrome.browserAction.setBadgeText({text: total});
            }else{
                chrome.browserAction.setBadgeText({text: ''});
            }
        }
    }
    chrome.browserAction.setTitle({title:getTooltip()});
};

function removeUnreadTimelineCount(t, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    localStorage.setObject(user_uniqueKey + t + UNREAD_TIMELINE_COUNT_KEY, 0);
    if(Settings.get().isSyncReadedToSina){ //如果同步未读数
        syncUnreadCountToSinaPage(t, user_uniqueKey);
    }
    if(getAlertMode()=='dnd'){ //免打扰模式
        chrome.browserAction.setBadgeText({text: '/'});
    }else{
        var total = 0;
        var userList = getUserList();
        for(var j in userList){
            var user = userList[j];
            for(var i in T_LIST[user.blogType]){
                if(Settings.get().isSetBadgeText[T_LIST[user.blogType][i]]){
                    total += getUnreadTimelineCount(T_LIST[user.blogType][i], user.uniqueKey);
                }
            }
        }
        if(total > 0){
            total = total.toString();
            chrome.browserAction.setBadgeText({text: total});
        }else{
            chrome.browserAction.setBadgeText({text: ''});
        }
    }
    chrome.browserAction.setTitle({title:getTooltip()});
};

//将新浪微博页面的未读信息数清零
function syncUnreadCountToSinaPage(t, user_uniqueKey){
    var c_user = null;
    if(!user_uniqueKey){
        c_user = getUser();
        user_uniqueKey = c_user.uniqueKey;
    }else{
        c_user = getUserByUniqueKey(user_uniqueKey);
    }
    if(!c_user){
        return;
    }
    var tl_type = false;
    switch(t){
        case 'comments_timeline':
            tl_type = 1;
            break;
        case 'mentions':
            tl_type = 2;
            break;
        case 'direct_messages':
            tl_type = 3;
            break;
        case 'followers':
            tl_type = 4;
            break;
    }
    if(tl_type){
        tapi.reset_count({'user':c_user, 'type':tl_type}, function(users, textStatus, statuCode){
            //TODO: reset success
        });
    }
};

//获取在插件icon上显示的tooltip内容
function getTooltip(){
    if(getAlertMode()=='dnd'){
        return _u.i18n("comm_dnd_tooltip");
    }
    var tip = '', _new=0, _mention=0, _comment=0, _direct=0;
    var userList = getUserList();
    for(var j in userList){
        var user = userList[j];
        _new = getUnreadTimelineCount('friends_timeline', user.uniqueKey);
        _mention = getUnreadTimelineCount('mentions', user.uniqueKey);
        _comment = getUnreadTimelineCount('comments_timeline', user.uniqueKey);
        _direct = getUnreadTimelineCount('direct_messages', user.uniqueKey);
        var u_tip = '';
        if(_new){ u_tip += _new + _u.i18n("abb_friends_timeline"); }
        if(_mention){
            u_tip = u_tip ? u_tip + ',  ' : u_tip;
            u_tip += _mention + '@';
        }
        if(_comment){
            u_tip = u_tip ? u_tip + ',  ' : u_tip;
            u_tip += _comment + _u.i18n("abb_comments_timeline");
        }
        if(_direct){
            u_tip = u_tip ? u_tip + ',  ' : u_tip;
            u_tip += _direct + _u.i18n("abb_direct_message");
        }
        if(u_tip){
            u_tip = '(' + T_NAMES[user.blogType] + ')' + user.screen_name + ': ' + u_tip;
        }
        if(tip && u_tip){
            tip += '\r\n';
        }
        tip = tip + u_tip;
    }
    
    return tip;
};

//===>>>>>>>>>>>>>>>>>>>>>>>
function setLastMsgId(id, t, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    localStorage.setObject(user_uniqueKey + t + LAST_MSG_ID, id);
};

function getLastMsgId(t, user_uniqueKey){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    return localStorage.getObject(user_uniqueKey + t + LAST_MSG_ID);
};

// 保存最新的cursor
function setLastCursor(cursor, t, user_uniqueKey) {
    localStorage.setObject(user_uniqueKey + t + LAST_CURSOR, cursor);
};
// 获取最新的cursor
function getLastCursor(t, user_uniqueKey) {
    return localStorage.getObject(user_uniqueKey + t + LAST_CURSOR);
};
//<<<<<<<<<<<<<<<<=========

// 获取上次选择的发送账号
function getLastSendAccounts() {
    return localStorage.getObject(LAST_SELECTED_SEND_ACCOUNTS) || '';
};

//-- 信息提示模式 (alert or dnd ) --
function getAlertMode(){
    var mode = localStorage.getObject(ALERT_MODE_KEY);
    return mode || 'alert';
};

function setAlertMode(mode){
    localStorage.setObject(ALERT_MODE_KEY, mode);
};
//<<--

//-- 新信息是否自动插入 --
function getAutoInsertMode(){
    var mode = localStorage.getObject(AUTO_INSERT_MODE_KEY);
    return mode || 'notautoinsert';
};

function setAutoInsertMode(mode){
    localStorage.setObject(AUTO_INSERT_MODE_KEY, mode);
};
//<<--

//====>>>>>>>>>>>>>>>>>>
function getBackgroundView(){
    var b = chrome.extension.getBackgroundPage();
    if(b){
        return b;
    }else{
        var views = chrome.extension.getViews();
        for (var i = 0; i < views.length; i++) {
            var view = views[i];
            if (view.theViewName && view.theViewName == 'background') {
                return view;
            }
        }
    }
    return null;
};

function getPopupView(){
    var views = chrome.extension.getViews();
    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.theViewName && view.theViewName == 'popup') {
            return view;
        }
    }
    return null;
};

//获取弹出窗的popup view
function getNewWinPopupView(){
    var views = chrome.extension.getViews();
    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.is_new_win_popup) {
            return view;
        }
    }
    return null;
};
//<<<<<<<<<<<<<<<<=====


//格式化时间输出。示例：new Date().format("yyyy-MM-dd hh:mm:ss");
Date.prototype.format = function(format)
{
	var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(),    //day
		"h+" : this.getHours(),   //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3), //quarter
		"S" : this.getMilliseconds() //millisecond
	};
	if(/(y+)/.test(format)) {
		format=format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}

	for(var k in o) {
		if(new RegExp("("+ k +")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
		}
	}
	return format;
};

//存储
Storage.prototype.setObject = function(key, value) {
    //alert(JSON.stringify(value));
    this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function(key) {
    var v = this.getItem(key);
    if(v)
    {
        try{
            v = JSON.parse(v);
        }
        catch(err){
            v = null;
        }
    }
    return v;
};

/**
 * 格式化字符串 from tbra
 * eg:
 * 	formatText('{0}天有{1}个小时', [1, 24]) 
 *  or
 *  formatText('{{day}}天有{{hour}}个小时', {day:1, hour:24}}
 * @param {Object} msg
 * @param {Object} values
 */
function formatText(msg, values, filter) {
    var pattern = /\{\{([\w\s\.\(\)"',-\[\]]+)?\}\}/g;
    return msg.replace(pattern, function(match, key) {
    	var value = values[key] || eval('(values.' +key+')');
        return jQuery.isFunction(filter) ? filter(value, key) : value;
    });	
};

// 让所有字符串拥有模板格式化
String.prototype.format = function(data) {
	return formatText(this, data);
};

String.prototype.endswith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// 为字符串增加去除所有html tag和空白的字符的方法
String.prototype.remove_html_tag = function() {
	return this.replace(/(<.*?>|&nbsp;|\s)/ig, '');
};

// HTML 编码
function HTMLEnCode(str){
    if(!str){ return ''; }
    str = str.replace(/</ig, '&lt;').replace(/>/ig, '&gt;');
//    str = str.replace(/\&lt;br\s*\/?\&gt;/ig, '<br />');
    // 支持<br/>
    return str;
};

// html转换为text
function htmlToText(html){
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.innerText;
};

///UBB内容转换
function ubbCode(str)	{
    var result = "";
    if(str != ""){
        var tmp;
        var reg = new RegExp("(^|[^/=\\]'\">])((www\\.|http[s]?://)[\\w\\.\\?%&\\-/#=;!\\+]+)","ig");
        var reg2 = new RegExp("\\[url=((www\\.|http[s]?://)[\\w\\.\\?%&\\-/#=;:!\\+]+)](.+)\\[/url]","ig");
        result = str;
        tmp = reg.exec(result);
        if (tmp && tmp.length>0){
            result = result.replace(reg,"<a href='" + tmp[2] + "' target='_blank'>" + tmp[2] + "</a>");
        }
        tmp = reg2.exec(result);
        //trace(result);
        if (tmp && tmp.length>0){
            result = result.replace(reg2,"<a href='" + tmp[1] + "' target='_blank'>" + tmp[3] + "</a>");
        }
    }
    reg = null;
    reg2 = null;
    return result;
};

//在Chrome上输出log信息，用于调试
function log(msg){
    console.log(msg);
};

// 微博字数
String.prototype.len = function(){
	return this.length;
//	return Math.round(this.replace(/[^\x00-\xff]/g, "qq").length / 2);
};

// 将字符串参数变成dict参数
// form: oauth_token_secret=a26e895ca88d3ddbb5ec4d9d1780964b&oauth_token=b7cbcc0dc5056509a6b85967639924df
// 支持完整url
function decodeForm(form) {
	var index = form.indexOf('?');
	if(index > -1) {
		form = form.substring(index+1);
	}
    var d = {};
    var nvps = form.split('&');
    for (var n = 0; n < nvps.length; ++n) {
        var nvp = nvps[n];
        if (nvp == '') {
            continue;
        }
        var equals = nvp.indexOf('=');
        if (equals < 0) {
            d[nvp] = null;
        } else {
        	d[nvp.substring(0, equals)] = decodeURIComponent(nvp.substring(equals + 1));
        }
    }
    return d;
}

// 获取一个字典的长度
function getDictLength(d) {
	var length = d.length;
	if(length === undefined){
		length = 0;
		for(var i in d) {
			length++;
		}
	}
	return length;
};

/**
 * 根据maxid删除重复的数据
 *
 * @param {Array}datas
 * @param {String}max_id
 * @param {Boolean}append
 * 	如果append == true, 判断最后一个等于最大id的，将它和它前面的删除，twitter很强大，id大到js无法计算
 *  否则为prepend，判断最后一个等于最大id的，将它和它后面的删除
 * @return {Object}
 * @api public
 */
function filterDatasByMaxId(datas, max_id, append) {
	var news = datas, olds = [];
    if(max_id && datas && datas.length > 0){
    	max_id = String(max_id);
    	var found_index = null;
    	$.each(datas, function(i, item){
    		if(max_id == String(item.id)) {
    			found_index = i;
    			return false;
    		}
    	});
    	if(found_index !== null){
    		if(append){
    			// id等于最大id的数据位于found_index，所以获取found_index+1开始往后的数据
    			news = datas.slice(found_index+1);
    			olds = datas.slice(0, found_index+1);
    		} else {
    			// 如果不是append的，id等于最大id的数据位于found_index，
    			// 只需要从开始到found_index(不包含结束边界)
    			news = datas.slice(0, found_index);
    			olds = datas.slice(found_index);
    		}
    	}
    }
    return {news: news, olds: olds};
};

//检查是否支持Twitter
//function checkTwitterEnabled(){
//    if(_u.i18n("language")!='zh_CN'){ return; }
//    var _sets = localStorage.getObject(SETTINGS_KEY);
//    _sets = _sets || {};
//    if(!_sets.twitterEnabled){
//        delete T_NAMES.twitter;
//    }
//};
//checkTwitterEnabled();

/*
* 缓动函数
* t: current time（当前时间）；
* b: beginning value（初始值）；
* c: change in value（变化量）；
* d: duration（持续时间）。
*/
var Tween = {
    Quad: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        }
    },
    Cubic: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        }
    },
    Quart: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        }
    },
    Quint: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        }
    },
    Sine: {
        easeIn: function(t,b,c,d){
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOut: function(t,b,c,d){
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOut: function(t,b,c,d){
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        }
    },
    Expo: {
        easeIn: function(t,b,c,d){
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOut: function(t,b,c,d){
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    },
    Circ: {
        easeIn: function(t,b,c,d){
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOut: function(t,b,c,d){
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        }
    },
    Elastic: {
        easeIn: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOut: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
        },
        easeInOut: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        }
    },
    Back: {
        easeIn: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158; 
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        }
    },
    Bounce: {
        easeIn: function(t,b,c,d){
            return c - Tween.Bounce.easeOut(d-t, 0, c, d) + b;
        },
        easeOut: function(t,b,c,d){
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOut: function(t,b,c,d){
            if (t < d/2) return Tween.Bounce.easeIn(t*2, 0, c, d) * .5 + b;
            else return Tween.Bounce.easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    }
};

// getPageScroll() by quirksmode.com
function getPageScroll() {
    var xScroll, yScroll;
    if (self.pageYOffset) {
      yScroll = self.pageYOffset;
      xScroll = self.pageXOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
      yScroll = document.documentElement.scrollTop;
      xScroll = document.documentElement.scrollLeft;
    } else if (document.body) {// all other Explorers
      yScroll = document.body.scrollTop;
      xScroll = document.body.scrollLeft;	
    }
    return new Array(xScroll,yScroll);
};

  // Adapted from getPageSize() by quirksmode.com
function getPageHeight() {
    var windowHeight;
    if (self.innerHeight) {	// all except Explorer
      	windowHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
      	windowHeight = document.documentElement.clientHeight;
    } else if (document.body) { // other Explorers
    	windowHeight = document.body.clientHeight;
    }
    return windowHeight;
};

//浮动层
var popupBox = {
    tp: '<div id="popup_box">' +
            '<div class="pb_title clearFix"><span class="t"></span><a href="javascript:" onclick="popupBox.close()" class="pb_close">'+ _u.i18n("comm_close") +'</a></div>' +
            '<div class="pb_content"></div>' +
        '</div>' +
        '<div id="popup_box_overlay"></di>',
    box: null,
    checkBox: function(){
        if(!this.box){
            $("body").append(this.tp);
            this.box = $("#popup_box");
            this.overlay = $("#popup_box_overlay ");
        }
    },
    close: function(){
        this.box.hide();
        this.overlay.hide();
    },
    show: function(img_width, img_height){
        this.overlay.show();
        var w = img_width;
        if(w){
            var max_w = Number($("#facebox_see_img").css('max-width').replace('px', '')) + 10;
            w = Math.min(w, max_w);
        }else{
            w = this.box.width();
        }
        var h = img_height;
        if(!h){
            h = this.box.height();
        }
        this.box.css({
            top: getPageScroll()[1] + (Math.max(10, $("body").height() / 2 - h / 2)),
            left: $("body").width() / 2 - w / 2 - 2
        }).show();
        $("body").scrollTop(1); //防止图片拉到底部关闭再打开无法滚动的问题
    },
    showOverlay: function(){},
    showImg: function(imgSrc, original, callbackFn){
        this.checkBox();
        var image = new Image();
        image.onload = function() {
            popupBox.showOverlay();
            if(original){
                popupBox.box.find('.pb_title .t, .pb_footer .t').html('<a target="_blank" href="' + original +'">'+ _u.i18n("comm_show_original_pic") +'</a>');
            }else{
                popupBox.box.find('.pb_title .t, .pb_footer .t').html('');
            }
            popupBox.box.find('.pb_content').html('<div class="image"><span class="rotate_btn">'
              + '<a href="javascript:" onclick="$(\'#facebox_see_img\').rotateLeft(90);popupBox.show();"><img src="/images/rotate_l.png"></a>'
              + '<a href="javascript:" onclick="$(\'#facebox_see_img\').rotateRight(90);popupBox.show();" style="margin-left:10px;"><img src="/images/rotate_r.png"></a></span>'
              + '<img id="facebox_see_img" src="' + image.src + '" class="cur_min" onclick="popupBox.close()" /></div>');
            popupBox.show(image.width, image.height);
            image.onload = null;
            image.onerror = null;
            if(callbackFn){ callbackFn('success'); }
        };
        image.onerror = function(){
            image.onload = null;
            image.onerror = null;
            if(callbackFn){ callbackFn('error'); }
        };
        image.src = imgSrc;
    },
    showMap: function(user_img, myLatitude, myLongitude, geo_info){
        this.checkBox();
        var latlng = new google.maps.LatLng(myLatitude, myLongitude);
        var myOptions = {
          zoom: 13,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map_canvas = $("#pb_map_canvas");
        if(!map_canvas.length){
            this.box.find('.pb_content').html('<div id="pb_map_canvas"></div>');
            map_canvas = $("#pb_map_canvas");
        }
        popupBox.show();
        var map = new google.maps.Map(map_canvas[0], myOptions);
        var marker = new google.maps.Marker({map: map, position:latlng});
        

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': latlng}, function(results, status) {//根据经纬度查找地理位置
            if (status == google.maps.GeocoderStatus.OK) {//判断查找状态
                if (results[0]) {//查找成功
                    /*
                        InfoWindow 信息窗口类。显示标记位置的信息
                    */
                	var address = results[0].formatted_address;
                	if(geo_info) {
                		if(geo_info.ip) {
                			address += '<br/>IP: ' + geo_info.ip;
                		}
                		if(geo_info.more) {
                			address += '<br/>ISP: ' + geo_info.more;
                		}
                	}
                    var infowindow = new google.maps.InfoWindow({
                        content: '<img class="map_user_icon" src="'+user_img+'" />' + address,
                        maxWidth: 60
                    });
                    infowindow.open(map, marker);//打开信息窗口。一般与map和标记关联
                    google.maps.event.addListener(marker, 'click', function() {
                      infowindow.open(map,marker);
                    });
                }
            } else {
                showMsg("Geocoder failed due to: " + status);
            }
        });
    },
    showVideo: function(url, playcode) {
        this.checkBox();
        popupBox.box.find('.pb_title .t, .pb_footer .t').html('<a target="_blank" href="' + url +'">'+ _u.i18n("comm_show_original_vedio") +'</a>');
        popupBox.box.find('.pb_content').html(playcode);
        popupBox.show();
    },
    showHtmlBox: function(title, content){
        this.checkBox();
        popupBox.box.find('.pb_title .t, .pb_footer .t').html(title);
        popupBox.box.find('.pb_content').html(content);
        popupBox.show();
    }
};

var UrlUtil = {
    domainRe: /^https?:\/\/([^\/]+)/i,
    getDomain: function(url){
        if(url){
            var m = url.match(UrlUtil.domainRe);
            if(m){
                return m[1];
            }
        }
        return '';
    },
    showFaviconBefore: function(ele, url){
        var d = UrlUtil.getDomain(url);
        if(d){
            $(ele).addClass('favicons_ico').css('background-image', 'url(https://www.google.com/s2/favicons?domain='+d+')');
        }
    }
};

// shorturl
var ShortenUrl = {
	services: {
		// http://api.t.sina.com.cn/short_url/shorten.json?source=3538199806&url_long=http://www.tudou.com/programs/view/cl_8vhHMCfs/
		't.cn': {api: 'http://api.t.sina.com.cn/short_url/shorten.json?source=3434422667',
			format: 'json', method: 'get',
			param_name: 'url_long',
			result_callback: function(data) {
				if(data && data.length == 1) {
					data = data[0];
				}
				return data ? data.url_short : null;
			}
		},
		'goo.gl': {api: 'http://goo.gl/api/url', format: 'json', method: 'post', param_name: 'url', result_name: 'short_url'},
//		'v.gd':  'http://v.gd/create.php?format=simple&url={{url}}',
//		'is.gd': 'http://is.gd/api.php?longurl={{url}}',
//		's8.hk': 'http://api.yongwo.de/api/s?u={{url}}',
		'seso.me': 'http://seso.me/api/?longurl={{url}}',
		'tinyurl.com': 'http://tinyurl.com/api-create.php?url={{url}}',
		'to.ly': 'http://to.ly/api.php?longurl={{url}}',
		'zi.mu': 'http://zi.mu/api.php?format=simple&action=shorturl&url={{url}}',
		'fa.by': 'http://fa.by/?module=ShortURL&file=Add&mode=API&url={{url}}',
//		'sqze.it': {api: 'http://long-shore.com/api/squeeze/', format: 'json', method: 'post', param_name: 'long_url', result_name: 'url'},
//		'2.ly': {api: 'http://2.ly/api/short', format: 'json', method: 'get', param_name: 'longurl', result_name: 'url'},
//		'2.gp': {api: 'http://2.gp/api/short', format: 'json', method: 'get', param_name: 'longurl', result_name: 'url'},
//		'7.ly': {api: 'http://7.ly/api/short', format: 'json', method: 'get', param_name: 'longurl', result_name: 'url'},
//		'aa.cx': 'http://aa.cx/api.php?url={{url}}',
//		'2br.in': {api: 'http://api.2br.in/shorten.json', format: 'json', method: 'get', param_name: 'url', result_name: 'shorten_url'},
		'lnk.by': {api: 'http://lnk.by/Shorten', 
			format_name: 'format', 
			format: 'json', 
			method: 'get', 
			param_name: 'url', result_name: 'shortUrl'}
	},
	// 还原
	// http://urlexpand0-45.appspot.com/api?u=http://is.gd/imWyT
	// MAX_INDEX => http://yongwo.de:1235/api?u=http://is.gd/imWyT&cb=foo
	MAX_INDEX: 46,
	expand: function(shorturl, callback, context) {
		var url = 'http://api.yongwo.de/api/e?f=json&u=' + shorturl;
		$.ajax({
			url: url,
			dataType: 'json',
			success: function(data, status, xhr) {
				callback.call(context, data);
			}, 
			error: function(xhr, status) {
				callback.call(context, null);
			}
		});
//		this.expand_sinaurl(shorturl, function(data){
//			if(!data) {
//				var url = 'http://api.yongwo.de/api/e?u=' + shorturl;
//				$.ajax({
//					url: url,
//					success: function(data, status, xhr) {
//						callback.call(context, data);
//					}, 
//					error: function(xhr, status) {
//						callback.call(context, null);
//					}
//				});
//			} else {
//				callback.call(context, data);
//			}
//		}, context);
	},
	
	SINAURL_RE: /http:\/\/(t|sinaurl)\.cn\/(\w+)/i,
	// 新浪短址特殊处理
	// http://t.sina.com.cn/mblog/sinaurl_info.php?url=h6yl4g
	expand_sinaurl: function(shorturl, callback, context) {
		var m = this.SINAURL_RE.exec(shorturl);
		if(m) {
			var id = m[2];
			$.ajax({
				url: 'http://t.sina.com.cn/mblog/sinaurl_info.php?url=' + id,
				dataType: 'json',
				success: function(data, status, xhr) {
					data = data.data[id];
					callback.call(context, data);
				}, 
				error: function(xhr, status) {
					callback.call(context, null);
				}
			});
		} else {
			callback.call(context, null);
		}
	},
	
	expandAll: function() {
		var b_view = getBackgroundView();
		var cache = b_view.SHORT_URLS;
		$('a.link:not([title*="'+ _u.i18n("comm_mbright_to_open") +'"],[videotype])').each(function() {
			var url = $(this).attr('href');
			if(url.indexOf('javascript:') == 0) {
				return;
			}
			if(url.length > 30) {
                UrlUtil.showFaviconBefore(this, url);
                if(!VideoService.attempt(url, this)) {
                	ImageService.attempt(url, this);
                }
				return;
			}
			var cache_data = cache[url];
			if(cache_data && cache_data.url) {
				var longurl = cache_data.url;
				$(this).attr('title', _u.i18n("comm_mbright_to_open") 
					+ ' ' + longurl).attr('rhref', longurl);
                UrlUtil.showFaviconBefore(this, longurl);
				if(!VideoService.attempt(cache_data, this)) {
                	ImageService.attempt(longurl, this);
                }
			} else {
				ShortenUrl.expand(url, function(data) {
					var longurl = data ? data.url: data;
					if(longurl) {
						$(this).attr('title', _u.i18n("comm_mbright_to_open") 
							+ ' ' + longurl).attr('rhref', longurl).addClass('longurl');
						cache[$(this).attr('href')] = data;
                        UrlUtil.showFaviconBefore(this, longurl);
						if(!VideoService.attempt(data, this)) {
		                	ImageService.attempt(longurl, this);
		                }
					}
				}, this);
			}
			
		});
	},
	
	short: function(longurl, callback, name, context) {
		var name = name || Settings.get().shorten_url_service;
		var service = this.services[name];
		var format = 'text';
		var format_name = null;
		var method = 'get';
		var data = {};
		var result_name = null, result_callback = null;
		if(typeof(service) !== 'string') {
			format_name = service.format_name || format_name;
			format = service.format || format;
			method = service.method || method;
			data[service.param_name] = longurl;
			if(format_name) {
				data[format_name] = format;
			}
			result_name = service.result_name;
			result_callback = service.result_callback;
			if(name == 'goo.gl') {
				data.user = 'toolbar@google.com';
				data.auth_token = this._create_googl_auth_token(longurl);
			}
			service = service.api;
		} else {
			service = service.format({url: encodeURIComponent(longurl)});
		}
		$.ajax({
			url: service,
			type: method,
			data: data,
			dataType: format,
			success: function(data, status, xhr) {
				if(result_callback) {
					data = result_callback(data);
				} else if(result_name) {
					data = data[result_name];
				}
				callback.call(context, data);
			}, 
			error: function(xhr, status) {
				callback.call(context, null);
			}
		});
	},
	
	// goo.gl的认证token计算函数
	_create_googl_auth_token: function(f){function k(){for(var c=0,b=0;b<arguments.length;b++)c=c+arguments[b]&4294967295;return c}function m(c){c=c=String(c>0?c:c+4294967296);var b;b=c;for(var d=0,i=false,j=b.length-1;j>=0;--j){var g=Number(b.charAt(j));if(i){g*=2;d+=Math.floor(g/10)+g%10}else d+=g;i=!i}b=b=d%10;d=0;if(b!=0){d=10-b;if(c.length%2==1){if(d%2==1)d+=9;d/=2;}}b=String(d);b+=c;return b;}function n(c){for(var b=5381,d=0;d<c.length;d++)b=k(b<<5,b,c.charCodeAt(d));return b;}function o(c){for(var b=0,d=0;d<c.length;d++)b=k(c.charCodeAt(d),b<<6,b<<16,-b);return b;}f={byteArray_:f,charCodeAt:function(c){return this.byteArray_[c];}};f.length=f.byteArray_.length;var e=n(f.byteArray_);e=e>>2&1073741823;e=e>>4&67108800|e&63;e=e>>4&4193280|e&1023;e=e>>4&245760|e&16383;var l="7";f=o(f.byteArray_);var h=(e>>2&15)<<4|f&15;h|=(e>>6&15)<<12|(f>>8&15)<<8;h|=(e>>10&15)<<20|(f>>16&15)<<16;h|=(e>>14&15)<<28|(f>>24&15)<<24;l+=m(h);return l;}
};

// 图片服务
var Instagram = {
	/* 
	 * http://instagr.am/p/BWp/ => 
	 * big: <img src="http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_7.jpg" class="photo" /> 
	 * middle: http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_6.jpg
	 * small: http://distillery.s3.amazonaws.com/media/2010/10/03/ca65a1ad211140c8ac97e2d2439a1376_5.jpg
	 */
	host: 'instagr.am',
	url_re: /http:\/\/instagr\.am\/p\//i,
	get: function(url, callback) {
		$.ajax({
			url: url,
			success: function(html, status, xhr) {
				var src = $(html).find('.photo').attr('src');
				var pics = {
					thumbnail_pic: src.replace('_7.', '_5.'),
					bmiddle_pic: src.replace('_7.', '_6.'),
					original_pic: src
				};
				callback(pics);
			},
			error: function() {
				callback(null);
			}
		});
	}
};

var Flickr = {
	host: 'www.flickr.com',
	url_re: /http:\/\/www\.flickr\.com\/photos\/\w+/i,
	src_re: /<link\srel\=\"image\_src\"\shref\=\"([^\"]+)\"/i,
	get: function(url, callback) {
		$.ajax({
			url: url,
			success: function(html, status, xhr) {
				// <link rel="image_src" href="http://farm6.static.flickr.com/5044/5345477530_171cfe59db_m.jpg">
				var m = Flickr.src_re.exec(html);
				if(m) {
					var src = m[1];
					var pics = {
						thumbnail_pic: src.replace('_m.', '_s.'),
						bmiddle_pic: src,
						original_pic: src.replace('_m.', '.')
					};
					callback(pics);
				}
			},
			error: function() {
				callback(null);
			}
		});
	}
};


// http://dev.twitpic.com/
// http://dev.twitpic.com/docs/thumbnails/
var Twitpic = {
	/*
	 * http://twitpic.com/show/thumb/1e10q
	 * http://twitpic.com/show/mini/1e10q
	 */
	host: 'twitpic.com',
	url_re: /http:\/\/(twitpic\.com)\/\w+/i,
	get: function(url, callback) {
		var tpl = 'http://twitpic.com/show/{{size}}/{{id}}';
		var re = /twitpic.com\/(\w+)/i;
		var results = re.exec(url);
		var pics = {
			thumbnail_pic: tpl.format({size: 'thumb', id: results[1]}),
			bmiddle_pic: tpl.format({size: 'full', id: results[1]}),
			original_pic: tpl.format({size: 'full', id: results[1]})
		};
		callback(pics);
	}
};

// http://p.twipple.jp/TxSpS => http://p.twipple.jp/data/T/x/S/p/S_s.jpg
// => http://p.twipple.jp/data/T/x/S/p/S_m.jpg
// => http://p.twipple.jp/data/T/x/S/p/S.jpg
// 直接去页面获取 http://p.twipple.jp/g7G6e
var Twipple = {
	host: 'p.twipple.jp',
	url_re: /http:\/\/p\.twipple\.jp\/\w+/i,
	get: function(url, callback) {
		$.ajax({
			url: url,
			success: function(html, status, xhr) {
				var src = $(html).find('#post_image').attr('src');
				var pics = {
					thumbnail_pic: src.replace('_m.', '_s.'),
					bmiddle_pic: src,
					original_pic: src.replace('_m.', '.')
				};
				callback(pics);
			},
			error: function() {
				callback(null);
			}
		});
	}
};

// https://groups.google.com/group/plixi/web/fetch-photos-from-url
var Plixi = {
	/*
	 * http://api.plixi.com/api/tpapi.svc/imagefromurl?size=thumbnail&url=http://tweetphoto.com/5527850
	 * http://api.plixi.com/api/tpapi.svc/imagefromurl?size=medium&url=http://tweetphoto.com/5527850
	 * http://api.plixi.com/api/tpapi.svc/imagefromurl?size=big&url=http://tweetphoto.com/5527850
	 */
	host: 'plixi.com',
	url_re: /http:\/\/(plixi\.com\/p|tweetphoto\.com)\//i,
	get: function(url, callback) {
		var tpl = 'http://api.plixi.com/api/tpapi.svc/imagefromurl?size={{size}}&url=' + url;
		var pics = {
			thumbnail_pic: tpl.format({size: 'thumbnail'}),
			bmiddle_pic: tpl.format({size: 'medium'}),
			original_pic: url//tpl.format({size: 'big'})
		};
		callback(pics);
	}
};

// http://code.google.com/p/imageshackapi/wiki/YFROGoptimizedimages
var Yfrog = {
	/*
	 * http://yfrog.com/gyunmnrj:embed
	 * http://yfrog.com/gyunmnrj:small
	 */
	host: 'yfrog.com',
	url_re: /http:\/\/yfrog\.com\/\w+/i,
	get: function(url, callback) {
		var pics = {
			thumbnail_pic: url + ':small',
			bmiddle_pic: url + ':embed',
			original_pic: url
		};
		callback(pics);
	}
};

// http://twitgoo.com/49d => http://twitgoo.com/49d/mini , http://twitgoo.com/49d/img
var Twitgoo = {
	host: 'twitgoo.com',
	url_re: /http:\/\/twitgoo\.com\/\w+/i,
	get: function(url, callback) {
		var pics = {
			thumbnail_pic: url + '/mini',
			bmiddle_pic: url + '/img',
			original_pic: url + '/img'
		};
		callback(pics);
	}
};

// Add ’:full’, ‘:square’, ‘:view’, ‘:medium’, ‘:thumbnail’, or ‘:thumb’ 
// to the moby.to short url and you will be redirected to the correct image.
// http://developers.mobypicture.com/documentation/additional/inline-thumbnails/
// moby.to/sjhjvq
var MobyPicture = {
	host: 'moby.to',
	url_re: /http:\/\/(moby\.to|www\.mobypicture\.com)\/\w+/i,
	get: function(url, callback, ele) {
		if(url.indexOf('mobypicture.com') >= 0) {
			var short_url = $(ele).html();
			if(short_url.indexOf('moby.to') < 0) {
				// 如果还是不行，则直接爬页面获取
				// ajax get: <input id="bookmark_directlink" type="text" value="http://moby.to/r2g9zv"/>
				$.get(url, function(data) {
					var new_url = $(data).find('#bookmark_directlink').val();
					callback(MobyPicture._format_urls(new_url));
				});
				return;	
			}
			url = short_url;
		}
		callback(this._format_urls(url));
	},
	_format_urls: function(url) {
		if(url.indexOf('moby.to') < 0) {
			return null;
		}
		return {
			thumbnail_pic: url + ':thumb',
			bmiddle_pic: url + ':medium',
			original_pic: url + ':full'
		};
	}
};

// http://api.imgur.com/
// http://i.imgur.com/xuCIW.png or http://imgur.com/z2pX5.png
// key: cba6198873ac20498a5686839b189fc0
var Imgur = {
	host: 'imgur.com',
	url_re: /http:\/\/(i\.)?imgur\.com\/\w+\.\w+/i,
	get: function(url, callback) {
		var re = /imgur.com\/(\w+)\.(\w+)/i;
		var tpl = 'http://i.imgur.com/{{word}}.{{ext}}';
		var results = re.exec(url);
		var pics = null;
		if(results) {
			var word = results[1];
			var ext = results[2];
			pics = {
				thumbnail_pic: tpl.format({word: word + 's', ext: ext}),
				bmiddle_pic: tpl.format({word: word + 'm', ext: ext}),
				original_pic: url
			};
		}
		callback(pics);
	},
	key: 'cba6198873ac20498a5686839b189fc0',
	api: 'http://imgur.com/api/upload.json',
	upload: function(pic, before_request, onprogress, callback) {
    	pic.keyname = 'image';
	    var boundary = '----multipartformboundary' + (new Date).getTime();
	    var dashdash = '--';
	    var crlf = '\r\n';
	
	    /* Build RFC2388 string. */
	    var builder = '';
	
	    builder += dashdash;
	    builder += boundary;
	    builder += crlf;
		
	    /* Generate headers. [PIC] */            
	    builder += 'Content-Disposition: form-data; name="' + pic.keyname + '"';
	    if(pic.file.fileName) {
	      builder += '; filename="' + this.url_encode(pic.file.fileName) + '"';
	    }
	    builder += crlf;
	
	    builder += 'Content-Type: '+ pic.file.type;
	    builder += crlf;
	    builder += crlf; 
	
	    var bb = new BlobBuilder(); //NOTE
	    bb.append(builder);
	    bb.append(pic.file);
	    builder = crlf;
	    
	    /* Mark end of the request.*/ 
	    builder += dashdash;
	    builder += boundary;
	    builder += dashdash;
	    builder += crlf;
	
	    bb.append(builder);
	    
	    if(before_request) {
	    	before_request();
	    }
	    $.ajax({
	        url: this.api,
	        cache: false,
	        timeout: 5*60*1000, //5分钟超时
	        type : 'post',
	        data: bb.getBlob(),
	        dataType: 'text',
	        contentType: 'multipart/form-data; boundary=' + boundary,
	        processData: false,
	        beforeSend: function(req) {
	            if(onprogress) {
	            	if(req.upload){
		                req.upload.onprogress = function(ev){
		                    onprogress(ev);
		                };
		            }
	            }
	        },
	        success: function(data, textStatus) {
	            try{
	                data = JSON.parse(data);
	            }
	            catch(err){
	                //data = null;
	                log(data);
	                data = {error:'服务器返回结果错误，本地解析错误。', error_code:500};
	                textStatus = 'error';
	            }
	            var error_code = null;
	            if(data){
                    var error = data.errors || data.error;
	                if(error || data.error_code){
	                	data.error = error;
	                    _showMsg('error: ' + data.error + ', error_code: ' + data.error_code);
	                    error_code = data.error_code || error_code;
	                }
	            }else{error_code = 400;}
	            callback(data, textStatus, error_code);
	        },
	        error: function (xhr, textStatus, errorThrown) {
	            var r = null, status = 'unknow';
	            if(xhr){
	                if(xhr.status){
	                    status = xhr.status;
	                }
	                if(xhr.responseText){
	                    var r = xhr.responseText;
	                    try{
	                        r = JSON.parse(r);
	                    }
	                    catch(err){
	                        r = null;
	                    }
	                    if(r){_showMsg('error_code:' + r.error_code + ', error:' + r.error);}
	                }
	            }
	            if(!r){
	                textStatus = textStatus ? ('textStatus: ' + textStatus + '; ') : '';
	                errorThrown = errorThrown ? ('errorThrown: ' + errorThrown + '; ') : '';
	                _showMsg('error: ' + textStatus + errorThrown + 'statuCode: ' + status);
	            }
	            callback({}, 'error', status); //不管什么状态，都返回 error
	        }
	    });
    }
};

// 图片服务
var ImageService = {
	services: {
		Instagram: Instagram, 
		Plixi: Plixi, 
		Imgur: Imgur,
		Twitpic: Twitpic,
		Yfrog: Yfrog,
		Twitgoo: Twitgoo,
		MobyPicture: MobyPicture,
		Twipple: Twipple,
		Flickr: Flickr
	},
	
	attempt: function(url, ele) {
		for(var name in this.services) {
			var item = this.services[name];
			if(item.url_re.test(url)) {
				var old_title = $(ele).attr('title');
				var title = _u.i18n("comm_mbleft_to_preview");
				if(old_title) {
					title += ', ' + old_title;
				}
				$(ele).attr('rhref', url).attr('title', title).attr('href', 'javascript:void(0);').attr('service', name).click(function() {
					ImageService.show(this, $(this).attr('service'), $(this).attr('rhref'));
				});
				return true;
			}
		}
		return false;
	},
	
	show: function(ele, service, url) {
		this.services[service].get(url, function(pics) {
			if(!pics) {
				return;
			}
			var tpl = '<div><a target="_blank" onclick="showFacebox(this);return false;" href="javascript:void(0);" bmiddle="{{bmiddle_pic}}" original="{{original_pic}}" onmousedown="rOpenPic(event, this)" title="'+ _u.i18n("comm_mbright_to_open_pic") +'"><img class="imgicon pic" src="{{thumbnail_pic}}"></a></div>';
			$(ele).hide().parent().after(tpl.format(pics));
		}, ele);
	},
	
	upload: function(pic, callback) {
		var settings = Settings.get();
		this.services[settings.image_service].upload(pic, callback);
	}
};

var VideoService = {
	services: {
		youku: {
			url_re: /youku\.com\/v_show\/id_([^\.]+)\.html/i,
			tpl: '<embed src="http://player.youku.com/player.php/sid/{{id}}/v.swf" quality="high" width="460" height="400" align="middle" allowScriptAccess="sameDomain" type="application/x-shockwave-flash"></embed>'
		},
		ku6: {
			// http://v.ku6.com/special/show_3898167/rJ5BS7HWyEW4iHC3.html
			url_re: /ku6\.com\/.+?\/([^\.\/]+)\.html/i,
			tpl: '<embed src="http://player.ku6.com/refer/{{id}}/v.swf" quality="high" width="460" height="400" align="middle" allowScriptAccess="always" allowfullscreen="true" type="application/x-shockwave-flash"></embed>'
		},
		tudou: {
			url_re: /tudou\.com\/programs\/view\/([^\/]+)\/?/i,
			tpl: '<embed src="http://www.tudou.com/v/{{id}}/v.swf" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" wmode="opaque" width="460" height="400"></embed>'
		},
		56: {
			url_re: /56\.com\/.+?\/(v_[^\.]+)\.html/i,
			tpl: '<embed src="http://player.56.com/{{id}}.swf" type="application/x-shockwave-flash" allowNetworking="all" allowScriptAccess="always" width="460" height="400"></embed>'
		},
		// http://video.sina.com.cn/playlist/4576702-1405053100-1.html#44164340 => 
		// http://you.video.sina.com.cn/api/sinawebApi/outplayrefer.php/vid=44164340_1405053100_1/s.swf
		// http://you.video.sina.com.cn/api/sinawebApi/outplayrefer.php/vid=44164340_1405053100_Z0LhTSVpCzbK+l1lHz2stqkP7KQNt6nkjWqxu1enJA5ZQ0/XM5GdZtwB5CrSANkEqDhAQJw+c/ol0x0/s.swf
		// http://you.video.sina.com.cn/b/32394075-1575345837.html =>
		// http://you.video.sina.com.cn/api/sinawebApi/outplayrefer.php/vid=32394075_1575345837/s.swf
		sina: {
			url_re: /video\.sina\.com\.cn\/.+?\/([^\.\/]+)\.html(#\d+)?/i,
			format: function(matchs) {
				var id = matchs[1];
				if(matchs[2]) {
					id = matchs[2].substring(1) + id.substring(id.indexOf('-'));
				}
				return id.replace('-', '_');
			},
			tpl: '<embed src="http://you.video.sina.com.cn/api/sinawebApi/outplayrefer.php/vid={{id}}/s.swf" type="application/x-shockwave-flash" allowNetworking="all" allowScriptAccess="always" width="460" height="400"></embed>'
		},
		// http://www.youtube.com/v/A6vXOZbzBYY?fs=1
		// http://youtu.be/A6vXOZbzBYY
		// http://www.youtube.com/watch?v=x9S37QbWYJc&feature=player_embedded
		youtube: {
			url_re: /(?:(?:youtu\.be\/(\w+))|(?:youtube\.com\/watch\?v=(\w+)))/i,
			format: function(matchs, url, ele) {
				if(url.indexOf('youtube.com/das_captcha') >= 0) {
					matchs = this.url_re.exec($(ele).html());
				}
				var id = matchs[1] || matchs[2];
				return id;
			},
			tpl: '<embed src="http://www.youtube.com/v/{{id}}?fs=1" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="460" height="400"></embed>'
		},
		
		// http://www.yinyuetai.com/video/96953
		yinyuetai: {
			url_re: /yinyuetai\.com\/video\/(\w+)/i,
			tpl: '<embed src="http://www.yinyuetai.com/video/player/{{id}}/v_0.swf" quality="high" width="460" height="400" align="middle"  allowScriptAccess="sameDomain" type="application/x-shockwave-flash"></embed>'
		},
		
		// http://www.xiami.com/song/2112011
		// http://www.xiami.com/widget/1_2112011/singlePlayer.swf
		xiami: {
			append: true, // 直接添加在链接后面
			url_re: /xiami\.com\/song\/(\d+)/i,
			tpl: '<embed src="http://www.xiami.com/widget/1_{{id}}/singlePlayer.swf" type="application/x-shockwave-flash" width="257" height="33" wmode="transparent"></embed>'
		},
		
		// http://v.zol.com.cn/video105481.html
		zol: {
			url_re: /v\.zol\.com\.cn\/video(\w+)\.html/i,
			tpl: '<embed height="400" width="460" wmode="opaque" allowfullscreen="false" allowscriptaccess="always" menu="false" swliveconnect="true" quality="high" bgcolor="#000000" src="http://v.zol.com.cn/meat_vplayer323.swf?movieId={{id}}&open_window=0&auto_start=1&show_ffbutton=1&skin=http://v.zol.com.cn/skin_black.swf" type="application/x-shockwave-flash">'
		},
		// http://v.ifeng.com/his/201012/00b4cb1a-7838-4846-aeaf-9967e3cdcd99.shtml
		// http://v.ifeng.com/v/jiashumei/index.shtml#bcd47338-3558-4436-90ca-4e233fcbc37a
		ifeng: {
			url_re: /v\.ifeng\.com\/(.+?)\/([^\.\/]+)\./i,
			format: function(matchs, url, ele) {
				var re = /[A-F0-9]{8}(?:-[A-F0-9]{4}){3}-[A-Z0-9]{12}/i;
				var m = re.exec(url);
				if(m) {
					matchs = m;
				}
				return matchs[matchs.length - 1];
			},
			tpl: '<embed src="http://v.ifeng.com/include/exterior.swf?guid={{id}}&pageurl=http://www.ifeng.com&fromweb=other&AutoPlay=true" quality="high"  allowScriptAccess="always" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" width="460" height="400"></embed>'
		}
	},
	
	format_flash: function(flash_url) {
		return '<div><embed src="' + flash_url + 
			'" type="application/x-shockwave-flash" quality="high" width="460" height="400" align="middle" allowScriptAccess="sameDomain"></embed></div>';
	},
	
	attempt: function(urldata, ele) {
		var url = urldata.url || urldata;
		var flash = urldata.flash;
		var flash_title = urldata.title || '';
		var screen_pic = urldata.screen;
		for(var name in this.services) {
			var service = this.services[name];
			if(service.url_re.test(url)) {
				if(service.append) {
					// 直接添加到后面
					var flash_code = flash ? this.format_flash(flash) : this.format_tpl(service, url, ele);
					if($(ele).parent().find('.embed_insert').length == 0) {
						$(ele).parent().append('<div class="embed_insert">' + flash_code + '</div>');
					}
				} else {
					var old_title = $(ele).attr('title');
					var title = _u.i18n("comm_mbleft_to_preview");
					if(flash_title) {
						title += '[' + flash_title + ']';
					}
					if(old_title) {
						title += ', ' + old_title;
					}
					$(ele).attr('rhref', url).attr('title', title)
							.attr('href', 'javascript:void(0);')
							.attr('flash', flash || '')
							.attr('flash_title', flash_title)
							.click(function() {
						VideoService.show($(this).attr('videoType'), 
							$(this).attr('rhref'), 
							$(this).attr('flash'), 
							$(this).attr('flash_title'),
							this);
					});
					if(screen_pic) {
						var img_html = '<br/><img title="' + flash_title + '" src="' + screen_pic + '" /><br/>';
//						if(flash_title) {
//							img_html = '<br/>' + flash_title + img_html;
//						}
						$(ele).parent().append(img_html);
					}
				}
				$(ele).attr('videoType', name).after(' [<a onclick="VideoService.popshow(this);" href="javascript:void(0);" title="' 
						+ _u.i18n("comm_popup_play") +'" class="external_link">'+ _u.i18n("abb_play") +'</a>]');
				return true;
			}
		}
		return false;
	},
	format_tpl: function(service, url, ele) {
		var matchs = service.url_re.exec(url);
		var id = null;
		if(service.format) {
			id = service.format(matchs, url, ele);
		} else {
			id = matchs[1];
		}
		return service.tpl.format({id: id});
	},
	show: function(name, url, flash, ele) {
		var service = this.services[name];
		var flash_code = flash ? this.format_flash(flash) : this.format_tpl(service, url, ele);
		popupBox.showVideo(url, flash_code);
	},
	popshow: function(ele) {
		var $this = $(ele).prev('a');
		var vtype = $this.attr('videoType');
		var flash = $this.attr('flash');
		var title = $this.attr('flash_title') || '';
		var shorturl = $this.html();
		var url = 'popshow.html?vtype=' + vtype 
			+ '&s=' + shorturl + '&title=' + title;
		if(flash) {
			url += '&flash=' + flash;
		} else {
			url += '&url=' + ($this.attr('rhref') || $this.attr('href'));
		}
		var l = (window.screen.availWidth-510)/2;
		var width_height = vtype == 'xiami' 
			? 'width=300,height=50': 'width=460,height=430';
    	window.open(url, '_blank', 'left=' + l + ',top=30,' 
    		+ width_height + ',menubar=no,location=no,resizable=no,scrollbars=yes,status=yes');
	}
};

function _bind_tip_items($tip_div) {
	$tip_div.find('li').mouseover(function(){
		$tip_div.find('li').removeClass('cur');
    	$(this).addClass('cur');
    });
}

// match_all_text 是否匹配全部内容
function at_user_autocomplete(ele_id, match_all_text, select_callback) {
	// support @ autocomplete
	var $tip_div = $('<div ele_id="' + ele_id + '" style="z-index: 2000; position: absolute;display:none; " class="at_user"><ul></ul></div>');
	$(document.body).append($tip_div);
	var ele = $(ele_id).get(0);
	ele.select_callback = select_callback;
	ele.match_all_text = match_all_text;
	$(ele_id).keyup(function(event){
    	if(!this._at_key_loading && // 不是正在加载
    			event.keyCode != '13' && event.keyCode != '38' && event.keyCode != '40') {
    		var key_index = 0, key = null;
    		if(!match_all_text) {
    			var value = $(this).val().substring(0, this.selectionStart);
    			key_index = value.search(/@[^@\s]{1,20}$/g);
    			if(key_index >= 0) {
            		key = value.substring(key_index + 1);
            		if(!/^[a-zA-Z0-9\u4e00-\u9fa5_]+$/.test(key)){
            			key = null;
            		}
            	}
    		} else {
    			key = $(this).val();
    		}
        	var $text_tip = $('#text_tip');
        	if(key) {
        		// http://xiaocai.info/2011/03/js-textarea-body-offset/
        		this._at_key = key;
        		this._at_key_index = key_index;
        		this._at_key_loading = true;
        		at_user_search(key, function(names){
        			this._at_key_loading = false;
        			var html = '';
            		for(var user_id in names) {
            			var item = names[user_id];
            			html += '<li name="' + item[0] + '" user_id="' + user_id + '">' + item[1] + '</li>';
            		}
            		if(!html) {
            			$tip_div.hide();
            			return;
            		}
            		$tip_div.find('ul').html(html).find('li:first').addClass('cur');
            		_bind_tip_items($tip_div);
            		
            		var $this = $(this);
            		var ele_offset = $this.offset();
            		if($text_tip.length == 0) {
            			$text_tip = $('<div id="text_tip" style="z-index:-1000;position:absolute;opacity:0;overflow:auto;display:inline;word-wrap:break-word;"></div>');
            			$(document.body).append($text_tip);
            		}
            		$text_tip.css({
        				left: ele_offset.left, 
        				top: ele_offset.top, 
        				height: $this.height,
        				width: $this.width(),
        				'font-family': $this.css('font-family'),
        				'font-size': $this.css('font-size')
        			});
            		var text = $this.val().substring(0, this.selectionStart);
            		function _format(s) {
            			return s.replace(/</ig, '&lt;').replace(/>/ig, '&gt;')
            				.replace(/\r/g, '').replace(/ /g, '&nbsp;').replace(/\n/g, '<br/>');
            		}
            		$text_tip.html(_format(text) + '<span>&nbsp;</span>');
            		var $span = $text_tip.find('span');
            		var offset = $span.offset();
            		var left = offset.left - $span.width();
            		if((left + $tip_div.width()) > (ele_offset.left + $this.width())) {
            			left -= $tip_div.width();
            		}
            		var top = Math.min(offset.top + $span.height(), ele_offset.top + $this.height());
            		$tip_div.css({left: left, top: top}).show();
        		}, this);
        	} else {
        		$tip_div.hide();
        	}
    	}
    }).keydown(function(){
    	if($tip_div.css('display') != 'none') {
//    		keycode 38 = Up 
//    		keycode 40 = Down
    		if(event.keyCode == '13') {
    			$tip_div.find('li.cur').click();
        		return false;
        	} else if(event.keyCode == '38'){
        		var $prev = $tip_div.find('li.cur').prev();
        		if($prev.length == 1) {
        			$tip_div.find('li.cur').removeClass('cur');
        			$prev.addClass('cur');
        		}
        		return false;
        	} else if(event.keyCode == '40'){
        		var $next = $tip_div.find('li.cur').next();
        		if($next.length == 1) {
        			$tip_div.find('li.cur').removeClass('cur');
        			$next.addClass('cur');
        		}
        		return false;
        	}
    	}
    }).focusout(function(){
    	// 延时隐藏，要不然点击选择的时候，已经被隐藏了，无法选择
    	setTimeout(function(){
    		$tip_div.hide();
    	}, 100);
    }).click(function(){
    	$(this).keyup();
    });
	$tip_div.click(function(){
    	var $select_li = $(this).find('li.cur:first');
    	var $text = $($tip_div.attr('ele_id'));
    	var value = $text.val();
    	var ele = $text.get(0);
    	var user_name = $select_li.attr('name');
    	if(ele.match_all_text) {
    		$text.val(user_name);
    		$text.focus();
    	} else {
    		var new_value = value.substring(0, ele._at_key_index + 1);
        	new_value += user_name + ' ' + value.substring(ele.selectionStart);
        	$text.focus().val(new_value);
        	// 设置光标位置
        	ele.selectionStart = ele.selectionEnd = ele._at_key_index + user_name.length + 2;
    	}
    	if(ele.select_callback) {
    		ele.select_callback({
    			id: $select_li.attr('user_id'),
    			name: user_name,
    			screen_name: $select_li.html()
    		});
    	}
    	setTimeout(function(){
    		$tip_div.hide();
    	}, 100);
    });
};


//@user search
function at_user_search(query, callback, context) {
	var query_regex = new RegExp(query, 'i');
	var current_user = getUser();
	var b_view = getBackgroundView();
	var hits = {}, hit_count = 0;
	var config = tapi.get_config(current_user);
	var data_types = [b_view.friendships.friend_data_type].concat(T_LIST.all);
	for(var index=0; index < data_types.length; index++) {
		var tweets = b_view.get_data_cache(data_types[index], current_user.uniqueKey) || [];
		var len = tweets.length;
	    for(var i=0; i<len; i++){
	    	var tweet = tweets[i];
	    	var items = [tweet.user || tweet];
	    	var retweeted_status = tweet.retweeted_status || tweet.status;
	    	if(retweeted_status) {
	    		items.push(retweeted_status.user);
	    		if(retweeted_status.retweeted_status) {
	    			items.push(retweeted_status.retweeted_status.user);
	    		}
	    	}
	    	for(var j=0; j<items.length; j++) {
	    		var user = items[j];
	    		if(_check_name(user, query_regex)){
	            	if(!hits[user.id]) {
	            		if(config.rt_at_name) {
	            			hits[user.id] = [user.name, user.screen_name];
	            		} else {
	            			hits[user.id] = [user.screen_name, user.screen_name];
	            		}
	            		hit_count++;
	            	}
	            }
	    	}
	        if(hit_count >= 10) {
	        	callback.call(context, hits);
	        	return;
	    	}
	    }
	}
	if(hit_count < 2) {
		// 命中太少，则尝试获取最新的
		b_view.friendships.fetch_friends(current_user.uniqueKey, function(friends){
			for(var i=0; i<friends.length; i++){
				user = friends[i];
				if(_check_name(user, query_regex)){
	            	if(!hits[user.id]) {
	            		if(config.rt_at_name) {
	            			hits[user.id] = [user.name, user.screen_name];
	            		} else {
	            			hits[user.id] = [user.screen_name, user.screen_name];
	            		}
	            		hit_count++;
	            		if(hit_count >= 10) {
	                    	break;
	                	}
	            	}
	            }
			}
			callback.call(context, hits);
	    	return;
		});
	} else {
		callback.call(context, hits);
		return;
	}
};

function _check_name(user, query_regex) {
	if(!user) {
		return false;
	}
	return user.screen_name && user.screen_name.search(query_regex) >= 0
		|| user.name && user.name.search(query_regex) >= 0;
};


// 根据当前ip获取地理坐标信息
// callback(geo, error_message)
var get_location = function(callback) {
	$.ajax({
		url:'http://api.yongwo.de/api/ip', 
		success: function(ip) {
			var url = 'http://api.map.sina.com.cn/geocode/ip_to_geo.php?format=json&source=3434422667&ip=' + ip;
			$.ajax({
				url: url, 
				dataType: 'json',
				success: function(data){
					var geo = data.geos && data.geos[0];
					var error = null;
					if(geo && geo.latitude) {
						geo.latitude = parseFloat(geo.latitude);
						geo.longitude = parseFloat(geo.longitude);
					} else {
						error = String(geo && geo.error || geo);
						geo = null;
					}
					callback(geo, error);
				},
				error: function(jqXHR, textStatus, errorThrown){
					callback(null, String(errorThrown));
				}
			});
		},
		error: function(jqXHR, textStatus, errorThrown){
			callback(null, String(errorThrown));
		}
	});
};

/**
 * 将符合字节流的string转化成Blob对象
 * 
 * @param {String} data
 * @return {Blob} 
 * @api public
 */
function binaryToBlob(data) {
	var bb = new BlobBuilder();
	var arr = new Uint8Array(data.length);
	for(var i = 0, l = data.length; i < l; i++) {
		arr[i] = data.charCodeAt(i);
	}
	bb.append(arr.buffer);
	return bb.getBlob();
};

/**
 * 根据URL获取图片的Blob对象
 * 
 * @param {String} url
 * @return {Blob} 
 * @api public
 */
function getImageBlob(url) {
	if(url.indexOf('data:') == 0) {
		// is dataUrl
		return dataUrlToBlob(url);
	}
	var r = new XMLHttpRequest();
	r.open("GET", url, false);
	// 详细请查看: https://developer.mozilla.org/En/XMLHttpRequest/Using_XMLHttpRequest#Receiving_binary_data
	// XHR binary charset opt by Marcus Granado 2006 [http://mgran.blogspot.com]
	r.overrideMimeType('text/plain; charset=x-user-defined');
	r.send(null);
	var blob = binaryToBlob(r.responseText);
	blob.name = blob.fileName = url.substring(url.lastIndexOf('/') + 1);
	blob.fileType = "image/jpeg"; //"image/octet-stream";
	return blob;
};

/**
 * 将dataUrl转化成Blob对象
 * 
 * @param {String} dataurl
 * @return {Blob} 
 * @api public
 */
function dataUrlToBlob(dataurl) {
	// data:image/jpeg;base64,xxxxxx
	var datas = dataurl.split(',', 2);
    var blob = binaryToBlob(atob(datas[1]));
	blob.fileType = datas[0].split(';')[0].split(':')[1];
	blob.name = blob.fileName = 'pic.' + blob.fileType.split('/')[1];
	return blob;
};