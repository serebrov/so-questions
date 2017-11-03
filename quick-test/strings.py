# https://stackoverflow.com/questions/47103246/how-to-replace-all-elements-in-list-1-with-all-elements-from-list-2-in-defined-f?noredirect=1#comment81159184_47103246

def goodbadString(string):
    for (a,b) in zip(strings, expectedResults):
        string = string.replace(a, b)
    return string
    idx = strings.index(string)
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
