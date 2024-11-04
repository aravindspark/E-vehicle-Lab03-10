from django.db import models


class Order(models.Model):
    start_time = models.CharField(max_length=100)
    customer_id ="FK"
    vehicle_id = "FK"
    actual_return_time = models.CharField(max_length=100)
    return_time = models.CharField(max_length=100)
    total_price =  models.CharField(max_length=100)
    status_id = "FK"
    customer_remarks = models.CharField(max_length=20)
    rented_location = models.CharField(max_length=20)
    returned_location = models.CharField(max_length=20)

    def __str__(self) -> str:
        return super().__str__()
    