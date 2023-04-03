from random_username.generate import generate_username
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from .models import User, OTP_Request, RecoverRequest
from .decorators import is_protected_route
import jwt
import json
import math
import random
import requests
from datetime import datetime, timezone
from .serializers import ImageSerializer
from rest_framework.generics import ListAPIView
from .forms import UserForm
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework.parsers import MultiPartParser, FormParser


SECRET_KEY = settings.SECRET_KEY


def generateOTP():
    digits = "0123456789"
    OTP = ""
    for i in range(6):
        OTP += digits[math.floor(random.random() * 10)]
    return OTP


def send_otp_email(user):
    otp = generateOTP()
    try:
        send_mail(
            "Your One Time Password (OTP)",
            otp,
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(e)
        return False
    OTP_Request.objects.create(user=user, otp=otp)
    return True


def send_recovery_email(host, user):
    token = jwt.encode(
        {"email": user.email, "created_at": datetime.now(timezone.utc).timestamp()},
        SECRET_KEY,
        algorithm="HS256",
    )
    try:
        rr = RecoverRequest.objects.get(user=user)
        rr.token = token
        rr.used = False
        rr.save()
    except Exception as e:
        print(e)
        rr = RecoverRequest.objects.create(user=user, token=token)

    try:
        send_mail(
            "Your account recovery link",
            f"http://{host}/recover/{token}",
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(e)
        return False
    return True


@api_view(["POST"])
def user_register(request):
    """
    Register Users
    """
    try:
        user1 = User.objects.filter(username=request.data["username"]).exists()
        user2 = User.objects.filter(email=request.data["email"]).exists()
        if user1 or user2:
            return Response(
                {"error": "user already exists"}, status=status.HTTP_400_BAD_REQUEST
            )
        data = {
            "username": request.data["username"],
            "email": request.data["email"],
            "password": make_password(request.data["password"]),
        }
        User.objects.create(**data)
        return Response({"success": True}, status=status.HTTP_201_CREATED)
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def email_verify(request):
    """
    Verify User's Email
    """
    try:
        user = User.objects.get(email=request.data["email"])
        otpRequest = OTP_Request.objects.filter(user=user).order_by("-created_at")[0]
        secondsSince = (
            datetime.now(timezone.utc) - otpRequest.created_at
        ).total_seconds()
        if otpRequest.tries > 4 or secondsSince > 10 * 60:
            return Response(
                {"error": "OTP no longer valid."}, status=status.HTTP_400_BAD_REQUEST
            )
        otpRequest.tries += 1
        otpRequest.save()
        if otpRequest.otp == request.data["otp"]:
            user.verified = True
            user.save()
            encoded_jwt = jwt.encode(
                {"username": user.username}, SECRET_KEY, algorithm="HS256"
            )
            return Response({"jwt": encoded_jwt}, status=status.HTTP_201_CREATED)
        return Response(
            {"error": "Incorrect OTP. Please try again."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except ObjectDoesNotExist:
        return Response(
            {"error": "user does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def send_otp(request):
    """
    Send an OTP to User's Email
    """
    try:
        user = User.objects.get(email=request.data["email"])
        send_otp_email(user)
        return Response(
            {"success": True, "verified": False, "email": user.email},
            status=status.HTTP_201_CREATED,
        )
    except ObjectDoesNotExist:
        return Response(
            {"error": "user does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def user_login(request):
    """
    Log in Users
    """
    try:
        user = User.objects.get(username=request.data["username"])
    except Exception as e:
        print(e)
        return Response(
            {"error": "username does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )
    if check_password(request.data["password"], user.password):
        encoded_jwt = jwt.encode(
            {"username": user.username}, SECRET_KEY, algorithm="HS256"
        )
        if user.verified:
            return Response(
                {"success": True, "jwt": encoded_jwt, "verified": True},
                status=status.HTTP_201_CREATED,
            )
        else:
            send_otp_email(user)
            return Response(
                {"success": True, "verified": False, "email": user.email},
                status=status.HTTP_201_CREATED,
            )

    return Response({"error": "incorrect password"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def send_recovery(request):
    """
    Send an email with a recovery link
    """
    try:
        user = User.objects.get(username=request.data["username"])
        send_recovery_email(request.get_host(), user)
    except Exception as e:
        print(e)
        return Response(
            {"error": "username does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )
    return Response(status=status.HTTP_200_OK)


@api_view(["POST"])
def verify_recovery(request):
    """
    Verify a recovery link
    """
    try:
        encoded_jwt = request.data["token"]
        decoded_jwt = jwt.decode(encoded_jwt, SECRET_KEY, algorithms=["HS256"])
        user = User.objects.get(email=decoded_jwt["email"])
        rr = RecoverRequest.objects.get(user=user, token=encoded_jwt)
        if (
            not rr
            or rr.used
            or (
                datetime.now() - datetime.fromtimestamp(decoded_jwt["created_at"])
            ).total_seconds()
            > 15 * 60
        ):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        User.objects.get(email=decoded_jwt["email"])
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_200_OK)


@api_view(["POST"])
def update_password(request):
    """
    Update password using recovery token
    """
    try:
        encoded_jwt = encoded_jwt = request.data["token"]
        decoded_jwt = jwt.decode(encoded_jwt, SECRET_KEY, algorithms=["HS256"])
        user = User.objects.get(email=decoded_jwt["email"])
        rr = RecoverRequest.objects.get(user=user, token=encoded_jwt)
        if (
            not rr
            or (
                datetime.now() - datetime.fromtimestamp(decoded_jwt["created_at"])
            ).total_seconds()
            > 15 * 60
        ):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        rr.used = True
        rr.save()
        user = User.objects.get(email=decoded_jwt["email"])
        user.password = make_password(request.data["password"])
        user.save()
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_200_OK)


@api_view(["POST"])
def google_verify(request, format=None):
    try:
        url = f'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={request.data["access_token"]}'  # noqa E501
        response = requests.get(url)
        response_dict = json.loads(response.text)
        try:
            user = User.objects.get(email=response_dict["email"])
        except Exception as e:
            print(e)
            user = User.objects.create(
                username=generate_username(1)[0],
                email=response_dict["email"],
                verified=True,
            )
        encoded_jwt = jwt.encode(
            {"username": user.username}, SECRET_KEY, algorithm="HS256"
        )
        return Response(
            {"success": True, "jwt": encoded_jwt, "verified": True},
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        print(e)
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@is_protected_route
def profile(request, format=None):
    data = {
        "username": request.user.username,
        "email": request.user.email,
    }
    return Response(data)


@api_view(["GET"])
@is_protected_route
def full_profile(request, format=None):
    target_user = User.objects.get(username=request.user.username)
    # serializer for profile pic
    serializer_profilepic = ImageSerializer(
        target_user, context={"request": request}, many=False
    )
    data = {
        "username": request.user.username,
        "email": request.user.email,
        "location": request.user.location,
        "short_bio": request.user.short_bio,
        "following": request.user.follows,
        "followed_by": request.user.followed_by,
        # "date_of_birth": request.user.date_of_birth,
        "profile_pic": serializer_profilepic.data["profile_pic"],
    }
    return Response(data)


@api_view(["POST", "GET"])
@is_protected_route
def get_other_user_profile(request, other_username):
    try:
        target_user = User.objects.get(username=other_username)
        if not target_user:
            return Response(
                {"error": "user does not exists"}, status=status.HTTP_400_BAD_REQUEST
            )
        target_user = User.objects.get(username=other_username)

        # serializer for profile pic
        serializer_profilepic = ImageSerializer(
            target_user, context={"request": request}, many=False
        )

        data = {
            "username": target_user.username,
            "email": target_user.email,
            "location": target_user.location,
            "short_bio": target_user.short_bio,
            "following": target_user.follows,
            "followed_by": target_user.followed_by,
            "profile_pic": serializer_profilepic.data["profile_pic"],
        }

        return Response(data)
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST", "GET"])
@is_protected_route
@parser_classes([MultiPartParser, FormParser])
def profile_pic(request):
    # def profile_pic(request, username):
    data = request.data
    print("data: ", data)

    # target_user = User.objects.get(username=username)
    target_user = User.objects.get(username=request.data["target_username"])
    print("target_user: ", target_user)

    file = request.FILES
    print("file: ", file)

    print("profile_pic: ", target_user.profile_pic)

    target_user.profile_pic = request.FILES.get("file")
    target_user.save()

    target_user = User.objects.get(username=username)
    print("profile_pic: ", target_user.profile_pic)
    response = {"result": "User Profile Updated"}
    return Response(response)


# @api_view(["POST"])
def profile_pic2(request, username):
    target_user = User.objects.get(username=username)
    form = UserForm(instance=target_user)

    if request.method == "POST":
        form = UserForm(request.POST, request.FILES, instance=target_user)
        if form.is_valid():
            form.save()

    context = {"form": form}
    return render(request, "test/form_test.html", context)


@api_view(["POST"])
def update_user_info(request):
    try:
        username = request.data["target_username"]

        targetuser = User.objects.filter(username=username).exists()
        if not targetuser:
            return Response(
                {"error": "user does not exists"}, status=status.HTTP_400_BAD_REQUEST
            )
        target_user = User.objects.get(username=username)
        target_user.short_bio = request.data["short_bio"]
        target_user.save()
        return Response(status=status.HTTP_200_OK)
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@is_protected_route
def follow(request):
    try:
        target_username = request.data["target_address"]
        self_username = request.data["self_address"]
        target_user = User.objects.get(username=target_username)
        self_user = User.objects.get(username=self_username)

        # check if already following
        if target_username not in self_user.follows:
            oldList = []
            if len(self_user.follows) > 0:
                oldList = self_user.follows.split(" ")
            oldList.append(target_username)
            self_user.follows = " ".join(oldList)
            self_user.save()

        if self_username not in target_user.followed_by:
            oldList2 = []
            if len(target_user.followed_by) > 0:
                oldList2 = target_user.followed_by.split(" ")
            oldList2.append(self_username)
            target_user.followed_by = " ".join(oldList2)
            target_user.save()

        return Response(status=status.HTTP_200_OK)
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@is_protected_route
def unfollow(request):
    try:
        target_username = request.data["target_address"]
        self_username = request.data["self_address"]
        target_user = User.objects.get(username=target_username)
        self_user = User.objects.get(username=self_username)

        # check if already not following.
        if target_username in self_user.follows:
            oldList = []
            if len(self_user.follows) > 0:
                oldList = self_user.follows.split(" ")

            oldList.remove(target_username)
            self_user.follows = " ".join(oldList)
            self_user.save()

        if self_username in target_user.followed_by:
            oldList2 = []
            if len(target_user.followed_by) > 0:
                oldList2 = target_user.followed_by.split(" ")
            oldList2.remove(self_username)
            target_user.followed_by = " ".join(oldList2)
            target_user.save()

        return Response(status=status.HTTP_200_OK)
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_400_BAD_REQUEST)
