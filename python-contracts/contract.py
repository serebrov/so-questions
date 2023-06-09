# See https://www.youtube.com/watch?v=js_0wjzuMfc
# Invited Keynote Talk from PyCon Israel, June 12, 2017.
# I cause trouble and build a framework using all sorts of new Python 3.6+ features.
# https://forum.dabeaz.com/t/the-fun-of-reinvention-pycon-israel-june-12-2017/204/11
#
# See also https://www.python.org/dev/peps/pep-0487/


# Sub-classes registry.
_contracts = {}
class Contract:

    # Own the 'dot' (Descriptor protocol)
    def __set__(self, instance, value):
        self.check(value)
        # The descriptor finds out it's name via __set_name__ method)
        instance.__dict__[self.name] = value

    def __set_name__(self, cls, name):
        self.name = name

    def __init_subclass__(cls):
        _contracts[cls.__name__] = cls


    @classmethod
    def check(cls, value):
        pass

class Typed(Contract):
    type = None
    @classmethod
    def check(cls, value):
        assert isinstance(
            value, cls.type
        ), 'Expected {}'.format(cls.type)
        super().check(value)

class Integer(Typed):
    type = int

class String(Typed):
    type = str

class Float(Typed):
    type = float

class Positive(Contract):
    @classmethod
    def check(cls, value):
        assert value > 0, 'Must be > 0'
        super().check(value)

class Nonempty(Contract):
    @classmethod
    def check(cls, value):
        assert len(value) > 0, 'Must be nonempty'
        super().check(value)


class PositiveInteger(Integer, Positive):
    pass

class NonemptyString(String, Nonempty):
    pass


from functools import wraps
from inspect import signature

def checked(func):
    sig = signature(func)
    ann = func.__annotations__
    @wraps(func)
    def wrapper(*args, **kwargs):
        # "applies" the arguments to the signature, so we get the dict like
        # {'a': PositiveInteger, 'b': PositiveInteger}
        bound = sig.bind(*args, **kwargs)
        for name, val in bound.arguments.items():
            if name in ann:
                ann[name].check(val)
        return func(*args, **kwargs)
    return wrapper


@checked
def gcd(a: PositiveInteger, b: PositiveInteger):
    """Compute greatest common divisor."""
    while b:
        a, b = b, a % b
    return a


class Player:

    name = NonemptyString()
    x = Integer()
    y = Integer()

    def __init__(self, name, x, y):
        self.name = name
        self.x = x
        self.y = y

    def left(self, dx):
        self.x -= dx

    def right(self, dx):
        self.x += dx


class BaseAnnotations:

    def __init_subclass__(cls):
        # Triggered for every sub-class, here
        # we "convert" annotations into class variables like in the
        # `Player` class above
        for name, val in cls.__annotations__.items():
            contract = val()  # Integer()
            contract.__set_name__(cls, name)
            setattr(cls, name, contract)

        # Apply `checked` decorator to the class methods
        for name, val in cls.__dict__.items():
            if callable(val):
                setattr(cls, name, checked(val))


    def __init__(self, *args):
        ann = self.__annotations__
        assert len(args) == len(ann), f'Expected {len(ann)} arguments'
        # Automatically set `self` properties from `args`,
        # we rely on the 3.6 feature - the dict is ordered by keys.
        for name, val in zip(ann, args):
            setattr(self, name, val)

    def __repr__(self):
        args = ','.join(
            repr(getattr(self, name))
            for name in self.__annotations__)
        return f'{type(self).__name__}({args})'


# The variant where we use annotations, so the contract checks are defined similar
# to the way we do it for the free function (see `gcd` above).
class PlayerAnnotations(BaseAnnotations):

    name: NonemptyString
    x: Integer
    y: Integer

    def left(self, dx: PositiveInteger):
        self.x -= dx

    def right(self, dx: PositiveInteger):
        self.x += dx

"""
from contract import *

PositiveInteger.check(-2)
PositiveInteger.check(-2.3)

p = PlayerAnnotations('Test', 9, 190)
p.x = '42'
p.left('x')
p
"""

# BaseMeta allows to use contracts classes without explicitly importing them
# so we do something like
#
#     from contracts import Base
#
#     class Player(Base)
#        name: String
#
# And we don't do `from contracts import String`

from collections import ChainMap

class BaseMeta(type):

    @classmethod
    def __prepare__(cls, *args):
        # We prepare the class namespace here (everything that is defined inside the class body),
        # see https://www.python.org/dev/peps/pep-3115/
        #
        # We have empty dict plus all the defined `Contract` subclasses, so now we can use
        # these subclasses inside the class body as if they were defined there.
        return ChainMap({}, _contracts)

    def __new__(meta, name, bases, methods):
        # Exclude contracts when we call __new__
        methods = methods.maps[0]
        return super().__new__(meta, name, bases, methods)

# Now we can have `class BaseAnnotations(metaclass=BaseMeta)` as above,
# and if we define the `Player` class inside another module, all the contract subclasses
# will be available inside the class body, we don't have to import them.

# We can also allow a "pre-declaration" of the variable name / type that will look like this:
#
#    dx: PositiveInteger
#
#    class PlayerAnnotations(BaseAnnotations):
#
#        name: NonemptyString
#        x: Integer
#        y: Integer
#
#        def left(self, dx):
#            self.x -= dx
#
#        def right(self, dx):
#            self.x += dx
#
# This can be done by also using the global variables namespace in the `checked` decorator.
# We apply the `checked` decorator via BaseAnnotations.__init_subclass__, so
# if we find a global variable with the same name as function argument, we'll take the
# contract information from there:
#
#    def checked(func):
#        sig = signature(func)
#        ann = ChainMap(
#            func.__annotations__,
#            func.__globals__.get('annotations', {})
#        )
#        # ann = func.__annotations__
#        ...
