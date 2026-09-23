from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import AdminLoginAPIView, AdminLogoutAPIView, AdminMeAPIView

urlpatterns = [
    path('login/', AdminLoginAPIView.as_view(), name='admin-login'),
    path('logout/', AdminLogoutAPIView.as_view(), name='admin-logout'),
    path('me/', AdminMeAPIView.as_view(), name='admin-me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
