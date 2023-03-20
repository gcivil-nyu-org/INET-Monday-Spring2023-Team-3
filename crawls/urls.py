from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path("", views.crawl_create),
    path("all/", views.crawl_get_all),
]

urlpatterns = format_suffix_patterns(urlpatterns)
