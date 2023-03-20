from django.contrib import admin
from .models import Crawl


class CrawlAdmin(admin.ModelAdmin):
    list_display = ("author", "title", "data")


# Register your models here.

admin.site.register(Crawl, CrawlAdmin)
