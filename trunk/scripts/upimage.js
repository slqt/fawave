// @author qleelulu@gmail.com

// 检测是否支持文件上传
function checkChrome(){
    if(!window.BlobBuilder && !window.WebKitBlobBuilder){
        $("body").html($("#needUpdateChrome")[0].outerHTML);
        $("#needUpdateChrome").show();
        return false;
    }
    return true;
};

function initOnLoad(){
    if(checkChrome()){
        init();
    }
};

function init(){
	initSelectSendAccounts(true);
	initTxtContentEven();
    $("#txtContent").focus();
    at_user_autocomplete('#txtContent');
    $(window).unload(function(){ initOnUnload(); }); 
    
    // 判断是否截图
    var params = decodeForm(window.location.search);
    if(params.tabId) {
    	chrome.tabs.get(parseInt(params.tabId), function(tab) {
    		// 设置标题和缩短网址
    		var title = tab.title || '';
    		var loc_url = tab.url;
            var $txt = $("#txtContent");
            var settings = Settings.get();
            $txt.val(formatText(settings.lookingTemplate, {title: title, url: loc_url})).focus();
            countInputText();
            _shortenUrl(loc_url, settings, function(shorturl){
	            if(shorturl) {
	                $txt.val($txt.val().replace(loc_url, shorturl)).focus();
	            }
	        });
            // 截图
    		chrome.tabs.captureVisibleTab(tab.windowId, null, function(dataurl) {
        		$("#imgPreview").html('<img class="pic" src="' + dataurl + '" />');
        	});
    	});
    }
};

var TP_USER_UPLOAD_INFO = '<li id="u_uploadinfo_{{uniqueKey}}">'
    + '<img src="{{profile_image_url}}">{{screen_name}}<img src="/images/blogs/{{blogType}}_16.png" class="blogType">: '
    + '<span class="barWrap"><strong class="bar" style="width: 10%;"><span></span></strong></span>'
    + '<span class="progressInfo"></span>'
    + '</li>';

function sendMsg(){ //覆盖popup.js的同名方法
    var check = true;
    var c_user = getUser();
    if(!c_user){
        _showMsg(_u.i18n("msg_need_add_account"));
        check = false;
    }
    var msg = $.trim($("#txtContent").val());
    if(!msg){
        _showMsg(_u.i18n("msg_need_content"));
        check = false;
    }
    var file = $("#imageFile")[0].files[0];
    if(!file) {
    	var image_url = $('#imageUrl').val();
    	if(image_url) {
    		file = getImageBlob(image_url);
    	} else {
    		var dataUrl = $('#imgPreview img').attr('src');
    		if(dataUrl) {
    			file = dataUrlToBlob(dataUrl);
    		}
    	}
    }
    if(!checkFile(file)){
        check = false;
    }

    if(!check){ return; }
	
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
        users.push(c_user);
    }else{
        _showMsg(_u.i18n("msg_need_select_account"));
        return;
    }
    var upInfo = $("#uploadinfo").html(''), stat = {uploaded:[]};
    stat.userCount = users.length;
    stat.sendedCount = 0;
    stat.successCount = 0;
    for(var i in users){
        var user = users[i];
        upInfo.append(TP_USER_UPLOAD_INFO.format(user));
        var pic = {file: file};
        var data = {status: msg};
        
        _uploadWrap(user, data, pic, stat, selLi);
    }
};

