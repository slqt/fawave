// @author qleelulu@gmail.com

window._settings = Settings.init(); //载入设置

Settings.get = function(){ return window._settings; }; //重写get，直接返回，不用再获取background view

var tweets = {}, 
    new_win_popup = Object(),
    MAX_MSG_ID = {},
    LAST_PAGES = {};
var SHORT_URLS = {};

window.checking={}; //正在检查是否有最新微博
window.paging={}; //正在获取分页微博


function _format_data_key(data_type, end_str, user_uniquekey) {
	if(!user_uniquekey){
		user_uniquekey = getUser().uniqueKey;
    }
	return user_uniquekey + data_type + end_str;
};

/**
 * 获取指定数据类型的本地缓存
 *
 * @param {String}user_uniqueKey
 * @param {String}data_type, like friends_timeline, mentions and os on.
 *  See utili.js / T_LIST.all define.
 * @return {Array}
 * @api public
 */
function get_data_cache(data_type, user_uniquekey) {
	var key = _format_data_key(data_type, '_tweets', user_uniquekey);
	return tweets[key];
};

function set_data_cache(cache, data_type, user_uniquekey) {
	var key = _format_data_key(data_type, '_tweets', user_uniquekey);
	tweets[key] = cache;
};

/**
 * 获取本地数据中最后一条记录的id标识值，用于分页和过滤数据
 *
 * @param String}data_type
 * @param {String}user_uniqueKey
 * @return last_id when cache is not empty, otherwise null.
 * @api public|private
 */
function getMaxMsgId(data_type, user_uniquekey){
    var cache = get_data_cache(data_type, user_uniquekey);
    var last_id = null;
    if(cache && cache.length > 0){
    	// 兼容网易的cursor_id
        // 兼容腾讯的PageTime
    	var last_index = cache.length - 1;
        var last_id = cache[last_index].timestamp 
        	|| cache[last_index].cursor_id 
        	|| cache[last_index].id;
    	if(typeof(last_id) === 'number'){
    		last_id--;
    	}
    }
    return last_id;
};


function getLastPage(data_type, user_uniquekey){
    return LAST_PAGES[_format_data_key(data_type, '_last_page', user_uniquekey)];
};

function setLastPage(data_type, page, user_uniquekey){
    var key = _format_data_key(data_type, '_last_page', user_uniquekey);
    LAST_PAGES[key] = page;
};

