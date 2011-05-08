// @author qleelulu@gmail.com

// 新浪微博表情转化
var TSINA_FACE_URL_PRE = 'http://timg.sjs.sinajs.cn/t3/style/images/common/face/ext/normal/';
var TSINA_FACE_TPL = '[{{name}}]';
var TSINA_FACES = {
"呵呵": "eb/smile.gif",
"嘻嘻": "c2/tooth.gif",
"哈哈": "6a/laugh.gif",
"爱你": "7e/love.gif",
"晕": "a4/dizzy.gif",
"泪": "d8/sad.gif",
"馋嘴": "b8/cz_thumb.gif",
"抓狂": "4d/crazy.gif",
"哼": "19/hate.gif",
"可爱": "9c/tz_thumb.gif",
"怒": "57/angry.gif",
"汗": "13/sweat.gif",
"困": "8b/sleepy.gif",
"害羞": "05/shame_thumb.gif",
"睡觉": "7d/sleep_thumb.gif",
"钱": "90/money_thumb.gif",
"偷笑": "7e/hei_thumb.gif",
"酷": "40/cool_thumb.gif",
"衰": "af/cry.gif",
"吃惊": "f4/cj_thumb.gif",
"闭嘴": "29/bz_thumb.gif",
"鄙视": "71/bs2_thumb.gif",
"挖鼻屎": "b6/kbs_thumb.gif",
"花心": "64/hs_thumb.gif",
"鼓掌": "1b/gz_thumb.gif",
"失望": "0c/sw_thumb.gif",
"思考": "e9/sk_thumb.gif",
"生病": "b6/sb_thumb.gif",
"亲亲": "8f/qq_thumb.gif",
"怒骂": "89/nm_thumb.gif",
"太开心": "58/mb_thumb.gif",
"懒得理你": "17/ldln_thumb.gif",
"右哼哼": "98/yhh_thumb.gif",
"左哼哼": "6d/zhh_thumb.gif",
"嘘": "a6/x_thumb.gif",
"委屈": "73/wq_thumb.gif",
"吐": "9e/t_thumb.gif",
"可怜": "af/kl_thumb.gif",
"打哈气": "f3/k_thumb.gif",
"做鬼脸": "88/zgl_thumb.gif",
"握手": "0c/ws_thumb.gif",
"耶": "d9/ye_thumb.gif",
"good": "d8/good_thumb.gif",
"弱": "d8/sad_thumb.gif",
"不要": "c7/no_thumb.gif",
"ok": "d6/ok_thumb.gif",
"赞": "d0/z2_thumb.gif",
"来": "40/come_thumb.gif",
"蛋糕": "6a/cake.gif",
"心": "6d/heart.gif",
"伤心": "ea/unheart.gif",
"钟": "d3/clock_thumb.gif",
"猪头": "58/pig.gif",
"咖啡": "64/cafe_thumb.gif",
"话筒": "1b/m_thumb.gif",
"干杯": "bd/cheer.gif",
"绿丝带": "b8/green.gif",
"蜡烛": "cc/candle.gif",
"微风": "a5/wind_thumb.gif",
"月亮": "b9/moon.gif",
"月饼": "96/mooncake3_thumb.gif",
"满月": "5d/moon1_thumb.gif",
"酒壶": "64/wine_thumb.gif",
"团": "11/tuan_thumb.gif",
"圆": "53/yuan_thumb.gif",
"左抱抱": "54/left_thumb.gif",
"右抱抱": "0d/right_thumb.gif",
"乐乐": "66/guanbuzhao_thumb.gif",
"团圆月饼": "e6/tuanyuan_thumb.gif",
"快快": "49/lbq1_thumb.gif",
"织": "41/zz2_thumb.gif",
"围观": "f2/wg_thumb.gif",
"威武": "70/vw_thumb.gif",
"爱心专递": "c9/axcd_thumb.gif",
"奥特曼": "bc/otm_thumb.gif",
// 亚运
"国旗": "dc/flag_thumb.gif",
"金牌": "f4/jinpai_thumb.gif",
"银牌": "1e/yinpai_thumb.gif",
"铜牌": "26/tongpai_thumb.gif",
"围脖": "3f/weijin_thumb.gif",
"温暖帽子": "f1/wennuanmaozi_thumb.gif",
"手套": "72/shoutao_thumb.gif",
"落叶": "79/yellowMood_thumb.gif",
"照相机": "33/camera_thumb.gif",
"白云": "ff/y3_thumb.gif",
"礼物": "c4/liwu_thumb.gif",
"v5": "c5/v5_org.gif",
"书呆子": "61/sdz_org.gif"
};

