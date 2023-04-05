from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from api.models import User, Follow


class FollowTest(APITestCase):
    username = "test_u"
    email = "test@gmail.com"
    pw = "test_pw"

    def authenticate(self):
        data = {"username": self.username, "email": self.email, "password": self.pw}
        self.client.post(reverse("register"), data)

        user = User.objects.get(username=data["username"])
        user.verified = True
        user.save()

        response = self.client.post(reverse("login"), data)
        jwt = response.data["jwt"]

        self.client.credentials(HTTP_AUTHORIZATION=jwt)

    def test_follow_success(self):
        self.authenticate()
        to_follow = User.objects.create(
            username="to_follow", email="1@gmail.com", password="1234"
        )

        data = {"self_address": self.username, "target_address": to_follow.username}

        response = self.client.post(reverse("follow"), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(Follow.objects.all()), 1)

    def test_follow_success_block_double_follow(self):
        self.authenticate()
        to_follow = User.objects.create(
            username="to_follow", email="1@gmail.com", password="1234"
        )
        data = {"self_address": self.username, "target_address": to_follow.username}

        response = self.client.post(reverse("follow"), data)
        response = self.client.post(reverse("follow"), data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(Follow.objects.all()), 1)

    def test_follow_fail_bad_req(self):
        self.authenticate()
        data = {"self_address": self.username, "target_address": "to_follow"}

        response = self.client.post(reverse("follow"), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_follow_fail_bad_auth(self):
        data = {"self_address": self.username, "target_address": "to_follow"}

        response = self.client.post(reverse("follow"), data)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_unfollow_success(self):
        self.test_follow_success()
        data = {"self_address": self.username, "target_address": "to_follow"}
        response = self.client.post(reverse("unfollow"), data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(Follow.objects.all()), 0)

    def test_unfollow_twice(self):
        self.test_follow_success()
        data = {"self_address": self.username, "target_address": "to_follow"}
        self.client.post(reverse("unfollow"), data)
        response = self.client.post(reverse("unfollow"), data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(Follow.objects.all()), 0)

    def test_unfollow_fail(self):
        self.authenticate()
        data = {"self_address": self.username, "target_address": "to_follow"}
        response = self.client.post(reverse("unfollow"), data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(Follow.objects.all()), 0)
