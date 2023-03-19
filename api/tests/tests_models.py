from django.test import TestCase
from api.models import User
from django.urls import reverse


class TestModels(TestCase):
    def setUp(self):
        return User.objects.create(
            username="testuser1", email="test1@gmail.com", password="password123"
        )

    def test_user(self):
        u = self.setUp()
        self.assertEquals("testuser1", u.username)
