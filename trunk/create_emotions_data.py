#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""http://api.t.sina.com.cn/emotions.json


获取表情数据,
直接运行脚本，让回复制粘贴就可以了。
"""
import urllib2
import json

r = urllib2.urlopen('http://api.t.sina.com.cn/emotions.json?source=3434422667')
data = json.loads(r.read())
r.close()
items = {}

#    print i['phrase'][1:-1]

print 'var TSINA_API_EMOTIONS = {'
for i in data:
    key = i['phrase'][1:-1]
    items[key] = i['url'].replace("http://img.t.sinajs.cn/t3/style/images/common/face/ext/normal/", "")
    print '"' + key + '"' + ': ' + '"' + items[key] + '",',
print '};'

print len(items)