//用户跟随放到background view这里处理
var friendships = {
	fetch_cursors: {},
	fetch_times: {}, // 上次爬取时间
	friend_data_type: 'user_friends',
    create: function(user_id, screen_name, callback){ //更随某人
    	var user = getUser();
        var params = {id:user_id, user:user};
        tapi.friendships_create(params, function(user_info, textStatus, statuCode){
            if(user_info === true || user_info.id){
            	if(user_info.screen_name) {
            		screen_name = user_info.screen_name;
            	}
                showMsg(_u.i18n("msg_f_create_success").format({name: screen_name}));
            } else {
            	user_info = null;
            }
            if(callback){ callback(user_info, textStatus, statuCode); }
            hideLoading();
        });
    },
    destroy: function(user_id, screen_name, callback){ //取消更随某人
    	var user = getUser();
        var params = {id:user_id, user:user};
        tapi.friendships_destroy(params, function(user_info, textStatus, statuCode){
        	if(user_info === true || user_info.id){
            	if(user_info.screen_name) {
            		screen_name = user_info.screen_name;
            	}
                showMsg(_u.i18n("msg_f_destroy_success").format({name: screen_name}));
            } else {
            	user_info = null;
            }
        	if(callback){ callback(user_info, textStatus, statuCode); }
            hideLoading();
        });
    },
    show: function(user_id){ //查看与某人的跟随关系
    	var user = getUser();
        var params = {id:user_id, user:user};
        tapi.friendships_show(params, function(sinaMsgs, textStatus){});
    },
    fetch_friends: function(user_uniquekey, callback, context) {
    	var user;
    	if(user_uniquekey) {
    		user = getUserByUniqueKey(user_uniquekey);
    	} else {
    		user = getUser();
    	}
    	var friend_data_type = this.friend_data_type;
    	var count = 200;
    	// 上次爬取的结果
    	var fetch_cursor = friendships.fetch_cursors[user_uniquekey];
    	var append = true;
    	if(fetch_cursor == null) {
    		// 第一次获取
    		fetch_cursor = '-1';
//    		console.log('first fetch friends');
    	} else if(fetch_cursor == '0') {
    		if(new Date().getTime() - friendships.fetch_times[user_uniquekey] < 60000) {
    			// 上次爬取时间和这次间隔在60秒以内的，直接返回空，不爬取
    			callback.call(context, []);
    			return;
    		}
    		// 已经全部爬取，现在只获取最近的即可
    		// 为了省流量，只获取最近50
    		count = 50;
    		fetch_cursor = '-1';
    		append = false;
    	}
    	var params = {
    		user: user,
    		user_id: user.id,
    		cursor: fetch_cursor, 
    		count: count
    	};
    	tapi.friends(params, function(data){
    		var friends = data.users || data.items || data;
    		// 重新获取一次cache，防止期间cache被更新了，之前的引用就失效了
    		var cache = get_data_cache(friend_data_type, user.uniqueKey) || [];
    		if(friends && friends.length > 0) {
    			var max_id = null;
    			if(cache.length > 0) {
    				if(append) {
        				max_id = cache[cache.length - 1].id;
        			} else {
        				max_id = cache[0].id;
        			}
    			}
                var result = filterDatasByMaxId(friends, max_id, append);
                friends = result.news;
                if(friends.length > 0) {
                	var rt_at_name = tapi.get_config(user).rt_at_name;
                    for(var i=0; i<friends.length; i++) {
        				var friend = friends[i];
        				// 只保存最简单的数据，减少内存占用
        				friends[i] = {id: friend.id, screen_name: friend.screen_name};
        				if(rt_at_name) {
        					friends[i].name = friend.name;
        				}
        			}
                    if(append) {
                    	cache = cache.concat(friends);
                    } else {
                    	cache = friends.concat(cache);
                    }
                    set_data_cache(cache, friend_data_type, user.uniqueKey);
                }
    		}
    		if(friendships.fetch_cursors[user_uniquekey] != '0') {
    			friendships.fetch_cursors[user_uniquekey] = String(data.next_cursor);
//    			console.log('fetch_done_once');
    		}
    		friendships.fetch_times[user_uniquekey] = new Date().getTime();
//    		console.log('fetch new', friends.length, 'cursor', data.next_cursor, cache.length);
    		callback.call(context, friends || []);
    	});
    }
};

function merge_direct_messages(user_uniquekey, new_messages){
	// 对私信进行合并排序
	var messages = get_data_cache('messages', user_uniquekey);
	if(!messages) {
		messages = [];
	}
	var need_sort = false;
	if(new_messages && new_messages.length > 0) {
		for(var i=0; i<new_messages.length; i++){
			new_messages[i].sort_value = new Date(new_messages[i].created_at).getTime();
		}
		var need_sort = messages.length > 0;
		messages = messages.concat(new_messages);
		if(need_sort) {
			messages.sort(function(a, b){
				if(a.sort_value < b.sort_value) {
					return 1;
				}
				return -1;
			});
		}
	}
	set_data_cache(messages, 'messages', user_uniquekey);
};

