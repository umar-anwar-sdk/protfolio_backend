from django.contrib.auth import logout
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .permissions import IsAdminAuthenticated
from .serializers import AdminLoginSerializer, AdminUserSerializer


class AdminLoginAPIView(generics.GenericAPIView):
    serializer_class = AdminLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'detail': 'Login successful.',
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': AdminUserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminLogoutAPIView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response({'detail': 'Logout successful.'}, status=status.HTTP_200_OK)


class AdminMeAPIView(generics.RetrieveAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminAuthenticated]

    def get_object(self):
        return self.request.user
