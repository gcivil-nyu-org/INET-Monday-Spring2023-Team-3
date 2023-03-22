from django.test import TestCase
from crawls.models import Crawl, Point, Tag, CrawlPoint, CrawlTag


class TestModels(TestCase):
    def setUp(self):
        return Crawl.objects.create(title="testcrawl1")

    def test_crawl(self):
        u = self.setUp()
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
        return CrawlPoint.objects.create(
            crawl=Crawl.objects.create(title="testcrawl1"),
            point=Point.objects.create(title="testpoint1"),
        )

    def test_CP(self):
        u = self.setUpCP()
        self.assertEquals("testcrawl1", u.crawl.title)
        self.assertEquals("testpoint1", u.point.title)

    def setUpCT(self):
        return CrawlTag.objects.create(
            tag=Tag.objects.create(title="testtag1"),
            point=Crawl.objects.create(title="testcrawl1"),
        )

    def test_CT(self):
        u = self.setUpCT()
        self.assertEquals("testtag1", u.tag.title)
        self.assertEquals("testcrawl1", u.point.title)
