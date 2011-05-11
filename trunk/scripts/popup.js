// @author qleelulu@gmail.com

var fawave = {};
function getTimelineOffset(t){
    return $("#" + t + "_timeline ul.list > li").length;
    //return timeline_offset[t] || PAGE_SIZE;
};

function initOnLoad(){
    setTimeout(init, 100); //为了打开的时候不会感觉太卡
};

var POPUP_CACHE = {};
// 方便根据不同用户获取缓存数据的方法
function get_current_user_cache(cache, t) {
	var c_user = getUser();
	var key = c_user.uniqueKey;
	if(t != undefined) {
		key += '_' + t;
	}
	if(!cache) {
		cache = POPUP_CACHE;
	}
	var _cache = cache[key];
	if(!_cache) {
		_cache = {};
		cache[key] = _cache;
	}
	return _cache;
};

var isNewTabSelected = window.is_new_win_popup ? true : false; //如果是弹出窗，则激活新打开的标签

function init(){
    var c_user = getUser();
    if(!c_user){
        chrome.tabs.create({url: 'options.html#user_set'});
        return;
    }else if(!c_user.uniqueKey){
        chrome.tabs.create({url: 'options.html#no_uniqueKey'});
        return;
    }
    //$('a').attr('target', '_blank');
    $('a').live('click', function(e){
        var url = $.trim($(this).attr('href'));
        if(url && !url.toLowerCase().indexOf('javascript')==0){
            chrome.tabs.create({url:$(this).attr('href'), selected:isNewTabSelected});
            return false;
        }
    }).live('mousedown', function(e){
        if(e.button == 2){ //右键点击
            var url = $.trim($(this).attr('rhref'));
            if(url){
                chrome.tabs.create({url:url, selected:isNewTabSelected});
            }
        }
    });

    if(window.is_new_win_popup){
        resizeFawave();
        $(window).resize(function(){
            resizeFawave();
        });
    }

    changeAlertMode(getAlertMode());
    changeAutoInsertMode(getAutoInsertMode());

    $('#ye_dialog_close').click(function(){ hideReplyInput(); });

    initTabs();

    initTxtContentEven();

    initChangeUserList();

    getSinaTimeline('friends_timeline'); //只显示首页的，其他的tab点击的时候再去获取

    initMsgHover();

    addUnreadCountToTabs();
    initIamDoing();

    initScrollPaging();

    $(window).unload(function(){ initOnUnload(); }); 

    //google map api，为了不卡，最后才载入
    var script = document.createElement("script"); 
    script.type = "text/javascript"; 
    script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=initializeMap"; 
    document.body.appendChild(script);
    
    // 注册 查看原始围脖的按钮事件
    $('a.show_source_status_btn').live('click', function() {
    	var $this = $(this);
    	var user = getUser();
    	var t = getCurrentTab().replace('#', '').replace(/_timeline$/i, '');
    	var params = {id: $(this).attr('status_id'), user: user};
    	$this.hide();
    	tapi.status_show(params, function(data) {
    		if(data && data.id) {
    			var html = buildStatusHtml([data], t, user).join('');
    			$this.parents('.mainContent').after(html);
    			// 处理缩址
        		ShortenUrl.expandAll();
    		} else {
    			$this.show();
    		}
    	});
    });
    
    // support @ autocomplete
    at_user_autocomplete("#txtContent");
    at_user_autocomplete("#replyTextarea");
    at_user_autocomplete("#direct_message_user", true, function(user){
    	// 选中则发私信
    	doNewMessage($("#direct_message_user").get(0), user.screen_name, user.id);
    });
    //CMT by sigma 
    //adShow();
};

function initializeMap(){};//给载入地图api调用

function initTabs(){
    window.currentTab = '#friends_timeline_timeline';
    $('#tl_tabs li').click(function() {
        var t = $(this), currentIsActive = t.hasClass('active');
        //不进行任何操作							 
        if(t.hasClass('tab-none')) {
            return;
        };
        //添加当前激活的状态
        t.siblings().removeClass('active').end().addClass('active');
        //切换tab前先保护滚动条位置
        var old_t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
        if(!currentIsActive){ //如果当前不是激活的（点击的不是当前tab）
            saveScrollTop(old_t);
        }
        //切换tab
        $('.list_p').hide();
        var c_t = t.attr('href').replace('#','').replace(/_timeline$/i,'');
        var c_ul = $(t.attr('href'));
        c_ul.show();
        window.currentTab = t.attr('href');
        if(c_t =='user_timeline'){ //用户自己的微薄，清空内容。防止查看别人的微薄的时候内容混合
            getUserTimeline();
            checkShowGototop();
            return;
        }else if(c_t =='followers'){
        	window.currentTab = ''; // 防止自动滚动
        	showFollowers();
            checkShowGototop();
            return;
        } else if(c_t == 'favorites') {
        	getFavorites(true);
            checkShowGototop();
            return;
        }
        //如果有未读信息，则清空列表，重新获取
        if(t.find(".unreadCount").html()) {
            c_ul.find('ul.list').html('');
        };
        if(!c_ul.find('ul.list').html()){
            getSinaTimeline(c_t);
        }
        resetScrollTop(c_t); //复位到上次滚动条的位置
        removeUnreadTimelineCount(c_t);
        t.find(".unreadCount").html('');
        updateDockUserUnreadCount(c_user.uniqueKey);

        checkShowGototop(); //检查是否要显示返回顶部按钮
    });
    
    checkSupportedTabs();
};

function initOnUnload(){
    var c = $("#txtContent").val();
    localStorage.setObject(UNSEND_TWEET_KEY, c||'');

    if(Settings.get().sendAccountsDefaultSelected == 'remember'){
        if($("#accountsForSend").data('inited')){
            var keys = '';
            $("#accountsForSend li.sel").each(function(){
                keys += $(this).attr('uniquekey') + '_';
            });
            keys = keys ? '_'+keys : keys;

            localStorage.setObject(LAST_SELECTED_SEND_ACCOUNTS, keys);
        }
    }
};

function initTxtContentEven(){
//>>>发送微博事件初始化 开始<<<
    var unsendTweet = localStorage.getObject(UNSEND_TWEET_KEY);
    var txtContent = $("#txtContent");
    if(unsendTweet){
        txtContent.val(unsendTweet);
    }

    //txtContent.bind('keyup', function(){
    //    countInputText();
    //});

    txtContent[0].oninput = txtContent[0].onfocus = countInputText;

    txtContent.keydown(function(event){
        var c = $.trim($(this).val());
        if(event.ctrlKey && event.keyCode==13){
            if(c){
                sendMsg(c);
            }else{
                showMsg(_u.i18n("msg_need_content"));
            }
            return false;
        }
    });

    $("#btnSend").click(function(){
        var txt = $("#txtContent");
        var c = $.trim(txt.val());
        if(c){
            sendMsg(c);
        }else{
            showMsg(_u.i18n("msg_need_content"));
        }
    });
//>>>发送微博事件初始化 结束<<<

//>>>回复事件初始化开始<<<
    $("#replyTextarea").keyup(function(){
        countReplyText();
    });

    $("#replyTextarea").keydown(function(event){
        var c = $.trim($(this).val());
        if(event.ctrlKey && event.keyCode==13){
            sendMsgByActionType(c);
            return false;
        }
    });

    $("#replySubmit").click(function(){
        var txt = $("#replyTextarea");
        var c = $.trim(txt.val());
        sendMsgByActionType(c);
    });
//>>>回复结束<<<
};

function sendMsgByActionType(c){//c:要发送的内容
    if(c){
        var actionType = $('#actionType').val();
        switch(actionType){
            case 'newmsg': // 私信
                sendWhisper(c);
                break;
            case 'repost': // 转
                sendRepost(c);
                break;
            case 'comment': // 评
                sendComment(c);
                break;
            case 'reply': // @
                sendReplyMsg(c);
                break;
            default:
                showMsg('Wrong Send Type');
        }
    }else{
        showMsg(_u.i18n("msg_need_content"));
    }
};

//统计字数
function countInputText() {
    var c = $("#txtContent").val();
    var len = 140 - c.len();
    $("#wordCount").html(len);
    if(len == 140){
        $("#btnSend").attr('disabled', 'disabled');
    }else{
        $("#btnSend").removeAttr('disabled');
    }
};

function countReplyText(){
    var c = $("#replyTextarea").val();
    var len = 140 - c.len();
    if(len > 0){
        len = _u.i18n("msg_word_count").format({len:len});
    }else{
        len = '(<em style="color:red;">'+ _u.i18n("msg_word_overstep").format({len:len}) +'</em>)';
    }
    $("#replyInputCount").html(len);
};

function cleanTxtContent(){
    $("#txtContent").val('').focus();
    countInputText();
};

