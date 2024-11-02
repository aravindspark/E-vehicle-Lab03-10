# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('email', 'password', 'firstname', 'lastname', 'midname', 'phone_number', 'birth_date', 'user_type')

    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email'],
            firstname=validated_data.get('firstname', ''),
            lastname=validated_data.get('lastname', ''),
            midname=validated_data.get('midname', ''),
            phone_number=validated_data.get('phone_number', ''),
            birth_date=validated_data.get('birth_date'),
            user_type=validated_data.get('user_type', 'user'),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = User.objects.filter(email=email).first()
        if user is None:
            raise serializers.ValidationError("User not found.")

        if not user.check_password(password):
            raise serializers.ValidationError("Incorrect password.")

        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"