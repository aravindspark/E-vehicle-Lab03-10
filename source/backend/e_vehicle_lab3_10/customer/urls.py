from django.urls import path
from .import views
from .views import OrderView

urlpatterns = [
    path('profile/<int:pk>',views.user_profile),

    # path("orders", OrderView.as_view(), name="order_list"),
    # path("orders/<int:pk>", OrderView.as_view(), name="order_detail"),

]