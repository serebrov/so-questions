from api import app
from base64 import b64encode
import unittest


# Helper API client to send auth headers in tests.
# It only has `get` method and hard-coded user name / password, but can
# easily be extended to support all HTTP methods and configurable auth data,
# so authentication itself can also be tested.
class ApiClient:
    """Performs API requests."""

    def __init__(self, app):
        self.client = app.test_client()

    def get(self, url, **kwargs):
        """Sends GET request and returns the response."""
        return self.client.get(url, headers=self.request_headers(), **kwargs)

    def request_headers(self):
        """Returns API request headers."""
        auth = '{0}:{1}'.format('user', 'secret')
        return {
            'Accept': 'application/json',
            'Authorization': 'Basic {encoded_login}'.format(
                encoded_login=b64encode(auth.encode('utf-8')).decode('utf-8')
            )
        }


class TestIntegrations(unittest.TestCase):

    def setUp(self):
        self.app = ApiClient(app)
        # self.app = app.test_client()

    def test_thing(self):
        response = self.app.get('/')
        print(response.data)


if __name__ == '__main__':
    unittest.main()
