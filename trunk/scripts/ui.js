// @author qleelulu@gmail.com

function buildStatusHtml(statuses, t, c_user){
	var htmls = [];
    if(!statuses || statuses.length == 0) { 
    	return htmls; 
    }
    if(!c_user){
        c_user = getUser();
    }
    var TEMPLATE_RT_RT = null;
    var theme = Settings.get().theme;
    var rt_replace_pre = null, rt_rt_replace_pre = null;
    if(theme=='pip_io' || theme=='work') {
    	rt_replace_pre = '<!-- {{retweeted_status_out}} -->';
    	rt_rt_replace_pre = '<!-- {{retweeted_retweeted_status_out}} -->';
    } else {
    	rt_replace_pre = '<!-- {{retweeted_status_in}} -->';
    	rt_rt_replace_pre = '<!-- {{retweeted_retweeted_status_in}} -->';
    }
    
    var config = tapi.get_config(c_user);
 	var support_do_comment = config.support_do_comment;
 	var support_do_favorite = config.support_do_favorite;
 	var BUTTON_TPLS = {
        showMapBtn: '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'{{user.profile_image_url}}\', {{geo.coordinates[0]}}, {{geo.coordinates[1]}});" title="'+ _u.i18n("btn_geo_title") +'"><img src="images/mapspin2a.png"/></a>',
        delTweetBtn: '<a class="deltweet" href="javascript:void(0);" onclick="doDelTweet(\'{{id}}\', this);" title="'+ _u.i18n("btn_del_tweet_title") +'">'+ _u.i18n("abb_delete") +'</a>',
        replyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'{{user.screen_name}}\',\'{{id}}\');" title="'+ _u.i18n("btn_mention_title") +'">@</a>',
        oretweetBtn: '<a class="oretweet ort" href="javascript:void(0);" onclick="javascript:sendOretweet(this,\'{{user.screen_name}}\',\'{{id}}\');" title="'+ _u.i18n("btn_rt_title") +'"></a>',
        retweetBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this);" title="'
        	+ _u.i18n("btn_old_rt_title") +'">RT</a>',
        repostBtn: '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'{{user.screen_name}}\',\'{{id}}\',\'{{retweeted_status_screen_name}}\',\'{{retweeted_status_id}}\');" title="'+ _u.i18n("btn_repost_title") +'">'+ _u.i18n("abb_repost") +'</a>',
        repostCounts: '<span class="repostCounts">({{repost_count}})</span>',
        commentBtn: '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'{{user.screen_name}}\', \'{{user.id}}\', \'{{id}}\');" title="'+ _u.i18n("btn_comment_title") +'">'+ _u.i18n("abb_comment") +'</a>',
        commentCounts: '<span class="commentCounts">({{comments_btn}})</span>',
        delCommentBtn: '<a class="delcommenttweet" href="javascript:void(0);" onclick="javascript:doDelComment(this,\'{{user.screen_name}}\',\'{{id}}\');" title="'+ _u.i18n("btn_del_comment_title") +'">'+ _u.i18n("abb_delete") +'</a>',
        new_msgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="doNewMessage(this,\'{{user.screen_name}}\',\'{{user.id}}\');" title="'+ _u.i18n("btn_direct_message_title") +'">'+ _u.i18n("abb_send_direct_message") +'</a>',
        delDirectMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="delDirectMsg(this,\'{{user.screen_name}}\',\'{{id}}\');" title="'+ _u.i18n("btn_del_direct_message_title") +'">'+ _u.i18n("abb_delete") +'</a>',
        addFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'{{user.screen_name}}\',\'{{id}}\');" title="'+ _u.i18n("btn_add_favorites_title") +'"><img width="11px" src="/images/favorites_2.gif"/></a>',
        delFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="delFavorites(this,\'{{user.screen_name}}\',\'{{id}}\');" title="'+ _u.i18n("btn_del_favorites_title") +'"><img width="11px" src="/images/favorites.gif"/></a>',
        
        // rt
        rtShowMapBtn: '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'{{retweeted_status.user.profile_image_url}}\', {{retweeted_status.geo.coordinates[0]}}, {{retweeted_status.geo.coordinates[1]}});" title="'+ _u.i18n("btn_geo_title") +'"><img src="images/mapspin2a.png"/></a>',
        rtRepostBtn: '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'{{retweeted_status.user.screen_name}}\',\'{{retweeted_status.id}}\');" title="'+ _u.i18n("btn_repost_title") +'">'+ _u.i18n("abb_repost") +'</a>',
        rtRetweetBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this, true);" title="'
        	+ _u.i18n("btn_old_rt_title") +'">RT</a>',
        rtOretweetBtn: '<a class="oretweet ort" href="javascript:void(0);" onclick="javascript:sendOretweet(this,\'{{retweeted_status.user.screen_name}}\',\'{{retweeted_status.id}}\');" title="'+ _u.i18n("btn_rt_title") +'"></a>',
        rtCommentBtn: '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'{{retweeted_status.user.screen_name}}\', \'{{retweeted_status.user.id}}\', \'{{retweeted_status.id}}\');" title="'+ _u.i18n("btn_comment_title") +'">'+ _u.i18n("abb_comment") +'</a>',
        rtCommentCounts: '<span class="commentCounts">({{rt_comments_count}})</span>',
        rtReplyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'{{retweeted_status.user.screen_name}}\',\'{{retweeted_status.id}}\');" title="'+ _u.i18n("btn_mention_title") +'">@</a>',
        rtAddFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'{{retweeted_status.user.screen_name}}\',\'{{retweeted_status.id}}\');" title="'+ _u.i18n("btn_add_favorites_title") +'"><img width="11px" src="/images/favorites_2.gif"/></a>',
        rtRepostCounts: '<span class="repostCounts">({{retweeted_status.repost_count}})</span>',
        
        // rt rt
        rtrtShowMapBtn: '<a class="geobtn" href="javascript:" onclick="showGeoMap(\'{{retweeted_status.retweeted_status.user.profile_image_url}}\', {{retweeted_status.retweeted_status.geo.coordinates[0]}}, {{retweeted_status.retweeted_status.geo.coordinates[1]}});" title="'+ _u.i18n("btn_geo_title") +'"><img src="images/mapspin2a.png"/></a>',
        rtrtOretweetBtn: '',
        rtrtRetweetBtn: '<a class="rtweet" href="javascript:void(0);" onclick="doRT(this, false, true);" title="'+ _u.i18n("btn_old_rt_title") +'">RT</a>',
        rtrtRepostBtn: '<a class="reposttweet" href="javascript:void(0);" onclick="javascript:doRepost(this,\'{{retweeted_status.retweeted_status.user.screen_name}}\',\'{{retweeted_status.retweeted_status.id}}\');" title="'+ _u.i18n("btn_repost_title") +'">'+ _u.i18n("abb_repost") +'</a>',
        rtrtCommentBtn: '<a class="commenttweet" href="javascript:void(0);" onclick="javascript:doComment(this,\'{{retweeted_status.retweeted_status.user.screen_name}}\', \'{{retweeted_status.retweeted_status.user.id}}\', \'{{retweeted_status.retweeted_status.id}}\');" title="'+ _u.i18n("btn_comment_title") +'">'+ _u.i18n("abb_comment") +'</a>',
        rtrtCommentCounts: '<span class="commentCounts">({{rtrt_comments_count}})</span>',
        rtrtReplyBtn: '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'{{retweeted_status.retweeted_status.user.screen_name}}\',\'{{retweeted_status.retweeted_status.id}}\');" title="'+ _u.i18n("btn_mention_title") +'">@</a>',
        rtrtAddFavoritesMsgBtn: '<a class="newMessage" href="javascript:void(0);" onclick="addFavorites(this,\'{{retweeted_status.retweeted_status.user.screen_name}}\',\'{{retweeted_status.retweeted_status.id}}\');" title="'+ _u.i18n("btn_add_favorites_title") +'"><img width="11px" src="/images/favorites_2.gif"/></a>',
        rtrtRepostCounts: '<span class="repostCounts">({{retweeted_status.retweeted_status.repost_count}})</span>'
    };
 	
 	// 不支持收藏
    if(!support_do_favorite) {
    	BUTTON_TPLS.addFavoritesMsgBtn = BUTTON_TPLS.delFavoritesMsgBtn = '';
    }
    // 不支持repost(转发)
    if(!config.support_repost) {
    	BUTTON_TPLS.repostCounts = BUTTON_TPLS.rtRepostCounts 
    		= BUTTON_TPLS.rtrtRepostCounts = BUTTON_TPLS.repostBtn 
    		= BUTTON_TPLS.rtRepostBtn = BUTTON_TPLS.rtrtRepostBtn = '';
    }
    if(!config.support_counts) {
    	BUTTON_TPLS.repostCounts = BUTTON_TPLS.rtRepostCounts 
    		= BUTTON_TPLS.rtrtRepostCounts = '';
    }
    // 不支持删除私信
    if(!config.support_destroy_msg) {
    	BUTTON_TPLS.delDirectMsgBtn = '';
    }
	// 不支持私信
    if(!config.support_direct_messages) {
    	BUTTON_TPLS.delDirectMsgBtn = '';
    	BUTTON_TPLS.new_msgBtn = '';
    }
    // 不支持评论
    if(!support_do_comment) {
        BUTTON_TPLS.commentBtn = BUTTON_TPLS.commentCounts 
        	= BUTTON_TPLS.rtCommentCounts = BUTTON_TPLS.rtCommentBtn = '';
    }
    
    // 支持转发列表
    if(config.support_repost && config.support_repost_timeline) {
    	var tpl = '<span class="repostCounts">(<a href="javascript:void(0);" title="'
    		+ _u.i18n("comm_show_repost_timeline") 
    		+ '" timeline_type="repost" onclick="showRepostTimeline(this, {{id}});">{{repost_count}}</a>)</span>';
    	BUTTON_TPLS.repostCounts = tpl;
    	BUTTON_TPLS.rtRepostCounts = tpl.replace(/{{repost_count}}/g, 
    			'{{retweeted_status.repost_count}}')
    		.replace(/{{id}}/g, '{{retweeted_status.id}}');
    	BUTTON_TPLS.rtrtRepostCounts = tpl.replace(/{{repost_count}}/g, 
    			'{{retweeted_status.retweeted_status.repost_count}}')
    		.replace(/{{id}}/g, '{{retweeted_status.retweeted_status.id}}');
    }
    var messageReplyToBtn = '';
    switch(t){
	    case 'friends_timeline':
	    case 'favorites':
	    case 'mentions':
	    case 'user_timeline':
	    	BUTTON_TPLS.delDirectMsgBtn = BUTTON_TPLS.delCommentBtn = '';
	        break;
	    case 'comments_timeline':
	    	BUTTON_TPLS.repostBtn = BUTTON_TPLS.repostCounts 
	    		= BUTTON_TPLS.commentCounts = BUTTON_TPLS.delTweetBtn 
	    		= BUTTON_TPLS.delDirectMsgBtn = BUTTON_TPLS.addFavoritesMsgBtn 
	    		= BUTTON_TPLS.delFavoritesMsgBtn = '';
	    	BUTTON_TPLS.commentBtn = '<a class="commenttweet" href="javascript:void(0);" ' 
	    		+ ' onclick="javascript:doComment(this,\'{{status.user.screen_name}}\', \'{{status.user.id}}\', \'{{status.id}}\',\'{{user.screen_name}}\', \'{{user.id}}\',\'{{id}}\');" ' 
	    		+ ' title="'+ _u.i18n("btn_reply_comment_title") + '">' + _u.i18n("abb_reply") + '</a>';
	        break;
	    case 'comments_by_me':
	    	BUTTON_TPLS.delDirectMsgBtn = BUTTON_TPLS.addFavoritesMsgBtn 
	    		= BUTTON_TPLS.delFavoritesMsgBtn = '';
	        break;
	    case 'direct_messages':
	    	BUTTON_TPLS.repostBtn = BUTTON_TPLS.oretweetBtn 
	    		= BUTTON_TPLS.repostCounts = BUTTON_TPLS.commentBtn 
	    		= BUTTON_TPLS.commentCounts = BUTTON_TPLS.delCommentBtn 
	    		= BUTTON_TPLS.delTweetBtn = BUTTON_TPLS.addFavoritesMsgBtn 
	    		= BUTTON_TPLS.delFavoritesMsgBtn = '';
	    	BUTTON_TPLS.new_msgBtn = BUTTON_TPLS.new_msgBtn.replace('>'
	    		+ _u.i18n("abb_send_direct_message") +'<', '>'+ _u.i18n("abb_reply") +'<');
	    	BUTTON_TPLS.replyBtn = '<a class="replytweet" href="javascript:void(0);" onclick="javascript:doReply(this,\'{{user.screen_name}}\',\'\');" title="'
	    		+ _u.i18n("btn_mention_title") +'">@</a>';
	    	messageReplyToBtn = '回复给 <a class="newMessage" href="javascript:void(0);" ' 
	    		+ ' onclick="doNewMessage(this,\'{{recipient.screen_name}}\',\'{{recipient.id}}\');" title="'
	    		+ _u.i18n("btn_direct_message_title") + '">{{recipient.screen_name}}</a>';
	        break;
	    default:
	        break;
	}
    if(c_user.blogType != 'twitter' && c_user.blogType != 'identi_ca') {
    	BUTTON_TPLS.rtOretweetBtn = BUTTON_TPLS.oretweetBtn = '';
    }
	switch(c_user.blogType){
	    case 'digu':
            if(t=='mentions'){
	    	    BUTTON_TPLS.replyBtn = BUTTON_TPLS.replyBtn.replace('>@<', '>'
	    	    	+ _u.i18n("abb_reply") +'<');
            }
	        break;
	    case 'renjian':
	    	BUTTON_TPLS.repostCounts = BUTTON_TPLS.rtRepostCounts 
	    		= BUTTON_TPLS.rtrtRepostCounts = '';
	        break;
	    case 'douban':
	    	BUTTON_TPLS.replyBtn = BUTTON_TPLS.rtReplyBtn = BUTTON_TPLS.rtrtReplyBtn = '';
	        break;
        case 'facebook':
	    	BUTTON_TPLS.replyBtn = BUTTON_TPLS.rtReplyBtn 
	    		= BUTTON_TPLS.rtrtReplyBtn = BUTTON_TPLS.new_msgBtn = BUTTON_TPLS.commentCounts = '';
	    	
	        break;
        default:
            break;
	}
	var support_instapaper = Settings.get().instapaper_user != null;
    for(var i in statuses) {
    	var status = statuses[i];
    	status.repost_count = status.repost_count === undefined ? '-' : status.repost_count;
    	status.user = status.user || status.sender;
    	/*
         * status.retweeted_status 转发
         * status.status 评论
         */
    	status.retweeted_status = status.retweeted_status || status.status;
    	
    	var comments_count_tpl = '<a href="javascript:void(0);" timeline_type="comment" title="'
    		+ _u.i18n("btn_show_comments_title") 
    		+ '" onclick="showComments(this, \'{{id}}\');">{{comments_count}}</a>';
    	if(status.comments_count === undefined) {
    		status.comments_count = '0';
    	}
    	var comments_btn = comments_count_tpl.format(status);
     	status.comments_btn = comments_btn;
     	status.rt_comments_count = status.rtrt_comments_count = '-';
     	var rt_status = status.retweeted_status;
     	if(rt_status && rt_status.user) {
     		if(rt_status.repost_count === undefined) {
     			rt_status.repost_count = '0';
     		}
     		if(rt_status.comments_count === undefined) {
     			rt_status.comments_count = '0';
     		}
     		status.retweeted_status_screen_name = rt_status.user.screen_name;
     		status.retweeted_status_id = rt_status.id;
     		status.rt_comments_count = comments_count_tpl.format(rt_status);
     		var rtrt_status = rt_status.retweeted_status;
     		if(rtrt_status && rtrt_status.user) {
     			if(rtrt_status.repost_count === undefined) {
     				rtrt_status.repost_count = '0';
         		}
     			if(rtrt_status.comments_count === undefined) {
     				rtrt_status.comments_count = '0';
         		}
     			status.rtrt_comments_count = 
     				comments_count_tpl.format(rtrt_status);
     		}
     	} else {
     		status.retweeted_status_id = status.retweeted_status_screen_name = '';
     	}
     	var buttons = {};
     	for(var key in BUTTON_TPLS) {
     		var tpl = BUTTON_TPLS[key];
     		var map_status = status;
     		if(key.substring(0, 4) == 'rtrt') {
     			map_status = status.retweeted_status 
     				? status.retweeted_status.retweeted_status: null;
     			if(!map_status) {
     				tpl = '';
     			}
 			} else if(key.substring(0, 2) == 'rt') {
     			map_status = status.retweeted_status;
     			if(!map_status) {
     				tpl = '';
     			}
     		}
     		if(tpl && key.endswith('MapBtn') && 
     				(!map_status.geo || !map_status.geo.coordinates 
     					|| map_status.geo.coordinates[0] == '0.0')) {
     			tpl = '';
 	        }
     		if(tpl) {
     			tpl = tpl.format(status);
     		}
     		buttons[key] = tpl;
     	}
     	if(status.favorited || 
     			(status.favorited === undefined && t == 'favorites')){
     		buttons.addFavoritesMsgBtn = '';
        } else {
        	buttons.delFavoritesMsgBtn = '';
        }
     	if(c_user.id == status.user.id) {
            status.myTweet = true;
            buttons.new_msgBtn = '';
            buttons.rtOretweetBtn = buttons.oretweetBtn = '';
        } else {
        	buttons.delTweetBtn = '';
        }
     	// 不支持评论
        if(status.hide_comments === true) {
        	buttons.commentBtn = buttons.commentCounts 
        		= buttons.rtCommentCounts = buttons.rtCommentBtn = '';
        }
        if(status.retweeted_status && status.retweeted_status.retweeted) {
        	buttons.rtOretweetBtn = '<a class="oretweet ort orted" href="javascript:void(0);" title="'
        		+ _u.i18n("btn_rted_title") + '"></a>';
        }
        if(status.retweeted) {
        	buttons.oretweetBtn = '<a class="oretweet ort orted" href="javascript:void(0);" title="'
        		+ _u.i18n("btn_rted_title") + '"></a>';
        }
        var status_type = status.status_type || t;
        var context = {
            provinces: provinces,
            tType: status_type,
            getUserCountsInfo: getUserCountsInfo,
            buildTipboxUserInfo: buildTipboxUserInfo,
            processMsg: tapi.processMsg,
            user: status.user,
            account: c_user,
            tweet: status,
            is_rt_rt: false,
            support_follow: c_user.blogType != 'douban',
            support_instapaper: support_instapaper,
            btn: buttons
        };
        if(messageReplyToBtn && status.recipient && status.recipient.id != c_user.id) {
        	buttons.messageReplyToBtn = messageReplyToBtn.format(status);
        }
        try {
        	var html = Shotenjin.render(TEMPLATE, context);
            var need_rt_rt = status.retweeted_status 
            	&& status.retweeted_status.retweeted_status;
            var rt_rt_tpl = null;
            if(status.retweeted_status) {
            	html = html.replace(rt_replace_pre, Shotenjin.render(TEMPLATE_RT, context));
            	if(need_rt_rt) {
            		if(!TEMPLATE_RT_RT) {
            			TEMPLATE_RT_RT = TEMPLATE_RT.replace(/tweet\.retweeted_status/g, 'tweet.retweeted_status.retweeted_status')
            				.replace(/btn\.rt/g, 'btn.rtrt');
            		}
            		context.is_rt_rt = true;
            		context.retweeted_status_user = status.retweeted_status.user;
            		html = html.replace(rt_rt_replace_pre, 
            			Shotenjin.render(TEMPLATE_RT_RT, context));
                }
            }
            htmls.push(html);
        } catch(err) {
            log(err);
        }
        status.readed = true;
    }
    return htmls;
};

