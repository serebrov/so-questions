# See https://www.youtube.com/watch?v=js_0wjzuMfc
# Invited Keynote Talk from PyCon Israel, June 12, 2017.  I cause trouble and build a framework using all sorts of new Python 3.6+ features.
# https://forum.dabeaz.com/t/the-fun-of-reinvention-pycon-israel-june-12-2017/204/11
#
# The original version uses classes, although each class only has one class method which
# means we really need functions and not classes.

def check_typed(type, value):
    assert isinstance(
        value, type
    ), 'Expected {}'.format(type)

def check_integer(value):
    return check_typed(int, value)

def check_string(value):
    return check_typed(str, value)

def check_float(value):
    return check_typed(float, value)

def check_positive(value):
    assert value > 0, 'Must be > 0'

def check_nonempty(value):
    assert len(value) > 0, 'Must be nonempty'

def check_positive_integer(value):
    check_positive(value)
    check_integer(value)


"""
check_positive_integer(-2)
check_positive_integer(-2.3)
"""
