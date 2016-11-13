from collections import OrderedDict

class Engine(object):

    def __init__(self, scene_map):
        self.scene_map = scene_map

    def play(self):
        for scene_name in self.scene_map.scenes:
            Scene = self.scene_map.scenes[scene_name]
            scene = Scene()
            scene.enter()


class SceneMap(object):

    scenes = OrderedDict()

    @classmethod
    def register(cls, name, map_fn):
        cls.scenes[name] = map_fn

