#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""使用jsmin压缩js"""

import os

old_size, min_size = 0, 0
for name in os.listdir('scripts'):
    if name == 'options.js':
        continue
    if name.endswith('.js'):
        source = 'scripts/%s' % name
        old = os.path.getsize(source)
        old_size += old
        to = source + '.min'
        os.system('jsmin < %s > %s' % (source, to))
        os.remove(source)
        os.rename(to, source)
        min = os.path.getsize(source)
        min_size += min
        print '%s %s => %s, %s small' % (source, old, min, old - min)

for dir in os.walk('_locales'):
    if not dir[2]:
        continue
    for name in dir[2]:
        if name.endswith('.json'):
            source = dir[0] + '/' + name
            old = os.path.getsize(source)
            old_size += old
            to = source + '.min'
            os.system('jsmin < %s > %s' % (source, to))
            os.remove(source)
            os.rename(to, source)
            min = os.path.getsize(source)
            min_size += min
            print '%s %s => %s, %s small' % (source, old, min, old - min)
        
print '\r\nChange size %s to %s, %s small' % (old_size, min_size, (old_size - min_size))