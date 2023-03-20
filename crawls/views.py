from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from crawls.models import Point, Crawl, Tag
from api.decorators import is_protected_route
import json


@api_view(["GET"])
def point(request, format=None):
    """
    get a point object
    Querying by title instead of google_place_id may be the best solution. We'll have
    duplicate points with different titles/descriptions, but otherwise editing the title
    /desc of any point will lead to point edits in every crawl that has that point
    """

    try:
        point = Point.objects.get(title=request.data["title"])
    except Point.DoesNotExist:
        return Response(
            {"error": "point does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )  # change to redirect?

    crawl_titles = []  # only really need titles for now
    for crawl in point.crawls.all():
        if crawl:  # might have nulls in through table
            crawl_titles.append(crawl.title)

    data = {
        "title": point.title,
        "description": point.description,
        "google_place_id": point.google_place_id,
        "address": point.address,
        "crawls": crawl_titles,  # this list may be empty
        "longitude": point.longitude,
        "latitude": point.latitude,
        "created_at": point.created_at,
        "updated_at": point.updated_at,
    }
    return Response(data)


@api_view(["POST"])
def point_create(request):
    """
    Create Point

    Doesn't create crawls for the point, for now let's just create empty crawls and add
    points to existing crawls in update?
    """
    point = Point.objects.filter(title=request.data["title"]).exists()
    if point:
        return Response(
            {"error": "point already exists"}, status=status.HTTP_400_BAD_REQUEST
        )  # change to redirect?
    data = {
        "title": request.data["title"],
        "description": request.data["description"],
        "google_place_id": request.data["google_place_id"],
        "address": request.data["address"],
        "longitude": request.data["longitude"],
        "latitude": request.data["latitude"],
    }
    point = Point.objects.create(**data)
    return Response(status=status.HTTP_201_CREATED)


@api_view(["POST"])
def point_delete(request):
    """
    Delete point
    """
    try:
        point = Point.objects.get(title=request.data["title"])
    except Point.DoesNotExist:
        return Response(
            {"error": "point does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )  # change to redirect?
    point.delete()
    return Response(status=status.HTTP_202_ACCEPTED)


@api_view(["GET"])
def crawl(request, format=None):
    """
    get a crawl object
    """
    try:
        crawl = Crawl.objects.get(title=request.data["title"])
    except Crawl.DoesNotExist:
        return Response(
            {"error": "crawl does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )  # change to redirect?

    tag_titles = []
    for tag in crawl.tags.all():
        if tag:  # might have nulls in through table
            tag_titles.append(tag.title)

    point_list = []
    for point in crawl.points.all():
        if point:  # might have nulls in through table
            point_dict = {}
            point_dict["title"] = point.title
            point_dict["google_place_id"] = point.google_place_id
            point_dict["address"] = point.address
            point_list.append(point_dict.copy())

    data = {
        "title": crawl.title,
        "description": crawl.description,
        "points": point_list,  # list of point dicts, only title/GP_id/address
        "tags": tag_titles,  # both points and tags may be empty
        "created_at": crawl.created_at,
        "updated_at": crawl.updated_at,
    }
    return Response(data)


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
            {"error": "crawl already exists"}, status=status.HTTP_400_BAD_REQUEST
        )  # change to redirect?
    data = {
        "title": request.data["title"],
        "author": request.user.username,
        "data": json.dumps(request.data)
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
        out.append({
            "title": crawls[i].title,
            "data": json.loads(crawls[i].data)
        })
    return Response(out)


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


@api_view(["POST"])
def crawl_add_points(request):
    """
    add points to a crawl

    """
    try:
        crawl = Crawl.objects.get(title=request.data["title"])
    except Crawl.DoesNotExist:
        if crawl:
            return Response(
                {"error": "crawl already exists"}, status=status.HTTP_400_BAD_REQUEST
            )  # change to redirect?

    for point in request.data["points"]:  # point should be a dict in points list
        cur_point = Point.objects.get_or_create(**point)
        crawl.points.add(cur_point)

    return Response(status=status.HTTP_202_ACCEPTED)
