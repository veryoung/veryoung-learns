# -*- coding: utf-8 -*-

sum = 100
times = 0
for x in range(1, 100):
    for y in range(1, 50):
        for z in range(1, 20):
            if sum == x * 1 + y * 2 + z * 5:
                times = times + 1
                print("1元有 %d 张, 2元有 %d 张, 5元有 %d 张"%(x,y,z))


print('共有 %d 种方式'%(times))
