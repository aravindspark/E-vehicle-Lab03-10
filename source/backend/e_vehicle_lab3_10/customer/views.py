from django.shortcuts import render, HttpResponse
from django.conf import settings
from django.http import JsonResponse

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.views import APIView
from .models import Order
from user.models import CustomUser
from .serializers import ProfileSerializer
from .tests import OrderSerializer


@api_view(['GET','PUT'])
def user_profile(request, pk=None):
    if pk:
        try:
            users = CustomUser.objects.get(id=pk, user_type="customer")
            
            respose_data = {
            "firstname" : users.firstname,
            "middlename": users.middlename,
            "lastname": users.lastname,
            "email" : users.email,
            "birth_date" : users.birth_date
            }

        except CustomUser.DoesNotExist:
            return Response(
                    {f"message: User not found, user id is {pk}"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        if request.method == 'GET':
            serializer = ProfileSerializer(users, many=True)
            return JsonResponse(respose_data)
        elif request.method == 'POST':
            serializer = ProfileSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"message": "request not valid"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(f"Nothing to look for", status=status.HTTP_404_NOT_FOUND)


class OrderView(APIView):
    def get(self, request, pk=None):
        if pk:
            try:
                order = Order.objects.get(id=pk, user_type="customer")
                serializer = OrderSerializer(order)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except CustomUser.DoesNotExist:
                return Response(
                    {f"message: order not found, user id is {pk}"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            try:
                orders = Order.objects.filter(customer__user_type="customer").order_by("id")
                serializer = OrderSerializer(orders, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(f"message: {str(e)}", status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        if pk:
            try:
                order = Order.objects.get(id=pk, user_type="customer")
                serializer = OrderSerializer(order, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Order.DoesNotExist:
                return Response({"message": "order does not exist"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(
                {"message": "please provide order id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def delete(self, request, pk=None):
        if pk:
            try:
                order = Order.objects.get(id=pk, user_type="customer")
                order.delete()
                return Response(
                    {"message": "order deleted"}, status=status.HTTP_204_NO_CONTENT
                )
            except Order.DoesNotExist:
                return Response(
                    {"message": "order not found"}, status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(
                {"message": "please provide order id"},
                status=status.HTTP_400_BAD_REQUEST,
            )