from ..engine import SceneMap

class Scene(object):

    def enter(self):
        print('Enter chapter 2')

SceneMap.register('chapter 2', Scene)