// http://api.t.sina.com.cn/emotions.json
var TSINA_API_EMOTIONS = {
		"呵呵": "eb/smile.gif", "嘻嘻": "c2/tooth.gif", "哈哈": "6a/laugh.gif", "爱你": "7e/love.gif", "晕": "a4/dizzy.gif", "泪": "d8/sad.gif", "馋嘴": "b8/cz_org.gif", "抓狂": "4d/crazy.gif", "哼": "19/hate.gif", "可爱": "9c/tz_org.gif", "怒": "57/angry.gif", "汗": "13/sweat.gif", "困": "8b/sleepy.gif", "害羞": "05/shame_org.gif", "睡觉": "7d/sleep_org.gif", "钱": "90/money_org.gif", "偷笑": "7e/hei_org.gif", "酷": "40/cool_org.gif", "衰": "af/cry.gif", "吃惊": "f4/cj_org.gif", "闭嘴": "29/bz_org.gif", "鄙视": "71/bs2_org.gif", "挖鼻屎": "b6/kbs_org.gif", "花心": "64/hs_org.gif", "鼓掌": "1b/gz_org.gif", "失望": "0c/sw_org.gif", "思考": "e9/sk_org.gif", "生病": "b6/sb_org.gif", "亲亲": "8f/qq_org.gif", "怒骂": "89/nm_org.gif", "太开心": "58/mb_org.gif", "懒得理你": "17/ldln_org.gif", "右哼哼": "98/yhh_org.gif", "左哼哼": "6d/zhh_org.gif", "嘘": "a6/x_org.gif", "委屈": "73/wq_org.gif", "吐": "9e/t_org.gif", "可怜": "af/kl_org.gif", "打哈气": "f3/k_org.gif", "顶": "91/d_org.gif", "疑问": "5c/yw_org.gif", "做鬼脸": "88/zgl_org.gif", "握手": "0c/ws_org.gif", "耶": "d9/ye_org.gif", "good": "d8/good_org.gif", "弱": "d8/sad_org.gif", "不要": "c7/no_org.gif", "ok": "d6/ok_org.gif", "赞": "d0/z2_org.gif", "来": "40/come_org.gif", "蛋糕": "6a/cake.gif", "心": "6d/heart.gif", "伤心": "ea/unheart.gif", "钟": "d3/clock_org.gif", "猪头": "58/pig.gif", "咖啡": "64/cafe_org.gif", "话筒": "1b/m_org.gif", "月亮": "b9/moon.gif", "太阳": "e5/sun.gif", "干杯": "bd/cheer.gif", "微风": "a5/wind_org.gif", "飞机": "6d/travel_org.gif", "兔子": "81/rabbit_org.gif", "熊猫": "6e/panda_org.gif", "给力": "c9/geili_org.gif", "神马": "60/horse2_org.gif", "浮云": "bc/fuyun_org.gif", "织": "41/zz2_org.gif", "围观": "f2/wg_org.gif", "威武": "70/vw_org.gif", "奥特曼": "bc/otm_org.gif", "实习": "48/sx_org.gif", "自行车": "46/zxc_org.gif", "照相机": "33/camera_org.gif", "叶子": "b8/green_org.gif", "春暖花开": "ca/chunnuanhuakai_org.gif", "咆哮": "4b/paoxiao_org.gif", "彩虹": "03/ch_org.gif", "沙尘暴": "69/sc_org.gif", "地球一小时": "4f/diqiuxiuxiyixiaoshi_org.gif", "爱心传递": "c9/axcd_org.gif", "蜡烛": "cc/candle.gif", "绿丝带": "b8/green.gif", "挤眼": "c3/zy_org.gif", "亲亲": "8f/qq_org.gif", "怒骂": "89/nm_org.gif", "太开心": "58/mb_org.gif", "懒得理你": "17/ldln_org.gif", "打哈气": "f3/k_org.gif", "生病": "b6/sb_org.gif", "书呆子": "61/sdz_org.gif", "失望": "0c/sw_org.gif", "可怜": "af/kl_org.gif", "挖鼻屎": "b6/kbs_org.gif", "黑线": "91/h_org.gif", "花心": "64/hs_org.gif", "可爱": "9c/tz_org.gif", "吐": "9e/t_org.gif", "委屈": "73/wq_org.gif", "思考": "e9/sk_org.gif", "哈哈": "6a/laugh.gif", "嘘": "a6/x_org.gif", "右哼哼": "98/yhh_org.gif", "左哼哼": "6d/zhh_org.gif", "疑问": "5c/yw_org.gif", "阴险": "6d/yx_org.gif", "做鬼脸": "88/zgl_org.gif", "爱你": "7e/love.gif", "馋嘴": "b8/cz_org.gif", "顶": "91/d_org.gif", "钱": "90/money_org.gif", "嘻嘻": "c2/tooth.gif", "汗": "13/sweat.gif", "呵呵": "eb/smile.gif", "睡觉": "7d/sleep_org.gif", "困": "8b/sleepy.gif", "害羞": "05/shame_org.gif", "悲伤": "1a/bs_org.gif", "鄙视": "71/bs2_org.gif", "抱抱": "7c/bb_org.gif", "拜拜": "70/88_org.gif", "怒": "57/angry.gif", "吃惊": "f4/cj_org.gif", "闭嘴": "29/bz_org.gif", "泪": "d8/sad.gif", "偷笑": "7e/hei_org.gif", "哼": "19/hate.gif", "晕": "a4/dizzy.gif", "衰": "af/cry.gif", "抓狂": "4d/crazy.gif", "愤怒": "bd/fn_org.gif", "感冒": "a0/gm_org.gif", "鼓掌": "1b/gz_org.gif", "酷": "40/cool_org.gif", "来": "40/come_org.gif", "good": "d8/good_org.gif", "haha": "13/ha_org.gif", "不要": "c7/no_org.gif", "ok": "d6/ok_org.gif", "拳头": "cc/o_org.gif", "弱": "d8/sad_org.gif", "握手": "0c/ws_org.gif", "赞": "d0/z2_org.gif", "耶": "d9/ye_org.gif", "最差": "3e/bad_org.gif", "右抱抱": "0d/right_org.gif", "左抱抱": "54/left_org.gif", "粉红丝带": "77/pink_org.gif", "爱心传递": "c9/axcd_org.gif", "心": "6d/heart.gif", "绿丝带": "b8/green.gif", "蜡烛": "cc/candle.gif", "围脖": "3f/weijin_org.gif", "温暖帽子": "f1/wennuanmaozi_org.gif", "手套": "72/shoutao_org.gif", "红包": "71/hongbao_org.gif", "喜": "bf/xi_org.gif", "礼物": "c4/liwu_org.gif", "蛋糕": "6a/cake.gif", "钻戒": "31/r_org.gif", "钻石": "9f/diamond_org.gif", "大巴": "9c/dynamicbus_org.gif", "飞机": "6d/travel_org.gif", "自行车": "46/zxc_org.gif", "汽车": "a4/jc_org.gif", "手机": "4b/sj2_org.gif", "照相机": "33/camera_org.gif", "药": "5d/y_org.gif", "电脑": "df/dn_org.gif", "手纸": "55/sz_org.gif", "落叶": "79/yellowMood_org.gif", "圣诞树": "a2/christree_org.gif", "圣诞帽": "06/chrishat_org.gif", "圣诞老人": "c5/chrisfather_org.gif", "圣诞铃铛": "64/chrisbell_org.gif", "圣诞袜": "08/chrisocks_org.gif", "图片": "ce/tupianimage_org.gif", "六芒星": "c2/liumangxing_org.gif", "地球一小时": "4f/diqiuxiuxiyixiaoshi_org.gif", "植树节": "56/zhishujie_org.gif", "粉蛋糕": "bf/nycake_org.gif", "糖果": "34/candy_org.gif", "万圣节": "73/nanguatou2_org.gif", "火炬": "3b/hj_org.gif", "酒壶": "64/wine_org.gif", "月饼": "96/mooncake3_org.gif", "满月": "5d/moon1_org.gif", "巧克力": "b1/qkl_org.gif", "脚印": "12/jy_org.gif", "酒": "39/j2_org.gif", "狗": "5d/g_org.gif", "工作": "b2/gz3_org.gif", "档案": "ce/gz2_org.gif", "叶子": "b8/green_org.gif", "钢琴": "b2/gq_org.gif", "印迹": "84/foot_org.gif", "钟": "d3/clock_org.gif", "茶": "a8/cha_org.gif", "西瓜": "6b/watermelon.gif", "雨伞": "33/umb_org.gif", "电视机": "b3/tv_org.gif", "电话": "9d/tel_org.gif", "太阳": "e5/sun.gif", "星": "0b/star_org.gif", "哨子": "a0/shao.gif", "话筒": "1b/m_org.gif", "音乐": "d0/music_org.gif", "电影": "77/movie_org.gif", "月亮": "b9/moon.gif", "唱歌": "79/ktv_org.gif", "冰棍": "3a/ice.gif", "房子": "d1/house_org.gif", "帽子": "25/hat_org.gif", "足球": "c0/football.gif", "鲜花": "6c/flower_org.gif", "花": "6c/flower.gif", "风扇": "92/fan.gif", "干杯": "bd/cheer.gif", "咖啡": "64/cafe_org.gif", "兔子": "81/rabbit_org.gif", "神马": "60/horse2_org.gif", "浮云": "bc/fuyun_org.gif", "给力": "c9/geili_org.gif", "萌": "42/kawayi_org.gif", "鸭梨": "bb/pear_org.gif", "熊猫": "6e/panda_org.gif", "互粉": "89/hufen_org.gif", "织": "41/zz2_org.gif", "围观": "f2/wg_org.gif", "扔鸡蛋": "91/rjd_org.gif", "奥特曼": "bc/otm_org.gif", "威武": "70/vw_org.gif", "伤心": "ea/unheart.gif", "热吻": "60/rw_org.gif", "囧": "15/j_org.gif", "orz": "c0/orz1_org.gif", "宅": "d7/z_org.gif", "小丑": "6b/xc_org.gif", "帅": "36/s2_org.gif", "猪头": "58/pig.gif", "实习": "48/sx_org.gif", "骷髅": "bd/kl2_org.gif", "便便": "34/s_org.gif", "雪人": "d9/xx2_org.gif", "黄牌": "a0/yellowcard.gif", "红牌": "64/redcard.gif", "跳舞花": "70/twh_org.gif", "礼花": "3d/bingo_org.gif", "打针": "b0/zt_org.gif", "叹号": "3b/th_org.gif", "问号": "9d/wh_org.gif", "句号": "9b/jh_org.gif", "逗号": "cc/dh_org.gif", "1": "9b/1_org.gif", "2": "2c/2_org.gif", "3": "f3/3_org.gif", "4": "2c/4_org.gif", "5": "d5/5_org.gif", "6": "dc/6_org.gif", "7": "43/7_org.gif", "8": "6d/8_org.gif", "9": "26/9_org.gif", "0": "d8/ling_org.gif", "闪": "ce/03_org.gif", "啦啦": "c1/04_org.gif", "吼吼": "34/05_org.gif", "庆祝": "67/06_org.gif", "嘿": "d3/01_org.gif", "省略号": "0d/shengluehao_org.gif", "kiss": "59/kiss2_org.gif", "圆": "53/yuan_org.gif", "团": "11/tuan_org.gif", "团圆月饼": "e6/tuanyuan_org.gif", "欢欢": "c3/liaobuqi_org.gif", "乐乐": "66/guanbuzhao_org.gif", "管不着爱": "78/2guanbuzhao1_org.gif", "爱": "09/ai_org.gif", "了不起爱": "11/2liaobuqiai_org.gif", "有点困": "68/youdiankun_org.gif", "yes": "9e/yes_org.gif", "咽回去了": "72/yanhuiqule_org.gif", "鸭梨很大": "01/yalihenda_org.gif", "羞羞": "42/xiuxiu_org.gif", "喜欢你": "6b/xihuang_org.gif", "小便屁": "a0/xiaobianpi_org.gif", "无奈": "d6/wunai22_org.gif", "兔兔": "da/tutu_org.gif", "吐舌头": "98/tushetou_org.gif", "头晕": "48/touyun_org.gif", "听音乐": "d3/tingyinyue_org.gif", "睡大觉": "65/shuijiao_org.gif", "闪闪紫": "9e/shanshanzi_org.gif", "闪闪绿": "a8/shanshanlu_org.gif", "闪闪灰": "1e/shanshanhui_org.gif", "闪闪红": "10/shanshanhong_org.gif", "闪闪粉": "9d/shanshanfen_org.gif", "咆哮": "4b/paoxiao_org.gif", "摸头": "2c/motou_org.gif", "真美好": "d2/meihao_org.gif", "脸红自爆": "d8/lianhongzibao_org.gif", "哭泣女": "1c/kuqinv_org.gif", "哭泣男": "38/kuqinan_org.gif", "空": "fd/kong_org.gif", "尽情玩": "9f/jinqingwan_org.gif", "惊喜": "b8/jingxi_org.gif", "惊呆": "58/jingdai_org.gif", "胡萝卜": "e1/huluobo_org.gif", "欢腾去爱": "63/huangtengquai_org.gif", "感冒了": "67/ganmao_org.gif", "怒了": "ef/fennu_org.gif", "我要奋斗": "a6/fendou123_org.gif", "发芽": "95/faya_org.gif", "春暖花开": "ca/chunnuanhuakai_org.gif", "抽烟": "83/chouyan_org.gif", "昂": "31/ang_org.gif", "啊": "12/aa_org.gif", "自插双目": "d3/zichashuangmu_org.gif", "咦": "9f/yiwen_org.gif", "嘘嘘": "cf/xu_org.gif", "我吃": "00/wochiwode_org.gif", "喵呜": "a7/weiqu_org.gif", "v5": "c5/v5_org.gif", "调戏": "f7/tiaoxi_org.gif", "打牙": "d7/taihaoxiaole_org.gif", "手贱": "b8/shoujian_org.gif", "色": "a1/se_org.gif", "喷": "4a/pen_org.gif", "你懂的": "2e/nidongde_org.gif", "喵": "a0/miaomiao_org.gif", "美味": "c1/meiwei_org.gif", "惊恐": "46/jingkong_org.gif", "感动": "7c/gandong_org.gif", "放开": "55/fangkai_org.gif", "痴呆": "e8/chidai_org.gif", "扯脸": "99/chelian_org.gif", "不知所措": "ab/buzhisuocuo_org.gif", "白眼": "24/baiyan_org.gif", "猥琐": "e1/weisuo_org.gif", "挑眉": "c9/tiaomei_org.gif", "挑逗": "3c/tiaodou_org.gif", "亲耳朵": "1c/qinerduo_org.gif", "媚眼": "32/meiyan_org.gif", "冒个泡": "32/maogepao_org.gif", "囧耳朵": "f0/jiongerduo_org.gif", "鬼脸": "14/guilian_org.gif", "放电": "fd/fangdian_org.gif", "悲剧": "ea/beiju_org.gif", "抚摸": "78/touch_org.gif", "大汗": "13/sweat_org.gif", "大惊": "74/suprise_org.gif", "惊哭": "0c/supcry_org.gif", "星星眼": "5c/stareyes_org.gif", "好困": "8b/sleepy_org.gif", "呕吐": "75/sick_org.gif", "加我一个": "ee/plus1_org.gif", "痞痞兔耶": "19/pipioye_org.gif", "mua": "c6/muamua_org.gif", "面抽": "fd/mianchou_org.gif", "大笑": "6a/laugh_org.gif", "揉": "d6/knead_org.gif", "痞痞兔囧": "38/jiong_org.gif", "哈尼兔耶": "53/honeyoye_org.gif", "开心": "40/happy_org.gif", "咬手帕": "af/handkerchief_org.gif", "去": "6b/go_org.gif", "晕死了": "a4/dizzy_org.gif", "大哭": "af/cry_org.gif", "扇子遮面": "a1/coverface_org.gif", "怒气": "ea/angery_org.gif", "886": "6f/886_org.gif", "雾": "68/w_org.gif", "台风": "55/tf_org.gif", "沙尘暴": "69/sc_org.gif", "晴转多云": "d2/qzdy_org.gif", "流星": "8e/lx_org.gif", "龙卷风": "6a/ljf_org.gif", "洪水": "ba/hs2_org.gif", "风": "74/gf_org.gif", "多云转晴": "f3/dyzq_org.gif", "彩虹": "03/ch_org.gif", "冰雹": "05/bb2_org.gif", "微风": "a5/wind_org.gif", "阳光": "1a/sunny_org.gif", "雪": "00/snow_org.gif", "闪电": "e3/sh_org.gif", "下雨": "50/rain.gif", "阴天": "37/dark_org.gif", "白羊": "07/byz2_org.gif", "射手": "46/ssz2_org.gif", "双鱼": "e2/syz2_org.gif", "双子": "89/szz2_org.gif", "天秤": "6b/tpz2_org.gif", "天蝎": "1e/txz2_org.gif", "水瓶": "1b/spz2_org.gif", "处女": "62/cnz2_org.gif", "金牛": "3b/jnz2_org.gif", "巨蟹": "d2/jxz2_org.gif", "狮子": "4a/leo2_org.gif", "摩羯": "16/mjz2_org.gif", "天蝎座": "09/txz_org.gif", "天秤座": "c1/tpz_org.gif", "双子座": "d4/szz_org.gif", "双鱼座": "7f/syz_org.gif", "射手座": "5d/ssz_org.gif", "水瓶座": "00/spz_org.gif", "摩羯座": "da/mjz_org.gif", "狮子座": "23/leo_org.gif", "巨蟹座": "a3/jxz_org.gif", "金牛座": "8d/jnz_org.gif", "处女座": "09/cnz_org.gif", "白羊座": "e0/byz_org.gif", "yeah": "1a/yeah_org.gif", "喜欢": "5f/xh_org.gif", "心动": "5f/xd_org.gif", "无聊": "53/wl_org.gif", "手舞足蹈": "b2/gx_org.gif", "搞笑": "09/gx2_org.gif", "痛哭": "eb/gd_org.gif", "爆发": "38/fn2_org.gif", "发奋": "31/d2_org.gif", "不屑": "b0/bx_org.gif", "加油": "d4/jiayou_org.gif", "国旗": "dc/flag_org.gif", "金牌": "f4/jinpai_org.gif", "银牌": "1e/yinpai_org.gif", "铜牌": "26/tongpai_org.gif", "哨子": "a0/shao.gif", "黄牌": "a0/yellowcard.gif", "红牌": "64/redcard.gif", "足球": "c0/football.gif", "篮球": "2c/bball_org.gif", "黑8": "6b/black8_org.gif", "排球": "cf/volleyball_org.gif", "游泳": "b9/swimming_org.gif", "乒乓球": "a5/pingpong_org.gif", "投篮": "7a/basketball_org.gif", "羽毛球": "77/badminton_org.gif", "射门": "e0/zuqiu_org.gif", "射箭": "40/shejian_org.gif", "举重": "14/juzhong_org.gif", "击剑": "38/jijian_org.gif", "烦躁": "c5/fanzao_org.gif", "呲牙": "c1/ciya_org.gif", "有钱": "e6/youqian_org.gif", "微笑": "05/weixiao_org.gif", "帅爆": "c1/shuaibao_org.gif", "生气": "0a/shengqi_org.gif", "生病了": "19/shengbing_org.gif", "色眯眯": "90/semimi_org.gif", "疲劳": "d1/pilao_org.gif", "瞄": "14/miao_org.gif", "哭": "79/ku_org.gif", "好可怜": "76/kelian_org.gif", "紧张": "75/jinzhang_org.gif", "惊讶": "dc/jingya_org.gif", "激动": "bb/jidong_org.gif", "见钱": "2b/jianqian_org.gif", "汗了": "7d/han_org.gif", "奋斗": "4e/fendou_org.gif", "小人得志": "09/xrdz_org.gif", "哇哈哈": "cc/whh_org.gif", "叹气": "90/tq_org.gif", "冻结": "d3/sjdj_org.gif", "切": "1d/q_org.gif", "拍照": "ec/pz_org.gif", "怕怕": "7c/pp_org.gif", "怒吼": "4d/nh_org.gif", "膜拜": "9f/mb2_org.gif", "路过": "70/lg_org.gif", "泪奔": "34/lb_org.gif", "脸变色": "cd/lbs_org.gif", "亲": "05/kiss_org.gif", "恐怖": "86/kb_org.gif", "交给我吧": "e2/jgwb_org.gif", "欢欣鼓舞": "2b/hxgw_org.gif", "高兴": "c7/gx3_org.gif", "尴尬": "43/gg_org.gif", "发嗲": "4e/fd_org.gif", "犯错": "19/fc_org.gif", "得意": "fb/dy_org.gif", "吵闹": "fa/cn_org.gif", "冲锋": "2f/cf_org.gif", "抽耳光": "eb/ceg_org.gif", "差得远呢": "ee/cdyn_org.gif", "被砸": "5a/bz2_org.gif", "拜托": "6e/bt_org.gif", "必胜": "cf/bs3_org.gif", "不关我事": "e8/bgws_org.gif", "上火": "64/bf_org.gif", "不倒翁": "b6/bdw_org.gif", "不错哦": "79/bco_org.gif", "眨眨眼": "3b/zy2_org.gif", "杂技": "ec/zs_org.gif", "多问号": "17/wh2_org.gif", "跳绳": "79/ts_org.gif", "强吻": "b1/q3_org.gif", "不活了": "37/lb2_org.gif", "磕头": "6a/kt_org.gif", "呜呜": "55/bya_org.gif", "不": "a2/bx2_org.gif", "狂笑": "d5/zk_org.gif", "冤": "5f/wq2_org.gif", "蜷": "87/q2_org.gif", "美好": "ae/mh_org.gif", "乐和": "5f/m2_org.gif", "揪耳朵": "15/j3_org.gif", "晃": "bf/h2_org.gif", "high": "e7/f_org.gif", "蹭": "33/c_org.gif", "抱枕": "f4/bz3_org.gif", "不公平": "85/bgp_org.gif"
};
//嘀咕的表情
//http://images.digu.com/web_res_v1/emotion/**.gif
var DIGU_EMOTIONS = {
    "微笑": "01", "我晕": "02", "口水": "03", "开心": "04", "鄙视": "05", 
    "我汗": "06", "好爽": "07", "偷笑": "08", "暴走": "09", "垂泪": "10", 
    "死定": "11", "傲慢": "12", "发怒": "13", "害羞": "14", "吃惊": "15", 
    "瞌睡": "16", "阴险": "17", "伤心": "18", "郁闷": "19", "摇头": "20", 
    "牛逼": "21", "呕吐": "22", "可怜": "23", "耍酷": "24", "雷死": "25", 
    "怒吼": "26", "啥玩意儿？": "27", 
    "28":"28", "29":"29", "30":"30", "31":"31", "32":"32"
};