// 封装重用的判断是否需要自动缩址的逻辑
function _shortenUrl(longurl, settings, callback) {
	if(longurl.indexOf('chrome-extension://') == 0) { // 插件地址就不处理了
		return;
	}
	var settings = settings || Settings.get();
	if(settings.isSharedUrlAutoShort && longurl.replace(/^https?:\/\//i, '').length > settings.sharedUrlAutoShortWordCount){
    	ShortenUrl.short(longurl, callback);
    }
};

// 添加缩短url
function addShortenUrl(){
    var btn = $("#urlShortenBtn");
    var status = btn.data('status');
    switch(status){
        case 'shorting':
            showMsg(_u.i18n("msg_shorting_and_wait"));
            break;
        case 'opened':
            var long_url = $("#urlShortenInp").val();
            if(!long_url){
                return;
            }
            btn.data('status', 'shorting');
            $("#urlShortenInp").val(_u.i18n("msg_shorting")).attr('disabled', true);
            ShortenUrl.short(long_url, function(shorturl){
                if(shorturl){
                    $("#txtContent").val($("#txtContent").val() + ' ' + shorturl + ' ');
                    $("#urlShortenInp").removeClass('long').val('');
                    btn.data('status', ''); 
                }else{
                    showMsg(_u.i18n("msg_shorten_fail"));
                    $("#urlShortenInp").val(long_url);
                    btn.data('status', 'opened'); //失败，仍然标记为打开的
                }
                $("#urlShortenInp").removeAttr('disabled');
            });
            break;
        default:
            btn.data('status', 'opened');
            $("#urlShortenInp").addClass('long').focus();
            break;
    }
};
function showAddShortenUrl(){
    var btn = $("#urlShortenBtn");
    if(!btn.data('status')){
        btn.data('status', 'opened');
        $("#urlShortenInp").addClass('long').focus();
    }
};
function enterAddShortenUrl(e){
    if(e.keyCode == '13') {
        addShortenUrl();
    }
};

//我正在看
function initIamDoing(){
    $("#doing").click(function(){
        chrome.tabs.getSelected(null, function(tab){
            var loc_url = tab.url;
            if(loc_url){
                var title = tab.title || '';
                var $txt = $("#txtContent");
                var settings = Settings.get();
                $txt.val(formatText(settings.lookingTemplate, {title: title, url: loc_url}));
                showMsgInput();
                _shortenUrl(loc_url, settings, function(shorturl){
		            if(shorturl) {
		                $txt.val($txt.val().replace(loc_url, shorturl));
		            }
		        });
            } else {
                showMsg(_u.i18n("msg_wrong_page_url"));
            }
        });
    });
};

//搜索
var Search = {
	current_search: '', // 默认当前搜索类型 search, search_user
	current_keyword: '',
    toggleInput: function(ele){
		$('.searchWrap').hide();
		var $search_wrap = $(ele).nextAll('.searchWrap');
		var search_type = $search_wrap.hasClass('searchUserWrap') ? 'search_user' : 'search';
		if(search_type == Search.current_search) {
			Search.current_search = '';
			return;
		}
		Search.current_search = search_type;
		$search_wrap.toggle();
		var $text = $search_wrap.find(".txtSearch").focus().keyup(function(event) {
			Search.current_keyword = $(this).val();
        	if(event.keyCode == '13') {
        		Search.search();
        	}
        });
		Search.current_keyword = $text.val();
    },
    search: function(read_more) {
    	var c_user = getUser();
    	var q = $.trim(Search.current_keyword);
    	if(!q) {
    		return;
    	}
    	// http://www.google.com/search?q=twitter&source=fawave&tbs=mbl:1
    	if(c_user.blogType == 'twitter') {
    		chrome.tabs.create({url: 'http://www.google.com/search?q=' + q + '&source=fawave&tbs=mbl:1', selected: false});
    		return;
    	}
	    var $tab = $("#tl_tabs .tab-user_timeline");
	    $tab.attr('statusType', 'search');
	    var $ul = $("#user_timeline_timeline ul.list");
	    var max_id = null;
	    var page = 1;
	    var cursor = null;
	    var config = tapi.get_config(c_user);
	    var support_search_max_id = config.support_search_max_id;
	    var support_cursor_only = config.support_cursor_only;
	    if(read_more) {
	    	// 滚动的话，获取上次的参数
	        max_id = $tab.attr('max_id');
	        cursor = $tab.attr('cursor');
	        page = Number($tab.attr('page') || 1);
	    }  else {
	    	// 第一次搜索
	    	$ul.html('');
	    }
	    var params = {count: PAGE_SIZE, q: q, user: c_user};
	    if(support_cursor_only) { // 只支持cursor方式分页
	    	if(cursor) {
	    		params.cursor = cursor;
	    	}
	    } else {
	    	if(support_search_max_id) {
		    	if(max_id) {
			    	params.max_id = max_id;
			    }
		    } else {
		    	params.page = page;
		    }
	    }
	    showLoading();
	    var timeline_type = 'user_timeline';
	    var method = 'search';
	    var data_type = 'status';
	    if(Search.current_search == 'search_user') {
	    	method = 'user_search';
	    	data_type = 'user';
	    }
	    hideReadMore(timeline_type);
	    tapi[method](params, function(data, textStatus) {
	    	hideLoading();
            hideReadMoreLoading(timeline_type);
	    	// 如果用户已经切换，则不处理
	    	var now_user = getUser();
	    	if(now_user.uniqueKey != c_user.uniqueKey) {
	    		return;
	    	}
	    	var statuses = data.results || data.items || data;
	    	if(!statuses) { // 异常
	    		return;
	    	}
	    	if(data.next_cursor !== undefined) {
	    		$tab.attr('cursor', data.next_cursor);
	    	}
	        if(statuses.length > 0){
	        	var c_tb = getCurrentTab();
	        	var want_tab = "#" + timeline_type + "_timeline";
	        	if(c_tb != want_tab) {
	        		//添加当前激活的状态
	                $tab.siblings().removeClass('active').end().addClass('active');
	                //切换tab前先保护滚动条位置
	                var old_t = c_tb.replace('#','').replace(/_timeline$/i,'');
	                saveScrollTop(old_t);
	                //切换tab
	                $('.list_p').hide();
	                
	                $(want_tab).show();
	                $ul.html('');
	
	                window.currentTab = want_tab;
	        	}
	            statuses = addPageMsgs(statuses, timeline_type, true, data_type);
	            // 保存数据，用于翻页
//	            $tab.attr('q', q);
	            $tab.attr('page', page + 1);
	        }
	        if(statuses.length >= PAGE_SIZE) {
            	max_id = data.max_id || String(statuses[statuses.length - 1].id);
            	$tab.attr('max_id', max_id);
            	showReadMore(timeline_type);
            } else {
            	hideReadMore(timeline_type, true); //没有分页了
            }
	        checkShowGototop();
	    });
    }
};

//隐藏那些不支持的Timeline Tab
function checkSupportedTabs(user){
    if(!user){
        user = getUser();
    }
    var config = tapi.get_config(user);
    var checks = {
    	support_comment: ['#tl_tabs .tab-comments_timeline, #comments_timeline_timeline', // 需要隐藏的
    	                  '#tl_tabs .tab-comments_timeline'], // 需要显示的
    	support_favorites: ['#tl_tabs .tab-favorites, #favorites_timeline',
    	                    '#tl_tabs .tab-favorites'],
    	support_direct_messages: ['#tl_tabs .tab-direct_messages, #direct_messages_timeline',
    	                    '#tl_tabs .tab-direct_messages'],
    	support_mentions: ['#tl_tabs .tab-mentions, #mentions_timeline',
    	                    '#tl_tabs .tab-mentions'],
    	support_search: ['.search_span', '.search_span'],
    	support_user_search: ['.user_search_span', '.user_search_span']
    };
    for(var key in checks) {
    	if(!config[key]){
    		$(checks[key][0]).hide();
        }else{
        	$(checks[key][1]).show();
        }
    }
    // 如果是buzz，则隐藏评论tab，但是它可以评论
    if(user.blogType == 'buzz') {
    	$('#tl_tabs .tab-comments_timeline, #comments_timeline_timeline').hide();
    }
};

//多用户切换
function initChangeUserList(){
    var c_user = getUser();
    if(c_user){
        showHeaderUserInfo(c_user);

        var userList = getUserList();
        if(userList.length < 2){ return; }
        //底部Dock
        var u_tp = '<li class="{{uniqueKey}} {{current}}">' +
                       '<span class="username">{{screen_name}}</span>' +
                       '<a href="javascript:" onclick="changeUser(\'{{uniqueKey}}\')"><img src="{{profile_image_url}}" /></a>' +
                       '<img src="/images/blogs/{{blogType}}_16.png" class="blogType" />' +
                       '<span class="unr"></span>' +
                   '</li>';
        var li = [];
        for(var i in userList){
            user = userList[i];
            if(user.uniqueKey == c_user.uniqueKey){
                user.current = 'current';
            }else{
                user.current = '';
            }
            li.push(u_tp.format(user));
        }
        $("#accountListDock").html('<ul>' + li.join('') + '</ul>');
        $("#msgInfoWarp").css('bottom', 40); //防止被用户列表遮挡
    }
};

//头部的用户信息
function showHeaderUserInfo(c_user){
    var h_user = $("#header .user");
    h_user.find('.face').attr('href', c_user.t_url);
    h_user.find('.face .icon').attr('src', c_user.profile_image_url);
    h_user.find('.face .bt').attr('src', 'images/blogs/'+c_user.blogType+'_16.png');
    h_user.find('.info .name').html(c_user.screen_name);
    var nums = '';
    if(tapi.get_config(c_user).userinfo_has_counts){
        nums = _u.i18n("comm_counts_info").format(c_user);
    }
    h_user.find('.info .nums').html(nums);
};

function changeUser(uniqueKey){
    var c_user = getUser();
    if(c_user.uniqueKey == uniqueKey){
        return;
    }
    var to_user = getUserByUniqueKey(uniqueKey);
    if(to_user){
        setUser(to_user);
        showHeaderUserInfo(to_user);
        var b_view = getBackgroundView();
        b_view.onChangeUser();
    	// 获取当前的tab
        var activeLi = $("#tl_tabs li.active");
    	var cur_t = activeLi.attr('href').replace(/_timeline$/, '').substring(1);
        
        var userT = T_LIST[to_user.blogType];
        var _li = null, _t = '', cur_t_new = '';
        $("#tl_tabs li").each(function(){
            _li = $(this);
            _t = _li.attr('href').replace(/_timeline$/i,'').substring(1);
            $("#" + _t + '_timeline .list').html('');
//            showReadMore(_t); //TODO: show or hide ?
            hideReadMore(_t);
        });
        checkSupportedTabs(to_user);
        if(activeLi.css('display')=='none'){ //如果不支持的tab刚好是当前tab
            activeLi.removeClass('active');
            window.currentTab = '#friends_timeline_timeline';
            cur_t_new = 'friends_timeline';
            $("#tl_tabs .tab-friends_timeline").addClass('active');
            $('#friends_timeline_timeline').show();
        }

        cur_t = cur_t_new || cur_t;
        $("#tl_tabs .unreadCount").html('');
        $("#accountListDock").find('.current').removeClass('current')
            .end().find('.'+to_user.uniqueKey).addClass('current');
        addUnreadCountToTabs();
        if(cur_t) { // 需要刷新一下数据
        	$("#tl_tabs li.active").click();
        }
    }
};

// 初始化用户选择视图, is_upload === true 代表是上传
function initSelectSendAccounts(is_upload){
    var afs = $("#accountsForSend");
    if(afs.data('inited')){
        if(Settings.get().sendAccountsDefaultSelected == 'current' && afs.find('li.sel').length < 2){
            afs.find('li').removeClass('sel');
            var c_user = getUser();
            $("#accountsForSend li[uniqueKey=" + c_user.uniqueKey +"]").addClass('sel');
        }
        shineSelectedSendAccounts(afs.find('li.sel'));
        return;
    }
    var userList = getUserList('send');
    if(userList.length < 2){ return; } //多个用户才显示
    var li_tp = '<li class="{{sel}}" uniqueKey="{{uniqueKey}}" onclick="toggleSelectSendAccount(this)">' +
                   '<img src="{{profile_image_url}}" />' +
                   '{{screen_name}}' +
                   '<img src="/images/blogs/{{blogType}}_16.png" class="blogType" />' +
               '</li>';
    var li = [];
    var c_user = getUser();
    for(var i in userList){
        user = userList[i];
        if(is_upload === true && tapi.get_config(user).support_upload === false) {
        	continue;
        }
        user.sel = '';
        switch(Settings.get().sendAccountsDefaultSelected){
            case 'all':
                user.sel = 'sel';
                break;
            case 'current':
                if(user.uniqueKey == c_user.uniqueKey){
                    user.sel = 'sel';
                }
                break;
            case 'remember':
                var lastSend = getLastSendAccounts();
                if(lastSend && lastSend.indexOf('_'+ user.uniqueKey + '_') >= 0){
                    user.sel = 'sel';
                }
                break;
            default:
                break;
        }
        li.push(li_tp.format(user));
    }
    afs.html('TO(<a class="all" href="javascript:" onclick="toggleSelectAllSendAccount()">'+ _u.i18n("abb_all") +'</a>): ' + li.join(''));
    afs.data('inited', 'true');
    shineSelectedSendAccounts();
};
function shineSelectedSendAccounts(sels){
    if(!sels){
        sels = $("#accountsForSend li.sel");
    }
    sels.css('-webkit-transition', 'none').removeClass('sel');
    function _highlightSels(){
        sels.css('-webkit-transition', 'all 0.8s ease').addClass('sel');
    }
    setTimeout(_highlightSels, 150);
};
function toggleSelectSendAccount(ele){
    var _t = $(ele);
    if(_t.hasClass('sel')){
        _t.removeClass('sel');
    }else{
        _t.addClass('sel');
    }
};
function toggleSelectAllSendAccount(){
    if($("#accountsForSend .sel").length == $("#accountsForSend li").length){ //已全选
        $("#accountsForSend li").removeClass('sel');
        var c_user = getUser();
        $("#accountsForSend li[uniqueKey=" + c_user.uniqueKey +"]").addClass('sel');
    }else{
        $("#accountsForSend li").addClass('sel');
    }
};
// <<-- 多用户 END

function addUnreadCountToTabs(){
    var ur = 0;
    var tab = '';
    var userList = getUserList();
    var c_user = getUser();
    for(var j in userList){
        var user = userList[j];
        var user_unread = 0;
        for(var i in T_LIST[user.blogType]){
            ur = getUnreadTimelineCount(T_LIST[user.blogType][i], user.uniqueKey);
            if(ur>0 && c_user.uniqueKey == user.uniqueKey){ //当前用户，则设置timeline tab上的提示
                tab = $("#tl_tabs .tab-" + T_LIST[user.blogType][i]);
                if(tab.length == 1 && !tab.hasClass('active')){
                    //tab.find('.unreadCount').html('(' + ur + ')');
                    tab.find('.unreadCount').html(ur);
                    user_unread += ur;
                }else{
                    removeUnreadTimelineCount(T_LIST[user.blogType][i], user.uniqueKey);
                }
            }else{
                user_unread += ur;
            }
            ur = 0;
        }
        /*
        if(user_unread > 0){
            $("#accountListDock ." + user.uniqueKey + " .unr").html(user_unread).show();
        }else{
            $("#accountListDock ." + user.uniqueKey + " .unr").html('').hide();
        }
        */
        updateDockUserUnreadCount(user.uniqueKey);
    }
};


//更新底部dock上的未读提示数
function updateDockUserUnreadCount(user_uniqueKey){
    if(!user_uniqueKey){ return; }
    //var user_unread = getUserUnreadTimelineCount(user_uniqueKey);
    var user = getUserByUniqueKey(user_uniqueKey);
    var user_unread = 0, count = 0, d_html = '', t = '';
    for(var i in T_LIST[user.blogType]){
        t = T_LIST[user.blogType][i];
        count = getUnreadTimelineCount(t, user_uniqueKey);
        user_unread += count;
        if(count > 0){
            d_html = d_html ? d_html+', ' : d_html;
            d_html += count + unreadDes[t];
        }
    }
    if(user_unread > 0){
        $("#accountListDock ." + user_uniqueKey + " .unr").html(user_unread).show();
    }else{
        $("#accountListDock ." + user_uniqueKey + " .unr").html('').hide();
    }

    d_html = d_html ? ' ('+d_html+')' : d_html;
    $("#accountListDock ." + user_uniqueKey + " .username").html(user.screen_name + d_html);
};

function initMsgHover(){
    /*
    $(".list li").live("mouseenter", function(){ //mouseover
        var li = $(this);
        li.addClass("activeTweet");
        li.find('.edit').show();
    });

    $(".list li").live("mouseleave", function(){ //mouseout
        var li = $(this);
        li.removeClass("activeTweet");
        li.find('.edit').hide();
    });
    */
};

//====>>>>>>>>>>>>>>>>>>>>>>

// 用户关系：跟随、取消跟随
function f_create(user_id, ele, screen_name){
	var $ele = $(ele);
	$ele.hide();
    showLoading();
    var b_view = getBackgroundView();
    b_view.friendships.create(user_id, screen_name, function(user_info, textStatus, statuCode){
        if(!user_info){
        	$ele.show();
        }
    });
};

function f_destroy(user_id, ele, screen_name){
	var $ele = $(ele);
	$ele.hide();
    showLoading();
    var b_view = getBackgroundView();
    b_view.friendships.destroy(user_id, screen_name, function(user_info, textStatus, statuCode){
        if(!user_info){
        	$ele.show();
        }
    });
};
//====>>>>>>>>>>>>>>>>>>>>>>

//滚动条位置
var SCROLL_TOP_CACHE = {};
//@t : timeline类型
function saveScrollTop(t){
	var _cache = get_current_user_cache(SCROLL_TOP_CACHE);
    _cache[t] = $("#" + t + "_timeline .list_warp").scrollTop();
};

//复位到上次的位置
//@t : timeline类型
function resetScrollTop(t){
    if(t == 'user_timeline'){
        $("#" + t + "_timeline .list_warp").scrollTop(0);
    }else{
    	var _cache = get_current_user_cache(SCROLL_TOP_CACHE);
        $("#" + t + "_timeline .list_warp").scrollTop(_cache[t] || 0);
    }
};
//====>>>>>>>>>>>>>>>>>>>>>>

// 显示粉丝列表
function showFollowers(to_t, screen_name, user_id) {
	//添加当前激活的状态
    $t = $('#tl_tabs .tab-followers');
    $t.siblings().removeClass('active').end().addClass('active');
    //切换tab
    $('.list_p').hide();
    $($t.attr('href')).show();
	to_t = to_t || $("#fans_tab .active").attr('t');
	if(screen_name) {
		$('#followers_timeline').attr('screen_name', screen_name);
	} else {
		$('#followers_timeline').removeAttr('screen_name');
	}
	if(user_id) {
		$('#followers_timeline').attr('user_id', user_id);
	} else {
		$('#followers_timeline').removeAttr('user_id');
	}
//	log('show ' + to_t);
	$("#fans_tab span").unbind('click').click(function() {
		_getFansList($(this).attr('t'));
	}).each(function() {
		var $this = $(this);
		$this.removeAttr('loading');
		$this.removeAttr('cursor'); // 删除游标
		if($this.attr('t') == to_t) {
			$this.click();
		}
	});
	var html_cache = get_current_user_cache(FANS_HTML_CACHE);
	for(var k in html_cache) {
		delete html_cache[k];
	}
};

/*
* 粉丝列表
*/
var NEXT_CURSOR = {};
var FANS_HTML_CACHE = {};
//获取用户的粉丝列表
function _getFansList(to_t, read_more){
	to_t = to_t || $("#fans_tab .active").attr('t');
	var c_user = getUser();
    if(!c_user){
        return;
    }
    var $followers_timeline = $('#followers_timeline');
    var screen_name = $followers_timeline.attr('screen_name');
    var user_id = $followers_timeline.attr('user_id');
    var get_c_user_fans = false;
    if(screen_name === undefined) {
    	screen_name = c_user.screen_name;
    	user_id = c_user.id;
    	get_c_user_fans = true;
    	$("#fans_tab span font").html(_u.i18n("comm_me"));
    }
    if(!get_c_user_fans) {
    	$("#fans_tab span font").html(screen_name);
    }
    var params = {user:c_user, count:PAGE_SIZE, screen_name: screen_name};
    if(user_id) {
    	params.user_id = user_id;
    }
    var $list = $("#followers_timeline .list");
    var $active_t = $("#fans_tab .active");
    var active_t = $active_t.attr('t');
    var $to_t = $("#fans_tab .tab_" + to_t);
    var cursor = $to_t.attr('cursor') || '-1';
    var last_user = $followers_timeline.attr('last_user');
    if(c_user.uniqueKey != last_user) { // 用户切换了
    	cursor = '-1';
    }
    $followers_timeline.attr('last_user', c_user.uniqueKey);
    // 各微博自己cache
    var html_cache = get_current_user_cache(FANS_HTML_CACHE);
    if($to_t.attr('loading') !== undefined) {
    	return;
    }
    if(!read_more) { // 点击tab
    	if(active_t != to_t) { // 切换
    		html_cache[active_t] = $list.html();
    		$("#fans_tab span").removeClass('active');
	    	$to_t.addClass('active');
	    	if(html_cache[to_t]) {
	    		$list.html(html_cache[to_t]);
	    		return;
	    	}
	    } else if(cursor != '-1') { // 点击当前tab
	    	return;
	    }
    	cursor = '-1';
	    $list.html('');
    }
	if(cursor == '0'){
		hideReadMore(to_t, true);
    	return;
    }
    params.cursor = cursor;
    hideReadMore(to_t);
    window.currentTab = to_t;
    showLoading();
    $to_t.attr('loading', true);
//    log(c_user.uniqueKey + ': ' + cursor + ' ' + read_more);
    tapi[to_t](params, function(data, textStatus, statuCode){
    	// 如果用户已经切换，则不处理
    	var now_user = getUser();
    	if(now_user.uniqueKey != c_user.uniqueKey) {
    		return;
    	}
        if(data){
            var users = data.users || data.items || data;
            var next_cursor = data.next_cursor;
//            log(c_user.uniqueKey + ': next_cursor ' + next_cursor);
            var $last_item = $("#followers_timeline ul.list .user_info:last");
            var max_id = $last_item.attr('did');
            var result = filterDatasByMaxId(users, max_id, true);
            users = result.news;
            if(users && users.length > 0) {
            	var html = '';
                for(var i in users){
                	if(!get_c_user_fans) {
                		users[i].unfollow = true;
                	}
                }
                html = buildUsersHtml(users, to_t).join('');
                if(to_t == $("#fans_tab .active").attr('t')) {
                	// 还是当前页
                	$list.append(html);
                }
                html_cache[to_t] += html;
            }
            if(users && users.length > 0) {
                showReadMore(to_t);
            } else {
                hideReadMore(to_t, true);
            }
            // 设置游标，控制翻页
            if(next_cursor !== undefined) {
        		$to_t.attr('cursor', next_cursor);
        	}
        } else {
        	// 异常
        	showReadMore(to_t);
        }
        $to_t.removeAttr('loading');
    });
};

// 查看用户的微薄
// 支持max_id、page、cursor 3种形式的分页
function getUserTimeline(screen_name, user_id, read_more) {
    var c_user = getUser();
    if(!c_user){
        return;
    }
    var $tab = $("#tl_tabs .tab-user_timeline");
    $tab.attr('statusType', 'user_timeline');
    var $ul = $("#user_timeline_timeline ul.list");
    var max_id = null;
    var cursor = null;
    var page = 1;
    var user_id = user_id || '';
    if(read_more) {
    	// 滚动的话，获取上次的参数
    	max_id = $tab.attr('max_id');
        page = String($tab.attr('page') || 1);
        cursor = $tab.attr('cursor');
        user_id = $tab.attr('user_id');
        screen_name = $tab.attr('screen_name');
    } else if(screen_name === undefined) {
    	// 直接点击tab，获取当前用户的
    	screen_name = c_user.screen_name;
    	user_id = c_user.id;
    	$ul.html('');
    }  else {
    	// 否则就是直接点击查看用户信息了
    	$ul.html('');
    }
    var params = {count: PAGE_SIZE, screen_name: screen_name, user: c_user};
    if(user_id) {
    	params.id = user_id;
    }
    var config = tapi.get_config(c_user);
    var support_cursor_only = config.support_cursor_only; // 只支持游标方式翻页
    if(!support_cursor_only) {
    	var support_max_id = config.support_max_id;
	    if(support_max_id) {
	    	if(max_id) {
	    		params.max_id = max_id;
	    	}
	    } else {
	    	params.page = page;
	    }
    } else {
    	if(cursor == '0') {
    		return;
    	}
    	if(cursor) {
    		params.cursor = cursor;
    	}
    }
    showLoading();
    var m = 'user_timeline';
    hideReadMore(m);
    tapi[m](params, function(data, textStatus){
    	// 如果用户已经切换，则不处理
    	var now_user = getUser();
    	if(now_user.uniqueKey != c_user.uniqueKey) {
    		return;
    	}
    	if(data) {
    		var sinaMsgs = data.items || data;
        	if(support_cursor_only && data.next_cursor) {
        		$tab.attr('cursor', data.next_cursor);
        	}
            if(sinaMsgs && sinaMsgs.length > 0){
            	var c_tab = getCurrentTab();
            	if(c_tab != "#user_timeline_timeline") {
            		//添加当前激活的状态
                    $tab.siblings().removeClass('active').end().addClass('active');
                    //切换tab前先保护滚动条位置
                    var old_t = c_tab.replace('#','').replace(/_timeline$/i,'');
                    saveScrollTop(old_t);
                    //切换tab
                    $('.list_p').hide();
                    
                    $("#user_timeline_timeline").show();
                    $ul.html('');

                    window.currentTab = "#user_timeline_timeline";
            	}
                addPageMsgs(sinaMsgs, m, true);
                var last_index = sinaMsgs.length - 1;
                max_id = String(sinaMsgs[last_index].timestamp || sinaMsgs[last_index].cursor_id || sinaMsgs[last_index].id);
                page += 1;
                // 保存数据，用于翻页
                $tab.attr('max_id', max_id);
                $tab.attr('page', page);
                $tab.attr('screen_name', screen_name);
                $tab.attr('user_id', user_id);
                if(sinaMsgs.length > 8){
                    showReadMore(m);
                }else{
                    hideReadMore(m, true); //没有分页了
                }
                if(!read_more) {
                	var user = data.user || sinaMsgs[0].user || sinaMsgs[0].sender;
                	// 是否当前用户
                	user.is_me = String(c_user.id) == String(user.id);
                    var userinfo_html = buildUserInfo(user);
                    $ul.prepend(userinfo_html);
                    resetScrollTop(m);
                }
            }else{
                hideReadMore(m, true);
            }
    	}
        hideLoading();
        checkShowGototop();
    });
};

// 获取用户收藏
var FAVORITE_HTML_CACHE = {};
function getFavorites(is_click){
	var c_user = getUser();
    if(!c_user){
        return;
    }
    var list = $("#favorites_timeline .list");
    var t = $("#tl_tabs .tab-favorites_timeline");
    var cursor = list.attr('cursor');
    var max_id = list.attr('max_id');
    var page = list.attr('page');
    var t = 'favorites';
    var user_cache = get_current_user_cache();
    var config = tapi.get_config(c_user);
    var support_cursor_only = config.support_cursor_only; // 只支持游标方式翻页
    if(!is_click) {
    	is_click = support_cursor_only ? !cursor : !page;
    }
    if(is_click) { // 点击或第一次加载
    	if(user_cache[t]) {
    		list.html(user_cache[t]);
    		return;
    	} else {
    		list.html('');
    		page = 1;
    	}
    }
    var params = {user: c_user, count: PAGE_SIZE};
    var support_cursor_only = config.support_cursor_only; // 只支持游标方式翻页
    var support_favorites_max_id = config.support_favorites_max_id; // 支持max_id方式翻页
    if(!is_click) {
    	if(support_cursor_only) {
    		if(cursor == '0') {
    			return;
    		}
    		if(cursor) {
    			params.cursor = cursor;
    		}
    	} else if(support_favorites_max_id) { // 163
    		if(max_id) {
    			params.max_id = max_id;
    		}
    	}
    	else {
    		if(page) {
    			params.page = page;
    		}
    	}
    }
    showLoading();
    hideReadMore(t);
    tapi[t](params, function(data, textStatus, statuCode){
    	if(c_user.uniqueKey != getUser().uniqueKey) {
    		return;
    	}
        if(textStatus != 'error' && data && !data.error){
        	var status = data.items || data;
        	if(data.next_cursor >= 0) {
        		list.attr('cursor', data.next_cursor);
        	}
        	list.attr('page', Number(page) + 1);
        	status = addPageMsgs(status, t, true);
	        if(status.length > 0){
	        	var index = status.length - 1;
	        	list.attr('max_id', status[index].timestamp || status[index].id);
	            showReadMore(t);
	            user_cache[t] = list.html();
	        } else {
	            hideReadMore(t, true);
	        }
        } else {
        	showReadMore(t);
        }
    });
};

//获取时间线微博列表
//@t : 类型
function getSinaTimeline(t, notCheckNew){
    var _ul = $("#" + t + "_timeline ul.list");
    var c_user = getUser();
    var b_view = getBackgroundView();
    var data_type = t;
    if('direct_messages' == data_type) {
    	data_type = 'messages';
    }
    var cache = b_view.get_data_cache(data_type, c_user.uniqueKey);
    hideReadMoreLoading(t);
    if(cache && cache.length > 0){
        var msgs = cache.slice(0, PAGE_SIZE);
        var htmls = [];
        var ids = [];
        htmls = buildStatusHtml(msgs, t);
        _ul.append(htmls.join(''));
        // 处理缩址
        ShortenUrl.expandAll();
        for(var i in msgs){
            var msg = msgs[i];
            ids.push(msg.id);
            if(msg.retweeted_status){
                ids.push(msg.retweeted_status.id);
                if(msg.retweeted_status.retweeted_status) {
                	ids.push(msg.retweeted_status.retweeted_status.id);
                }
            }else if(msg.status){
                ids.push(msg.status.id);
                if(msg.status.retweeted_status) {
                	ids.push(msg.status.retweeted_status.id);
                }
            }
        }
        if(ids.length>0){
            if(ids.length > 100){
                var ids2 = ids.slice(0, 99);
                ids = ids.slice(99, ids.length);
                showCounts(t, ids2);
            }
            if(ids.length > 0) {
            	showCounts(t, ids);
            }
        }
        if(cache.length >= (PAGE_SIZE/2)) {
            showReadMore(t);
        }
    } else if(!notCheckNew){
    	showReadMoreLoading(t);
        b_view.checkTimeline(t);
    }
};

//显示评论数和回复数
function showCounts(t, ids){
	if(!ids || ids.length <= 0){
		return;
	}
    if(['direct_messages'].indexOf(t) >= 0){return;}

    var c_user = getUser();
    var config = tapi.get_config(c_user);
    if(!c_user || !config.support_counts){
        return;
    }
    /* 腾讯每次只能取30个id，腾讯的返回结果里面有，不用重新请求（不实时？）
    if(c_user.blogType == 'tqq' && ids.length > 30){
        var ids2 = ids.slice(30);
        ids = ids.slice(0, 30);
        showCounts(t, ids2);
    }
    */
    ids = ids.join(',');
    var data = {ids:ids, user:c_user};
    showLoading();
    tapi.counts(data, function(counts, textStatus){
    	hideLoading();
        if(textStatus != 'error' && counts && !counts.error){
            if(counts.length && counts.length>0){
                for(var i in counts){
                    $('#'+ t +'_timeline .showCounts_'+counts[i].id).each(function(){
                        var _li = $(this);
                        var _edit = _li.find('.edit:eq(0)');
                        if(_edit){
                        	if(config.support_repost_timeline) {
                        		_edit.find('.repostCounts a').html(counts[i].rt);
                        	} else {
                        		_edit.find('.repostCounts').html('('+ counts[i].rt +')');
                        	}
                            var _comm_txt = '(0)';
                            if(counts[i].comments > 0){
                                _comm_txt = '(<a href="javascript:void(0);" title="'+ _u.i18n("comm_show_comments") +'" timeline_type="comment" onclick="showComments(this,' + counts[i].id + ');">' +counts[i].comments + '</a>)';
                            }
                            _edit.find('.commentCounts').html(_comm_txt);
                        }
                    });
                }
            }
        }
    });
}//<<<<<===========

//======>>>>>>> 查看评论 / 转发列表 <<<<<<<
//@ele: 触发该事件的元素, 如果ele的timeline_type == 'repost'，则代表是转发列表
//@tweetId: 微博ID
//@page: 分页
//@notHide: 不要隐藏评论列表
function showComments(ele, tweetId, page, notHide){
	if(!tweetId) {
		return;
	}
	var $ele = $(ele);
	// 获取status的screen_name
	var $user_info = $ele.parents('.userName').find('a:first');
	var screen_name = $user_info.attr('user_screen_name');
	var user_id = $user_info.attr('user_id');
    var comment_p = $ele.closest('.commentWrap');
    var commentWrap = comment_p.children('.comments');
    var $comment_list = commentWrap.children('.comment_list');
    var current_type = comment_p.attr('timeline_type') || 'comment';
	var timeline_type = $ele.attr('timeline_type') || current_type;
    if(current_type != timeline_type) {
    	// 切换，清空目前的数据
    	commentWrap.hide();
    	$comment_list.html('');
    	comment_p.attr('timeline_type', timeline_type);
    }
    if(!notHide && commentWrap.css('display') != 'none'){
        commentWrap.hide();
        return;
    } else if(!notHide && $comment_list.html()){
        commentWrap.show();
        return;
    }
    var hide_btn_text = timeline_type == 'comment' ? 
    	_u.i18n("btn_hide_comments") : _u.i18n("btn_hide_repost_timeline");
    commentWrap.find('.comment_hide_list_btn').html(hide_btn_text);
    showLoading();
    var user = getUser();
    var params = {id:tweetId, count:COMMENT_PAGE_SIZE, user:user};
    if(page) {
    	params.page = page;
    } else {
    	page = 1;
    }
    var method = timeline_type == 'comment' ? 'comments' : 'repost_timeline';
    tapi[method](params, function(data, textStatus){
    	data = data || {};
    	var comments = data.items || data;
        if(comments){
            if(comments.length && comments.length>0){
                var _html = [];
                for(var i in comments){
                    _html.push(buildComment(comments[i], tweetId, screen_name, user_id, timeline_type));
                }
                $comment_list.html(_html.join(''));
                commentWrap.show();
                // 如果明确显示没有下一页，则不显示分页按钮
                if(data.has_next !== false) {
                	if(page < 2){
                        commentWrap.find('.comment_paging a:eq(0)').hide();
                    }else{
                        commentWrap.find('.comment_paging a:eq(0)').show();
                    }
                    if(comments.length < COMMENT_PAGE_SIZE){
                        commentWrap.find('.comment_paging a:eq(1)').hide();
                    }else{
                        commentWrap.find('.comment_paging a:eq(1)').show();
                    }
                    commentWrap.find('.comment_paging').attr('page',page).show();
                }
                if(data.comment_count) {
                	$ele.html(data.comment_count);
                }
            }else{
                if(page==1){
                    commentWrap.find('.comment_paging').hide();
                }else{
                    commentWrap.find('.comment_paging a:eq(1)').hide();
                }
            }
        }
        if(!comments || !comments.length){
        	$ele.parent().html('(0)');
        }
        hideLoading();
    });
};

var showRepostTimeline = showComments;

function commentPage(ele, tweetId, is_pre){
    var $this = $(ele);
    var page_wrap = $this.parent();
    var page = Number(page_wrap.attr('page'));
    if(isNaN(page)){
    	page = 1;
    }
    if(page == 1 && is_pre){
        $this.hide();
        return;
    }
    page = is_pre ? page - 1 : page + 1;
    page_wrap.hide();
    showComments(ele, tweetId, page, true);
}

//<<<<<<<<<<<======

//======>>>>>>> 更多(分页) <<<<<<<
var CAN_SCROLL_PAGING = {};
//有分页
function showReadMore(t){
    CAN_SCROLL_PAGING[t] = true;

    hideReadMoreLoading(t);
};
//正在获取分页或者没有分页内容了
//@nomore: 没有分页内容了
function hideReadMore(t, nomore){
    CAN_SCROLL_PAGING[t] = false;

    if(!nomore){
        showReadMoreLoading(t);
    }else{
        hideReadMoreLoading(t);
    }
};
//是否可以分页
function isCanReadMore(t){
    //$("#" + t + "ReadMore").hide();
    return CAN_SCROLL_PAGING[t] || false;
};
//显示获取分页loading
function showReadMoreLoading(t){
	if(t == 'friends') {
		t = 'followers';
	}
    $("#" + t + "_rm_loading").show();
    $("#" + t + '_timeline .list_warp').scrollTop(100000); //底部
};
//隐藏获取分页loading
function hideReadMoreLoading(t){
	if(t == 'friends') {
		t = 'followers';
	}
    $("#" + t + "_rm_loading").hide();
};

function getCurrentTab() {
	var c_t = window.currentTab;
    if(c_t == 'followers' || c_t == 'friends') {
    	c_t = '#followers_timeline';
    }
    return c_t;
}

function scrollPaging(){
    var c_t = window.currentTab;
    var tl = c_t.replace('#','').replace(/_timeline$/i,'');
    if(!isCanReadMore(tl)){
        //hideReadMore(tl, true);
        return;
    }
    var is_followers_tab = false;
    c_t = getCurrentTab();
    var h = $(c_t + ' .list')[0].scrollHeight;
    var list_warp = $(c_t + ' .list_warp');
    h = h - list_warp.height();
    if(list_warp.scrollTop() >= h){
//    	log('scroll ' + tl);
        if(c_t == '#followers_timeline'){ //粉丝列表特殊处理
            readMoreFans();
        } else if(tl == 'favorites') {
        	getFavorites();
        } else if(tl == 'user_timeline') {
        	var $tab = $("#tl_tabs .tab-user_timeline");
        	if($tab.attr('statusType') == 'search') {
        		Search.search(true);
        	} else {
        		getUserTimeline(null, null, true);
        	}
        } else {
            readMore(tl);
        }
    }
};

function initScrollPaging(){
    $(".list_warp").scroll(function(e){
    	if($(this).attr('scrolling')) {
    		return;
    	}
    	$(this).attr('scrolling', true);
        scrollPaging();
        checkShowGototop();
        $(this).removeAttr('scrolling');
    });
};

//检查是否需要显示返回顶部按钮
function checkShowGototop(){
    var c_t = getCurrentTab();
    var list_warp = $(c_t + ' .list_warp');
    if(list_warp.scrollTop() > 200){
        $("#gototop").show();
    }else{
        $("#gototop").hide();
    }
};

function setScrollTotop(){
    var c_t = getCurrentTab();
    var list_warp = $(c_t + ' .list_warp');
    list_warp.scrollTop(0);
};

function readMoreFans(){
    _getFansList(null, true);
};

function readMore(t){
    hideReadMore(t);
    var moreEle = $("#" + t + "ReadMore");
    showLoading();
    var _b_view = getBackgroundView();
    var c_user = getUser();
    var data_type = t;
    if(data_type == 'direct_messages') {
    	data_type = 'messages';
    }
    var cache = _b_view.get_data_cache(data_type, c_user.uniqueKey);
    var timeline_offset = getTimelineOffset(t);
    //tab上如果有未读数，则需要加上
    var unread_count = $("#tl_tabs li.tab-" + t + " .unreadCount").html();
    unread_count = Number(unread_count);
    unread_count = isNaN(unread_count) ? 0 : unread_count;
    if(!cache || (timeline_offset + unread_count) >= cache.length) {
        _b_view.getTimelinePage(c_user.uniqueKey, t);
    } else {
        var msgs = cache.slice(timeline_offset, timeline_offset + PAGE_SIZE);
        addPageMsgs(msgs, t, true);
        showReadMore(t);
    }
};

/************
 * 给BG调用的。
 * 如果当前tab是激活的，就返回true，否则返回false(即为未读). 
 * 修改：根据用户设置是否自动提示新消息来返回true or false
 * */
function addTimelineMsgs(msgs, t, user_uniqueKey){
    var c_user = getUser();
    if(!user_uniqueKey){
        user_uniqueKey = c_user.uniqueKey;
    }
    //不是当前用户
    if(c_user.uniqueKey != user_uniqueKey){
        return false;
    }

    var li = $('.tab-' + t);
    var _ul = $("#" + t + "_timeline ul.list");
    
    var unread = getUnreadTimelineCount(t);
    for(var i=0; i<msgs.length; i++){
        var _msg_user = msgs[i].user || msgs[i].sender;
        if(_msg_user && _msg_user.id != c_user.id){
        	unread += 1;
        }
    }
    if(!li.hasClass('active')) {
        //清空，让下次点tab的时候重新取
    	_ul.html('');
    	if(unread > 0){
            li.find('.unreadCount').html(unread);
            //li.find('.unreadCount').html('(' + unread + ')');
            updateDockUserUnreadCount(user_uniqueKey);
        }
        return false;
    } else {
    	if(getAutoInsertMode() === 'notautoinsert') {
    	    if(unread > 0){
                li.find('.unreadCount').html(unread);
    	    }
    	    return false;
    	} else {
    	    addPageMsgs(msgs, t, false);
    	    return true;
    	}
    }
    return false;
};

// 添加分页数据，并且自动删除重复的数据，返回删除重复的数据集
function addPageMsgs(msgs, t, append, data_type){
	msgs = msgs || [];
	if(msgs.length == 0){
		return msgs;
	}
	if(t == 'sent_direct_messages') {
		t = 'direct_messages';
	}
	data_type = data_type || 'status';
    var _ul = $("#" + t + "_timeline ul.list"), htmls = [];
    var method = append ? 'append' : 'prepend';
    var direct = append ? 'last' : 'first';
    var $last_item = $("#" + t + "_timeline ul.list li.tweetItem:" + direct);
    var max_id = $last_item.attr('did');
    var result = filterDatasByMaxId(msgs, max_id, append);
    msgs = result.news;

    htmls = data_type == 'status' ? buildStatusHtml(msgs, t) : buildUsersHtml(msgs, t);
    _ul[method](htmls.join(''));
    // 处理缩址
    ShortenUrl.expandAll();
    var ids = [];
    if(t != 'direct_messages') {
	    for(var i=0; i<msgs.length; i++){
	    	var status = msgs[i];
	    	var retweeted_status = status.retweeted_status || status.status;
        	ids.push(status.id);
            if(retweeted_status){
                ids.push(retweeted_status.id);
                if(retweeted_status.retweeted_status) {
                	ids.push(retweeted_status.retweeted_status.id);
                }
            }
	    }
    }
    if(ids.length > 0) {
        if(ids.length > 100) {
            var ids2 = ids.slice(0, 99);
            ids = ids.slice(99, ids.length);
            showCounts(t, ids2);
        }
        showCounts(t, ids);
    }
    var h_old = _ul.height();
    //hold住当前阅读位置
    var list_warp = $("#" + t + '_timeline .list_warp');
    var st_old = list_warp.scrollTop();
    if(!append && st_old > 50){ //大于50才做处理，否则不重新定位(顶部用户可能想直接看到最新的微博)
        var h_new = _ul.height();
        list_warp.scrollTop(h_new - h_old + st_old);
    }
    return msgs;
};

//发送 @回复
function sendReplyMsg(msg){
    var btn = $("#replySubmit"),
        txt = $("#replyTextarea"),
        screen_name = $("#ye_dialog_title").text();
    var user = getUser();
    var config = tapi.get_config(user);
    var tweetId = $("#replyTweetId").val();
    // 判断是否需要填充 @screen_name
    if(config.reply_dont_need_at_screen_name !== true || !tweetId) {
    	if(config.rt_at_name) {
    		// 需要使用name替代screen_name
    		msg = '@' + $('#replyUserName').val() + ' ' + msg;
    	} else {
    		msg = screen_name + ' ' + msg;
    	}
    }
    if(tweetId) {
    	data = {sina_id: tweetId}; // @回复
    } else {
    	data = {};
    }
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    data['status'] = msg;
    
    data['user'] = user;
    tapi.update(data, function(sinaMsg, textStatus){
        if(sinaMsg.id){
            hideReplyInput();
            txt.val('');
            setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
            showMsg(screen_name + ' ' + _u.i18n("comm_success"));
        }else if(sinaMsg.error){
//            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });
};

//发送微博
function sendMsg(msg){
    var btn = $("#btnSend"),
        txt = $("#txtContent");
        
    
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    
    var users = [], selLi = $("#accountsForSend .sel");
    if(selLi.length){
        selLi.each(function(){
            var uniqueKey = $(this).attr('uniqueKey');
            var _user = getUserByUniqueKey(uniqueKey, 'send');
            if(_user){
                users.push(_user);
            }
        });
    }else if(!$("#accountsForSend li").length){
        users.push(getUser());
    }else{
        showMsg(_u.i18n("msg_need_select_account"));
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
        return;
    }
    var stat = {};
    stat.userCount = users.length;
    stat.sendedCount = 0;
    stat.successCount = 0;
    for(var i in users){
        _sendMsgWraper(msg, users[i], stat, selLi);
    }
};

function _sendMsgWraper(msg, user, stat, selLi){
    var data = {};
    data['status'] = msg; //放到这里重置一下，否则会被编码两次
    data['user'] = user;
    tapi.update(data, function(sinaMsg, textStatus){
        stat.sendedCount++;
        if(sinaMsg === true || sinaMsg.id){
            stat.successCount++;
            $("#accountsForSend li[uniquekey=" + user.uniqueKey +"]").removeClass('sel');
        }else if(sinaMsg.error){
//            showMsg('error: ' + sinaMsg.error);
        }
        if(stat.successCount >= stat.userCount){//全部发送成功
            hideMsgInput();
            selLi.addClass('sel');
            $("#txtContent").val('');
            showMsg(_u.i18n("msg_send_success"));
        }
        if(stat.sendedCount >= stat.userCount){//全部发送完成
            selLi = null;
            $("#btnSend").removeAttr('disabled');
            $("#txtContent").removeAttr('disabled');
            if(stat.successCount > 0){ //有发送成功的
                setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
                var failCount = stat.userCount - stat.successCount;
                if(stat.userCount > 1 && failCount > 0){ //多个用户，并且有发送失败才显示
                    showMsg(_u.i18n("msg_send_complete").format({successCount:stat.successCount, errorCount:failCount}));
                }
            }
        }
        user = null;
        stat = null;
    });
};

// 发生私信
function sendWhisper(msg){
    var btn = $("#replySubmit");
    var txt = $("#replyTextarea");
    var toUserId = $('#whisperToUserId').val();
    var data = {text: msg, id: toUserId};
    var user = getUser();
    data['user'] = user;
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    if(user.blogType == 't163') {
    	// 163只需要用户
    	data.id = $('#replyUserName').val();
    }
    tapi.new_message(data, function(sinaMsg, textStatus){
        if(sinaMsg === true || sinaMsg.id){
            hideReplyInput();
            txt.val('');
            showMsg(_u.i18n("msg_send_success"));
        } else if (sinaMsg.error){
//            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });
};

function sendRepost(msg, repostTweetId, notSendMord){
    var btn, txt, data;
    btn = $("#replySubmit");
    txt = $("#replyTextarea");
    repostTweetId = repostTweetId || $('#repostTweetId').val();
    data = {status: msg, id:repostTweetId};
    var user = getUser();
    var config = tapi.get_config(user);
    data.user = user;
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    // 处理是否评论
    if(!notSendMord){
        if($('#chk_sendOneMore').attr("checked") && $('#chk_sendOneMore').val()){ //同时给XXX评论
            if(config.support_repost_comment) {
            	data.is_comment = 1;
            } else {
            	sendComment(msg, $('#chk_sendOneMore').val(), true);
            }
        }
        if($('#chk_sendOneMore2').attr("checked") && $('#chk_sendOneMore2').val()){ //同时给原作者 XXX评论
        	if(config.support_repost_comment_to_root) {
        		data.is_comment_to_root = 1;
        	} else {
        		sendComment(msg + '.', $('#chk_sendOneMore2').val(), true);
        	}
        }
    }
    tapi.repost(data, function(status, textStatus){
        if(status && (status.id || status.retweeted_status.id) ){
            hideReplyInput();
            txt.val('');
            setTimeout(callCheckNewMsg, 1000, 'friends_timeline');
            showMsg(_u.i18n("msg_repost_success"));
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });

//    if(!notSendMord){
//        if($('#chk_sendOneMore').attr("checked") && $('#chk_sendOneMore').val()){ //同时给XXX评论
//            sendComment(msg, $('#chk_sendOneMore').val(), true);
//        }
//        if($('#chk_sendOneMore2').attr("checked") && $('#chk_sendOneMore2').val()){ //同时给原作者 XXX评论
//            sendComment(msg, $('#chk_sendOneMore2').val(), true);
//        }
//    }
};

function sendComment(msg, comment_id, notSendMord){
    var btn, txt, cid, data, user_id;
    btn = $("#replySubmit");
    txt = $("#replyTextarea");
    cid = $('#commentCommentId').val();
    user_id = $('#commentUserId').val();
    comment_id = comment_id || $('#commentTweetId').val();
    data = {comment: msg, id: comment_id};
    var user = getUser();
    // 判断评论是否需要用到原微博的id
    if(tapi.get_config(user).comment_need_user_id) {
    	data.user_id = user_id;
    }
    data['user'] = user;
    btn.attr('disabled','true');
    txt.attr('disabled','true');
    var m = 'comment';
    if(cid){ //如果是回复别人的微博
    	m = 'reply';
    	data.cid = cid;
        data.comment = data.comment.replace(_u.i18n("msg_comment_reply_default").format({username:$('#replyUserName').val()}), '');
    	var reply_user_id = $('#replyUserId').val();
    	data.reply_user_id = reply_user_id;
    } 
    tapi[m](data, function(sinaMsg, textStatus){
        if(sinaMsg === true || sinaMsg.id){
            hideReplyInput();
            txt.val('');
            showMsg(_u.i18n("msg_comment_success"));
        }else if(sinaMsg.error){
//            showMsg('error: ' + sinaMsg.error);
        }
        btn.removeAttr('disabled');
        txt.removeAttr('disabled');
    });

    if(!notSendMord){
        if($('#chk_sendOneMore').attr("checked") && $('#chk_sendOneMore').val()){
            sendRepost(msg, $('#chk_sendOneMore').val(), true);
        }
    }
};

function callCheckNewMsg(t, uniqueKey){
    var b_view = getBackgroundView();
    if(b_view){
        b_view.checkNewMsg(t, uniqueKey);
    }
}

function showMsgInput(){
    initSelectSendAccounts();
    var h_submitWrap = $("#submitWarp .w").height();
    var h = window.innerHeight - 70 - h_submitWrap;
    $(".list_warp").css('height', h);
    $("#submitWarp").data('status', 'show').css('height', h_submitWrap);
    var _txt = $("#txtContent").val();
    $("#txtContent").focus().val('').val(_txt); //光标在最后面
    countInputText();
    $("#header .write").addClass('active').find('b').addClass('up');
    $("#doing").appendTo('#doingWarp');
};

function hideMsgInput(){
    fawave.face.hide();
    var h = window.innerHeight - 70;
    $(".list_warp").css('height', h);
    $("#submitWarp").data('status', 'hide').css('height', 0);
    $("#header .write").removeClass('active').find('b').removeClass('up');
    $("#doing").prependTo('#tl_tabs .btns');
};

function toogleMsgInput(ele){
    if($("#submitWarp").data('status') != 'show'){
        showMsgInput();
    }else{
        hideMsgInput();
    }
};

function hideReplyInput(){
    fawave.face.hide();
    $("#ye_dialog_window").hide();
    // 清空旧数据
    $('#ye_dialog_window input[type="hidden"]').val('');
    $('#ye_dialog_window input[type="checkbox"]').val('');
};

function resizeFawave(w, h){
    if(!w){
        w = window.innerWidth;
    }
    if(!h){
        h = window.innerHeight;
    }
    var wh_css = '#wrapper{width:'+ w +'px;}'
                   + '#txtContent{width:'+ (w-2) +'px;}'
				   + '.warp{width:' + w + 'px;} .list_warp{height:' + (h-70) + 'px;}'
                   + '#pb_map_canvas, #popup_box .image img, #popup_box .image canvas{max-width:'+ (w-20) +'px;}';
	$("#styleCustomResize").html(wh_css);
};

//====>>>>>>>>>>>>>>>
function doReply(ele, screen_name, tweetId, name){//@回复
    $('#actionType').val('reply');
    $('#replyTweetId').val(tweetId || '');
    $('#replyUserName').val(name);
    $('#ye_dialog_title').html('@' + screen_name);

    $('#chk_sendOneMore').attr("checked", false).val('').hide();
    $('#txt_sendOneMore').text('').hide();
    $('#chk_sendOneMore2').attr("checked", false).val('').hide();
    $('#txt_sendOneMore2').text('').hide();

    $('#ye_dialog_window').show();
    $('#replyTextarea').val('').focus();
    countReplyText();
};

/*
    @ele: 触发该事件的元素
    @userName: 当前微博的用户名
    @tweetId: 微博的id
    @rtUserName: 转发微博的用户名
    @reTweetId: 转发的微薄id
*/
function doRepost(ele, userName, tweetId, rtUserName, reTweetId){//转发
	var user = getUser();
    var config = tapi.get_config(user);
    $('#actionType').val('repost');
    $('#repostTweetId').val(tweetId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html(_u.i18n("msg_repost_who").format({username:userName}));
    if(config.support_comment) {
    	$('#chk_sendOneMore').attr("checked", false).val(tweetId).show();
        $('#txt_sendOneMore').text(_u.i18n("msg_comment_too").format({username:userName})).show();
    } else { // 不支持repost，则屏蔽
    	$('#chk_sendOneMore').attr("checked", false).val('').hide();
        $('#txt_sendOneMore').text('').hide();
    }
    if(config.support_comment &&
    		rtUserName && rtUserName != userName && reTweetId) {
        $('#chk_sendOneMore2').attr("checked", false).val(reTweetId).show();
        $('#txt_sendOneMore2').text(_u.i18n("msg_comment_original_too").format({username:rtUserName})).show();
    }else{
        $('#chk_sendOneMore2').attr("checked", false).val('').hide();
        $('#txt_sendOneMore2').text('').hide();
    }

    $('#ye_dialog_window').show();
    var d = $(ele).closest('li').find('.msgObjJson').text();
    try{
        d = unescape(d);
        d = JSON.parse(d);
    }
    catch(err){
        d = null;
    }
    var v = '';
    var $t = $('#replyTextarea');
    $t.focus().val('').blur();
    if(reTweetId && d && d.retweeted_status){
        if(user.blogType=='tqq'){
            var data = $(ele).closest('li').find('.msgObjJson').text();
            data = unescape(data);
            try{
                data = JSON.parse(data);
                userName = data.user.name || userName;
            }catch(err){
            }
        }
        v = config.repost_delimiter + '@' + userName + ':' + d.text;
    } else {
    	v = _u.i18n("comm_repost_default");
    }
	// 光标在前
	$t.val(v).focus();
    if(v== _u.i18n("comm_repost_default")){$t.select();}
    countReplyText();
};

/* 评论
 * cid:回复的评论ID
 */
function doComment(ele, userName, userId, tweetId, 
		replyUserName, replyUserId, cid){
    $('#actionType').val('comment');
    $('#commentTweetId').val(tweetId);
    $('#commentUserId').val(userId);
    $('#replyUserName').val(replyUserName);
    $('#replyUserId').val(replyUserId || '');
    $('#commentCommentId').val(cid||'');
    $('#ye_dialog_title').html(_u.i18n("msg_comment_who").format({username:userName}));
    $('#ye_dialog_window').show();
    var _txt = replyUserName ? (_u.i18n("msg_comment_reply_default").format({username:replyUserName})) : '';
    var user = getUser();
	var config = tapi.get_config(user);
	if(config.support_repost) { // 支持repost才显示
		$('#chk_sendOneMore').attr("checked", false).val(tweetId).show();
    	$('#txt_sendOneMore').text(_u.i18n("msg_repost_too")).show();
	} else {
		$('#chk_sendOneMore').val('').hide();
    	$('#txt_sendOneMore').text('').hide();
	}
    $('#chk_sendOneMore2').val('').hide();
    $('#txt_sendOneMore2').text('').hide();

    $('#replyTextarea').focus().val(_txt);
    countReplyText();
};

function doNewMessage(ele, userName, toUserId){//悄悄话
    $('#actionType').val('newmsg');
    $('#whisperToUserId').val(toUserId);
    $('#replyUserName').val(userName);
    $('#ye_dialog_title').html(_u.i18n("msg_direct_message_who").format({username:userName}));

    $('#chk_sendOneMore').attr("checked", false).val('').hide();
    $('#txt_sendOneMore').text('').hide();
    $('#chk_sendOneMore2').attr("checked", false).val('').hide();
    $('#txt_sendOneMore2').text('').hide();

    $('#ye_dialog_window').show();
    $('#replyTextarea').val('').focus();
    countReplyText();
};

function doRT(ele, is_rt, is_rt_rt){//RT
    var data = $(ele).closest('li').find('.msgObjJson').text();
    data = unescape(data);
    data = JSON.parse(data);
    var t = $("#txtContent");
    showMsgInput();
    t.val('').blur();
    if(is_rt) {
    	data = data.retweeted_status;
    } else if(is_rt_rt) {
    	data = data.retweeted_status.retweeted_status;
    }
    var _msg_user = data.user;
    var config = tapi.get_config(getUser());
    var repost_pre = config.repost_pre;
    var need_processMsg = config.need_processMsg;
    var val = need_processMsg ? data.text : htmlToText(data.text);
    var original_pic = data.original_pic;
    if(data.retweeted_status) {
    	if(data.retweeted_status.original_pic) {
    		original_pic = data.retweeted_status.original_pic;
    	}
    	var rt_name = config.rt_at_name ? 
    		(data.retweeted_status.user.name || data.retweeted_status.user.id) 
    		: data.retweeted_status.user.screen_name;
    	val += '//@' + rt_name + ':' + (need_processMsg ? data.retweeted_status.text 
    			: htmlToText(data.retweeted_status.text));
    	if(data.retweeted_status.retweeted_status) {
    		if(data.retweeted_status.retweeted_status.original_pic) {
        		original_pic = data.retweeted_status.retweeted_status.original_pic;
        	}
    		var rtrt_name = config.rt_at_name ? 
    	    		(data.retweeted_status.retweeted_status.user.name || data.retweeted_status.retweeted_status.user.id) 
    	    		: data.retweeted_status.retweeted_status.user.screen_name;
        	val += '//@' + rtrt_name + ':' + (need_processMsg ? 
        		data.retweeted_status.retweeted_status.text 
        		: htmlToText(data.retweeted_status.retweeted_status.text));
        }
    }
    var name = config.rt_at_name ? (_msg_user.name || _msg_user.id) : _msg_user.screen_name;
    val = repost_pre + ' ' + '@' + name + ' ' + val;
    if(original_pic) {
    	// 有图片，自动带上图片地址，并尝试缩短
			jQuery.get(original_pic);
    	var settings = Settings.get();
    	var longurl = original_pic;
    	val += config.image_shorturl_pre + longurl;
        _shortenUrl(longurl, settings, function(shorturl) {
        	if(shorturl){
                t.blur().val(t.val().replace(longurl, shorturl)).focus();
                countInputText();
            }
        });
    }
    if(data.crosspostSource) {
    	// 有原文url地址，并尝试缩短
//    	var settings = Settings.get();
    	var longurl = data.crosspostSource;
    	val += ' [原]' + longurl;
//        _shortenUrl(longurl, settings, function(shorturl) {
//        	if(shorturl){
//                t.blur().val(t.val().replace(longurl, shorturl)).focus();
//                countInputText();
//            }
//        });
    }
    t.val(val);
    t.focus(); //光标在头部
};

function _delCache(id, t, unique_key) {
	var cache_key = unique_key + t + '_tweets';
    var b_view = getBackgroundView();
    if(b_view && b_view.tweets[cache_key]){
        var cache = b_view.tweets[cache_key];
        id = String(id);
        for(var i in cache){
//        	if(String(cache[i]) == id){
            if(String(cache[i].id) == id){
                cache.splice(i, 1);
//                TweetStorage.removeItem(id);
                break;
            }
        }
    }
};

function doDelTweet(tweetId, ele){//删除自己的微博
    if(!tweetId){return;}
    showLoading();
    var user = getUser();
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    tapi.destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
        	$(ele).closest('li').remove();
            _delCache(tweetId, t, user.uniqueKey);
            showMsg(_u.i18n("msg_delete_success"));
        }else{
            showMsg(_u.i18n("msg_delete_fail"));
        }
    });
};
function doDelComment(ele, screen_name, tweetId){//删除评论
    if(!tweetId){return;}
    showLoading();
    var user = getUser();
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    tapi.comment_destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
        	$(ele).closest('li').remove();
            _delCache(tweetId, t, user.uniqueKey);
            showMsg(_u.i18n("msg_delete_success"));
        }else{
            showMsg(_u.i18n("msg_delete_fail"));
        }
    });
};
function delDirectMsg(ele, screen_name, tweetId){//删除私信
    if(!tweetId){return;}
    showLoading();
    var user = getUser();
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    tapi.destroy_msg({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
        	$(ele).closest('li').remove();
            _delCache(tweetId, t, user.uniqueKey);
            showMsg(_u.i18n("msg_delete_success"));
        }else{
            showMsg(_u.i18n("msg_delete_fail"));
        }
    });
};
function addFavorites(ele, screen_name, tweetId){//添加收藏
    if(!tweetId){return;}
    showLoading();
    var _a = $(ele);
    var _aHtml = _a[0].outerHTML;
    _a.hide();
    var user = getUser();
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    tapi.favorites_create({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            _a.after(_aHtml.replace('addFavorites','delFavorites')
                            .replace('favorites_2.gif','favorites.gif')
                            .replace(_u.i18n("btn_add_favorites_title"), _u.i18n("btn_del_favorites_title")));
            _a.remove();
//            var item = TweetStorage.getItems([tweetId], t, user.uniqueKey)[0];
//            item.favorited = True;
//            TweetStorage.setItems([item], t, user.uniqueKey);
            var cacheKey = user.uniqueKey + t + '_tweets';
            var b_view = getBackgroundView();
            if(b_view && b_view.tweets[cacheKey]){
                var cache = b_view.tweets[cacheKey];
                tweetId = String(tweetId);
                for(var i in cache){
                    if(cache[i].id == tweetId){
                        cache[i].favorited = true;
                        break;
                    }
                }
            }
            showMsg(_u.i18n("msg_add_favorites_success"));
        }else{
            showMsg(_u.i18n("msg_add_favorites_fail"));
            _a.show();
        }
    });
};
function delFavorites(ele, screen_name, tweetId){//删除收藏
    if(!tweetId){return;}
    showLoading();
    var _a = $(ele);
    var _aHtml = _a[0].outerHTML;
    _a.hide();
    var user = getUser();
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    tapi.favorites_destroy({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            _a.after(_aHtml.replace('delFavorites','addFavorites')
                            .replace('favorites.gif','favorites_2.gif')
                            .replace(_u.i18n("btn_del_favorites_title"), _u.i18n("btn_add_favorites_title")));
            _a.remove();
//            var item = TweetStorage.getItems([tweetId], t, user.uniqueKey)[0];
//            item.favorited = True;
//            TweetStorage.setItems([item], t, user.uniqueKey);
            var c_user = getUser();
            var cacheKey = c_user.uniqueKey + t + '_tweets';
            var b_view = getBackgroundView();
            if(b_view && b_view.tweets[cacheKey]){
                var cache = b_view.tweets[cacheKey];
                for(var i in cache){
                    if(cache[i].id == tweetId){
                        cache[i].favorited = false;
                        break;
                    }
                }
            }
            showMsg(_u.i18n("msg_del_favorites_success"));
        }else{
            showMsg(_u.i18n("msg_del_favorites_fail"));
            _a.show();
        }
    });
};