function buildUsersHtml(users, t, c_user){
	var htmls = [];
    if(!users || users.length == 0) { 
    	return htmls; 
    }
    if(!c_user){
        c_user = getUser();
    }
    for(var i in users) {
    	var user = users[i];
        var context = {
            provinces: provinces,
            tType: t,
            getUserCountsInfo: getUserCountsInfo,
            buildTipboxUserInfo: buildTipboxUserInfo,
            processMsg: tapi.processMsg,
            user: user,
            account: c_user,
            support_follow: c_user.blogType != 'douban'
        };
        try {
            htmls.push(Shotenjin.render(TEMPLATE_FANS, context));
        } catch(err) {
            log(err);
        }
    }
    return htmls;
};

// 生成Tipbox用户信息(鼠标移到用户头像时显示的用户信息)
function buildTipboxUserInfo(user){
    var context = {
	    provinces: provinces,
	    user: user
	};
    var r = Shotenjin.render(TEMPLATE_TIPBOX_USER_INFO, context);
    return r;
};

// 生成用户信息
function buildUserInfo(user){
    var context = {
        provinces: provinces,
        getUserCountsInfo: getUserCountsInfo,
        user: user,
        support_follow: getUser().blogType != 'douban'
    };
    var r = Shotenjin.render(TEMPLATE_USER_INFO, context);
    return r;
};

