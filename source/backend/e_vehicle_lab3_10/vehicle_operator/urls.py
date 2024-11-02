from django.urls import path
from .views import OperatorView, VehicleView, VehicleTypeView, VehicleStatusView


urlpatterns = [
    # path("api/operator", ope)
    path("operators", OperatorView.as_view(), name="operator_list"),
    path(
        "operators/<int:pk>", OperatorView.as_view(), name="operator_detail"
    ),  # pk is the primary key of the operator
    path("vehicles", VehicleView.as_view(), name="vehicle_list"),
    path("vehicles/<int:pk>", VehicleView.as_view(), name="vehicle_detail"),
    path("vehicle_types", VehicleTypeView.as_view(), name="vehicle_type"),
    path(
        "vehicle_types/<int:pk>", VehicleTypeView.as_view(), name="vehicle_type_detail"
    ),
    path("vehicle_status", VehicleStatusView.as_view(), name="vehicle_status"),
    path(
        "vehicle_status/<int:pk>",
        VehicleStatusView.as_view(),
        name="vehicle_status_detail",
    ),
]
