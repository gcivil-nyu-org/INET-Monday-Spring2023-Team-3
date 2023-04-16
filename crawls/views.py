from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from crawls.models import Crawl
from api.decorators import is_protected_route
import json


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
            "picture": target_crawl.picture,
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
        target_crawl.picture = request.data["picture"]

        target_crawl.save()
        return Response(status=status.HTTP_200_OK)
    except Exception as e:
        print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@is_protected_route
def get_crawls_by_author(request, username):
    try:
        target_crawls = Crawl.objects.filter(author=username)
        out = []
        for i in range(len(target_crawls)):
            out.append(
                {
                    "id": target_crawls[i].id,
                    "title": target_crawls[i].title,
                    "data": json.loads(target_crawls[i].data),
                    "author": target_crawls[i].author.username,
                }
            )
        return Response(out)
    except Exception as e:
        print(e)
        return Response(
            {"error": "No such crawl exist"}, status=status.HTTP_400_BAD_REQUEST
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
