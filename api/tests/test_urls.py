from django.test import SimpleTestCase
from django.urls import reverse, resolve
from api.views import user_register, user_login, profile


class TestUrls(SimpleTestCase):
    def test_register_url_is_resolves(self):
        url = reverse("register")
        self.assertEquals(resolve(url).func, user_register)

    def test_login_url_is_resolves(self):
        url = reverse("login")
        self.assertEquals(resolve(url).func, user_login)

    def test_profile_url_is_resolves(self):
        url = reverse("profile", kwargs={"other_username":username})
        self.assertEquals(resolve(url).func, profile)
