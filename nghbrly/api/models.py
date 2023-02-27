from django.db import models

# Create your models here.

class User(models.Model):
    username = models.TextField()
    email = models.TextField()
    password = models.TextField()

    def _str_(self):
        return self.username