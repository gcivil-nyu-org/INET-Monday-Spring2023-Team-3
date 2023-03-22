from django.test import TestCase
from api.models import User


class TestModels(TestCase):
    def setUp(self):
        return User.objects.create(
            username="tester1", email="tester@gmail.com", password="password123"
        )

    def test_user(self):
        u = self.setUp()
        self.assertEquals("tester1", u.username)
