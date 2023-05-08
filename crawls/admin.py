from django.contrib import admin
from .models import Crawl, Review


class CrawlAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "title", "data")


class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "crawl", "text", "rating")


# Register your models here.

admin.site.register(Crawl, CrawlAdmin)
admin.site.register(Review, ReviewAdmin)
