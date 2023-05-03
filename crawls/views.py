from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import IntegrityError
from django.http import HttpResponse
from crawls.models import Crawl, Tag
from api.models import User
from api.decorators import is_protected_route

# from api.utils import get_user_from_jwt
import json
import base64
import random


def process_crawl_query_set(crawls):
    """
    takes in query set of crawls, returns list of crawl data dicts
    """
    out = []
    for i in range(len(crawls)):
        out.append(
            {
                "id": crawls[i].id,
                "title": crawls[i].title,
                "author": crawls[i].author.username,
                "description": crawls[i].description,
                "created_at": crawls[i].created_at,
                "author_profile_pic": crawls[i].author.profile_pic,
            }
        )
    return out


def process_crawl(crawl):
    """
    takes in single crawl, return crawl data dict
    """
    tag_set = crawl.tags.all()
    tag_list = []
    for tag in tag_set:
        tag_list.append(tag.title)
    out = {
        "id": crawl.id,
        "title": crawl.title,
        "data": json.loads(crawl.data),
        "author": crawl.author.username,
        "description": crawl.description,
        "created_at": crawl.created_at,
        "author_profile_pic": crawl.author.profile_pic,
        "tags": tag_list,
    }
    return out


def crawl_search_by_title_author_tag(query):
    """
    generalized search, takes query string and returns query set of crawls
    filtered by title, author, and search
    """
    title_crawls = Crawl.objects.filter(title__icontains=query)

    users = User.objects.filter(username__icontains=query)
    username_crawls = Crawl.objects.none()
    for user in users:
        username_crawls = username_crawls | Crawl.objects.filter(author=user)

    tags = Tag.objects.filter(title__icontains=query)
    tag_crawls = Crawl.objects.none()
    for tag in tags:
        tag_crawls = tag_crawls | tag.crawls.all()

    all_crawls = title_crawls.union(username_crawls, tag_crawls)
    return all_crawls


@api_view(["POST"])
@is_protected_route
def crawl_create(request):
    """
    create crawl

    """
    crawl = Crawl.objects.filter(title=request.data["title"]).exists()
    if crawl:
        return Response(
            {"error": "Crawl title already exists"}, status=status.HTTP_400_BAD_REQUEST
        )
    data = {
        "title": request.data["title"],
        "author": request.user,
        "data": json.dumps(request.data["data"]),
        "picture": request.data["picture"],
        "description": request.data["description"],
    }
    crawl = Crawl.objects.create(**data)

    return Response(status=status.HTTP_201_CREATED)


@api_view(["GET"])
@is_protected_route
def crawl_get_all(request):
    """
    get all crawls

    """
    perPage = int(request.GET.get("perPage", "3"))
    page = int(request.GET.get("page", "1"))
    crawls = Crawl.objects.all()[
        perPage * (page - 1) : perPage * (page) + 1  # noqa: E203
    ]
    hasNext = len(crawls) > perPage
    if hasNext:
        crawls = crawls[: len(crawls) - 1]
    out = process_crawl_query_set(crawls)
    return Response({"page": page, "crawls": out, "hasNext": hasNext})


