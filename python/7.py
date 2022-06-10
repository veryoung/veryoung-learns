nrow = 5
nStar = nrow*2-1
nSpace = 0
for i in range(nrow, 0, -1):
    nStar = i * 2 - 1
    nSpace = nrow-i
    print(' '*nSpace + 'N'*nStar)
