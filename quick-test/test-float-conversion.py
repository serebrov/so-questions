import math

# http://stackoverflow.com/q/35089126/4612064

def getFormattedHeight(height):
    heightWhole = math.trunc( round(height, 2) )
    heightDec = int(round((height - heightWhole)*100, 0))
    return "{:0>2d}".format(heightWhole) + "_" + "{:0>2d}".format(heightDec)

prev = None
numbers = [0.0, 0.1, 0.29, 1.278, 59.0, 99.9]
for x in range(0, 10000):
    number = x / 100.
    result = getFormattedHeight(number)
    print result
    if prev and prev == result:
        raise Exception('Prev and result are same')
    prev = result

print 'OK, they were different'

# example of simple test
# import re

# units = ['in', 'ft']
# tests = ['12in desk', '12 in desk', 'abc 20 ft long', ]
# expecteds = ['12 desk', '12 desk', 'abc 20 long', ]

# regexp = re.compile(r'(\d+)\s*(%s)\b' % '|'.join(units))
# for test, expected in zip(tests, expecteds):
#     actual = re.sub(regexp, r'\1', test)
#     assert actual == expected