//人间的表情 [//smile]
var RENJIAN_EMOTIONS = {
   "smile":[
      "微笑",
      "0px 0px"
   ],
   "heart":[
      "色",
      "-30px 0px"
   ],
   "yum":[
      "满足",
      "-60px 0px"
   ],
   "laugh":[
      "憨笑",
      "-90px 0px"
   ],
   "grin":[
      "可爱",
      "-120px 0px"
   ],
   "tongue":[
      "调皮",
      "-150px 0px"
   ],
   "hot":[
      "得意",
      "-180px 0px"
   ],
   "ambivalent":[
      "不高兴",
      "-210px 0px"
   ],
   "blush":[
      "害羞",
      "-240px 0px"
   ],
   "frown":[
      "低落",
      "-270px 0px"
   ],
   "halo":[
      "炯炯有神",
      "0px -30px"
   ],
   "crazy":[
      "猥琐",
      "-30px -30px"
   ],
   "crying":[
      "哭",
      "-60px -30px"
   ],
   "undecided":[
      "傲慢",
      "-90px -30px"
   ],
   "naughty":[
      "魔鬼",
      "-120px -30px"
   ],
   "lips":[
      "闭嘴",
      "-150px -30px"
   ],
   "nerd":[
      "得意",
      "-180px -30px"
   ],
   "kiss":[
      "亲亲",
      "-210px -30px"
   ],
   "pirate":[
      "海盗",
      "-240px -30px"
   ],
   "gasp":[
      "惊讶",
      "-270px -30px"
   ],
   "foot":[
      "擦汗",
      "0px -60px"
   ],
   "largegasp":[
      "衰",
      "-30px -60px"
   ],
   "veryangry":[
      "抓狂",
      "-60px -60px"
   ],
   "angry":[
      "无奈",
      "-90px -60px"
   ],
   "confused":[
      "晕",
      "-120px -60px"
   ],
   "sick":[
      "我吐",
      "-150px -60px"
   ],
   "moneymouth":[
      "吐钱",
      "-180px -60px"
   ],
   "ohnoes":[
      "糗大了",
      "-210px -60px"
   ],
   "wink":[
      "眨眼",
      "-240px -60px"
   ],
   "sarcastic":[
      "阴险",
      "-270px -60px"
   ],
   "up":[
      "顶",
      "0px -90px"
   ],
   "down":[
      "鄙视",
      "-30px -90px"
   ],
   "candle":[
      "蜡烛",
      "-60px -90px"
   ],
   "flower":[
      "鲜花",
      "-90px -90px"
   ],
   "ribbon":[
      "丝带",
      "-120px -90px"
   ]
};

