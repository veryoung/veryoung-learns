# -*- coding: utf-8 -*-
height = 100
total = 100
for i in range(1,11):
    total,height = total + height, height / 2
print("共经过：{}米".format(total- 2 * height))
