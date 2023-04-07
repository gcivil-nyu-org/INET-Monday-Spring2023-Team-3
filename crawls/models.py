from io import BytesIO
from django.core.files import File
from django.core.exceptions import ValidationError
from django.db import models
from PIL import Image, ImageOps

# Create your models here.


class Crawl(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField(max_length=500, null=True)
    author = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    tags = models.ManyToManyField("Tag", through="CrawlTag", blank=True)
    points = models.ManyToManyField("Point", through="CrawlPoint", blank=True)
    data = models.TextField(null=True)
    picture = models.ForeignKey("ImageModel", null=True, on_delete=models.SET_NULL)

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


class CrawlTag(models.Model):
    tag = models.ForeignKey("Tag", null=True, on_delete=models.SET_NULL)
    point = models.ForeignKey("Crawl", null=True, on_delete=models.SET_NULL)
    """
    will have to check for nulls
    """


class ImageModel(models.Model):
    # maybe title + "_crawl" for crawls and username + "_prof" for profile pics
    def save(self, *args, **kwargs):
        im = Image.open(self.image)
        im = Image.convert("RGB")
        im = ImageOps.exif_transpose(im)
        im_io = BytesIO()
        im.save(im_io, "JPEG", quality=70)
        new_image = File(im_io, name=self.image.title)
        self.image = new_image
        super().save(*args, **kwargs)

    def validate_image(fieldfile_obj):
        filesize = fieldfile_obj.file.size
        megabyte_limit = 2.0
        if filesize > megabyte_limit * 1024 * 1024:
            raise ValidationError("Max file size is %sMB" % str(megabyte_limit))

    image = models.ImageField(null=True, default=None, validators=[validate_image])
    title = models.CharField(max_length=200)
