from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import VehicleType, VehicleStatus, Vehicle
from datetime import datetime

User = get_user_model()

class VehicleTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleType
        fields = "__all__"


class VehicleStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleStatus
        fields = "__all__"


class OperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class VehicleSerializer(serializers.ModelSerializer):
    type_name = serializers.ReadOnlyField(source="type_id.type_name")
    status_name = serializers.ReadOnlyField(source="status_id.status_name")
    operator_firstname = serializers.ReadOnlyField(source="operator_id.firstname")
    operator_lastname = serializers.ReadOnlyField(source="operator_id.lastname")
    operator_email = serializers.ReadOnlyField(source="operator_id.email")

    class Meta:
        model = Vehicle
        fields = "__all__"
