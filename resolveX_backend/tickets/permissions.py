from rest_framework.permissions import BasePermission
from users.models import User

class TicketCreatePermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user

        # Employee cannot create
        if user.role == "employee":
            return False

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admin / Manager -> no restriction
        if user.role in ["admin", "manager"]:
            return True

        # Team Lead -> only own department
        if user.role == "team_lead":
            return obj.department == user.department

        # Client -> own ticket only
        if user.role == "client":
            return obj.client == user

        return False
       
class TicketDetailPermission(BasePermission):

    def has_object_permission(self, request, view, obj):
        user = request.user

        #Admin / Manager -> all tickets
        if user.role in ["admin", "manager"]:
            return True

        #Team Lead -> tickets in their department
        if user.role == "team_lead":
            return obj.department == user.department

        #Employee -> only assigned tickets
        if user.role == "employee":
            return obj.assigned_to == user

        #Client -> only own created tickets
        if user.role == "client":
            return obj.created_by == user

        return False
    
    
class TicketUpdatePermission(BasePermission):

    def has_object_permission(self, request, view, obj):
        user = request.user

        request_fields = set(request.data.keys())
        is_status_update = request_fields == {"status"}

        if is_status_update:

            # Admin -> all
            if user.role == "admin":
                return True

            # Manager -> all
            if user.role == "manager":
                return True

            # Team Lead -> department only
            if user.role == "team_lead":
                return obj.department == user.department

            # Employee -> assigned only
            if user.role == "employee":
                return obj.assigned_to == user

            # Client -> own created ticket
            if user.role == "client":
                return obj.created_by == user

            return False

        # Admin -> full access
        if user.role == "admin":
            return True

        # Only creator can fully edit
        return obj.created_by == user
    

class TicketDeletePermission(BasePermission):

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admin -> delete all
        if user.role == "admin":
            return True

        # Manager -> own created
        if user.role == "manager":
            return obj.created_by == user

        # Team Lead -> own created under department
        if user.role == "team_lead":
            return (
                obj.created_by == user and
                obj.department == user.department
            )

        # Client -> own created
        if user.role == "client":
            return obj.created_by == user

        # Employee -> no delete
        return False


class TicketClosePermission(BasePermission):

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admin / Manager -> all
        if user.role in ["admin", "manager"]:
            return True

        # Team Lead -> department
        if user.role == "team_lead":
            return obj.department == user.department

        # Employee -> assigned
        if user.role == "employee":
            return obj.assigned_to == user

        # Client -> own ticket
        if user.role == "client":
            return obj.client == user

        return False
    

class TicketReopenPermission(TicketClosePermission):
    pass


class TicketCommentPermission(BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user

        if request.method in ["PUT", "PATCH", "DELETE"]:

            # Admin -> full control
            if user.role == "admin":
                return True

            # Only comment owner
            return obj.user == user

        return False

    def can_comment_ticket(self, user, ticket):

        # Admin / Manager -> all
        if user.role in ["admin", "manager"]:
            return True

        # Team Lead -> own department
        if user.role == "team_lead":
            return ticket.department == user.department

        # Employee -> assigned
        if user.role == "employee":
            return ticket.assigned_to == user

        # Client -> own created ticket
        if user.role == "client":
            return ticket.created_by == user

        return False
    


class TicketAttachmentPermission(BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admin -> full access (recommended)
        if user.role == "admin":
            return True

        # Update / Delete -> only uploader
        return obj.uploaded_by == user

    def can_add_attachment(self, user, ticket):
        # Admin override optional
        if user.role == "admin":
            return True

        return ticket.created_by == user
    


class TicketAssignPermission(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return request.user.role in ["admin", "manager", "team_lead"]
    


