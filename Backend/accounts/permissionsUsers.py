# permissions.py
from rest_framework.permissions import BasePermission
from enum import Enum

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'user'

class UserRole(Enum):
    ADMIN = 'admin'
    USER = 'user'

class IsSuperAdminOrAdmin(BasePermission):
    """
    Deprecated name kept for backwards compatibility in other views.
    Now only checks if the user is an ADMIN.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and
            user.role == UserRole.ADMIN.value
        )

IsSuperAdmin = IsAdmin