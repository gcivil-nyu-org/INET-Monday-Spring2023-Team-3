from django.db import models

# Create your models here.


class Tag(models.Model):
    title = models.CharField(max_length=200)
    crawls = models.ManyToManyField(
        'Crawl', through='CrawlTag', blank=True
        )

    def __str__(self):
        return self.title


class Crawl(models.Model):
    name = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(max_length=500, null=True)
    tags = models.ManyToManyField(
        'Tag', through='CrawlTag', blank=True
        )
    points = models.ManyToManyField(
        'Point', through='CrawlPoint', blank=True
        )
    # Number_of_point = models.IntegerField()
    # Total_length_in_miles = models.FloatField()

    def __str__(self):
        return self.name


class Point(models.Model):
    name = models.CharField(max_length=200)
    google_place_id = models.TextField(null=True)  # until we figure out GMaps API
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    longitude = models.FloatField(null=True)
    latitude = models.FloatField(null=True)
    description = models.TextField(max_length=500, null=True)
    address = models.TextField(max_length=200, null=True)  # until we figure out GM API
    crawls = models.ManyToManyField(
        'Crawl', through='CrawlPoint', blank=True
        )

    def __str__(self):
        return self.name


class CrawlPoint(models.Model):
    crawl = models.ForeignKey('Crawl', on_delete=models.CASCADE)
    point = models.ForeignKey('Point', on_delete=models.CASCADE)


class CrawlTag(models.Model):
    tag = models.ForeignKey('Tag', on_delete=models.CASCADE)
    point = models.ForeignKey('Crawl', on_delete=models.CASCADE)