// TSOHU 表情
// .find('i').each(function(){console.log('"' + $(this).attr('title') + '": "' + $(this).attr('class') + '",')});
var TSOHU_EMOTIONS_URL_PRE = 'http://s3.cr.itc.cn/img/';
var TSOHU_FACE_TPL = '[{{name}}]';
var TSOHU_EMOTIONS = {
"地球一小时": "i2/t/178.gif",
"盐": "t/536.gif",
"心相映": "t/532.gif",
"急救箱": "t/531.gif",
"地震": "t/530.gif",
"蜡烛": "t/425.gif",
//"握手": "x x53",
"蛋糕": "t/527.gif",
"内裤": "t/528.gif",
"内衣": "t/529.gif",
"雪": "t/526.gif",
"福": "t/519.gif",
"微笑": "i3/t/2026.gif",
"色": "i3/t/2027.gif",
"呲牙": "i3/t/2028.gif",
"偷笑": "i3/t/2029.gif",
"害羞": "i3/t/2030.gif",
"大哭": "i3/t/2031.gif",
"哭": "i3/t/061.gif",
"酷": "i3/t/2033.gif",
"发火": "i3/t/2034.gif",
"怒": "i3/t/2035.gif",
"疑问": "i3/t/2036.gif",
"感叹": "i3/t/2037.gif",
"调皮": "i3/t/2038.gif",
"眨眼": "i3/t/2039.gif",
"寒": "i3/t/2040.gif",
"睡觉": "i3/t/2041.gif",
"困": "i3/t/2042.gif",
"不满": "i3/t/2043.gif",
"噘嘴": "i3/t/2044.gif",
"听歌": "i3/t/2045.gif",
"汗": "i3/t/2046.gif",
"脸红": "i3/t/2047.gif",
"耳语": "i3/t/2048.gif",
"嘘": "i3/t/2049.gif",
"吐": "i3/t/2050.gif",
"馋": "i3/t/2051.gif",
"鄙视": "i3/t/2052.gif",
"讽刺": "i3/t/2053.gif",
"发呆": "i3/t/2054.gif",
"晕": "i3/t/2055.gif",
"被踹": "i3/t/2056.gif",
"衰": "i3/t/2057.gif",
"受伤": "i3/t/2058.gif",
"海盗": "i3/t/2059.gif",
"闭嘴": "i3/t/2060.gif",
"佐罗": "i3/t/2061.gif"
};

