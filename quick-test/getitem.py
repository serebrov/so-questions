class FakeList:

    def __getitem__(self, slice_):
         print('slice_', slice_)
         print('type(slice_)', type(slice_))
         print('dir(slice_)', dir(slice_))
         return str(slice_.start) + " to " + str(slice_.stop)

f = FakeList()

print(f[1:4])
