from django.forms import ModelForm
from django import forms

from .models import User


class UserForm(ModelForm):
    class Meta:
        model = User
        fields = (
            "username",
            "profile_pic",
            "short_bio",
        )
