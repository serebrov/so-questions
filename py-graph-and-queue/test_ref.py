from sys import stdin, stdout
import queue
import math
from collections import OrderedDict

#Vertex Class Definition
class Vertex:
    def __init__(self, name):
        self.name = int(name)
        self.neighbors = OrderedDict()

    def add_neighbor(self, neigh):
        assert(isinstance(neigh, Vertex))
        if neigh.get_name() not in self.neighbors:
            self.neighbors[neigh.get_name()] = neigh

    def get_neighbours(self):
        return list(self.neighbors.values())

    def get_name(self):
        return self.name

    def get_neighbours_names(self):
        return [n.get_name() for n in self.get_neighbours()]


#Graph Class definition
class Graph:
    def __init__(self):
        self.verts = []
        self.num = 0

    def add_vert(self, node):
        self.verts.append(Vertex(node))

    def add_edge(self, fro, to):
        print('%s -> %s' % (fro, to))
        self.verts[fro-1].add_neighbor(self.verts[to-1])
        self.verts[to-1].add_neighbor(self.verts[fro-1])

def bfs(g,s):

    q= queue.Queue(maxsize=0)
    q.put(g.verts[s-1])
    cost= [-1 for yy in range(g.num)]
    cost[s-1]=0

    print('g.verts[s-1] is ', g.verts[s-1].get_name())
    print('g.verts[s-1] neigh ', g.verts[s-1].get_neighbours_names())
    print('g.verts[s-1] neigh[0] -> neigh', g.verts[s-1].get_neighbours()[0].get_neighbours_names())
    print('------------')

    while(not q.empty()):

        p=q.get()

        """If I check for p.get_neighbours() here, only the neigbors of
        source element s are returned. Otherwise, the loop stops
        after calling the first neighbor of s. However, if I
        explicitly call g.verts and check for neighbors, the list
        is complete."""

        print('p is ', p)
        print('p name is ', p.get_name())
        print('p nei ', p.get_neighbours_names())
        if len(p.get_neighbours()) > 0:
            print('p nei -> nei ', p.get_neighbours()[0].get_neighbours_names())
        print('------------')

        for vex in p.get_neighbours():
            if cost[vex.name-1]==-1:
                q.put(vex)
                cost[vex.name-1]= cost [p.name-1]+6

    return cost

t= 1
for hehe in range (t):
    n, e= 10, 6

    g= Graph()
    #add n vertices
    for i in range (1, n+1):
        g.add_vert(i)
        g.num+=1
    arr= [ [3, 1], [10, 1], [10, 1] , [3, 1] , [1, 8], [5, 2]]
    for i in range(e):
        x,y = arr[i][0], arr[i][1]
        g.add_edge(x, y)

    s= 3
    #s is the start node of the graph
    c=bfs(g,3)

    c=bfs(g,1)

    del c[s-1]

    for yoy in c:
        stdout.write(str(yoy))
        stdout.write(" ")
    stdout.write("\n")

"""
       3  5   6  4 7 8 9
      /    \
10 - 1      2
     |
     8
"""
