from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.role == "admin")
        )

class IsManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "manager"

class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ["admin", "manager"]
    
class IsAdminManagerOrTeamLead(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ["admin", "manager", "team_lead"]
        )

class IsTeamLead(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "team_lead"


class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "employee"
    

class IsNotEmployee(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role != "employee"

class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "client"
    
class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.client == request.user
    
