from api import app, auth
import unittest


@auth.verify_password
def verify_password(user, password):
    return True


class TestIntegrations(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()

    def test_thing(self):
        response = self.app.get('/')
        print(response.data)


if __name__ == '__main__':
    unittest.main()