// TQQ表情
// http://mat1.gtimg.com/www/mb/images/face/14.gif
// .find('a').each(function(i, item){console.log('"' + $(this).attr('title') + '"' + ': ' + '"' + $(this).attr('class').substring(1) + '.gif",');});
var TQQ_EMOTIONS_URL_PRE = 'http://mat1.gtimg.com/www/mb/images/face/';
var TQQ_FACE_TPL = '/{{name}}';
var TQQ_EMOTIONS = {
	"微笑": "14.gif",
	"撇嘴": "1.gif",
	"色": "2.gif",
	"发呆": "3.gif",
	"得意": "4.gif",
	"流泪": "5.gif",
	"害羞": "6.gif",
	"闭嘴": "7.gif",
	"睡": "8.gif",
	"大哭": "9.gif",
	"尴尬": "10.gif",
	"发怒": "11.gif",
	"调皮": "12.gif",
	"呲牙": "13.gif",
	"惊讶": "0.gif",
	"难过": "15.gif",
	"酷": "16.gif",
	"冷汗": "96.gif",
	"抓狂": "18.gif",
	"吐": "19.gif",
	"偷笑": "20.gif",
	"可爱": "21.gif",
	"白眼": "22.gif",
	"傲慢": "23.gif",
	"饥饿": "24.gif",
	"困": "25.gif",
	"惊恐": "26.gif",
	"流汗": "27.gif",
	"憨笑": "28.gif",
	"大兵": "29.gif",
	"奋斗": "30.gif",
	"咒骂": "31.gif",
	"疑问": "32.gif",
	"嘘": "33.gif",
	"晕": "34.gif",
	"折磨": "35.gif",
	"衰": "36.gif",
	"骷髅": "37.gif",
	"敲打": "38.gif",
	"再见": "39.gif",
	"擦汗": "97.gif",
	"抠鼻": "98.gif",
	"鼓掌": "99.gif",
	"糗大了": "100.gif",
	"坏笑": "101.gif",
	"左哼哼": "102.gif",
	"右哼哼": "103.gif",
	"哈欠": "104.gif",
	"鄙视": "105.gif",
	"委屈": "106.gif",
	"快哭了": "107.gif",
	"阴险": "108.gif",
	"亲亲": "109.gif",
	"吓": "110.gif",
	"可怜": "111.gif",
	"菜刀": "112.gif",
	"西瓜": "89.gif",
	"啤酒": "113.gif",
	"篮球": "114.gif",
	"乒乓": "115.gif",
	"咖啡": "60.gif",
	"饭": "61.gif",
	"猪头": "46.gif",
	"玫瑰": "63.gif",
	"凋谢": "64.gif",
	"示爱": "116.gif",
	"爱心": "66.gif",
	"心碎": "67.gif",
	"蛋糕": "53.gif",
	"闪电": "54.gif",
	"炸弹": "55.gif",
	"刀": "56.gif",
	"足球": "57.gif",
	"瓢虫": "117.gif",
	"便便": "59.gif",
	"月亮": "75.gif",
	"太阳": "74.gif",
	"礼物": "69.gif",
	"拥抱": "49.gif",
	"强": "76.gif",
	"弱": "77.gif",
	"握手": "78.gif",
	"胜利": "79.gif",
	"抱拳": "118.gif",
	"勾引": "119.gif",
	"拳头": "120.gif",
	"差劲": "121.gif",
	"爱你": "122.gif",
	"NO": "123.gif",
	"OK": "124.gif",
	"爱情": "42.gif",
	"飞吻": "85.gif",
	"跳跳": "43.gif",
	"发抖": "41.gif",
	"怄火": "86.gif",
	"转圈": "125.gif",
	"磕头": "126.gif",
	"回头": "127.gif",
	"跳绳": "128.gif",
	"挥手": "129.gif",
	"激动": "130.gif",
	"街舞": "131.gif",
	"献吻": "132.gif",
	"左太极": "133.gif",
	"右太极": "134.gif"
};

