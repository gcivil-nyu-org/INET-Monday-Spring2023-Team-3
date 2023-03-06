from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    path("register/", views.user_register),
    path("login/", views.user_login),
    path("profile/", views.profile),
    path("verify/", views.email_verify),
    path("send-otp/", views.send_otp),
    path("recover/", views.send_recovery),
    path("verify-recovery/", views.verify_recovery),
    path("update-password/", views.update_password),
]

urlpatterns = format_suffix_patterns(urlpatterns)
