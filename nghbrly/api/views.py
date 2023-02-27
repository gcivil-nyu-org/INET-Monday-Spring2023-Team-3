from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from .models import User
from .decorators import is_protected_route
import jwt, os

SECRET_KEY = os.environ.get('SECRET_KEY')


@api_view(['POST'])
def user_register(request):
    """
    Register Users
    """
    user = User.objects.filter(username=request.data["username"]).exists()
    if user:
        return Response({"error": "username already exists"}, status=status.HTTP_400_BAD_REQUEST)
    data = {
        "username": request.data["username"],
        "email": request.data["email"],
        "password": make_password(request.data["password"])
    }
    user = User.objects.create(**data)
    encoded_jwt = jwt.encode({"username": user.username}, SECRET_KEY, algorithm="HS256")
    return Response({'jwt': encoded_jwt}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def user_login(request):
    """
    Log in Users
    """
    try:
        user = User.objects.get(username=request.data["username"])
    except:
        return Response({"error": "username does not exist"}, status=status.HTTP_400_BAD_REQUEST)
    if check_password(request.data["password"], user.password):
        encoded_jwt = jwt.encode({"username": user.username}, SECRET_KEY, algorithm="HS256")
        return Response({'jwt': encoded_jwt}, status=status.HTTP_201_CREATED)
    return Response({"error": "incorrect password"}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
@is_protected_route
def profile(request, format=None):
    user = User.objects.get(username=request.user["username"])
    data = {
        "username": user.username,
        "email": user.email,
    }
    return Response(data)