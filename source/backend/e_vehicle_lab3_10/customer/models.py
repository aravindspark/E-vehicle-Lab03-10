from django.contrib.auth import get_user_model
from django.db import models
from vehicle_operator.models import Vehicle
# Create your models here.
from user.models import  CustomUser
User = get_user_model()

class Amount(models.Model):
    amount = models.FloatField(default=0)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

class OrderStatus(models.TextChoices):
    CREATED = 'created' # unpaid
    # CONFIRMED = 'confirmed' # , _('Confirmed')
    # IN_PROGRESS = 'in_progress', _('In Progress')
    COMPLETED = 'completed' # paid
    CANCELED = 'canceled' # , _('Canceled')

class Order(models.Model):
    # customer_id = models.ForeignKey(User, on_delete=models.CASCADE)
    customer_id = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'customer'})  # limited user_type 'customer' )
    vehicle_id = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    planned_return_time = models.DateTimeField(null=True, blank=True)
    actual_return_time = models.DateTimeField(null=True, blank=True)

    total_price = models.FloatField(default=0)
    order_date = models.DateTimeField(auto_now_add=True)
    order_status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.CREATED)

    is_faulted = models.BooleanField(default=False) # what does this do???
    # customer_remarks = models.TextField(null=True, blank=True)

    # some position info
    rented_location = models.CharField(max_length=100)
    returned_location = models.CharField(max_length=100)
    rented_lat = models.FloatField(default=None)
    rented_lng = models.FloatField(default=None)
    returned_lat = models.FloatField(default=None)
    returned_lng = models.FloatField(default=None)


# class Fault_report(models.Model):
#     order = models.ForeignKey(Order, on_delete=models.CASCADE)
#     fault_description = models.TextField()
#     creation_time = models.DateTimeField(auto_now_add=True)