// t163
var T163_EMOTIONS_URL_PRE = 'http://img1.cache.netease.com/t/face/';
var T163_FACE_TPL = '[{{name}}]';
var T163_EMOTIONS = {
"勾引": "yunying/gouyin.gif",
"纠结": "yunying/jiujie.gif",
"开心": "yunying/kaixin.gif",
"困死了": "yunying/kunsile.gif",
"路过": "yunying/luguo.gif",
"冒泡": "yunying/maopao.gif",
"飘走": "yunying/piaozou.gif",
"思考": "yunying/sikao.gif",
"我顶": "yunying/woding.gif",
"我晕": "yunying/woyun.gif",
"抓狂": "yunying/zhuakuang.gif",
"装酷": "yunying/zhuangku.gif",
"福": "default/fu.gif",
"红包": "default/hongbao.gif",
"菊花": "default/jvhua.gif",
"蜡烛": "default/lazhu.gif",
"礼物": "default/liwu.gif",
"圣诞老人": "default/sdlr.gif",
"圣诞帽": "default/sdm.gif",
"圣诞树": "default/sds.gif",
"崩溃": "default/bengkui.gif",
"鄙视你": "default/bishini.gif",
"不说": "default/bushuo.gif",
"大哭": "default/daku.gif",
"飞吻": "default/feiwen.gif",
"工作忙": "default/gongzuomang.gif",
"鼓掌": "default/guzhang.gif",
"害羞": "default/haixiu.gif",
"坏": "default/huai.gif",
"坏笑": "default/huaixiao.gif",
"教训": "default/jiaoxun.gif",
"惊讶": "default/jingya.gif",
"可爱": "default/keai.gif",
"老大": "default/laoda.gif",
"欠揍": "default/qianzou.gif",
"撒娇": "default/sajiao.gif",
"色迷迷": "default/semimi.gif",
"送花": "default/songhua.gif",
"偷笑": "default/touxiao.gif",
"挖鼻孔": "default/wabikou.gif",
"我吐": "default/wotu.gif",
"嘘": "default/xu.gif",
"仰慕你": "default/yangmuni.gif",
"yeah": "default/yeah.gif",
"疑问": "default/yiwen.gif",
"晕": "default/yun.gif",
"砸死你": "default/zasini.gif",
"眨眼": "default/zhayan.gif",
"扭扭": "ali/niuniu.gif",
"转圈圈": "ali/feng.gif",
"踢踏舞": "ali/tita.gif",
"强": "ali/qiang.gif",
"跳舞": "ali/niu.gif",
"蜷": "ali/juan.gif",
"吃惊": "ali/bie.gif",
"我汗": "ali/liuhan.gif",
"呐喊": "ali/aaa.gif",
"生病": "ali/dahan.gif",
"隐身": "ali/yinshen.gif",
"放松": "ali/jian.gif",
"捶地": "ali/bugongping.gif",
"嗯": "ali/diantou.gif",
"撒花": "ali/saqian.gif",
"撒花": "ali/saqian.gif",
"心": "ali/xin.gif",
"囧": "ali/jiong.gif",
"害怕": "ali/leng.gif",
"冷": "ali/han.gif",
"震惊": "ali/jingya.gif",
"怒": "ali/nuqi.gif",
"狂笑": "ali/kuangxiao.gif",
"渴望": "ali/kewang.gif",
"飘过": "ali/piaoguo.gif",
"转圈哭": "ali/zhuanquanku.gif",
"得瑟": "ali/lala.gif",
"hi": "ali/hi.gif",
"闪电": "ali/jing.gif",
"同意": "ali/erduo.gif",
"星星眼": "ali/a.gif",
"爆头": "popb/baotou.gif",
"唱歌": "popb/changge.gif",
"嘲笑": "popb/chaoxiao.gif",
"抽烟": "popb/chouyan.gif",
"大笑": "popb/daxiao.gif",
"淡定": "popb/danding.gif",
"疯了": "popb/fengle.gif",
"感动": "popb/gandong.gif",
"哈哈": "popb/haha.gif",
"汗": "popb/han.gif",
"好冷": "popb/haoleng.gif",
"哼哒": "popb/hengda.gif",
"警告": "popb/jinggao.gif",
"跳跳": "popb/kaiqiang.gif",
"困": "popb/kun.gif",
"泪奔": "popb/leiben.gif",
"卖萌": "popb/maimeng.gif",
"拍手": "popb/paishou.gif",
"路过这里": "popb/piaoguo.gif",
"杀无赦": "popb/shawushe.gif",
"烧香": "popb/shaoxiang.gif",
"掏鼻孔": "popb/taobikong.gif",
"舔舔": "popb/tiantian.gif",
"开枪": "popb/tiaotiao.gif",
"吐口水": "popb/tukoushui.gif",
"瞎得瑟": "popb/xiadese.gif",
"吆西": "popb/yaoxi.gif",
"晕倒": "popb/yundao.gif",
"早安": "popb/zaoan.gif",
"揍你": "popb/zouni.gif",
};

var FACE_TYPES = [
    ['tsina', TSINA_FACES, TSINA_FACE_URL_PRE, TSINA_FACE_TPL, '新浪'],      
    ['tqq', TQQ_EMOTIONS, TQQ_EMOTIONS_URL_PRE, TQQ_FACE_TPL, '腾讯'],
    ['tsohu', TSOHU_EMOTIONS, TSOHU_EMOTIONS_URL_PRE, TSOHU_FACE_TPL, '搜狐'],
    ['t163', T163_EMOTIONS, T163_EMOTIONS_URL_PRE, T163_FACE_TPL, '网易'],
];