# -*- coding: utf-8 -*-
while True:
    try:
        x = int(input('请输入第一个整数：'))
        y = int(input('请输入第二个整数：'))
        z = int(input('请输入第三个整数：'))
    except ValueError:
        print ('输入错误，请重新输入')
        continue
    list = [x,y,z]
    list.sort(reverse = True)
    print (list)
