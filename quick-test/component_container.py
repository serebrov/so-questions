class Component(object):
    def __init__(self, container):
        self.flag = True
        self.container = container

    def component_method(self):
        if self.flag:
            # Call a method, called_from_component, from the container
            self.container.called_from_component()

class Container(object):
    def __init__(self):
        self.component = Component(self)

    def container_method(self):
        self.component.component_method()

    def called_from_component(self):
        # Do some stuff. This is the method I want self.component to call
        print 'Called from component'

container = Container()
container.container_method()


class Hour(object):

    def __init__(self):
        self.hour = 0

    def tick(self):
        self.hour += 0
