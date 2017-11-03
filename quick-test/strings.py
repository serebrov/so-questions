def goodbadString(string):
    for (a,b) in zip(strings, expectedResults):
        string = string.replace(a, b)
    return string
    idx = strings.index(string)
    if idx >= 0:
        return expectedResults[idx]

strings = ['It has been a good and bad day', 'bad company',
           'good is as good does!', 'Clovis is a big city.']
expectedResults = ['I am confused', 'goodbye', 'hello',
                   'hello and goodbye']
for string, expectedResult in zip(strings, expectedResults):
    print('Sample string = ', string)
    print('Expected result =', expectedResult)
    print('Actual result =', goodbadString(string))
    print()
