from django.db import models

# Create your models here.


class User(models.Model):
	username = models.TextField()
	email = models.TextField()
	password = models.TextField()

	def _str_(self):
		return self.username


class Tag(models.Model):
	name = models.CharField(max_length=200)
	tag = models.ManyToManyField('Tag', through='TagPoint')


class Crawl(models.Model):
	name = models.CharField(max_length=200)
	author = models.CharField(max_length=200)
	created_at = models.DateTimeField(auto_now_add=True)
	description = models.TextField(max_length=500, null=True)
	tags = models.ManyToManyField(Tag, null=True)
	points = models.ManyToManyField('Point', through='CrawlPoint', null=True, blank=True)
	# Number_of_point = models.IntegerField()
	# Total_length_in_miles = models.FloatField()


class Point(models.Model):
	name = models.CharField(max_length=200)
	google_place_id = models.TextField(null=True)  # until we figure out GMaps API
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now_add=True)
	longitude = models.FloatField(null=True)
	latitude = models.FloatField(null=True)
	description = models.TextField(max_length=500, null=True)
	address = models.TextField(max_length=200, null=True)  # until we figure out GMaps API
	crawls = models.ManyToManyField('Crawl', through='CrawlPoint', null=True, blank=True)


class CrawlPoint(models.Model):
	crawl = models.ForeignKey(Crawl)
	point = models.ForeignKey(Point)


class TagPoint(models.Model):
	tag = models.ForeignKey(Tag)
	point = models.ForeignKey(Point)