function sendOretweet(ele, screen_name, tweetId){//twitter锐推
    if(!tweetId){return;}
    showLoading();
    var _a = $(ele);
    var _aHtml = _a[0].outerHTML;
    _a.hide();
    var user = getUser();
    var t = getCurrentTab().replace('#','').replace(/_timeline$/i,'');
    var title = _a.attr('title');
    tapi.retweet({id:tweetId, user:user}, function(data, textStatus){
        if(textStatus != 'error' && data && !data.error){
            _a.removeAttr('onclick').attr('title', _u.i18n("comm_success")).show();
			if(_a.hasClass('ort')) {
				_a.addClass('orted');
			}
			if(_a.html()) {
				_a.html(_u.i18n("comm_has") + _a.html());
			}
            var c_user = getUser();
            var cacheKey = c_user.uniqueKey + t + '_tweets';
            var b_view = getBackgroundView();
            if(b_view && b_view.tweets[cacheKey]){
                var cache = b_view.tweets[cacheKey];
                for(var i in cache){
                    if(cache[i].id == tweetId){
                        cache[i].retweeted = true;
                        break;
                    }else if(cache[i].retweeted_status && cache[i].retweeted_status.id == tweetId){
                        cache[i].retweeted_status.retweeted = true;
                        break;
                    }
                }
            }

            showMsg(title + _u.i18n("comm_success"));
        }else{
            showMsg(title + _u.i18n("comm_fail"));
            _a.show();
        }
    });
};
//<<<<<<<<<<<<<=====

