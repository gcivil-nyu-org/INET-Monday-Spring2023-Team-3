from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from api.models import User
from crawls.models import Crawl
import json


class TestCrawls(APITestCase):
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

    def test_crawl_get_all(self):
        self.authenticate()

        crawl_data = {"google_place_id": "12335"}
        data = {
            "title": "sample_crawl",
            "author": self.username,
            "data": json.dumps(crawl_data),
        }
        Crawl.objects.create(**data)

        data = {
            "title": "sample_crawl_2",
            "author": self.username,
            "data": json.dumps(crawl_data),
        }
        Crawl.objects.create(**data)

        response = self.client.get(reverse("crawl_get_all"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["title"], "sample_crawl")
        self.assertEqual(response.data[1]["title"], "sample_crawl_2")

    def test_crawl_get_all_bad_auth(self):
        self.client.credentials(HTTP_AUTHORIZATION="1234")
        response = self.client.get(reverse("crawl_get_all"))

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_crawl_delete_success(self):
        self.authenticate()

        crawl_data = {"google_place_id": "12335"}
        data = {
            "title": "sample_crawl",
            "author": self.username,
            "data": json.dumps(crawl_data),
        }
        Crawl.objects.create(**data)

        response = self.client.post(reverse("crawl_delete"), {"title": "sample_crawl"})
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)

    def test_crawl_delete_fail(self):
        self.authenticate()

        response = self.client.post(reverse("crawl_delete"), {"title": "sample_crawl"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_crawl_create_success(self):
        self.authenticate()

        crawl_data = {"google_place_id": "12335"}
        data = {
            "title": "sample_crawl",
            "author": self.username,
            "data": json.dumps(crawl_data),
        }

        response = self.client.post(reverse("crawl_create"), data)
        crawl = Crawl.objects.all()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(crawl[0].title, "sample_crawl")

    def test_crawl_create_fail(self):
        self.authenticate()

        crawl_data = {"google_place_id": "12335"}
        data = {
            "title": "sample_crawl",
            "author": self.username,
            "data": json.dumps(crawl_data),
        }

        Crawl.objects.create(**data)
        response = self.client.post(reverse("crawl_create"), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_crawls_by_author(self):
        self.test_crawl_create_success()

        response = self.client.get(
            reverse("get_crawls_by_author", kwargs={"username": self.username})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["title"], "sample_crawl")
