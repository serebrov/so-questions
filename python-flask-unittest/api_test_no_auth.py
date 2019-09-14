from api import app, auth
import unittest


# Disable auth checks in tests.
@auth.verify_password
def verify_password(user, password):
    """Overwrite password check.

    This works even if we send no auth data."""
    return True


class TestIntegrations(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()

    def test_thing(self):
        response = self.app.get('/')
        print(response.data)


if __name__ == '__main__':
    unittest.main()