//获取最新的(未看的)微博
// @t : 获取timeline的类型
// @p : 要附加的请求参数,类型为{}
function checkTimeline(t, p, user_uniqueKey){
    var c_user = null;
    if(!user_uniqueKey){
        c_user = getUser();
        user_uniqueKey = c_user.uniqueKey;
    } else {
        c_user = getUserByUniqueKey(user_uniqueKey);
    }
    if(!c_user){
        return;
    }
    if(isDoChecking(user_uniqueKey, t, 'checking')){ 
    	return; 
    }
    if(t == 'direct_messages' && tapi.get_config(c_user).support_sent_direct_messages) {
    	// 私信，则同时获取自己发送的
    	checkTimeline('sent_direct_messages', p, user_uniqueKey);
    }
    setDoChecking(user_uniqueKey, t, 'checking', true);
    var need_set_count = true;
    var params = {user:c_user, count:PAGE_SIZE};
    var last_id = getLastMsgId(t, user_uniqueKey);
    if(last_id){
        if(c_user.blogType == 'tqq' && !get_data_cache(t, user_uniqueKey)){ 
        	//腾讯微博的第一次获取加pageflag=0，获取第一页
           params['pageflag'] = 0;
        }
        params['since_id'] = last_id;
    }
    $.extend(params, p);
    showLoading();
    tapi[t](params, function(data, textStatus){
    	hideLoading();
    	data = data || {};
    	var sinaMsgs = data.items || data;
    	if(data.next_cursor !== undefined) {
    		// 保存最新的cursor，用于分页
    		setLastCursor(data.next_cursor, t, user_uniqueKey);
    	}
    	if(!$.isArray(sinaMsgs)) {
    		sinaMsgs = [];
    	}
    	var popupView = getPopupView();
        var isFirstTime = false;
        var _key = user_uniqueKey + t + '_tweets';
        if(!tweets[_key]){
            tweets[_key] = [];
            isFirstTime = true;//如果不存在，则为第一次获取微博
        }
        if(!last_id && tweets[_key].length > 0){
        	last_id = tweets[_key][0].cursor_id || tweets[_key][0].id;
        }
        
        if(last_id && sinaMsgs.length > 0){
        	if(c_user.blogType == 't163' && last_id.indexOf(':') > 0) { // 兼容网易的id
        		last_id = last_id.split(':', 1)[0];
        	} else if(c_user.blogType == 'tqq') {
                // tqq 重现修改last_id为id
        		//last_id = tweets[_key][0].id;
                last_id = getLastMsgId(t+'_real_id', user_uniqueKey);
        	}
        	var result = filterDatasByMaxId(sinaMsgs, last_id, false);
        	if(tweets[_key].length == 0) {
        		tweets[_key] = result.olds; // 填充旧的数据
        		if(t == 'direct_messages' || t == 'sent_direct_messages') {
                	// 将私信合并显示
                	merge_direct_messages(user_uniqueKey, result.olds);
                }
        		if(popupView){
        			popupView.addTimelineMsgs(result.olds, t, user_uniqueKey);
        		}
        	}
        	sinaMsgs = result.news;
        }
        var current_user = getUser();
        
        if(sinaMsgs.length > 0){
        	// 保存最新的id，用于过滤数据和判断
        	// 兼容网易的cursor_id
            // 兼容腾讯的pagetime
            setLastMsgId(sinaMsgs[0].timestamp || sinaMsgs[0].cursor_id 
            	|| sinaMsgs[0].id, t, user_uniqueKey);
            if(c_user.blogType == 'tqq'){
                //qq的last_id保存的是timestamp，但是在过滤重复信息的时候需要用到id，所以再保存一个ID
                setLastMsgId(sinaMsgs[0].id, t+'_real_id', user_uniqueKey);
            }
            tweets[_key] = sinaMsgs.concat(tweets[_key]);
            if(t == 'direct_messages' || t == 'sent_direct_messages') {
            	// 将私信合并显示
            	merge_direct_messages(user_uniqueKey, sinaMsgs);
            }
            var _unreadCount = 0, _msg_user = null;
            var c_user_id = String(c_user.id);
            for(var i in sinaMsgs){
                _msg_user = sinaMsgs[i].user || sinaMsgs[i].sender;
                if(_msg_user && String(_msg_user.id) != c_user_id){
                    _unreadCount += 1;
                }
            }
            if(popupView){
        		// 判断是否还是当前用户
                if(!popupView.addTimelineMsgs(sinaMsgs, t, user_uniqueKey)){
                    setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
                    popupView.updateDockUserUnreadCount(user_uniqueKey);
                } else {
                    if(current_user.uniqueKey == user_uniqueKey){
                        popupView._showMsg(_u.i18n("msg_has_new_tweet"));
                    } else {
                    	setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
                    	popupView.updateDockUserUnreadCount(user_uniqueKey);
                    }
                }
            } else { //在页面显示新消息，桌面提示
                setUnreadTimelineCount(_unreadCount, t, user_uniqueKey);
                showNewMsg(sinaMsgs, t, c_user);
                if(_unreadCount > 0){
                    NotificationsManager.show(c_user, t);
                    playSound(t);
                }
            }
    	}
    	setDoChecking(user_uniqueKey, t, 'checking', false);
    	if(isFirstTime){//如果是第一次(启动插件时),则获取以前的微薄
            if(tweets[_key].length < PAGE_SIZE) { 
            	//如果第一次(启动插件时)获取的新信息少于分页大小，则加载一页以前的微薄，做缓冲
                getTimelinePage(user_uniqueKey, t);
            } else if (popupView) {
                popupView.showReadMore(t);
            }
        } else if(popupView) {
        	if(sinaMsgs.length >= PAGE_SIZE) {
        		popupView.showReadMore(t);
        	} else {
        		popupView.hideReadMoreLoading(t);
        	}
        }
    });
};

