from sys import stdin, stdout
import queue
import math

#Vertex Class Definition
class Vertex:
    def __init__(self, name):
        self.name=name
        self.neighbors= []
        self.nay=[]

    def addneighbor(self, neigh):
        if not neigh in self.nay:
            self.nay.append(neigh)
            self.neighbors.append(Vertex(neigh))

    def getneigh(self):
        return self.neighbors

    def getname(self):
        return int(self.name)

#Graph Class definition
class Graph:
    def __init__(self):
        self.verts=[]
        self.num= 0

    def addvert(self, node):
        self.verts.append(Vertex(node))

    def addedge(self, fro, to):
        self.verts[fro-1].addneighbor(to)
        self.verts[to-1].addneighbor(fro)

def bfs(g,s):

    q= queue.Queue(maxsize=0)
    q.put(g.verts[s-1])
    cost= [-1 for yy in range(g.num)]
    cost[s-1]=0

    print('g is ', g)
    print('g.verts[s-1] is ', g.verts[s-1])
    print('g.verts[s-1] neigh ', g.verts[s-1].getneigh())
    print('g.verts[s-1] neigh[0] -> neigh', g.verts[s-1].getneigh()[0].getneigh())
    print('------------')

    while(not q.empty()):

        p=q.get()

        """If I check for p.getneigh() here, only the neigbors of
        source element s are returned. Otherwise, the loop stops
        after calling the first neighbor of s. However, if I
        explicitly call g.verts and check for neigbors, the list
        is complete."""

        print('p is ', p)
        print('p nei ', p.getneigh())
        if len(p.getneigh()) > 0:
            print('p nei -> nei ', p.getneigh()[0].getneigh())
        print('------------')

        for vex in p.getneigh():
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
        g.addvert(i)
        g.num+=1
    arr= [ [3, 1], [10, 1], [10, 1] , [3, 1] , [1, 8], [5, 2]]
    for i in range(e):
        x,y = arr[i][0], arr[i][1]
        g.addedge(x, y)

    s= 3
    print('g.verts[s-1] is ', g.verts[s-1].getname())
    print('g.verts[s-1] neigh ', g.verts[s-1].getneigh()[0].getname())
    print('g.verts[s-1] neigh[0] -> neigh', g.verts[s-1].getneigh()[0].getneigh())
    print('------------')

    #s is the start node of the graph
    c=bfs(g,s)

    del c[s-1]

    for yoy in c:
        stdout.write(str(yoy))
        stdout.write(" ")
    stdout.write("\n")

"""
g.verts[s-1] is  3
g.verts[s-1] neigh  [1]
g.verts[s-1] neigh[0] -> neigh []
------------
p is  3
p nei  [1]
p nei -> nei  []
------------
p is  1
p nei  []
"""
