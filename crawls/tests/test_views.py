from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from api.models import User
from crawls.models import Crawl
import json


class TestCrawls(APITestCase):
    username = "test_u"
    email = "test@gmail.com"
    password = "test_pw"

    def authenticate(self):
        data = {
            "username": self.username,
            "email": self.email,
            "password": self.password,
        }
        self.client.post(reverse("register"), data)

        user = User.objects.get(username=data["username"])
        user.verified = True
        user.save()

        response = self.client.post(reverse("login"), data)
        jwt = response.data["jwt"]

        self.client.credentials(HTTP_AUTHORIZATION=jwt)

    def test_crawl_get_all(self):
        self.authenticate()
        user = User.objects.get(username=self.username)
        crawl_data = {"google_place_id": "12335"}
        data = {
            "title": "sample_crawl",
            "author": user,
            "data": json.dumps(crawl_data),
        }
        Crawl.objects.create(**data)

        data = {
            "title": "sample_crawl_2",
            "author": user,
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
        user = User.objects.get(username=self.username)

        crawl_data = {"google_place_id": "12335"}
        data = {
            "title": "sample_crawl",
            "author": user,
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
            "picture": "data:image/image/png;base64,iVBORw0KGg==",
            "description": "some random description",
        }

        response = self.client.post(reverse("crawl_create"), data)
        crawls = Crawl.objects.all()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(crawls[0].title, "sample_crawl")

    def test_crawl_create_fail(self):
        self.authenticate()
        user = User.objects.get(username=self.username)

        crawl_data = {"google_place_id": "12335"}
        data = {
            "title": "sample_crawl",
            "author": user,
            "data": json.dumps(crawl_data),
        }

        Crawl.objects.create(**data)
        response = self.client.post(reverse("crawl_create"), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_crawls_by_author_success(self):
        self.test_crawl_create_success()

        response = self.client.get(
            reverse("get_crawls_by_author", kwargs={"username": self.username})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["title"], "sample_crawl")

    def test_crawls_by_author_fail(self):
        self.authenticate()

        response = self.client.get(
            reverse("get_crawls_by_author", kwargs={"username": "wrong username"})
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_crawls_by_author_fail_bad_auth(self):
        response = self.client.get(
            reverse("get_crawls_by_author", kwargs={"username": self.username})
        )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_crawls_by_id_success(self):
        self.test_crawls_by_author_success()

        response = self.client.get(reverse("get_crawl_by_id", kwargs={"crawl_id": 1}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "sample_crawl")

    def test_crawls_by_id_fail_bad_id(self):
        self.test_crawls_by_author_success()

        response = self.client.get(reverse("get_crawl_by_id", kwargs={"crawl_id": 2}))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_crawls_by_id_fail_bad_auth(self):
        response = self.client.get(reverse("get_crawl_by_id", kwargs={"crawl_id": 1}))

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_update_crawl_by_id_success(self):
        self.test_crawls_by_author_success()

        response = self.client.post(
            reverse("update_crawl_by_id", kwargs={"crawl_id": 1}),
            {"title": "new_title", "description": "new description", "data": ""},
        )

        updated_crawl = Crawl.objects.get(id=1)
        self.assertEqual(updated_crawl.title, "new_title")
        self.assertEqual(updated_crawl.description, "new description")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_crawl_by_id_fail_bad_id(self):
        self.test_crawls_by_author_success()

        response = self.client.post(
            reverse("update_crawl_by_id", kwargs={"crawl_id": 2}),
            {"title": "new_title", "description": "new description"},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_crawls_by_id_fail_bad_auth(self):
        response = self.client.post(
            reverse("update_crawl_by_id", kwargs={"crawl_id": 2}),
            {"title": "title", "description": "description"},
        )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_crawl_delete_by_id_success(self):
        self.test_crawls_by_author_success()
        data = {"id": "1"}

        response = self.client.post(reverse("crawl_delete_by_id"), data)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(len(Crawl.objects.all()), 0)

    def test_crawl_delete_by_id_fail(self):
        self.authenticate()
        data = {"id": "1"}

        response = self.client.post(reverse("crawl_delete_by_id"), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_crawls_by_author_success(self):
        self.test_crawl_create_success()
        response = self.client.get(
            reverse("search_crawls_by_author", kwargs={"username": self.username})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_crawls_by_author_fail(self):
        self.authenticate()
        response = self.client.get(
            reverse("search_crawls_by_author", kwargs={"username": "wrong username"})
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_crawls_by_title_success(self):
        self.test_crawl_create_success()
        response = self.client.get(
            reverse("search_crawls_by_title", kwargs={"title": "sample_crawl"})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_tags_to_crawl_success(self):
        self.test_crawl_create_success()
        data = {"crawl_title": "sample_crawl", "tags": "t1, t2, t3"}

        response = self.client.post(reverse("add_tags_to_crawl"), data)
        crawl = Crawl.objects.get(title="sample_crawl")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(crawl.tags.all()), 3)

    def test_add_tags_to_crawl_fail_crawl_DNE(self):
        self.authenticate()
        data = {"crawl_title": "sample_crawl", "tags": "t1, t2, t3"}

        response = self.client.post(reverse("add_tags_to_crawl"), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_add_tags_to_crawl_fail_bad_data(self):
        self.test_crawl_create_success()
        data = {"crawl_title": "sample_crawl"}

        response = self.client.post(reverse("add_tags_to_crawl"), data)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_search_crawls_by_tag_success(self):
        self.test_add_tags_to_crawl_success()
        response = self.client.get(
            reverse("search_crawls_by_tag", kwargs={"tag_title": "t1"})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["title"], "sample_crawl")

    def test_search_crawls_by_tag_fail_tag_DNE(self):
        self.authenticate()
        response = self.client.get(
            reverse("search_crawls_by_tag", kwargs={"tag_title": "t1"})
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_crawls_by_title_author_tag_success(self):
        self.test_crawl_create_success()
        response = self.client.get(
            reverse(
                "search_crawls_by_title_author_tag", kwargs={"query": self.username}
            )
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
