from .models import User

# from django.http import HttpResponseRedirect
import jwt
import os

SECRET_KEY = os.environ.get("SECRET_KEY")


def get_user_from_jwt(encoded_jwt):
    decoded_user = jwt.decode(encoded_jwt, SECRET_KEY, algorithms=["HS256"])
    user = User.objects.get(id=decoded_user["id"])
    return user
