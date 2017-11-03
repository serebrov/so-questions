# https://stackoverflow.com/questions/46978144/solving-cyclic-dependency-with-python-inheritance/47103082#47103082


class StateA(object):
    def event1(self):
        return StateC()


class StateB(StateA):
    def event1(self):
        return self


class StateC(object):
    def event1(self):
        return self


print(type(StateA().event1()))
