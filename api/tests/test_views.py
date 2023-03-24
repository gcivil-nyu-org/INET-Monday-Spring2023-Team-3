from rest_framework.test import APITestCase  # , APIRequestFactory
from rest_framework import status
from django.urls import reverse
from api.models import User
# from api.views import user_register


class RegisterTest(APITestCase):
    def test_user_register(self):
        data = {
            "username": "test_u",
            "email": "test@gmail.com",
            "password": "test_pw"
        }

        response = self.client.post(reverse("register"), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        def test_user_register_fail(self):
            data = {
                "username": "test_u",
                "email": "test@gmail.com",
                "password": "test_pw"
            }

            User.objects.create(**data)

            response = self.client.post(reverse("register"), data)
            self.assertEqual(response.content["error"], "user already exists")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