//查看图片
function showFacebox(ele){
    var _t = $(ele);
    if(!_t.find('.img_loading').length){
        _t.append('<img class="img_loading" src="images/loading.gif" />');
    }else{
        _t.find('.img_loading').show();
    }
    popupBox.showImg(_t.attr('bmiddle'), _t.attr('original'), function(){
        _t.find('.img_loading').hide();
    });
};

//显示地图
function showGeoMap(user_img, latitude, longitude){
    if(google && google.maps){
        popupBox.showMap(user_img, latitude, longitude);
    }else{
        showMsg(_u.i18n("msg_loading_map"));
    }
};

//====>>>>
//打开上传图片窗口
function openUploadImage(){
    initOnUnload();
    var l = (window.screen.availWidth-510)/2;
    window.open('upimage.html', '_blank', 'left=' + l + ',top=30,width=510,height=600,menubar=no,location=no,resizable=no,scrollbars=yes,status=yes');
};
//<<<<=====

//====>>>>
//在新窗口打开popup页
function openPopupInNewWin(){
    initOnUnload();
    /*
    if(getNewWinPopupView()){
        getNewWinPopupView().blur();
        getNewWinPopupView().focus();
        return;
    } */
    var W = Settings.get().popupWidth, H = Settings.get().popupHeight;
    var l = (window.screen.availWidth-W)/2;
    window.theViewName = 'not_popup';
    getBackgroundView().new_win_popup.window = window.open('popup.html?is_new_win=true', 'FaWave', 'left=' + l + ',top=30,width=' + W + ',height=' + (H+10) + ',menubar=no,location=no,resizable=no,scrollbars=yes,status=yes');
};

