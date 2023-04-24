from rest_framework import status
from rest_framework.response import Response
from functools import wraps
from .utils import get_user_from_jwt

# from django.http import HttpResponseRedirect
import os

SECRET_KEY = os.environ.get("SECRET_KEY")


def is_protected_route(function):
    @wraps(function)
    def wrap(request, *args, **kwargs):
        try:
            encoded_jwt = request.META["HTTP_AUTHORIZATION"]
            user = get_user_from_jwt(encoded_jwt)
            request.user = user
            if user:
                return function(request, *args, **kwargs)
            else:
                return Response(status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return wrap
