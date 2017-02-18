class Base:
    def test(self):
        print('Base')


class ChildA(Base):
    def test(self):
        super().test()
        print('ChildA')


class ChildB(Base):
    def test(self):
        super().test()
        print('ChildB')


class ChildC(ChildA, ChildB):
    def test(self):
        super().test()
        print('ChildC')


ChildC().test()
