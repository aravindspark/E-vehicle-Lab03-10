from rest_framework import serializers
from django.contrib.auth import get_user_model
from user.models import CustomUser

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'

    def __str__(self) -> str:
        return self.name