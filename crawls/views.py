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

    does not update points, does get/create and add tags
    """
    crawl = Crawl.objects.filter(title=request.data["title"]).exists()
    if crawl:
        return Response(
            {"error": "Crawl title already exists"}, status=status.HTTP_400_BAD_REQUEST
        )  # change to redirect?
    data = {
        "title": request.data["title"],
        "author": request.user.username,
        "data": json.dumps(request.data["data"]),
    }
    crawl = Crawl.objects.create(**data)
    # assuming tags will be input as string with tags separated by commas
    # if request.data["tags"].strip():
    #     tag_list = [tag.strip() for tag in request.data["tags"].split(",")]
    #     for tag in tag_list:
    #         if tag:  # might have nulls in through table
    #             cur_tag = Tag.objects.get_or_create(title=tag)  # avoid duplicate tags
    #             crawl.tags.add(cur_tag)

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
        out.append({"title": crawls[i].title, "data": json.loads(crawls[i].data)})
    return Response(out)


@api_view(["GET"])
@is_protected_route
def crawl_get_crawls_by_author(request):
    """
    get crawls authored by the user_id passed in.
    """
    author_id = request.query_params.get("author_id")
    crawls = Crawl.objects.filter(author_id=author_id)
    res = []
    for i in crawls:
        res.append({"title": i.title, "data": json.loads(i.data)})
    return Response(res)


@api_view(["POST"])
def crawl_delete(request):
    """
    delete crawl
    """
    try:
        crawl = Crawl.objects.get(title=request.data["title"])
    except Crawl.DoesNotExist:
        return Response(
            {"error": "crawl does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )  # change to redirect?
    crawl.delete()
    return Response(status=status.HTTP_202_ACCEPTED)