//分页获取以前的微博
// @t : 获取timeline的类型
// @p : 要附加的请求参数,类型为{}
function getTimelinePage(user_uniqueKey, t, p){
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
    if(t == 'followers'){ log('The Wrong Page Fetch: ' + t);return; } //忽略粉丝列表
    if(isDoChecking(user_uniqueKey, t, 'paging')){ return; }
    if(t == 'direct_messages' && tapi.get_config(c_user).support_sent_direct_messages) {
    	// 私信，则同时获取自己发送的
    	getTimelinePage(user_uniqueKey, 'sent_direct_messages', p);
    }
    var t_key = user_uniqueKey + t + '_tweets';
    if(!tweets[t_key]) {
        tweets[t_key] = [];
    }
    var params = {user:c_user, count:PAGE_SIZE};
    var config = tapi.get_config(c_user);
    var page = null;
    var cursor = null;
    var support_max_id = config.support_max_id;
    var support_cursor_only = config.support_cursor_only;
    if(support_cursor_only) { // 只支持cursor分页
    	// 先去tweets[t_key]获取最后一个数据是否带cursor，带则使用他，不带则使用last_cursor
    	// 这是最巧妙的地方。。。
    	var length = tweets[t_key].length;
    	if(length > 0 && tweets[t_key][length - 1].cursor) {
    		cursor = tweets[t_key][length - 1].cursor;
    	} else {
    		cursor = getLastCursor(t, user_uniqueKey);
    	}
    	if(cursor == '0') { // 再无数据
    		return;
    	} else if(cursor) {
    		params.cursor = cursor;
    	}
    } else {
    	// 判断是否支持max_id形式获取数据
	    if(support_max_id) {
		    var max_id = getMaxMsgId(t, user_uniqueKey);
		    if(max_id){
		        params['max_id'] = max_id;
		    }
	    } else {
	    	// count, page 形式
	    	page = getLastPage(t, user_uniqueKey);
	    	if(page == 0) {
	    		return; // 到底了
	    	} else if(page == undefined) {
	    		page = 1;
	    	} else {
	    		page += 1;
	    	}
	    	params['page'] = page;
	    }
    }
    $.extend(params, p);

    setDoChecking(user_uniqueKey, t, 'paging', true);
    
    showLoading();
    tapi[t](params, function(data, textStatus) {
    	hideLoading();
    	if(data) {
    		var sinaMsgs = data.items || data;
        	if($.isArray(sinaMsgs) && textStatus != 'error') {
        		if(sinaMsgs.length > 0){
                    var max_id = getMaxMsgId(t, user_uniqueKey);
                    if(c_user.blogType == 'tqq' && tweets[t_key].length > 0) {
                    	max_id = tweets[t_key][0].id; // tqq 重现修改last_id为id
                	}
                    var result = filterDatasByMaxId(sinaMsgs, max_id, true);
                    sinaMsgs = result.news;
                    for(var i in sinaMsgs){
                        sinaMsgs[i].readed = true;
                    }
                    tweets[t_key] = tweets[t_key].concat(sinaMsgs);
                    if(t == 'direct_messages' || t == 'sent_direct_messages') {
                    	// 将私信合并显示
                    	merge_direct_messages(user_uniqueKey, sinaMsgs);
                    }
                } else {
                	page = 0;
                }
                if(page != null) { // page分页
                    setLastPage(t, page, user_uniqueKey);
                }
        	}
            // 设置翻页和填充新数据到ui列表的后面显示
            _showReadMore(t, user_uniqueKey, sinaMsgs);
            if(data.next_cursor && tweets[t_key].length > 0) {
            	// 保存cursor信息
        		tweets[t_key][tweets[t_key].length - 1].cursor = String(data.next_cursor);
        	}
    	}
        setDoChecking(user_uniqueKey, t, 'paging', false);
    });
};

