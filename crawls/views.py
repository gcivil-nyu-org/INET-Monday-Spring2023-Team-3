from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from crawls.models import Point, Crawl, Tag


@api_view(["GET"])
def point(request, format=None):
    """
    get a point object
    Should query by google_place_id instead of title when Maps API is up and running
    """

    try:
        point = Point.objects.get(title=request.data["title"])
        # point = Point.objects.get(
        # google_place_id=request.google_place_id["google_place_id"]
        # )
    except Point.DoesNotExist:
        return Response(
            {"error": "point does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )  # change to redirect?

    crawl_titles = []  # only need titles for now, dict for more vals
    for crawl in point.crawls.all():
        crawl_titles.append(crawl.title)

    data = {
        "title": point.title,
        "description": point.description,
        "google_place_id": point.google_place_id,
        "address": point.address,
        "crawls": crawl_titles,  # keep in mind this list may be empty
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

    Should query by google place id instead of title when Maps API is up and running

    Doesn't create crawls for the point, for now let's just create points and add
    them to existing crawls in update?
    """
    point = Point.objects.filter(title=request.data["title"]).exists()
    if point:
        return Response(
            {"error": "point already exists"}, status=status.HTTP_400_BAD_REQUEST
        )  # change to redirect?
    data = {
        "title": request.data["title"],
        "description": request.data["description"],
        "google_place_id": request.data[
            "google_place_id"
        ],  # all google place attributes from here # noqa E501
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
    Should query by google place id instead of title when Maps API is up and running
    """
    try:
        point = Point.objects.get(title=request.data["title"])
        # point = Point.objects.get(
        #       google_place_id=request.google_place_id["google_place_id"]
        #       )
    except Point.DoesNotExist:
        return Response(
            {"error": "point does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )  # change to redirect?
    point.delete()
    return Response(status=status.HTTP_202_ACCEPTED)  # need to return data?


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
        tag_titles.append(tag.title)

    point_list = []
    for point in crawl.points.all():
        point_dict = {}
        point_dict["title"] = point.title
        point_dict["google_place_id"] = point.google_place_id
        point_dict["address"] = point.address
        point_list.append(point_dict.copy())

    data = {
        "title": crawl.title,
        "description": crawl.description,
        "points": point_list,  # list of point dicts, only title/GP_id/address
        "tags": tag_titles,  # keep in mind both points and tags can be empty
        "created_at": crawl.created_at,
        "updated_at": crawl.updated_at,
    }
    return Response(data)


@api_view(["POST"])
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
        "description": request.data["description"],
        "address": request.data["address"],
        "created_at": request.data["created_at"],
        "updated_at": request.data["updated_at"],
    }
    crawl = Crawl.objects.create(**data)
    # assuming tags will be given as string with tags separated by commas
    if request.data["tags"].strip():
        tag_list = [tag.strip() for tag in request.data["tags"].split(",")]
        for tag in tag_list:
            cur_tag = Tag.objects.get_or_create(title=tag)  # avoid duplicate tags
            crawl.tags.add(cur_tag)

    return Response(status=status.HTTP_201_CREATED)


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
