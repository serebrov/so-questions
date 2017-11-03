class Window:

    def __init__(self):
        self.my_button = Mybutton(self.cmd)

    def cmd(self):
        print("hello world")


class Mybutton:

    def __init__(self, command):
        self.command = command

    def a_ramdom_fcn(self):
        self.command.__call__()


win = Window()
win.my_button.a_ramdom_fcn()


class HelloWorldCommand:

    def execute(self):
        print("Hello world")


class Window:

    def __init__(self):
        self.my_button = Mybutton(
            HelloWorldCommand()
        )

class Mybutton:

    def __init__(self, command):
        self.command = command

    def a_ramdom_fcn(self):
        self.command.execute()


win = Window()
win.my_button.a_ramdom_fcn()
