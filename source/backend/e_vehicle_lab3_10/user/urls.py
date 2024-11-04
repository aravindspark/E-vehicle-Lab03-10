from django.urls import path

from user.views import RegisterView, LoginView, LogoutView, CustomerView, user_profile

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),  # only for customer
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='login'),
    path('customers', CustomerView.as_view(), name='customer_list'),
    path('<int:pk>', user_profile, name='customer_detail'),
]
