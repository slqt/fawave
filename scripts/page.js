// @author qleelulu@gmail.com

var TSINA_API_EMOTIONS = window.TSINA_API_EMOTIONS || {};

var FAWAVE_BASE_URL = chrome.extension.getURL("");

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

/* 在页面上显示新信息 */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if(request.method){
        methodManager[request.method](request, sender, sendResponse);
    }
});

var methodManager = {
	showSendQuickMessage: function(request, sender, sendResponse) {
		fawaveInitTemplate();
		var fsw = $("#fawaveSendMsgWrap");
        if(fsw.css('display')=='none'){
            //更新用户列表，避免切换用户或者修改用户列表
            chrome.extension.sendRequest({method:'getQuickSendInitInfos'}, function(response){
                CURRENT_USER = response.c_user;
                USER_LIST = response.userList;
                initSelectSendAccounts();
            });
            fsw.show();
        }
        //注意下面三句的顺序，不能乱
        var text = request.text;
        var link = request.link;
        var info = request.info; // mediaType: "image"
        if(!text) {
        	text = link;
        } else if(link) {
        	text += ' ' + link;
        }
        $("#fawaveTxtContentInp").focus();
        if(text){ 
        	$("#fawaveTxtContentInp").val(text); 
        }
        if(info.mediaType == 'image') {
        	$('#imgPreview').html('<img style="max-width: 400px; max-height: 150px;" src="' + info.srcUrl + '" />');
        }
        fawaveCountInputText();
        if(link) {
        	chrome.extension.sendRequest({method:'shortenUrl', long_url:link}, function(response){
	            if(response.short_url){
	                $("#fawaveTxtContentInp").val($("#fawaveTxtContentInp").val().replace(link, response.short_url));
	                fawaveCountInputText();
	            }
	        });
        }
	},
    showNewMsgInPage: function(request, sender, sendResponse){
        if(window.fawave_not_alert){ return; }
        if(request.msgs && request.msgs.length>0){
            var msg_wrap = $("#fa_wave_msg_wrap");
            if(msg_wrap.length < 1){
                msg_wrap = $('<div id="fa_wave_msg_wrap">' +
                                '<div class="fawave_btns fawave_clearFix">' +
	                                '<a href="javascript:void(0)" class="fawave_but fawave_logo fawave_not_alert"><img src="' + chrome.extension.getURL("icons/icon48.png") + '" />'+ _u.i18n("comm_not_alert_this_page") +'</a>' +
                                    '<a href="javascript:void(0)" class="close_fawave_remind fawave_but fawave_fr">'+ _u.i18n("comm_close") +'</a>' +
                                '</div><div class="fa_wave_list"></div></div>').appendTo('body');
                msg_wrap.find('.close_fawave_remind').click(function(){ close_fawave_remind(); });
                msg_wrap.find('.fawave_not_alert').click(function(){ window.fawave_not_alert = true; close_fawave_remind(); });
                msg_wrap.hover(function(){
                    $("#fa_wave_msg_wrap .fa_wave_list > div").stop(true).css('opacity', '1.0');
                }, function(){
                    $("#fa_wave_msg_wrap .fa_wave_list > div")
                        .animate({opacity: 1.0}, 800)      
                        .fadeOut('slow', function() {
                              $(this).remove();
                              if(!$("#fa_wave_msg_wrap .fa_wave_list").html()){
                                  $("#fa_wave_msg_wrap").hide();
                              }
                          });
                });
            }
            var msg_list_wrap = msg_wrap.find('.fa_wave_list');
            var len = request.msgs.length>5 ? 5 : request.msgs.length;
            var showCount = 0;//已经提示的信息数
            var user = request.user;
            var _msg_user = null;
            for(var i=0; i<request.msgs.length; i++){
                _msg_user = request.msgs[i].user || request.msgs[i].sender;
                if(_msg_user.id != user.id){
                    showCount += 1;
                    if(showCount == 1){msg_wrap.show();}//有可显示的信息，就显示
                    $(builFawaveTip(request.msgs[i], user)).find('a').each(function(){
                            if($(this).attr('rhref')){
                                $(this).attr('href', $(this).attr('rhref'));
                            }
                        }).end()
                        .appendTo(msg_list_wrap)
                        .fadeIn('slow')
                        .animate({opacity: 1.0}, 8000)
                        .fadeOut('slow', function() {
                          $(this).remove();
                          if(!msg_list_wrap.html()){
                              msg_wrap.hide();
                          }
                        });
                    if(showCount >= 5){break;}
                }
            }
            if(!msg_list_wrap.html()){
                msg_wrap.hide();
            }
        }
    }
};
//@account: 当前微博所属的账号
function builFawaveTip(msg, account){
    var user = msg.user || msg.sender;
    var picHtml = '', rtHtml = '';
    if(msg.thumbnail_pic){
        picHtml = '<div><a target="_blank" href="'+msg.original_pic+'"> <img class="imgicon pic" src="' + msg.thumbnail_pic + '" /></a> </div>';
    }
    if(msg.retweeted_status){
        rtHtml =  '<div class="retweeted"><span class="username"><a target="_blank" href="' + msg.retweeted_status.user.t_url + '">' + msg.retweeted_status.user.screen_name + '</a>: </span>'
                + tapi.processMsg(account, msg.retweeted_status.text);
        if(msg.retweeted_status.thumbnail_pic){
            rtHtml += '<div><a target="_blank" href="'+msg.retweeted_status.original_pic+'"> <img class="imgicon pic" src="' + msg.retweeted_status.thumbnail_pic + '" /> </a> </div>';
        }
        rtHtml += '</div>';
    }
    var tp =  '<div class="msgRemind">'
            + '  <div class="usericon">'
            + '	   <a target="_blank" href="' + user.t_url + '"><img src="' + user.profile_image_url.replace('24x24', '48x48') + '" class="face" /></a>'
            + '	   <img src="' + chrome.extension.getURL("images/blogs/"+account.blogType+"_16.png") + '" class="blogType" />'
            + '  </div>'
            + '  <div class="maincontent">'
            + '    <div class="msg">'
            + '       <span class="username"><a target="_blank" href="' + user.t_url + '">' + user.screen_name + '</a>: </span>'
            +         tapi.processMsg(account, msg.text) + picHtml 
            + '    </div>'
            +      rtHtml
            + '  </div>'
            + '</div>';
    return tp;
};