//====>>>>
//新消息提示模式：提示模式、免打扰模式
function changeAlertMode(to_mode){
    var btn = $("#btnAlertMode");
    if(!to_mode){
        var mode = btn.attr('mode');
        to_mode = (mode == 'alert') ? 'dnd' : 'alert';
    }
    setAlertMode(to_mode);
    var tip = (to_mode=='alert') ? _u.i18n("btn_alert_mode_title") : _u.i18n("btn_dnd_mode_title");
    btn.attr('mode', to_mode).attr('title', tip).find('img').attr('src', 'images/' + to_mode + '_mode.png');
    setUnreadTimelineCount(0, 'friends_timeline');
};

//====>>>>
//新消息是否自动插入：自动插入、仅提示新消息数
function changeAutoInsertMode(to_mode){
    var btn = $("#btnAutoInsert");
    if(!to_mode){
        var mode = btn.attr('mode');
        to_mode = (mode == 'notautoinsert') ? 'autoinsert' : 'notautoinsert';
    }
    setAutoInsertMode(to_mode);
    var tip = (to_mode=='notautoinsert') ? _u.i18n("btn_not_auto_insert_title") : _u.i18n("btn_auto_insert_title");
    btn.attr('mode', to_mode).attr('title', tip).find('img').attr('src', 'images/' + to_mode + '.png');
};

