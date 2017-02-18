class MyClass:
    pass

x = MyClass()

# Works fine, new attribute is created
x.test = 'value'
print(x.test)

# Raises AttributeError
print(x.test_two)
