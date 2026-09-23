from rest_framework.permissions import BasePermission


class IsAdminAuthenticated(BasePermission):
    message = 'Admin access required.'

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        return bool(
            user and
            user.is_authenticated and
            user.is_active and
            (user.is_superuser or user.is_staff)
        )
