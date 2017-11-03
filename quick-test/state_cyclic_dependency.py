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
