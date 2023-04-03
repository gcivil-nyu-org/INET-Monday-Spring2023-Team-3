from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path("", views.crawl_create),
    path("all/", views.crawl_get_all),
    # path("crawl_by_author/", views.crawl_get_crawls_by_author),
]

urlpatterns = format_suffix_patterns(urlpatterns)