//====>>>>
//表情添加
fawave.face = {
    show: function(ele, target_id){
        var f = $("#face_box");
        if(f.css('display') == 'none' || $("#face_box_target_id").val() != target_id) {
        	// 初始化表情
        	if($('#face_box .faceItemPicbg .face_icons').length == 0) {
        		// FACE_TYPES   [typename, faces, url_pre, tpl, type_title]
        		for(var i=0; i<FACE_TYPES.length; i++) {
        			var face_type = FACE_TYPES[i];
        			var $face_tab = $('<span face_type="' + face_type[0] + '">' + face_type[4] + '</span>');
        			$face_tab.click(function(){
        				if(!$(this).hasClass('active')) {
        					$('.face_tab span').removeClass('active');
            				$('#face_box .faceItemPicbg .face_icons').hide();
            				$('#face_box .faceItemPicbg .' + $(this).attr('face_type') + '_faces').show();
            				$(this).addClass('active');
        				}
        			});
        			var $face_icons = $('<div style="display:none;" class="face_icons ' + face_type[0] + '_faces"></div>');
//        			if(current_blogtype == face_type[0]) {
//        				$face_tab.addClass('active');
//        				$face_icons.show();
//        			}
        			$('#face_box .face_tab p').append($face_tab);
            		$('#face_box .faceItemPicbg').append($face_icons);
            		var exists = {};
            		$('#face_icons li a').each(function() {
            			exists[$(this).attr('title')] = true;
            		});
            		var face_tpl = face_type[3];
            		var tpl = '<li><a href="javascript:void(0)" onclick="fawave.face.insert(this)"' 
            			+ ' value="' + face_tpl + '" title="{{name}}"><img src="{{url}}" alt="{{name}}"></a></li>';
            		var faces = face_type[1], url_pre = face_type[2];
            		for(var name in faces) {
            			if(exists[name]) continue;
            			$face_icons.append(tpl.format({'name': name, 'url': url_pre + faces[name]}));
            			exists[name] = true;
            		}
        		}
        	}
        	var current_blogtype = getUser().blogType;
        	$('#face_box .face_tab span[face_type="' + current_blogtype + '"]').click();
            $("#face_box_target_id").val(target_id);
            var offset = $(ele).offset();
            f.css({top: offset.top+20, left: offset.left}).show();
        }else{
            f.hide();
        }
    },
    hide: function(){
        $("#face_box").hide();
        $("#face_box_target_id").val('');
    },
    insert: function(ele){
        var target_textbox = $("#" + $("#face_box_target_id").val());
        if(target_textbox.length==1){
            var tb = target_textbox[0], str = $(ele).attr('value');
            var newstart = tb.selectionStart+str.length;
            tb.value=tb.value.substr(0,tb.selectionStart)+str+tb.value.substring(tb.selectionEnd);
            tb.selectionStart = newstart;
            tb.selectionEnd = newstart;
        }
        this.hide();
    }
};

