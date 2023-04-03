from rest_framework import serializers
from .models import User

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    # This is the magic function which does the work
    # def get_photo_url(self, obj):
    #     request = self.context.get('request')
    #     photo_url = obj.fingerprint.url
    #     return request.build_absolute_uri(photo_url)


# class ImageSerializer2(serializers.HyperlinkedModelSerializer):
#     class Meta:
#         model = User
#         fields = '__all__'
#
#     def update(self, instance: User, validated_data):
#         instance.profile_pic = validated_data['file']
#         instance.save()
#         return instance
