def nfruits(dictionary, string):
    i = 0
    string = sorted(string)

    for idx, char in enumerate(string):
        if idx < len(string) - 1:
            for key in dictionary:
                dictionary[key] += 1
            dictionary[char] -= 2
        else:
            dictionary[char] -= 1
        print dictionary
    return dictionary[max(dictionary, key = dictionary.get)]

def nfruits2(dictionary, string):
    i = 0
    string = sorted(string)

    for idx, char in enumerate(string):
        dictionary[char] -= 1
        if idx < len(string) - 1:
            for key in dictionary:
                if key != char:
                    dictionary[key] += 1
        print dictionary
    return dictionary[max(dictionary, key = dictionary.get)]

if __name__ == "__main__":
    dd = {'A': 1, 'B': 2, 'C': 3}
    print nfruits(dd, 'AC')
    dd = {'A': 1, 'B': 2, 'C': 3}
    print nfruits2(dd, 'AC')
