from django.shortcuts import render, HttpResponse
from django.conf import settings
from django.http import JsonResponse

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from user.models import CustomUser
from .serializers import ProfileSerializer

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
            return Response(respose_data)
        
        elif request.method == 'PUT':
            users.firstname = request.data.get('firstname')
            users.middlename = request.data.get('middlename')
            users.lastname = request.data.get('lastname')
            users.birth_date = request.data.get('birth_date')
            serializer = ProfileSerializer(users, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
                return Response(f"Error in method",status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response(f"Nothing to look for", status=status.HTTP_404_NOT_FOUND)


# @api_view(['GET','PUT','POST','DELETE'])
# def user_order(request, pk=None):