function rOpenPic(event, ele){
    if(event.button == 2){ //右键点击直接打开原图
        var url = $.trim($(ele).attr('original'));
        if(url){
            chrome.tabs.create({url:url, selected:isNewTabSelected});
        }
    }
};

//平滑滚动
/*
 t: current time（当前时间）；
 b: beginning value（初始值）；
 c: change in value（变化量）；
 d: duration（持续时间）。
*/
var SmoothScroller = {
    T: '', //setTimeout引用
    c_t: '', //当前tab
    list_warp: '',
    list_warp_height: 0, //当前的列表窗口高度
    ease_type: 'easeOut',
    tween_type: 'Quad',
    status:{t:0, b:0, c:0, d:0},
    resetStatus: function(){
        SmoothScroller.status.t = 0;
        SmoothScroller.status.b = 0;
        SmoothScroller.status.c = 0;
        SmoothScroller.status.d = 0;
    },
    start: function(e){
        if(e.wheelDelta == 0){ return; }
        clearTimeout(this.T);
        e.preventDefault();
        this.c_t = getCurrentTab();
        this.list_warp = $(this.c_t + ' .list_warp');
        this.list_warp_height = this.list_warp.height(); //算好放缓存，免得每次都要算
        this.ease_type = Settings.get().smoothSeaeType;
        this.tween_type = Settings.get().smoothTweenType;
        var hasDo = this.status.t>0 ? (Math.ceil(Tween[this.tween_type][this.ease_type](this.status.t-1, this.status.b, this.status.c, this.status.d)) - this.status.b) : 0;
        this.status.c = -e.wheelDelta + this.status.c - hasDo; 
        this.status.d = (this.status.d/2) - (this.status.t/2) + 13;
        this.status.t = 0;
        this.status.b = this.list_warp.scrollTop();
        if(this.status.b <= 0 && this.status.c < 0){//在顶部还往上滚动，直接无视
            this.resetStatus();
            return;
        } 
        this.run();
    },
    run: function(){
        var _t = SmoothScroller;
        var _top = Math.ceil(Tween[_t.tween_type][_t.ease_type](_t.status.t, _t.status.b, _t.status.c, _t.status.d));
        _t.list_warp.scrollTop( _top );
        //var h = $(_t.c_t + ' .list').height();
        var h = $(_t.c_t + ' .list')[0].scrollHeight;
        h = h - _t.list_warp_height;
        if(_top >= h && _t.status.c > 0){
            _t.resetStatus();
            return;
        }
        if(_t.status.t < _t.status.d){
            _t.status.t++; _t.T = setTimeout(_t.run, 10);
        }
    }
};

