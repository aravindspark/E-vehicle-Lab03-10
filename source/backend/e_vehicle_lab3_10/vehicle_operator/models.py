from django.db import models
import datetime
from django.contrib.auth import get_user_model

User = get_user_model()

class VehicleType(models.Model):
    type_name = models.CharField(max_length=100)

    def __str__(self):
        return self.type_name


class VehicleStatus(models.Model):
    status_name = models.CharField(max_length=100)

    def __str__(self):
        return self.status_name


class Vehicle(models.Model):
    type_id = models.ForeignKey(VehicleType, on_delete=models.CASCADE)
    status_id = models.ForeignKey(VehicleStatus, on_delete=models.CASCADE)
    operator_id = models.ForeignKey(
        User, null=True, on_delete=models.SET_NULL,
        limit_choices_to={'user_type': 'operator'}  # limited user_type 'operator'
    )

    current_location = models.CharField(max_length=100)  # postcode or something like "1 Beith St, Glasgow G11 6PS"
    current_lat = models.FloatField(default=None)
    current_lng = models.FloatField(default=None)
    battery_level = models.FloatField(default=0, null=True, blank=True)
    last_service_date = models.DateTimeField(
        default=datetime.datetime(1900, 1, 1), null=True, blank=True
    )
    create_time = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(
        default=False, choices=[(True, "Yes"), (False, "No")]
    )

    def __str__(self):
        return str(self.id) + ',' + str(self.current_location)

