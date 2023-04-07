from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path("", views.crawl_create, name="crawl_create"),
    path("all/", views.crawl_get_all, name="crawl_get_all"),
    path("delete/", views.crawl_delete, name="crawl_delete"),
    path("get_crawl_by_id/<str:crawl_id>/", views.get_crawl_by_id, name="get_crawl_by_id"),
    path("update_crawl_by_id/<str:crawl_id>/", views.update_crawl_by_id, name="update_crawl_by_id"),
]

urlpatterns = format_suffix_patterns(urlpatterns)
