# See https://www.youtube.com/watch?v=js_0wjzuMfc
# Invited Keynote Talk from PyCon Israel, June 12, 2017.
# I cause trouble and build a framework using all sorts of new Python 3.6+ features.
# https://forum.dabeaz.com/t/the-fun-of-reinvention-pycon-israel-june-12-2017/204/11
#
# The version without inheritance, the only class we use as base is `Contract`
# which serves as an interface.
# The version with inheritance is less flexible - we actually need to write a new class
# for each new check. The version below allows to do something like
# 'Composite(Integer(), Positive()).check(x)`.
#
# Another problem is that we use the `classmethod` in there, so
# it's hard to define a check like "less than 100" / "less than 1000" (with dynamic
# value to check). In the version below we can do `LessThan(100).check(x)`.


# This serves as an interface.
class Contract:
    def check(self, value):
        pass

class Typed(Contract):
    def __init__(self, type):
        self.type = type

    def check(self, value):
        assert isinstance(
            value, self.type
        ), 'Expected {}'.format(self.type)

# We can define classes such as `Integer`, `String`, etc, but
# it is not really neccessary we just can use `Typed(int).check(x)` directly.
class Integer(Contract):
    def check(self, value):
        Typed(int).check(value)

class String(Contract):
    def check(self, value):
        Typed(str).check(value)

class Float(Contract):
    def check(self, value):
        Typed(float).check(value)

class Positive(Contract):
    def check(self, value):
        assert value > 0, 'Must be > 0'

class Nonempty(Contract):
    def check(self, value):
        assert len(value) > 0, 'Must be nonempty'

class Composite(Contract):
    def __init__(self, *args):
        self.subcontracts = args

    def check(self, value):
        for contract in self.subcontracts:
            contract.check(value)

# We can define `PositiveInteger` class, but we actually don't need to
# we can compose contracts dynamically using the `Composite` contract:
# Composite(Positive(), Integer()).check(-2)
class PositiveInteger(Contract):
    def check(self, value):
        Positive().check(value)
        Integer().check(value)



"""
Typed(int).check(2)

Integer().check(2)
Positive().check(2.2)

Positive(Integer).check(2.2)

Positive().check(Integer(2.2))

PositiveInteger().check(-2)
PositiveInteger().check(-2.3)

contract.Composite(contract.Positive(), contract.Integer()).check(-2)
"""
