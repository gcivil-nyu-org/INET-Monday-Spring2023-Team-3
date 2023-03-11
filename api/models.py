from django.db import models

# Create your models here.


class User(models.Model):
    username = models.TextField(unique=True)
    email = models.EmailField(unique=True)
    password = models.TextField()
    verified = models.BooleanField(default=False)

    def _str_(self):
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
