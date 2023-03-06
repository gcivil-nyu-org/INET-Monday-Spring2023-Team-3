from django.contrib import admin
from .models import User, OTP_Request, RecoverRequest


class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "password", "verified")


class OTP_RequestAdmin(admin.ModelAdmin):
    list_display = ("user", "otp", "verified", "created_at", "tries")


class RecoverRequestAdmin(admin.ModelAdmin):
    list_display = ("user", "token", "used")


# Register your models here.

admin.site.register(User, UserAdmin)
admin.site.register(OTP_Request, OTP_RequestAdmin)
admin.site.register(RecoverRequest, RecoverRequestAdmin)
