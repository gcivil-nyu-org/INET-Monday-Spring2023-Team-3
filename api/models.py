from django.db import models

# Create your models here.


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
    follows = models.TextField(blank=True, default="")
    followed_by = models.TextField(blank=True, default="")
    profile_pic = models.ImageField(
        null=True, blank=True, upload_to=upload_to, default="profiles/sample.jpg"
    )

    def __str__(self):
        return self.username


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
