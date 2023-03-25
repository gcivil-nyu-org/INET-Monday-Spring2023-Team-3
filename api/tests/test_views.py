from rest_framework.test import APITestCase  # , APIRequestFactory
from rest_framework import status
from django.urls import reverse
from api.models import User


class RegisterTest(APITestCase):
    def test_user_register_success(self):
        data = {"username": "test_u", "email": "test@gmail.com", "password": "test_pw"}

        response = self.client.post(reverse("register"), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_register_fail(self):
        data = {"username": "test_u", "email": "test@gmail.com", "password": "test_pw"}

        User.objects.create(**data)

        response = self.client.post(reverse("register"), data)
        self.assertEqual(response.data["error"], "user already exists")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTest(APITestCase):
    def test_user_login_success(self):
        data = {"username": "test_u", "email": "test@gmail.com", "password": "test_pw"}
        self.client.post(reverse("register"), data)

        user = User.objects.get(username=data["username"])
        user.verified = True
        user.save()

        response = self.client.post(reverse("login"), data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_login_send_otp(self):
        data = {"username": "test_u", "email": "test@gmail.com", "password": "test_pw"}
        self.client.post(reverse("register"), data)

        response = self.client.post(reverse("login"), data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_login_user_exists_fail(self):
        data = {"username": "test_u", "email": "test@gmail.com", "password": "test_pw"}

        response = self.client.post(reverse("login"), data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "username does not exist")

    def test_user_login_password_fail(self):
        data = {"username": "test_u", "email": "test@gmail.com", "password": "test_pw"}

        User.objects.create(**data)

        data["password"] = "fail"

        response = self.client.post(reverse("login"), data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "incorrect password")


class EmailTest(APITestCase):
    def test_send_recovery_success(self):
        data = {"username": "test_u", "email": "test@gmail.com", "password": "test_pw"}
        self.client.post(reverse("register"), data)

        response = self.client.post(reverse("recover"), data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_send_recovery_fail(self):
        data = {"username": "test_u", "email": "test@gmail.com", "password": "test_pw"}

        response = self.client.post(reverse("recover"), data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class OTPTest(APITestCase):
    def test_send_otp_success(self):
        data = {"username": "test_u", "email": "test@gmail.com", "password": "test_pw"}
        self.client.post(reverse("register"), data)

        response = self.client.post(reverse("send_otp"), data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_send_otp_fail(self):
        data = {"username": "test_u", "email": "test@gmail.com", "password": "test_pw"}

        response = self.client.post(reverse("send_otp"), data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
