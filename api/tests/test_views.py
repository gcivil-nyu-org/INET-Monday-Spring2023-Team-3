from django.test import TestCase, Client
from django.urls import reverse
from api.models import User
from api.views import profile

# Needs adjustments for status codes and objects to grab fo rpost functions


class TestViews(TestCase):
    def setUp(self):
        return User.objects.create(
            username="testuser1", email="test1@gmail.com", password="password123"
        )

    def test_profile(self):
        url = reverse(profile)
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 500)

    def test_user_login(self):
        client = Client()

        response = client.get(reverse("login"))
        self.assertEqual(response.status_code, 405)

    def test_user_register(self):
        client = Client()

        response = client.get(reverse("register"))
        self.assertEqual(response.status_code, 405)