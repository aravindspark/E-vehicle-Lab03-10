# views.py
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .serializer import RegisterSerializer, LoginSerializer, UserSerializer

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

            # refresh token to blacklist
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"detail": "Logout successful."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CustomerView(APIView):
    def get(self, request, pk=None):
        if pk:
            try:
                customer = User.objects.get(id=pk, user_type="customer")
                serializer = UserSerializer(customer)
                return Response(serializer.data)
            except User.DoesNotExist:
                return Response(
                    {f"message: User not found, user id is {pk}"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            try:
                customer = User.objects.filter(user_type="customer").order_by("id")
                serializer = UserSerializer(customer, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(f"message: {str(e)}", status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk=None):
        if pk:
            try:
                customer = User.objects.get(id=pk, user_type="customer")
                serializer = UserSerializer(customer, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({"message": "customer does not exist"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(
                {"message": "please provide customer id"},
                status=status.HTTP_400_BAD_REQUEST,
            )