// 设置可以继续翻页
// 如果datas是数组类型，则根据长度是否大于页数的一半判断是否可以继续翻页
function _showReadMore(t, user_uniqueKey, datas) {
	var current_user = getUser();
    //防止获取分页内容后已经切换了用户
    if(current_user.uniqueKey == user_uniqueKey) { 
    	// TODO:更详细逻辑有待改进
        var popupView = getPopupView();
        if(popupView) {
        	if($.isArray(datas)) {
        		popupView.addPageMsgs(datas, t, true);
                if(datas.length >= (PAGE_SIZE / 2)) {
                    popupView.showReadMore(t);
                } else {
                    popupView.hideReadMore(t, true);
                }
        	} else { // 获取数据异常
        		popupView.showReadMore(t);
        	}
        }
    }
};

//检查是否正在获取
//@t: timeline类型
//@c_t: checking or paging
function isDoChecking(user_uniqueKey, t, c_t){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    if(window[c_t][user_uniqueKey + t]){
        var d = new Date().getTime();
        var _d = d - window[c_t][user_uniqueKey + t + '_time'];
        if(_d < 60*1000){ //如果还没有超过一分钟
            return true;
        }
    }
    return false;
}

function setDoChecking(user_uniqueKey, t, c_t, v){
    if(!user_uniqueKey){
        user_uniqueKey = getUser().uniqueKey;
    }
    window[c_t][user_uniqueKey + t] = v;
    window[c_t][user_uniqueKey + t + '_time'] = new Date().getTime();
}

//在页面显示提示信息
//@user: 当前用户
function showNewMsg(msgs, t, user){
    if(getAlertMode()=='dnd'){ return; } //免打扰模式
    if(Settings.get().isShowInPage[t]){
        chrome.tabs.getSelected(null, function(tab) {
            if(!tab){ return; }
            chrome.tabs.sendRequest(tab.id, {method:'showNewMsgInPage', msgs: msgs, t:t, user:user}, function handler(response) {
            });
        });
    }
};

