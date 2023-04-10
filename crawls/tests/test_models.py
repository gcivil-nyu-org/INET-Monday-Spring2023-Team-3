from django.test import TestCase
from crawls.models import Crawl, Point, Tag, CrawlPoint, CrawlTag
from api.models import User


class TestModels(TestCase):
    def test_crawl(self):
        data = {"username": "test_u", "email": "1@gmail.com", "password": "test_pw"}
        user = User.objects.create(**data)
        u = Crawl.objects.create(id=1, title="testcrawl1", author=user)
        self.assertEquals("testcrawl1", u.title)
        self.assertEquals(str(u), u.title)

    def setUpP(self):
        return Point.objects.create(title="testpoint1")

    def test_point(self):
        u = self.setUpP()
        self.assertEquals("testpoint1", u.title)
        self.assertEquals(str(u), u.title)

    def setUpT(self):
        return Tag.objects.create(title="testtag1")

    def test_tag(self):
        u = self.setUpT()
        self.assertEquals("testtag1", u.title)
        self.assertEquals(str(u), u.title)

    def setUpCP(self):
        data = {
            "username": "test_u2",
            "email": "test2@gmail.com",
            "password": "test_pw",
        }
        user = User.objects.create(**data)
        return CrawlPoint.objects.create(
            crawl=Crawl.objects.create(id=2, title="testcrawl1", author=user),
            point=Point.objects.create(title="testpoint1"),
        )

    def test_CP(self):
        u = self.setUpCP()
        self.assertEquals("testcrawl1", u.crawl.title)
        self.assertEquals("testpoint1", u.point.title)

    def setUpCT(self):
        data = {
            "username": "test_u3",
            "email": "test3@gmail.com",
            "password": "test_pw",
        }
        user = User.objects.create(**data)
        return CrawlTag.objects.create(
            tag=Tag.objects.create(title="testtag1"),
            point=Crawl.objects.create(id=3, title="testcrawl1", author=user),
        )

    def test_CT(self):
        u = self.setUpCT()
        self.assertEquals("testtag1", u.tag.title)
        self.assertEquals("testcrawl1", u.point.title)
