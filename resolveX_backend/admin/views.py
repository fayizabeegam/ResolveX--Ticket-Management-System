from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from users.models import*
from admin.serializers import*
from users.permissions import*
from django.shortcuts import get_object_or_404
from tickets.models import*
from tickets.serializers import*



class DepartmentListCreateView(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]

        # POST → Only Admin allowed
        return [permissions.IsAuthenticated(), IsAdmin()]
    

class DepartmentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAdmin()]
    
    def get_queryset(self):
        user = self.request.user

        # Admin & Manager -> all
        if user.role in ["admin", "manager", "client"]:
            return Department.objects.all()

        # Team Lead & Employee → only their department
        elif user.role in ["team_lead", "employee"]:
            if user.department:
                return Department.objects.filter(id=user.department.id)
            return Department.objects.none()

        return Department.objects.none()


class AdminUserListView(generics.ListCreateAPIView):
    queryset = User.objects.exclude(role='admin')
    serializer_class = AdminUserSerializer
   
    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated(), IsAdminManagerOrTeamLead()]
        return [permissions.IsAuthenticated(), IsAdmin()]
    
    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.exclude(role='admin')

        if user.role == "manager":
            queryset = queryset.exclude(role="manager")

        elif user.role == "team_lead":
            if not user.department:
                return User.objects.none()
            queryset = queryset.filter(department=user.department).exclude(role="team_lead")
            
        department_id = self.request.query_params.get("department")

        if department_id:
            # Admin & Manager → can filter any department
            if user.role in ["admin", "manager"]:
                queryset = queryset.filter(department_id=department_id)

            # Team Lead → only their own department
            elif user.role == "team_lead":
                if str(user.department.id) == department_id:
                    queryset = queryset.filter(department_id=department_id)
                else:
                    return User.objects.none()
                
        def get_serializer_context(self):
            return {"request": self.request}
        
        return queryset


class AdminUserUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.exclude(role='admin')
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class ToggleUserStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)

        user.is_active = not user.is_active
        user.save()

        return Response({
            "message": "User status updated",
            "user": user.username,
            "is_active": user.is_active
        }, status=status.HTTP_200_OK)
    