//播放声音提醒
var AlertaAudioFile = null;
try{
    AlertaAudioFile = new Audio(); //因为有一个Chrome的新版本居然没有Audio这个
}catch(err){
    log('Not Support Audio');
}
function playSound(t){
    if(!AlertaAudioFile){
        return;
    }
    if(getAlertMode()!='dnd' && Settings.get().isEnabledSound[t]){
        if(!AlertaAudioFile.src){
            AlertaAudioFile.src = Settings.get().soundSrc;
        };
        AlertaAudioFile.play();
    }
};

//桌面信息提醒
var NotificationsManager = {
    tp: '<script> uniqueKey = "{{user.uniqueKey}}"; Timeout = {{timeout}};</script>' + 
        '<div class="item">' +
            '<div class="usericon"><img src="{{user.profile_image_url}}" class="face"/><img src="images/blogs/{{user.blogType}}_16.png" class="blogType"/></div>' + 
            '<div class="info"><span class="username">{{user.screen_name}}</span><br/>' + 
                '<span class="unreads">' + 
                    '<span id="unr_friends_timeline"><span>{{unreads.friends_timeline}}</span>'+ _u.i18n("abb_friends_timeline") +'</span> &nbsp;&nbsp; <span id="unr_mentions"><span>{{unreads.mentions}}</span>@</span> <br/>' + 
                    '<span id="unr_comments_timeline"><span>{{unreads.comments_timeline}}</span>'+ _u.i18n("abb_comment") +'</span> &nbsp;&nbsp; <span id="unr_direct_messages"><span>{{unreads.direct_messages}}</span>'+ _u.i18n("abb_direct_message") + '</span> ' + 
                '</span>' + 
            '</div>' + 
        '</div>' + 
        '<script> removeHighlight(); TIME_LINE = "{{t}}"; highlightTimeline();</script>',
    
    cache: {}, //存放要显示的账号
    isEnabled: function(t){
        return getAlertMode()!='dnd' && Settings.get().isDesktopNotifications[t];
    },
    /*
    * 先检查cache中有account有没存在，如果存在，则说明正在创建Notifications窗口
    * 如果不存在，则缓存，并创建Notifications窗口。
    * 这样是为了避免Notifications窗口还在创建中，这时chrome.extension.getViews({type:"notification"})还不能获取到该窗口，则会造成重复创建
    */
    show: function(account, t){
        if(!this.isEnabled(t)){ return; }
        
        if(this.cache[account.uniqueKey]){
            this.cache[account.uniqueKey].timelines.push(t);
            return;
        } //如果缓存的还没显示

        var _nf = false;
        var nfViews = chrome.extension.getViews({type:"notification"});
        for(var i in nfViews){
            if(nfViews[i].uniqueKey == account.uniqueKey){ //如果已经存在，则直接更新内容
                
                var unreads = {};
                unreads['friends_timeline'] = getUnreadTimelineCount('friends_timeline', account.uniqueKey);
                unreads['mentions'] = getUnreadTimelineCount('mentions', account.uniqueKey);
                unreads['comments_timeline'] = getUnreadTimelineCount('comments_timeline', account.uniqueKey);
                unreads['direct_messages'] = getUnreadTimelineCount('direct_messages', account.uniqueKey);

                nfViews[i].updateInfo(t, unreads);
                _nf = true;
            }
        }

        if(!_nf){ //如果还没存在，则通知创建
            account.timelines = [t];
            this.cache[account.uniqueKey] = account;
            var ntf = webkitNotifications.createHTMLNotification('/destop_alert.html'+'#'+account.uniqueKey);
            ntf.show();
        }
    },
    //Notifications窗口创建完后，调用该方法获取信息
    getShowHtml: function(uniqueKey){
        var account = this.cache[uniqueKey];

        var unreads = {};
        unreads['friends_timeline'] = getUnreadTimelineCount('friends_timeline', account.uniqueKey);
        unreads['mentions'] = getUnreadTimelineCount('mentions', account.uniqueKey);
        unreads['comments_timeline'] = getUnreadTimelineCount('comments_timeline', account.uniqueKey);
        unreads['direct_messages'] = getUnreadTimelineCount('direct_messages', account.uniqueKey);

        account.unreads = unreads;
        var timeout = Settings.get().desktopNotificationsTimeout;
        var data = this.tp.format({user:account, unreads:unreads, t:account.timelines.join(','), timeout:timeout});
        delete this.cache[uniqueKey];
        return data;
    }
};

