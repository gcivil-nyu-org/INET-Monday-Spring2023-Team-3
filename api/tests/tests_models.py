from django.test import TestCase
from api.models import UserTest, User


class TestModels(TestCase):
    def setUp(self):
        return UserTest.objects.create(
            username="testanil3", email="testanil3@gmail2.com", password="password123"
        )

    def test_user(self):
        u = self.setUp()

        u2 = User.objects.create(
            username="testanil3", email="testanil3@gmail2.com", password="password123"
        )

        self.assertEquals("testanil3", u.username)
        self.assertEquals(u.__str__(), u.username)
        self.assertEquals(u.__str__(), u2.username)
