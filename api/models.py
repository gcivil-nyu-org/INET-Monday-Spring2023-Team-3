from io import BytesIO
from django.core.files import File
from django.core.exceptions import ValidationError
from django.db import models
from PIL import Image, ImageOps


class UserTest(models.Model):
    username = models.TextField()
    email = models.EmailField()
    password = models.TextField()
    verified = models.BooleanField(default=False)
    short_bio = models.TextField(blank=True, default="")

    def __str__(self):
        return self.username


def upload_to(instance, filename):
    return "profiles/{filename}".format(filename=filename)


class User(models.Model):
    username = models.TextField(unique=True)
    email = models.EmailField(unique=True)
    password = models.TextField()
    verified = models.BooleanField(default=False)
    location = models.CharField(max_length=200, null=True, blank=True)
    short_bio = models.TextField(blank=True, default="")
    profile_pic = models.ImageField(
        null=True, blank=True, upload_to=upload_to, default="profiles/sample.jpg"
    )
    picture = models.ForeignKey(
        "ProfileImageModel", null=True, on_delete=models.SET_NULL
    )

    def __str__(self):
        return self.username


class Follow(models.Model):
    follows = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follows")
    followed = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="followed"
    )

    def __str__(self):
        return "{} follows {}".format(self.follows, self.followed)


class OTP_Request(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.TextField()
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    tries = models.IntegerField(default=0)


class RecoverRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.TextField()
    used = models.BooleanField(default=False)


class ProfileImageModel(models.Model):
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
