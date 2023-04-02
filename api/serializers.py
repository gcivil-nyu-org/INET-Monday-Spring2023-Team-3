from rest_framework import serializers
from .models import User

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['profile_pic', ]

    #This is the magic function which does the work
    def get_photo_url(self, obj):
        request = self.context.get('request')
        photo_url = obj.fingerprint.url
        return request.build_absolute_uri(photo_url)
