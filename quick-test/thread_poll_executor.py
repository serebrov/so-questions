from concurrent.futures import ThreadPoolExecutor
from random import random
from time import sleep

class main():
    def __init__(self):
        self.var = random()
        print('init', self.var)

    def first(self):
        print('first', self.var)
        self.second()
        print('fourth', self.var)

    def second(self):
        print('second', self.var)
        self.var = random()
        print('third', self.var)
        sleep(1)

def worker():
    m = main()
    m.first()

with ThreadPoolExecutor() as executor:
    executor.submit(worker)
    executor.submit(worker)
    executor.submit(worker)