function close_fawave_remind(){
    $("#fa_wave_msg_wrap .fa_wave_list").html('');
    $("#fa_wave_msg_wrap").hide();
};

// HTML 编码
function HTMLEnCode(str){
    if(!str){ return ''; }
    str = str.replace(/</ig, '&lt;');
    str = str.replace(/>/ig, '&gt;');
    return str;
};

/*
<li class="tweetItem showCounts_${status.id}" id="tweet${status.id}" did="${status.id}">
	<div class="usericon">
		<a target="_blank" href="" title="">
			<img src="${status.user.profile_image_url.replace('24x24', '48x48')}" />
		</a>
	</div>
	<div class="mainContent">
		<div class="userName">
			<a target="_blank" href="" title="">${status.user.screen_name}</a>
		</div>
		<div class="msg">
			<div class="tweet">${status.text}
				<?py if(status.thumbnail_pic): ?>
				<div>
					<a target="_blank" onclick="showFacebox(this);return false;" href="javascript:void(0);" bmiddle="#{status.bmiddle_pic}" >
						<img class="imgicon pic" src="#{status.thumbnail_pic}" />
					</a>
				</div>
				<?py #endif ?>
			</div>
		</div>
		<div class="retweet"></div>
		<div class="msgInfo">${status.created_at} 通过 #{status.source}</div>
	</div>
</li>
*/


/**
 * 格式化字符串 from tbra
 * eg:
 * 	formatText('{0}天有{1}个小时', [1, 24]) 
 *  or
 *  formatText('{{day}}天有{{hour}}个小时', {day:1, hour:24}}
 * @param {Object} msg
 * @param {Object} values
 */