var RefreshManager = {
    itv: {},
    /*
    * 启动定时器
    * @getFirst: 如果为true， 则先发送一次请求，再启动定时器.
    */
    start: function(getFirst){
        var userList = getUserList(), refTime = 90;
        for(var j in userList){
            var user = userList[j];
            for(var i in T_LIST[user.blogType]){
                var uniqueKey = user.uniqueKey, t = T_LIST[user.blogType][i];
                refTime = Settings.getRefreshTime(user, t);
                if(getFirst){ checkTimeline(t, null, uniqueKey); }
                this.itv[uniqueKey+t] = setInterval(checkTimeline, 1000*refTime, t, null, uniqueKey);
            }
        }
    },
    stop: function(){
        for(var i in this.itv){
            clearInterval(this.itv[i]);
        }
    },
    restart: function(getFirst){
        this.stop();
        this.start(getFirst);
    },
    refreshUser: function(user){
        for(var i in T_LIST[user.blogType]){
            var uniqueKey = user.uniqueKey, t = T_LIST[user.blogType][i];
            refTime = Settings.getRefreshTime(user, t);
            clearInterval(this.itv[uniqueKey+t]); //重新计时
            checkTimeline(t, null, uniqueKey);
            this.itv[uniqueKey+t] = setInterval(checkTimeline, 1000*refTime, t, null, uniqueKey);
        }
    }
};

setUnreadTimelineCount(0, 'friends_timeline'); //设置提示信息（上次关闭前未读）

RefreshManager.start(true);



function checkNewMsg(t, uniqueKey){
    try{
        checkTimeline(t, null, uniqueKey);
    }catch(err){

    }
}

function onChangeUser(){
    window.c_user = null;
    var c_user = getUser();
    if(c_user){
        window.c_user = c_user;
    }
};

// AD
var ADs = {
    adlist: null,
    currentIndex: -1,
    fetchAds:function(){
        $.getJSON("http://api.yongwo.de/fawave/adlist/", function(ads){
            if(ads){
                ADs.adlist = ads;
                ADs.currentIndex = -1;
            }
        });
    },
    getNext: function(){
        if(!ADs.adlist || ADs.currentIndex >= ADs.adlist.length){
            ADs.fetchAds();
        }else{
            var ran = Math.round(Math.random()*8)%4;
            if(ran===1){
                ADs.currentIndex++;
                return ADs.adlist[ ADs.currentIndex ];
            }
        }
        return null;
    }
};
ADs.fetchAds();

//刷新账号信息
function refreshAccountInfo(){
    var stat = {errorCount: 0, successCount: 0};
    // 获取用户列表
    stat.userList = getUserList('all');
    $("#refresh-account").attr("disabled", true);
    for(var i in stat.userList){
        refreshAccountWarp(stat.userList[i], stat);//由于闭包会造成变量共享问题，所以写多一个包装函数。
    }
};

function refreshAccountWarp(user, stat){
    tapi.verify_credentials(user, function(data, textStatus, errorCode){
    	user.blogType = user.blogType || 'tsina'; //兼容单微博版
        user.authType = user.authType || 'baseauth'; //兼容单微博版
        if(errorCode){
            stat.errorCount++;
        } else {
            $.extend(user, data); //合并，以data的数据为准
            user.uniqueKey = user.blogType + '_' + user.id;
            stat.successCount++;
        }
        if((stat.errorCount + stat.successCount) == stat.userList.length){
        	// 全部刷新完，更新
        	//为防止在刷新用户信息的过程中，修改了用户信息
        	var userlist = getUserList('all');
        	$.extend(userlist, stat.userList);
            saveUserList(userlist);
            var c_user = getUser();
            if(c_user){
                if(!c_user.uniqueKey){ //兼容单微博版本
                    c_user.uniqueKey = (c_user.blogType||'tsina') + '_' + c_user.id;
                }
                $.each(userlist, function(index, item){
                	if(c_user.uniqueKey.toLowerCase() == item.uniqueKey.toLowerCase()){
                		c_user = item;
                		return false;
                	}
                });
                setUser(c_user);
            }
        }
    });
};

