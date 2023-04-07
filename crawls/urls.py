from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path("", views.crawl_create, name="crawl_create"),
    path("all/", views.crawl_get_all, name="crawl_get_all"),
    path("delete/", views.crawl_delete, name="crawl_delete"),
    path(
        "get_crawl_by_id/<str:crawl_id>/", views.get_crawl_by_id, name="get_crawl_by_id"
    ),
    path(
        "update_crawl_by_id/<str:crawl_id>/",
        views.update_crawl_by_id,
        name="update_crawl_by_id",
    ),
    path(
        "get_crawls_by_author/<str:username>/",
        views.get_crawls_by_author,
        name="get_crawls_by_author",
    ),
]

urlpatterns = format_suffix_patterns(urlpatterns)
