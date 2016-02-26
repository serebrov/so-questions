# see http://stackoverflow.com/q/35626923/4612064

class A(object):
     def doit(self):
         print "A", self, super(A, self)
         super(A, self).doit()

class B(object):
     def doit(self):
         print "B", self, super(B, self)

class C(A,B):
     def doit(self):
         print "C", self
         A.doit(self)
         B.doit(self)

     def doit_explain(self):
         print "C", self
         # calls B.doit()
         super(A, self).doit()
         print "Back to C"
         # calls A.doit() (and super in A also calls B.doit())
         super(C, self).doit()
         print "Back to C"
         # second-time B.doit()
         B.doit(self)

print "MRO:", [x.__name__ for x in C.__mro__]
#MRO: ['C', 'A', 'B', 'object']

C().doit()
# C <__main__.C object at 0x7f37575e2d10>
# A <__main__.C object at 0x7f37575e2d10> <super: <class 'A'>, <C object>>
# B <__main__.C object at 0x7f37575e2d10> <super: <class 'B'>, <C object>>
# B <__main__.C object at 0x7f37575e2d10> <super: <class 'B'>, <C object>>

print ''
C().doit_explain()
# C <__main__.C object at 0x7fc100f8f790>
# B <__main__.C object at 0x7fc100f8f790> <super: <class 'B'>, <C object>>
# Back to C
# A <__main__.C object at 0x7fc100f8f790> <super: <class 'A'>, <C object>>
# B <__main__.C object at 0x7fc100f8f790> <super: <class 'B'>, <C object>>
# Back to C
# B <__main__.C object at 0x7fc100f8f790> <super: <class 'B'>, <C object>>
