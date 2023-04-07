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

    def test_full_profile_success(self):
        self.test_follow_success()
        to_follow2 = User.objects.create(
            username="to_follow2", email="12@gmail.com", password="1234"
        )

        data = {"self_address": self.username, "target_address": to_follow2.username}
        self.client.post(reverse("follow"), data)

        response = self.client.get(reverse("full_profile"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["following"], "to_follow to_follow2")

    def test_full_profile_fail_bad_auth(self):
        response = self.client.get(reverse("full_profile"))
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_other_user_profile_success(self):
        self.test_follow_success()
        to_follow2 = User.objects.create(
            username="to_follow2", email="12@gmail.com", password="1234"
        )

        data = {"self_address": self.username, "target_address": to_follow2.username}
        self.client.post(reverse("follow"), data)

        response = self.client.get(
            reverse(
                "other_user_profile", kwargs={"other_username": to_follow2.username}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["followed_by"], "test_u")

    def test_other_user_profile_fail_no_user(self):
        self.test_follow_success()

        response = self.client.get(
            reverse("other_user_profile", kwargs={"other_username": "to_follow2"})
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_other_user_profile_fail_bad_auth(self):
        response = self.client.get(
            reverse("other_user_profile", kwargs={"other_username": "to_follow2"})
        )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_update_profile_success(self):
        self.authenticate()
        data = {"target_username": self.username, "short_bio": "I'm a bio!"}
        response = self.client.post(reverse("update_user_info"), data)

        updated_user = User.objects.get(username=self.username)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(updated_user.short_bio, data["short_bio"])

    def test_update_profile_fail_bad_prof(self):
        self.authenticate()
        data = {"target_username": "wrong username", "short_bio": "I'm a bio!"}
        response = self.client.post(reverse("update_user_info"), data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
