from django.db import models

# Create your models here.


class Crawl(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(max_length=500, null=True)
    author = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField("Tag", through="CrawlTag", blank=True)
    points = models.ManyToManyField("Point", through="CrawlPoint", blank=True)
    # Number_of_point = models.IntegerField()
    # Total_length_in_miles = models.FloatField()
    # picture = models.ImageField(upload_to='...')

    def __str__(self):
        return self.title


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
    title = models.CharField(max_length=200)
    crawls = models.ManyToManyField("Crawl", through="CrawlTag", blank=True)

    def __str__(self):
        return self.title


class CrawlPoint(models.Model):
    crawl = models.ForeignKey("Crawl", null=True, on_delete=models.SET_NULL)
    point = models.ForeignKey("Point", null=True, on_delete=models.SET_NULL)
    """         
    will have to check for nulls
    """
    def __str__(self):
        return self.crawl


class CrawlTag(models.Model):
    tag = models.ForeignKey("Tag", null=True, on_delete=models.SET_NULL)
    crawl = models.ForeignKey("Crawl", null=True, on_delete=models.SET_NULL)
    """
    will have to check for nulls
    """
    def __str__(self):
        return self.tag
