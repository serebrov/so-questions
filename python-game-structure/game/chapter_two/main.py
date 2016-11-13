from ..engine import SceneMap

class Scene(object):

    def enter(self):
        print('Enter chapter 2')
        return None

SceneMap.register('chapter 2', Scene)
