from abc import ABCMeta, abstractproperty

class Foo(object):
    __metaclass__ = ABCMeta

    @abstractproperty
    def x(self):
        pass

    @abstractproperty
    def y(self):
        pass

class Bar(Foo):
    x_val = None
    y_val = None

    def __init__(self, x, y):
        self.x_val = x
        self.y_val = y

    @property
    def x(self):
        return self.x_val

    @x.setter
    def x(self, value):
        self.x_val = value

    @property
    def y(self):
        return self.y_val

    @y.setter
    def y(self, value):
        self.y_val = value

class Baz(Bar):

    def __init__(self):
        super().__init__(x=2, y=6)


a = Baz()
