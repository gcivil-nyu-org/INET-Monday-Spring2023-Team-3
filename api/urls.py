from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path("register/", views.user_register),
    path("login/", views.user_login),
    path("profile/", views.profile),
]

urlpatterns = format_suffix_patterns(urlpatterns)
