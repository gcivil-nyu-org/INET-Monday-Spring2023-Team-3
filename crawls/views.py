from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from django.views.generic.edit import DeleteView, CreateView, UpdateView
from crawls.models import Point, Crawl  # , Tag


class PointDetailView(DetailView):
    model = Point
    context_object_name = "point"

    # template_name = ''  by default will look under crawls/templates/point_detail.html

    """
    should return an object called 'point' which you can reference in the template
            e.g. point.<attribute>

    URL generally includes pk or slug to identify point object and.as_view(), e.g.:
    path('point/<int:pk>', views.PointDetailView.as_view(), name='point_detail')

    we can override get_context_data() for the detail views if we want to add
    information to the object that gets passed to the template:
        https://docs.djangoproject.com/en/4.1/ref/class-based-views/generic-display/
    """


class PointListView(ListView):
    model = Point
    paginate_by = 25  # objects per page, 25 is arbitrary choice
    context_object_name = "points"
    # template_name = '' by default will look under crawls/templates/point_list.html

    """
    returns a list called 'point' (default 'object_list')
    populated with point objects that
    you can reference in the template

    DTL has built-in functions to deal with pagination if you want to use that:
        https://docs.djangoproject.com/en/4.1/topics/pagination/

    we can override get_queryset() to filter the object_list, e.g.

    url e.g.
    path('points', views.PointListView.as_view(), name='point_list')
    """


class PointCreateView(CreateView):
    model = Point
    fields = [
        "title",
        "description",
        "google_place_id",
        "longitude," "latitude",
        "address",
    ]
    success_url = "/"
    # template_name = ''

    """
    will allow you to edit all these fields, should probably only let the user touch
    description and title, fill in the rest with fields from Google Maps place object
    for now maybe worth just filling them in manually to debug then work out API

    overriding get_success_url() may be a better option than success_url
    """


class PointUpdateView(UpdateView):
    model = Point
    fields = [
        "title",
        "description",
        "google_place_id",
        "longitude," "latitude",
        "address",
    ]
    success_url = "/"
    # template_name = ''

    """
    Works largely the same as create view, just pulls existing object from the DB first

    overriding get_success_url() may be a better option than success_url
    """


class PointDeleteView(DeleteView):
    model = Point
    success_url = "/"  # placeholder, defines redirect after deletion
    # template_name = ''

    """
    again, URL generally includes pk or slug to identify point object and.as_view(),
    e.g.:
        path('point/<int:pk>/delete',
            views.PointDeleteView.as_view(success_url=reverse_lazy('points:all')),
            name='point_delete')

    overriding get_success_url() may be a better option than success_url
    """


class CrawlDetailView(DetailView):
    model = Crawl
    context_object_name = "crawl"
    # template_name = ''  by default will look under crawls/templates/crawl_detail.html

    """
    should return an object called 'crawl' which you can reference in the template
            e.g. crawl.<attribute>

    URL generally includes pk or slug to identify point object and.as_view(), e.g.:
    path('crawl/<int:pk>', views.CrawlDetailView.as_view(), name='crawl_detail')

    again can override get_context_data()
    """


class CrawlListView(ListView):
    model = Crawl
    paginate_by = 15  # objects per page, 15 is arbitrary choice
    context_object_name = "crawls"
    # template_name = '' by default will look under crawls/templates/crawl_list.html

    """
    returns a list called crawls populated with crawl objects that
        you can reference in the template

    we can override get_queryset() to filter the crawls, e.g.

    url e.g.
    path('crawls', views.CrawlListView.as_view(), name='crawl_list')
    """


class CrawlCreateView(CreateView):
    model = Crawl
    fields = ["title", "author", "description", "google_place_id", "tags", "points"]
    success_url = "/"
    # template_name = ''

    """
    will allow you to edit all these fields, should probably only let the user touch
    description and title, fill in the rest with fields from Google Maps place object
    for now maybe worth just filling them in manually to debug then work out API

    overriding get_success_url() may be a better option than success_url
    """


class CrawlUpdateView(UpdateView):
    model = Crawl
    fields = ["title", "author", "description", "google_place_id", "tags", "points"]
    success_url = "/"
    # template_name = ''

    """
    Works largely the same as create view, just pulls existing object from the DB first

    overriding get_success_url() may be a better option than success_url
    """


class CrawlDeleteView(DeleteView):
    model = Crawl
    success_url = "/"  # placeholder, defines redirect after deletion
    # template_name = ''

    """
    again, URL generally includes pk or slug to identify crawl object and.as_view(),
    e.g.:
        path('point/<int:pk>/delete',
            views.PointDeleteView.as_view(success_url=reverse_lazy('points:all')),
            name='point_delete')

    overriding get_success_url() may be a better option than success_url
    """
