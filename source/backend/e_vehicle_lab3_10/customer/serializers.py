from rest_framework import serializers
from django.contrib.auth import get_user_model
from user.models import CustomUser
from .models import Order


User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('firstname','middlename','lastname','birth_date')

    def __str__(self) -> str:
        return self.name
    
class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'