from django.db import models
from api.models import User

# Create your models here.


class Crawl(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200, unique=True)
    description = models.TextField(max_length=500, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="author")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField("Tag", through="CrawlTag", blank=True)
    points = models.ManyToManyField("Point", through="CrawlPoint", blank=True)
    data = models.TextField(null=True)
    picture = models.TextField(blank=True, default="")
    # Number_of_point = models.IntegerField()
    # Total_length_in_miles = models.FloatField()
    # picture = models.ImageField(upload_to='...')

    def __str__(self):
        return self.title


class Review(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.CharField(max_length=1000)
    rating = models.CharField(max_length=3)
    crawl = models.ForeignKey("Crawl", null=True, on_delete=models.SET_NULL)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.rating


class Point(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(max_length=500, null=True)
    google_place_id = models.TextField(null=True)  # until we figure out GMaps API
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    longitude = models.FloatField(null=True)
    latitude = models.FloatField(null=True)
    address = models.TextField(max_length=200, null=True)  # until we figure out GM API
    crawls = models.ManyToManyField("Crawl", through="CrawlPoint", blank=True)
    # picture = models.ImageField(upload_to='...')

    def __str__(self):
        return self.title


class Tag(models.Model):
    title = models.CharField(max_length=200, unique=True)
    crawls = models.ManyToManyField("Crawl", through="CrawlTag", blank=True)

    def __str__(self):
        return self.title


class CrawlPoint(models.Model):
    crawl = models.ForeignKey("Crawl", null=True, on_delete=models.SET_NULL)
    point = models.ForeignKey("Point", null=True, on_delete=models.SET_NULL)
    """
    will have to check for nulls
    """


class CrawlTag(models.Model):
    tag = models.ForeignKey("Tag", null=True, on_delete=models.SET_NULL)
    point = models.ForeignKey("Crawl", null=True, on_delete=models.SET_NULL)
    """
    will have to check for nulls
    """