@api_view(["GET"])
def get_crawl_picture(request, crawl_id):
    """
    get crawl picture

    """
    try:
        # jwt = request.COOKIES.get("jwt")
        # Should be used to verify access
        # user = get_user_from_jwt(jwt)
        # request.user = user
        target_crawl = Crawl.objects.get(id=crawl_id)
        data_uri = target_crawl.picture
        image_data = data_uri.partition("base64,")[2]
        image_ext = data_uri.partition("base64,")[0].split("/")[1][:-1]
        binary = base64.b64decode(image_data)
        return HttpResponse(binary, content_type=f"image/{image_ext}")
    except Exception as e:
        print(e)
        return Response(
            {"error": "crawl does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
@is_protected_route
def crawl_delete(request):
    """
    delete crawl
    """
    try:
        crawl = Crawl.objects.get(title=request.data["title"])
    except Crawl.DoesNotExist:
        return Response(
            {"error": "crawl does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )
    crawl.delete()
    return Response(status=status.HTTP_202_ACCEPTED)


@api_view(["GET"])
@is_protected_route
def get_crawl_by_id(request, crawl_id):
    try:
        target_crawl = Crawl.objects.get(id=crawl_id)
        tags = target_crawl.tags.all()
        res = {
            "id": target_crawl.id,
            "title": target_crawl.title,
            "data": json.loads(target_crawl.data),
            "author": target_crawl.author.username,
            "author_profile_pic": target_crawl.author.profile_pic,
            "description": target_crawl.description,
            "created_at": target_crawl.created_at,
            "tags": [tag.title for tag in tags],
        }
        return Response(res)
    except Exception as e:
        print(e)
        return Response(
            {"error": "crawl does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
@is_protected_route
def update_crawl_by_id(request, crawl_id):
    try:
        target_crawl = Crawl.objects.filter(id=crawl_id).exists()
        if not target_crawl:
            return Response(
                {"error": "crawl does not exist."}, status=status.HTTP_400_BAD_REQUEST
            )
        target_crawl = Crawl.objects.get(id=crawl_id)
        target_crawl.title = request.data["title"]
        target_crawl.description = request.data["description"]
        target_crawl.data = json.dumps(request.data["data"])

        target_crawl.save()
        return Response(status=status.HTTP_200_OK)
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@is_protected_route
def get_crawls_by_author(request, username):
    try:
        user = User.objects.get(username=username)
        target_crawls = Crawl.objects.filter(author=user)
        out = process_crawl_query_set(target_crawls)
        return Response(out)
    except Exception as e:
        print(e)
        return Response(
            {"error": "Username has no crawls"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
@is_protected_route
def crawl_delete_by_id(request):
    """
    delete crawl by crawl id
    """
    try:
        crawl = Crawl.objects.get(id=request.data["id"])
    except Crawl.DoesNotExist:
        return Response(
            {"error": "crawl does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )
    crawl.delete()
    return Response(status=status.HTTP_202_ACCEPTED)


@api_view(["GET"])
@is_protected_route
def search_crawls_by_author(request, username):
    try:
        # returns an empty dataset if if user has no crawls
        # but will throw exception if user does not exist
        user = User.objects.get(username=username)
        target_crawls = Crawl.objects.filter(author=user)
        out = process_crawl_query_set(target_crawls)

        return Response(out)
    except Exception as e:
        print(e)
        return Response(
            {"error": "Username does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["GET"])
@is_protected_route
def search_crawls_by_title(request, title):
    # returns an empty dataset if no crawls with specified title
    try:
        perPage = int(request.GET.get("perPage", "3"))
        page = int(request.GET.get("page", "1"))
        crawls = Crawl.objects.filter(title__icontains=title)[
            perPage * (page - 1) : perPage * (page) + 1  # noqa: E203
        ]
        hasNext = len(crawls) > perPage
        if hasNext:
            crawls = crawls[: len(crawls) - 1]
        out = process_crawl_query_set(crawls)
        return Response({"page": page, "crawls": out, "hasNext": hasNext})
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@is_protected_route
def search_crawls_by_tag(request, tag_title):
    try:
        tag = Tag.objects.get(title=tag_title)
        crawls = tag.crawls.all()
        out = process_crawl_query_set(crawls)
        return Response(out)
    except Tag.DoesNotExist:
        return Response(
            {"error": "tag does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@is_protected_route
def add_tags_to_crawl(request):
    """request should include the _crawl_title_
    and a string of _tags_ separated by commas
    """
    try:
        crawl = Crawl.objects.get(title=request.data["crawl_title"])
        tag_list = request.data["tags"].split(",")
        for tag in tag_list:
            tag = tag.strip().lower()
            # weird concurrency bug wouldn't let me just use get_or_create
            try:
                tag_obj = Tag.objects.create(title=tag)
            except IntegrityError:
                tag_obj = Tag.objects.get(title=tag)
            crawl.tags.add(tag_obj)
        return Response(status=status.HTTP_200_OK)
    except Crawl.DoesNotExist:
        return Response(
            {"error": "crawl does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@is_protected_route
def search_crawls_generalized(request, query):
    try:
        perPage = int(request.GET.get("perPage", "3"))
        page = int(request.GET.get("page", "1"))
        all_crawls = crawl_search_by_title_author_tag(query)
        all_crawls = all_crawls[
            perPage * (page - 1) : perPage * (page) + 1  # noqa E203
        ]
        hasNext = len(all_crawls) > perPage
        if hasNext:
            all_crawls = all_crawls[: len(all_crawls) - 1]
        out = process_crawl_query_set(all_crawls)
        return Response({"page": page, "crawls": out, "hasNext": hasNext})
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@is_protected_route
def get_random_crawl(request):
    try:
        crawls = Crawl.objects.all()
        crawl_count = Crawl.objects.count()
        index = random.randint(0, crawl_count - 1)
        crawl = crawls[index]
        out = process_crawl(crawl)
        return Response(out)
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@is_protected_route
def get_random_filtered_crawl(request, query):
    try:
        all_crawls = crawl_search_by_title_author_tag(query)
        crawl_count = len(all_crawls)
        index = random.randint(0, crawl_count - 1)
        crawl = all_crawls[index]
        out = process_crawl(crawl)
        return Response(out)
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_400_BAD_REQUEST)
