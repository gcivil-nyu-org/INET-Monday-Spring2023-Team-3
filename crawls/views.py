from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from crawls.models import Crawl, Tag
from api.models import User
from api.decorators import is_protected_route
import json


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
                "picture": crawls[i].picture,
                "author_profile_pic": crawls[i].author.profile_pic,
            }
        )
    return out


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
    crawls = Crawl.objects.all()
    out = process_crawl_query_set(crawls)
    return Response(out)


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
        res = {
            "id": target_crawl.id,
            "title": target_crawl.title,
            "data": json.loads(target_crawl.data),
            "author": target_crawl.author.username,
            "author_profile_pic": target_crawl.author.profile_pic,
            "description": target_crawl.description,
            "created_at": target_crawl.created_at,
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
        target_crawls = Crawl.objects.filter(title=title)
        out = process_crawl_query_set(target_crawls)
        return Response(out)
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
            tag_obj = Tag.objects.create(title=tag.lower())
            crawl.tags.add(tag_obj)
        return Response(status=status.HTTP_200_OK)
    except Crawl.DoesNotExist:
        return Response(
            {"error": "crawl does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