$(function(){
    if(Settings.get().isSmoothScroller){
        $('.list_warp').bind('mousewheel', function(e){
            SmoothScroller.start(e);
        });
    }
});// <<=== 平滑滚动结束

//强制刷新
function forceRefresh(ele){
    $(ele).attr('disabled', true).fadeOut();
    var bg = getBackgroundView();
    var user = getUser();
    bg.RefreshManager.refreshUser(user);
    setTimeout(showRefreshBtn, 10*1000);
};
function showRefreshBtn(){
    $("#btnForceRefresh").attr('disabled', true).fadeIn();
};// <<=== 强制刷新结束

function _showLoading(){
    $("#loading").show();
};

function _hideLoading(){
    $("#loading").hide();
};

// 翻译
function translate(ele) {
	var $ele = $(ele).parents('.userName').next();
	if(!$ele.hasClass('tweet_text')) {
		$ele = $ele.find('.tweet_text');
	}
	$(ele).hide();
	var settings = Settings.get();
	var target = settings.translate_target;
	tapi.translate(getUser(), $ele.html(), target, function(translatedText) {
		if(translatedText) {
			$ele.after('<hr /><div class="tweet_text_old">' + translatedText + '</div>');
		}
	});
};

// read later
function read_later(ele) {
	var $button = $(ele);
	$button.hide();
	var $ele = $(ele).parents('.userName').next();
	var $datelink = $ele.nextAll('.msgInfo:first').find('a:first');
	if(!$ele.hasClass('tweet_text')) {
		$ele = $ele.find('.tweet_text');
	}
	var $link = $ele.find('a:first');
	if($link.length == 0) {
		_showMsg("No URL");
	} else {
		var url = $link.attr('rhref') || $link.attr('href');
		var title = $link.attr('flash_title');
		var selection = $ele.text() + ' ' + $datelink.attr('href');
		var data = {url: url, selection: selection};
		if(title) {
			data.title = title;
		}
		var user = Settings.get().instapaper_user;
		Instapaper.add(user, data, function(success, error, xhr){
			if(success) {
				_showMsg(_u.i18n("msg_save_success"));
			} else {
				_showMsg('Read later fail.');
				$button.show();
			}
		});
	}
};

// AD
function adShow(){
    var ad = getBackgroundView().ADs.getNext();
    if(ad){
        $("#topAd").html('<a href="{{url}}" target="_blank" title="{{title}}">{{title}}</a>'.format(ad));
    }
};
