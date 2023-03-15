from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from crawls.models import Point, Crawl  # , Tag


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
        )

    data = {
        "title": point.title,
        "description": point.description,
        "google_place_id": point.google_place_id,
        "address": point.address,
        "crawls": point.crawls,  # MtM attribute, may need a separate query for this
        "longitude": point.longitude,
        "latitude": point.latitude,
        "created_at": point.created_at,
        "updated_at": point.updated_at
    }
    return Response(data)


@api_view(["POST"])
def point_create(request):
    """
    Create Point

    Should query by google place id instead of title when Maps API is up and running
    """
    point = Point.objects.filter(title=request.data["title"]).exists()
    if point:
        return Response(
            {"error": "point already exists"}, status=status.HTTP_400_BAD_REQUEST
        )
    data = {
        "title": request.data["title"],
        "description": request.data["description"],
        "google_place_id": request.data["google_place_id"],
        "address": request.data["address"],
        "crawls": request.data["crawls"],  # MtM attribute
        "longitude": request.data["longitude"],
        "latitude": request.data["latitude"],
        "created_at": request.data["created_at"],
        "updated_at": request.data["updated_at"]
    }
    point = Point.objects.create(**data)
    return Response(point, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def point_delete(request):
    """
    Delete point
    Should query by google place id instead of title when Maps API is up and running
    """
    try:
        point = Point.objects.get(title=request.data["title"])
        # point = Point.objects.get(
        # google_place_id=request.google_place_id["google_place_id"]
        # )
    except Point.DoesNotExist:
        return Response(
            {"error": "point does not exist"}, status=status.HTTP_400_BAD_REQUEST
        )
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
        )

    data = {
        "title": crawl.title,
        "description": crawl.description,
        "points": crawl.points,  # MtM attribute, may need a separate query for this
        "tags": crawl.tags,  # MtM attribute, may need a separate query for this
        "created_at": crawl.created_at,
        "updated_at": crawl.updated_at
    }
    return Response(data)


@api_view(["POST"])
def crawl_create(request):
    """
    create crawl
    """
    crawl = Crawl.objects.filter(title=request.data["title"]).exists()
    if crawl:
        return Response(
            {"error": "crawl already exists"}, status=status.HTTP_400_BAD_REQUEST
        )
    data = {
        "title": request.data["title"],
        "description": request.data["description"],
        "address": request.data["address"],
        "points": request.data["points"],  # MtM attribute
        "tags": request.data["tags"],  # MtM attribute
        "created_at": request.data["created_at"],
        "updated_at": request.data["updated_at"]
    }
    crawl = Crawl.objects.create(**data)
    return Response(data, status=status.HTTP_201_CREATED)  # need to return data?


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
        )
    crawl.delete()
    return Response(status=status.HTTP_202_ACCEPTED)