function fawaveFormatText(msg, values, filter) {
    var pattern = /\{\{([\w\s\.\(\)"',-]+)?\}\}/g;
    return msg.replace(pattern, function(match, key) {
        return jQuery.isFunction(filter) ? filter((values[key] || eval('(values.' +key+')')), key) : (values[key] || eval('(values.' +key+')')); //values[key];
    });	
};
// 让所有字符串拥有模板格式化
String.prototype.format = function(data) {
	return fawaveFormatText(this, data);
};
// 为字符串增加去除所有html tag和空白的字符的方法
String.prototype.remove_html_tag = function() {
	return this.replace(/(<.*?>|&nbsp;|\s)/ig, '');
};
/* 在页面上显示新信息 end */


/* 快速发微博 */
var QUICK_SEND_TEMPLATE = ' \
    <div id="fawaveSendMsgWrap" style="display:none;"> \
        <div class="fawave-model-container">\
            <div class="modal-title" id="modalTitle">'+ _u.i18n("comm_quick_send") +'--'+ _u.i18n("extName") +'</div> \
            <div class="close"><a href="javascript:" class="fawavemodal-close">x</a></div> \
            <div class="modal-data"> \
                <div>\
                	<input type="checkbox" id="fawave-share-page-chk-and-capture" /><label for="fawave-share-page-chk-and-capture">'+ _u.i18n("comm_share_this_page_and_capture") +'</label>\
                    &nbsp;&nbsp;\
                	<input type="checkbox" id="fawave-share-page-chk" /><label for="fawave-share-page-chk">'+ _u.i18n("comm_share_this_page") +'</label>\
                    <span class="fawave-wordCount">140</span>\
                    <textarea id="fawaveTxtContentInp" style="width:100%;" rows="5" ></textarea>\
                </div>\
                <div id="imgPreview" style="margin: 5px;"></div> \
                <ul id="fawave_accountsForSend"></ul>\
                <div class="fawaveSubmitWarp">\
                    <button id="btnFawaveQuickSend" class="btn-positive" title="'+ _u.i18n("comm_send_tip") +'">\
                        <img src="/images/tick.png" alt="">'+ _u.i18n("comm_send") +'</button>\
                    <button class="btn-negative">\
                        <img src="/images/cross.png" alt="">'+ _u.i18n("comm_cancel") +'</button>\
                    <span class="fawaveQuickSendTip"></span>\
                </div>\
                <span class="fawaveUserInfo">\
                    <span></span>\
                    <a target="_blank"><img /></a><img class="blogType" />\
                </span>\
            </div> \
            <div class="fawaveInfoMsg"></div>\
            <iframe scr="about:blank" style="position:absolute;z-index:-1;top:0;left:0;height:100%;width:100%;" width="420" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no" allowtransparency="yes"></iframe>\
        </div>\
    </div>';

QUICK_SEND_TEMPLATE = QUICK_SEND_TEMPLATE.replace('/images/tick.png', chrome.extension.getURL("/images/tick.png"))
                                         .replace('/images/cross.png', chrome.extension.getURL("/images/cross.png"));

var QUICK_SEND_HOT_KEYS = '', QUICK_SEND_HOT_KEYS_COUNT = 0, PRESSED_KEY = [], CURRENT_USER = '', USER_LIST = '';

// 微博字数
String.prototype.len = function(){
	return Math.round(this.replace(/[^\x00-\xff]/g, "qq").length / 2);
};

function fawaveCountInputText(){
    $("#fawaveSendMsgWrap .fawave-wordCount").html(140 - $("#fawaveTxtContentInp").val().len());
};

function showFawaveSendMsg(msg){
    $('<div class="fawaveMessageInfo">' + msg + '</div>')
        .appendTo('#fawaveSendMsgWrap .fawaveInfoMsg')
        .fadeIn('slow')
        .animate({opacity: 1.0}, 5000)
        .fadeOut('slow', function() {
          $(this).remove();
        });
};

function fawaveInitTemplate(){
    if($("#fawaveSendMsgWrap").length){ return; }

    $('body').append(QUICK_SEND_TEMPLATE);

    //initSelectSendAccounts();

    $("#fawaveSendMsgWrap .fawavemodal-close").click(function(){
        //showFawaveAlertMsg('');
        $("#fawaveSendMsgWrap").hide();
    });

    $("#fawaveSendMsgWrap .btn-negative").click(function(){
        $("#fawaveTxtContentInp").val('');
        $("#fawave-share-page-chk").attr("checked", false);
        $("#fawave-share-page-chk-and-capture").attr("checked", false);
        //showFawaveAlertMsg('');
        $("#fawaveSendMsgWrap").hide();
    });

    $("#fawaveTxtContentInp").bind('keyup', function(){
        fawaveCountInputText();
    });

    $("#fawaveTxtContentInp").keydown(function(event){
        if(event.ctrlKey && event.keyCode==13){
            sendFawaveMsg();
            return false;
        }
    });

    var chkLooking = document.getElementById("fawave-share-page-chk");
    if(chkLooking){
        chkLooking.addEventListener("click", function() {
            fawaveToggleLooking(this);
        }, false);
    }
    
    var chkLooking_and_capture = document.getElementById("fawave-share-page-chk-and-capture");
    if(chkLooking_and_capture){
    	chkLooking_and_capture.addEventListener("click", function() {
            fawaveToggleLooking(this, true);
        }, false);
    }

    var btnSend = document.getElementById("btnFawaveQuickSend");
    if(btnSend){
        btnSend.addEventListener("click", function() {
            sendFawaveMsg();
        }, false);
    }
};

// 初始化用户选择视图, is_upload === true 代表是上传
function initSelectSendAccounts(is_upload){
    if(!USER_LIST || !CURRENT_USER){ return; }
    var afs = $("#fawave_accountsForSend");
    if(afs.data('inited')){
        return;
    }
    var userList = USER_LIST;
    if(userList.length < 2){
        if(CURRENT_USER){
            var f_u_info = $("#fawaveSendMsgWrap .fawaveUserInfo").show();
            f_u_info.find('span').html(CURRENT_USER.screen_name)
                .end().find('a').attr('href', CURRENT_USER.t_url)
                .end().find('a img').attr('src', CURRENT_USER.profile_image_url)
                .end().find('img.blogType').attr('src', chrome.extension.getURL('images/blogs/' + CURRENT_USER.blogType + '_16.png'));
        }
        return;
    } //多个用户才显示
    var li_tp = '<li class="{{sel}}" uniqueKey="{{uniqueKey}}" >' +
                   '<img src="{{profile_image_url}}" />' +
                   '{{screen_name}}' +
                   '<img src="{{fawave_base_url}}images/blogs/{{blogType}}_16.png" class="blogType" />' +
               '</li>';
    var li = [];
    var c_user = CURRENT_USER;
    for(var i in userList){
        user = userList[i];
        user.fawave_base_url = FAWAVE_BASE_URL;
        if(is_upload === true && tapi.get_config(user).support_upload === false) {
        	continue;
        }
        if(user.uniqueKey == c_user.uniqueKey){
            user.sel = 'sel';
        }else{
            user.sel = '';
        }
        li.push(fawaveFormatText(li_tp, user));
    }
    afs.html('TO:(<a class="all" href="javascript:" id="fawave_toggleSelectAllSendAccount">'+ _u.i18n("abb_all") +'</a>) ' + li.join(''));
    afs.data('inited', 'true');
    afs.find('li').click(function(){ toggleSelectSendAccount(this); });
    $("#fawave_toggleSelectAllSendAccount").click(function(){ toggleSelectAllSendAccount(); });
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
    if($("#fawave_accountsForSend .sel").length == $("#fawave_accountsForSend li").length){ //已全选
        $("#fawave_accountsForSend li").removeClass('sel');
    }else{
        $("#fawave_accountsForSend li").addClass('sel');
    }
};

function fawaveToggleLooking(ele, capture){
    chrome.extension.sendRequest({method:'getLookingTemplate'}, function(response){
        var fawaveLookingTemplate = response.lookingTemplate;
        var loc_url = window.location.href, s_url = $(ele).data('short_url');
        loc_url = s_url || loc_url;
        var title = document.title;
        var result = fawaveFormatText(fawaveLookingTemplate, {title:(title||''), url:loc_url});
        if($(ele).attr('checked')){
            $("#fawaveTxtContentInp").val(result);
            if(!s_url){
                chrome.extension.sendRequest({method:'shortenUrl', long_url:loc_url}, function(response){
                    if(response.short_url){
                        $("#fawaveTxtContentInp").val($("#fawaveTxtContentInp").val().replace(loc_url, response.short_url));
                        $(ele).data('short_url', response.short_url);
                        fawaveCountInputText();
                    }
                });
            }
            // 截图
            if(capture) {
            	$("#fawaveSendMsgWrap").hide();
            	setTimeout(function() {
            		chrome.extension.sendRequest({method:'captureVisibleTab'}, function(response){
                		$("#imgPreview").html('<img style="max-width: 400px; max-height: 150px;" src="' + response.dataUrl + '" />');
                		$("#fawaveSendMsgWrap").show();
                    });
            	}, 500);
            }
        }else{
            $("#fawaveTxtContentInp").val($("#fawaveTxtContentInp").val().replace(result, ''));
            if(capture) {
            	$("#imgPreview").html('');
            }
        }
        fawaveCountInputText();
    });
};

function sendFawaveMsg(){
    var msg = $.trim($("#fawaveTxtContentInp").val());
    var image_url = $('#imgPreview img').attr('src');
    if(!msg){
        showFawaveSendMsg(_u.i18n("msg_need_content"));
        return;
    }
    var users = [], selLi = $("#fawave_accountsForSend .sel");
    if(selLi.length){
        selLi.each(function(){
            var uniqueKey = $(this).attr('uniqueKey');
            $.each(USER_LIST, function(i, item){
            	if(item.uniqueKey == uniqueKey){
            		users.push(item);
            		return false;
            	}
            });
        });
    }else if(!$("#fawave_accountsForSend li").length){
        users.push(CURRENT_USER);
    }else{
        showFawaveSendMsg(_u.i18n("msg_need_select_account"));
        return;
    }
    var stat = {};
    stat.userCount = users.length;
    stat.sendedCount = 0;
    stat.successCount = 0;
    $("#fawaveSendMsgWrap input, #fawaveSendMsgWrap button, #fawaveSendMsgWrap textarea").attr('disabled', true);
    for(var i in users){
        _sendFawaveMsgWrap(msg, image_url, users[i], stat, selLi);
    }
};

function _sendFawaveMsgWrap(msg, imageUrl, user, stat, selLi){
    chrome.extension.sendRequest({method:'publicQuickSendMsg', user:user, sendMsg:msg, imageUrl: imageUrl}, function(response){
        stat.sendedCount++;
        var msg = response.msg;
        if( msg === true || (msg && msg.id) || (msg && msg.data && msg.data.id) || response.textStatus == 'success'){
            stat.successCount++;
            $("#fawave_accountsForSend li[uniquekey=" + user.uniqueKey +"]").removeClass('sel');
        }else if(msg && msg.error){
            showFawaveSendMsg('error: ' + msg.error);
        }
        else{
            showFawaveSendMsg(_u.i18n("msg_send_error").format({username:user.screen_name}));
        }
        if(stat.successCount >= stat.userCount){//全部发送成功
            selLi.addClass('sel');
            // 清空图片
            $('#imgPreview').html('');
            $("#fawaveSendMsgWrap .btn-negative").click();
        }
        if(stat.sendedCount >= stat.userCount){//全部发送完成
            selLi = null;
            $("#fawaveSendMsgWrap input, #fawaveSendMsgWrap button, #fawaveSendMsgWrap textarea").removeAttr('disabled');
            if(stat.successCount > 0){ //有发送成功的
                chrome.extension.sendRequest({method:'notifyCheckNewMsg'}, function(response){});
                
                if(stat.userCount > 1){ //多个用户的
                    showFawaveSendMsg(_u.i18n("msg_send_complete").format({successCount:stat.successCount, errorCount:(stat.userCount - stat.successCount)}));
                }
            }
            
        }
        user = null;
        stat = null;
    });
};

$(function(){
    
    chrome.extension.sendRequest({method:'getQuickSendInitInfos'}, function(response){
        QUICK_SEND_HOT_KEYS = response.hotkeys;
        QUICK_SEND_HOT_KEYS_COUNT = QUICK_SEND_HOT_KEYS.split(',').length;

        USER_LIST = response.userList;
        CURRENT_USER = response.c_user;
    });

    document.addEventListener("keydown", function(e) {
        if(!QUICK_SEND_HOT_KEYS){ return; }

        PRESSED_KEY.push(e.keyCode);
        if(PRESSED_KEY.length > QUICK_SEND_HOT_KEYS_COUNT){
            PRESSED_KEY.shift();
        }
        if(PRESSED_KEY.toString() == QUICK_SEND_HOT_KEYS ){
            fawaveInitTemplate();
            var fsw = $("#fawaveSendMsgWrap");
            if(fsw.css('display')=='none'){
                //更新用户列表，避免切换用户或者修改用户列表
                chrome.extension.sendRequest({method:'getQuickSendInitInfos'}, function(response){
                    CURRENT_USER = response.c_user;
                    USER_LIST = response.userList;
                    initSelectSendAccounts();
                });
                fsw.show();
                //注意下面三句的顺序，不能乱
                var sText = window.getSelection().toString();
                $("#fawaveTxtContentInp").focus();
                if(sText){ $("#fawaveTxtContentInp").val(sText); }
            }else{
                //showFawaveSendMsg('');
                fsw.hide();
            }
        }
    }, false);

});
/* 快速发微博 end */
