from abc import ABCMeta, abstractmethod


class ClassA:
    def do(self):
        print('A-do')


class ClassB:
    def do(self):
        print('B-do')


class ClassC:
    pass


class Doable(metaclass=ABCMeta):
    @abstractmethod
    def do(self):
        pass

# We can register existing classes as "Doable" without modifying them
Doable.register(ClassA)
Doable.register(ClassB)
Doable.register(ClassC)

try:
    # Although in this case (no explicit inheritance from Doable), the ClassC()
    # will NOT raise the type error
    collect = [ClassA(), ClassB(), ClassC()]
    for item in collect:
        # here we will get `ClassC` object has no attribute `do`
        if isinstance(item, Doable):
            item.do()
except Exception as err:
    print(err)


# TypeError: Can't instantiate abstract class ClassD with abstract methods do
class ClassD(Doable):
    pass

d = ClassD()
