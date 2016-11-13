from ..engine import SceneMap

class Scene(object):

    def enter(self):
        print('Enter chapter 1')
        return 'chapter 2'

SceneMap.register('intro', Scene)