refreshAccountInfo(); //每次启动的时候都刷新一下用户信息

//更新用户的地理位置信息（笔记本位置可能会变）
function updateGeoInfo(){
    if(_settings.isGeoEnabled) {
    	if(_settings.isGeoEnabledUseIP) {
    		get_location(function(geo, error){
    			if(geo) {
    				_settings.geoPosition = geo;
    			}
    		});
    	} else {
    		if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(function(position){
                    var p = {latitude: position.coords.latitude, longitude: position.coords.longitude};
                    _settings.geoPosition = p;
                }, function(msg){
                });
            }
    	}
    }
};
try {
    updateGeoInfo();
} catch(err) {
}

// contextMenus, 右键快速发送微博
var sharedContextmenuId = null;
function createSharedContextmenu(){
    if(!sharedContextmenuId){
        sharedContextmenuId = chrome.contextMenus.create({"title": _u.i18n("comm_share_whit_fawave"), 
            "contexts": ['all'],
            "onclick": function(info, tab) {
                var text = info.selectionText;
                text = text || tab.title;
                var link = info.linkUrl || info.srcUrl || info.frameUrl || info.pageUrl;
                chrome.tabs.sendRequest(tab.id, {method:'showSendQuickMessage', text: text, link: link});
            }
        });
    }
};
function removeSharedContextmenu(){
    if(sharedContextmenuId){
        chrome.contextMenus.remove(sharedContextmenuId);
        sharedContextmenuId = null;
    }
};
if(Settings.get().enableContextmenu){
    createSharedContextmenu();
};


//与page.js通讯
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    // sender.tab ? sender.tab.url
    if(request.method){
        r_method_manager[request.method](request, sender, sendResponse);
    }
});

r_method_manager = {
    test: function(request, sender, sendResponse){
        sendResponse({farewell: "goodbye"});
    },
    getLookingTemplate: function(request, sender, sendResponse){
        var _l_tp = Settings.get().lookingTemplate;
        sendResponse({lookingTemplate: _l_tp});
    },
    shortenUrl: function(request, sender, sendResponse){
        var longurl = request.long_url;
        if(Settings.get().isSharedUrlAutoShort && longurl.indexOf('chrome-extension://') != 0 && longurl.replace(/^https?:\/\//i, '').length > Settings.get().sharedUrlAutoShortWordCount){
            ShortenUrl.short(longurl, function(shorturl){
                sendResponse({short_url: shorturl});
            });
        }else{
            sendResponse({short_url: ''});
        }
    },
    getQuickSendInitInfos: function(request, sender, sendResponse){
        var hotkeys = Settings.get().quickSendHotKey;
        var c_user = getUser();
        var userList = getUserList('send');
        sendResponse({hotkeys: hotkeys, c_user:c_user, userList:userList});
    },
    publicQuickSendMsg: function(request, sender, sendResponse){
        var msg = request.sendMsg;
        var user = request.user;
        var data = {status: msg, user:user};
        tapi.update(data, function(sinaMsg, textStatus){
            if(sinaMsg.id){
                setTimeout(checkNewMsg, 1000, 'friends_timeline');
            }
            sendResponse({msg:sinaMsg, textStatus:textStatus});
        });
    },
    notifyCheckNewMsg: function(request, sender, sendResponse){
        setTimeout(checkNewMsg, 1000, 'friends_timeline');
    }
};