//生成粉丝信息
function buildFansLi(user, t){
    var context = {
	    t: t,
	    provinces: provinces,
	    getUserCountsInfo: getUserCountsInfo,
	    user: user
	};
    var r = Shotenjin.render(TEMPLATE_FANS, context);
    return r;
};

/**
 * 生成评论列表 / 转发列表
 * timeline_type: repost, comment
 */
function buildComment(comment, status_id, status_user_screen_name, 
		status_user_id, timeline_type){
    var c_user = getUser();
    var comment_id = comment.id;
    var comment_user_screen_name = comment.user.screen_name;
    var comment_user_id = comment.user.id;
    var datetime = new Date(comment.created_at).format("yyyy-MM-dd hh:mm:ss");
    var comment_btn = null;
    var repost_status = '';
    if(timeline_type == 'comment') {
    	if(comment.status && comment.status.id) {
        	status_id = comment.status.id;
        	if(comment.status.user) {
        		status_user_screen_name = comment.status.user.screen_name;
        		status_user_id = comment.status.user.id;
        	}
        }
    	comment_btn = ('<a class="replyComment" href="javascript:void(0);" '
    		+ ' onclick="javascript:doComment(this,\'{{status_user_screen_name}}\',\'{{status_user_id}}\',\'{{status_id}}\',\'{{comment_user_screen_name}}\',\'{{comment_user_id}}\',\'{{comment_id}}\');" ' 
    		+ ' title="'+ _u.i18n("btn_reply_comment_title") +'">'
    		+ _u.i18n("abb_reply") +'</a>').format({
    	    	status_id: status_id,
    	    	status_user_screen_name: status_user_screen_name,
    	    	status_user_id: status_user_id,
    	    	comment_id: comment_id,
    	    	comment_user_screen_name: comment_user_screen_name,
    	    	comment_user_id: comment_user_id
    	    });
    } else { // repost
    	var status = comment;
    	status_id = status.id;
    	status_user_id = status.user.id;
    	status_user_screen_name = status.user.screen_name;
    	// 直接回复给转发者的微博
    	comment_id = ''; 
    	comment_user_id = '';
    	comment_user_screen_name = '';
    	var retweeted_status_screen_name = '';
    	var retweeted_status_id = '';
    	if(status.retweeted_status && status.retweeted_status.user) {
    		retweeted_status_screen_name = status.retweeted_status.user.screen_name;
    		retweeted_status_id = status.retweeted_status.id;
    	}
    	status.retweeted_status_screen_name = retweeted_status_screen_name;
    	status.retweeted_status_id = retweeted_status_id;
    	var repost_btn = ('<a class="replyComment" href="javascript:void(0);" ' 
    		+ 'onclick="javascript:doRepost(this,\'{{user.screen_name}}\',\'{{id}}\',\'{{retweeted_status_screen_name}}\',\'{{retweeted_status_id}}\');" ' 
    		+ 'title="'+ _u.i18n("btn_repost_title") +'">'+ _u.i18n("abb_repost") +'</a>').format(status);
    	comment_btn = ('<a class="replyComment" href="javascript:void(0);" ' 
    		+ 'onclick="javascript:doComment(this,\'{{user.screen_name}}\', \'{{user.id}}\', \'{{id}}\');" '
    		+ 'title="'+ _u.i18n("btn_comment_title") +'">&nbsp;&nbsp;'
    		+ _u.i18n("abb_comment") +'</a>').format(status);
    	comment_btn += repost_btn;
    	repost_status = '<div class="msgObjJson" style="display:none;">' 
    		+ escape(JSON.stringify(status)) + '</div>';
    	datetime = '<a href="' + status.t_url + '">' + datetime 
    		+ '</a> ' + _u.i18n('comm_post_by') + ' ' 
    		+ status.source + ' ' + _u.i18n('comm_repost');
    }
    if(comment.user.verified) {
    	comment.user.verified = '<img title="'+ _u.i18n("comm_verified") +'" src="/images/verified.gif" />';
    } else {
    	comment.user.verified = '';
    }
    var reply_user = ('<a target="_blank" href="javascript:getUserTimeline(\'{{screen_name}}\', \'{{id}}\');" rhref="{{t_url}}" title="'+ _u.i18n("btn_show_user_title") +'">@{{screen_name}}{{verified}}</a>').format(comment.user);
    var tp = '<li>' 
            + reply_user + ': ' + tapi.processMsg(c_user, comment) 
            + '<span class="msgInfo">(' + datetime + ')</span>'
            + comment_btn
            + repost_status
            + '</li>';
    return tp;
}

function getUserCountsInfo(user){
	if(user.statuses_count == undefined) return '';
    tp = _u.i18n("comm_follow") + '：' + user.friends_count + '\r\n'
           + _u.i18n("comm_fans") + '：' + user.followers_count + '\r\n'
           + _u.i18n("comm_tweet") + '：' + user.statuses_count + '';
    return tp;
}