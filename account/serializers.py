from django.contrib.auth import get_user_model
from rest_framework import serializers
from account.models import UserOtherDetails, UserFollowings

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'username',
        ]


class UserOtherDetailsSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserOtherDetails
        fields = '__all__'


class FollowingSerializer(serializers.ModelSerializer):
    user = UserOtherDetailsSerializer(read_only=True)
    is_following = UserOtherDetailsSerializer(read_only=True)

    class Meta:
        model = UserFollowings
        fields = '__all__'
