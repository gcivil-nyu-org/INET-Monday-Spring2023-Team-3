from django.db import models

# Create your models here.


class User(models.Model):
    username = models.TextField()
    email = models.TextField()
    password = models.TextField()

    def _str_(self):
        return self.username

class Tag(models.Model):
	Name = models.CharField(max_length=200)
	Tag = models.ManyToManyField('Tag', through='TagPoint')

class Crawl(models.Model):
	Name = models.CharField(max_length=200)
	Author = models.CharField(max_length=200)
	Created_at = models.DateTimeField(auto_now_add=True)
	Description = models.TextField(max_length=500, null=True)
	Tags = models.ManyToManyField(Tag, null=True)
	Points = models.ManyToManyField('Point', through='CrawlPoint', null=True, blank=True)
	##Number_of_point = models.IntegerField()
	##Total_length_in_miles = models.FloatField()

class Point(models.Model):
	Name = models.CharField(max_length=200)
	Google_Place_ID = models.TextField(null=True)  #until we figure out GMaps API
	Created_at = models.DateTimeField(auto_now_add=True)
	Updated_at = models.DateTimeField(auto_now_add=True)
	Longitude = models.FloatField(null=True)
	Latitude = models.FloatField(null=True)
	Description = models.TextField(max_length=500, null=True)
	Address = models.TextField(max_length=200, null=True) #until we figure out GMaps API
	Crawls =  models.ManyToManyField('Crawl', through='CrawlPoint', null=True, blank=True)

class CrawlPoint(models.Model):
	crawl = models.ForeignKey(Crawl)
	point = models.ForeignKey(Point)

class TagPoint(models.Model):
	tag = models.ForeignKey(Tag)
	point = models.ForeignKey(Point)
