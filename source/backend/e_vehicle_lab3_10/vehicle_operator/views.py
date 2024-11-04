from django.contrib.auth import get_user_model
from django.forms import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Vehicle, VehicleStatus, VehicleType
from .serializer import (
    OperatorSerializer,
    VehicleSerializer,
    VehicleStatusSerializer,
    VehicleTypeSerializer,
)
# import requests

gm_geocode_url_address = "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=AIzaSyCslggYN9083AFtqYZeK6D3toY606bhqig"
gm_geocode_url_latlng = "https://maps.googleapis.com/maps/api/geocode/json?latlng=%s&key=AIzaSyCslggYN9083AFtqYZeK6D3toY606bhqig"
User = get_user_model()


class OperatorView(APIView):
    # permission_classes = (IsAuthenticated,)
    def get(self, request, pk=None):
        if pk:
            try:
                operator = User.objects.get(id=pk, user_type="operator")
                serializer = OperatorSerializer(operator)
                return Response(serializer.data)
            except User.DoesNotExist:
                return Response(
                    {f"message: Operator not found, operator id is {pk}"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            try:
                operators = User.objects.filter(user_type="operator").order_by("id")
                serializer = OperatorSerializer(operators, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(f"message: {str(e)}", status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        serializer = OperatorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        if pk:
            try:
                operator = User.objects.get(id=pk, user_type="operator")
                operator.delete()
                return Response(
                    {"message": "operator deleted"}, status=status.HTTP_204_NO_CONTENT
                )
            except User.DoesNotExist:
                return Response(
                    {"message": "operator not found"}, status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"message": "please provide operator id"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def put(self, request, pk=None):
        if pk:
            try:
                operator = User.objects.get(id=pk, user_type="operator")
                serializer = OperatorSerializer(
                    operator, data=request.data, partial=True
                )
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({"message" : "operator does not exist"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(
                {"message": "please provide operator id"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class VehicleView(APIView):
    # permission_classes = (IsAuthenticated,)

    def get(self, request, pk=None):
        if pk:
            try:
                vehicle = Vehicle.objects.get(id=pk)
                serializer = VehicleSerializer(vehicle)
                return Response(serializer.data)
            except Vehicle.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            try:
                vehicles = Vehicle.objects.all()
                serializer = VehicleSerializer(vehicles, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(f"message: {str(e)}", status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        # if we only get location, then get lng and lat by self
        if (
                request.data.get("current_lat") == ""
                or request.data.get("current_lat") == None
                or request.data.get("current_lng") == ""
                or request.data.get("current_lng") == None
        ):
            error_message, current_lat, current_lng = self._update_lat_lng_by_postcode(
                request.data.get("current_location")
            )
            if error_message:
                return Response(
                    data={"message": error_message}, status=status.HTTP_400_BAD_REQUEST
                )
            request.data["current_lat"] = current_lat
            request.data["current_lng"] = current_lng
        # if we only get lat and lng, then get location by api
        elif (
                request.data.get("current_location") == ""
                or request.data.get("current_location") == None
        ):
            current_lat = request.data.get("current_lat")
            current_lng = request.data.get("current_lng")
            request.data["current_location"] = self._get_location_by_lat_lng(
                current_lat, current_lng
            )
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        if pk:
            try:
                vehicle = Vehicle.objects.get(id=pk)
                vehicle.delete()
                return Response(
                    {"message": "vehicle deleted"}, status=status.HTTP_200_OK
                )
            except Vehicle.DoesNotExist:
                return Response(
                    {"message": "vehicle not found"}, status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(
                data={"message": "Please provide a valid vehicle status id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def put(self, request, pk=None):
        if pk:
            try:
                vehicle = Vehicle.objects.get(id=pk)
                # if only change location, then get lat and lng
                if request.data.get("current_lat") and request.data.get("current_lng"):
                    current_lat = request.data.get("current_lat")
                    current_lng = request.data.get("current_lng")
                    request.data["current_location"] = self._get_location_by_lat_lng(
                        current_lat, current_lng
                    )
                elif request.data.get("current_location"):
                    error_message, current_lat, current_lng = (
                        self._update_lat_lng_by_postcode(
                            request.data.get("current_location")
                        )
                    )
                    if error_message:
                        return Response(
                            data={"message": error_message},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    request.data["current_lat"] = current_lat
                    request.data["current_lng"] = current_lng
                # if only change lang and lat

                serializer = VehicleSerializer(vehicle, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Vehicle.DoesNotExist:
                return Response(
                    {"message": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(
                data={"message": "Please provide a valid vehicle id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def _update_lat_lng_by_postcode(self, current_location):
        error_message = None
        current_lat, current_lng = None, None
        response = requests.get(gm_geocode_url_address % current_location)
        data = response.json()
        if data["status"] == "OK":
            current_lat = data["results"][0]["geometry"]["location"]["lat"]
            current_lng = data["results"][0]["geometry"]["location"]["lng"]
        else:
            error_message = (
                f"google map api's status is not ok, status is {data['status']}"
            )
        return error_message, current_lat, current_lng

    def _get_location_by_lat_lng(self, lat, lng):
        response = requests.get(gm_geocode_url_latlng % f"{lat},{lng}")
        data = response.json()
        if data["status"] == "OK":
            return data["results"][0]["formatted_address"]
        else:
            return None


class VehicleStatusView(APIView):
    # permission_classes = (IsAuthenticated,)

    def get(self, request, pk=None):
        if pk:
            try:
                vehicle = VehicleStatus.objects.get(id=pk)
                serializer = VehicleStatusSerializer(vehicle)
                return Response(serializer.data)
            except Vehicle.DoesNotExist:
                return Response(
                    {f"message": "Vehicle status not found, vehicle status id is {pk}"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            try:
                vehicles = VehicleStatus.objects.all()
                serializer = VehicleStatusSerializer(vehicles, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(f"message: {str(e)}", status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        serializer = VehicleStatusSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        if pk:
            try:
                vehicle = VehicleStatus.objects.get(id=pk)
                vehicle.delete()
                return Response(
                    {"message": "Vehicle status deleted successfully"},
                    status=status.HTTP_204_NO_CONTENT,
                )
            except VehicleStatus.DoesNotExist:
                return Response(
                    {"message": "Vehicle status not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                data={"message": "Please provide a valid vehicle status id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def put(self, request, pk=None):
        if pk:
            try:
                vehicle_status = VehicleStatus.objects.get(id=pk)
                serializer = VehicleStatusSerializer(
                    vehicle_status, data=request.data, partial=True
                )
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Vehicle.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(
                {"message": "please vehicle status id"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class VehicleTypeView(APIView):
    # permission_classes = (IsAuthenticated,)

    def get(self, request, pk=None):
        if pk:
            try:
                vehicle = VehicleType.objects.get(id=pk)
                serializer = VehicleTypeSerializer(vehicle)
                return Response(serializer.data)
            except Vehicle.DoesNotExist:
                return Response(
                    {f"message": "Vehicle type not found vehicle type id is {pk}"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            try:
                vehicles = VehicleType.objects.all()
                serializer = VehicleTypeSerializer(vehicles, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(f"message: {str(e)}", status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        serializer = VehicleTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        if pk:
            try:
                vehicle = VehicleType.objects.get(id=pk)
                vehicle.delete()
                return Response(
                    {"message": "vehicle type deleted"},
                    status=status.HTTP_204_NO_CONTENT,
                )
            except Vehicle.DoesNotExist:
                return Response(
                    {f"message": "Vehicle type not found, vehicle type id is {pk}"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                data={"message": "Please provide a valid vehicle type id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def put(self, request, pk=None):
        if pk:
            try:
                vehicle_type = VehicleType.objects.get(id=pk)
                serializer = VehicleTypeSerializer(
                    vehicle_type, data=request.data, partial=True
                )
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except VehicleType.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(
                {"message": "please vehicle type id"},
                status=status.HTTP_400_BAD_REQUEST,
            )
