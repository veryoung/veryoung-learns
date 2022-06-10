# -*- coding: utf-8 -*-
import string

isInWork = '在工作'
isRetired = '已退休'

gender = raw_input('请输入性别:\n')

if gender != 'M' and gender != '男' and gender != 'F' and gender != '女':
    print('请正确输入性别')
else: 
    age = int(input('请输入年龄: '))

    if gender=='M' or gender=='男':

        if int(age)>=60:

            print(isRetired)

        else:

            print(isInWork)

    elif gender=='F' or gender=='女':

        if int(age)>=55:

            print(isRetired)

        else:

            print(isInWork)