function _uploadWrap(user, data, pic, stat, selLi){
    tapi.upload(user, data, pic, 
        function() {
            _showLoading();
            disabledUpload();
        }, 
        function(ev) {
            onprogress(ev, user, stat);
        }, 
        function(data, textStatus, error_code) {
            //processUploadResult(data, textStatus, error_code);

            stat.sendedCount++;
            if(textStatus != 'error' && data && !data.error){
                stat.successCount++;
                $("#accountsForSend li[uniquekey=" + user.uniqueKey +"]").removeClass('sel');
                $("#u_uploadinfo_" + user.uniqueKey).find('.progressInfo').append(' (<span>'+ _u.i18n("comm_success") +'</span>)');
            }else if(data.error){
                _showMsg('error: ' + data.error);
                $("#u_uploadinfo_" + user.uniqueKey).addClass('error').find('.progressInfo').append(' (<span style="color:red">'+ _u.i18n("comm_fail") +'</span>)');
            }
            if(stat.successCount >= stat.userCount){//全部发送成功
                _showMsg(_u.i18n("msg_send_success"));
                selLi.addClass('sel');
                var ifw = $("#imageFileWrap");
                ifw.html(ifw.html());
                $("#txtContent").val('');
                $("#btnSend").attr('disabled', true);
                $("#imgPreview").html('');
                $("#progressBar span").html("");
            }
            if(stat.sendedCount >= stat.userCount){//全部发送完成
                selLi = null;
                $("#progressBar")[0].style.width = "0%";
                enabledUpload();
                _hideLoading();
                if(stat.successCount > 0){ //有发送成功的
                    setTimeout(callCheckNewMsg, 1000);
                    var failCount = stat.userCount - stat.successCount;
                    if(stat.userCount > 1 && failCount > 0){ //多个用户的
                        _showMsg(_u.i18n("msg_send_complete").format({successCount:successCount, errorCount:failCount}));
                    }
                }
            }
        }
    );
};

var FILECHECK = {
	maxFileSize: 2*1024000,
    fileTypes: '__image/gif__image/jpeg__image/jpg__image/png__'
};

function checkFile(file){
    var check = true;
    if(file){
        if(file.size > FILECHECK.maxFileSize){
            _showMsg(_u.i18n("msg_file_too_large"));
            check = false;
        }
        if(file.type && FILECHECK.fileTypes.indexOf('__' + file.type + '__') < 0){
            _showMsg(_u.i18n("msg_pic_type_error"));
            check = false;
        }
    }else{
        _showMsg(_u.i18n("msg_need_pic"));
        check = false;
    }
    return check;
};


function onprogress(rpe, user, stat){
    if(!user){return;}
    stat.uploaded[user.uniqueKey] = rpe.loaded;
    //$("#progressBar")[0].style.width = ((rpe.loaded * 200 / rpe.total) >> 0) + "px";
    var precent = parseInt((rpe.loaded / rpe.total) * 100);
    $("#u_uploadinfo_" + user.uniqueKey).find(".bar").css('width', precent + "%")
        .end().find(".progressInfo").html("Sent: " + size(rpe.loaded) + " of " + size(rpe.total));
    var allLoaded = 0;
    for(key in stat.uploaded){
        allLoaded += stat.uploaded[key];
    }
    var allPrecent = parseInt((allLoaded / (rpe.total*stat.userCount) ) * 100);
    $("#progressBar")[0].style.width = allPrecent + "%";
    $("#progressBar span").html(allPrecent + "%");
};

function size(bytes){   // simple function to show a friendly size
    var i = 0;
    while(1023 < bytes){
        bytes /= 1024;
        ++i;
    };
    return  i ? bytes.toFixed(2) + ["", " Kb", " Mb", " Gb", " Tb"][i] : bytes + " bytes";
};


function selectFile(fileEle){
    var file = fileEle.files[0];
    $("#imgPreview").html('');
    $('#imageUrl').val('');
    $("#progressBar")[0].style.width = "0%";
    $("#progressBar span").html("");
    if(file){
        var check = checkFile(file);
        if(check){
            var reader = new FileReader();
            reader.onload = function(e){
                $("#imgPreview").html('<img class="pic" src="' + e.target.result + '" />');
            };
            reader.readAsDataURL(file);
        }
    }
};

function selectUrl(ele){
    var url = $(ele).val();
    $("#imgPreview").html('');
    $('#uploadForm').get(0).reset();
    $('#imageUrl').val(url);
    $("#progressBar")[0].style.width = "0%";
    $("#progressBar span").html("");
    if(url){
    	$("#imgPreview").html('<img class="pic" src="' + url + '" />');
    }
};

function disabledUpload(){
    $("#btnSend").attr('disabled', true);
    $("#imageFile").attr('disabled', true);
};

function enabledUpload(){
    $("#btnSend").removeAttr('disabled');
    $("#imageFile").removeAttr('disabled');
};