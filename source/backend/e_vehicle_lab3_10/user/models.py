from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('user_type', 'manager')
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('user_type') == 'manager':
            raise ValueError('Superuser must have user_type=manager.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('customer', 'Customer'),
        ('operator', 'Operator'),
        ('manager', 'Manager'),
    ]
    email = models.EmailField(unique=True)
    firstname = models.CharField(max_length=30, default='', blank=True)
    lastname = models.CharField(max_length=30, default='', blank=True)
    middlename = models.CharField(max_length=30, default='', blank=True)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, default='',  blank=True)
    user_type = models.CharField(max_length=10, default="customer", choices=USER_TYPE_CHOICES)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_deleted = models.BooleanField(default=False, choices=[(True, "Yes"), (False, "No")])
    creation_time = models.DateTimeField(auto_now_add=True)
    objects = CustomUserManager()
    USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['first_name', 'last_name']
