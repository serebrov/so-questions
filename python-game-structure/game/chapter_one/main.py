from ..engine import SceneMap

class Scene(object):

    def enter(self):
        print('Enter chapter 1')

SceneMap.register('intro', Scene)
