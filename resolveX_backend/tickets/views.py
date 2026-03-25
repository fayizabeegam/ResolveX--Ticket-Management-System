import csv
from django.http import HttpResponse
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from tickets.models import*
from tickets.serializers import *
from users.permissions import*
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from tickets.permissions import*
from tickets.utils import log_ticket_activity
from django.utils.dateparse import parse_date
from django.utils import timezone
from datetime import timedelta


class TicketCreateView(generics.CreateAPIView):
    serializer_class = TicketCreateSerializer
    permission_classes = [permissions.IsAuthenticated, TicketCreatePermission]

    def perform_create(self, serializer):
        ticket = serializer.save()

        # Log Ticket Creation
        log_ticket_activity(
            ticket=ticket,
            action="Ticket Created",
            user=self.request.user
        )

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        return Response({
            "message": "Ticket created successfully",
            "data": response.data
        }, status=201)


class TicketListView(generics.ListAPIView):
    serializer_class = TicketListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role in ["admin", "manager"]:
            queryset = Ticket.objects.all()

        elif user.role == "team_lead":
            if not user.department:
                return Ticket.objects.none()

            queryset = Ticket.objects.filter(
                department=user.department
            )

        elif user.role == "employee":
            queryset = Ticket.objects.filter(
                assigned_to=user
            )

        elif user.role == "client":
            queryset = Ticket.objects.filter(
                created_by=user
            )

        else:
            return Ticket.objects.none()

        department_param = self.request.query_params.get("department")

        if department_param:
            # Only Admin & Manager can filter by department
            if user.role in ["admin", "manager"]:
                queryset = queryset.filter(department_id=department_param)

            # Team lead can only filter within their own department
            elif user.role == "team_lead":
                if str(user.department.id) == department_param:
                    queryset = queryset.filter(department_id=department_param)
                else:
                    return Ticket.objects.none()
                
        status_param = self.request.query_params.get("status")
        priority_param = self.request.query_params.get("priority")

        if status_param:
            queryset = queryset.filter(status=status_param)

        if priority_param:
            queryset = queryset.filter(priority=priority_param)

        return queryset


class TicketDetailView(generics.RetrieveAPIView):
    serializer_class = TicketDetailSerializer
    permission_classes = [permissions.IsAuthenticated, TicketDetailPermission]
    queryset = Ticket.objects.all()
   

class TicketUpdateView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated,TicketUpdatePermission]
    queryset = Ticket.objects.all()

    def get_serializer_class(self):
        if set(self.request.data.keys()) == {"status"}:
            return TicketStatusUpdateSerializer
        return TicketUpdateSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.status == "closed" and set(request.data.keys()) != {"status"}:
            return Response(
                {"error": "Closed tickets cannot be edited."},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = instance.status
        old_priority = instance.priority
        response = super().update(request, *args, **kwargs)
        instance.refresh_from_db()

        if old_status != instance.status:
            log_ticket_activity(
                ticket=instance,
                action="Status Changed",
                user=request.user,
                field_name="status",
                old_value=old_status,
                new_value=instance.status
            )


        if old_priority != instance.priority:
            log_ticket_activity(
                ticket=instance,
                action="Priority Changed",
                user=request.user,
                field_name="priority",
                old_value=old_priority,
                new_value=instance.priority
            )

        return response


class TicketDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, TicketDeletePermission]
    queryset = Ticket.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.status == "closed":
            return Response(
                {"error": "Closed tickets cannot be deleted."},
                status=400
            )

        Notification.objects.filter(related_ticket=instance).delete()

        log_ticket_activity(
            ticket=instance,
            action="Ticket Deleted",
            user=request.user,
            field_name="ticket",
            old_value=f"Title: {instance.title},Status: {instance.status},Priority: {instance.priority}"
        )

        self.perform_destroy(instance)

        return Response(
            {"message": "Ticket deleted successfully."},
            status=200
        )


class TicketCloseView(APIView):
    permission_classes = [permissions.IsAuthenticated, TicketClosePermission]

    def post(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)

        self.check_object_permissions(request, ticket)

        if ticket.status == "closed":
            return Response(
                {"message": "Ticket already closed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = ticket.status
        ticket.status = "closed"
        ticket.save()

        log_ticket_activity(
            ticket,
            "Ticket Closed",
            request.user,
            "status",
            old_status,
            "closed"
        )

        resolution_time = ticket.updated_at - ticket.created_at

        log_ticket_activity(
            ticket,
            "Resolution Time",
            request.user,
            new_value=str(resolution_time)
        )

        return Response(
            {"message": "Ticket closed successfully"},
            status=status.HTTP_200_OK
        )


class TicketReopenView(APIView):
    permission_classes = [permissions.IsAuthenticated, TicketReopenPermission]

    def post(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)

        self.check_object_permissions(request, ticket)

        if ticket.status != "closed":
            return Response(
                {"error": "Only closed tickets can be reopened"},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = ticket.status
        ticket.status = Ticket._meta.get_field("status").default
        ticket.save()

        log_ticket_activity(
            ticket,
            "Ticket Reopened",
            request.user,
            "status",
            old_status,
            "open"
        )

        return Response(
            {"message": "Ticket reopened successfully"},
            status=status.HTTP_200_OK
        )



class AddCommentView(generics.CreateAPIView):
    serializer_class = TicketCommentSerializer
    permission_classes = [TicketCommentPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        return {"request": self.request}        

    def perform_create(self, serializer):
        ticket = get_object_or_404(Ticket, pk=self.kwargs["pk"])

        permission = TicketCommentPermission()

        if not permission.can_comment_ticket(self.request.user, ticket):
            raise PermissionDenied("You are not allowed to comment on this ticket.")

        if ticket.status == "closed":
            raise PermissionDenied("Cannot comment on closed ticket.")

        comment = serializer.save(
            ticket=ticket,
            user=self.request.user
        )
        log_ticket_activity(
            ticket=ticket,
            action="Comment Added",
            user=self.request.user,
            field_name="comment",
            new_value=comment.comment if comment.comment else "Attachment added"
        )


    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        return Response({
            "message": "Comment added successfully",
            "data": response.data
        }, status=status.HTTP_201_CREATED)


    
    

class UpdateCommentView(generics.UpdateAPIView):
    serializer_class = TicketCommentSerializer
    permission_classes = [TicketCommentPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return TicketComment.objects.filter(
            ticket_id=self.kwargs["ticket_id"]
        )
    
    def get_serializer_context(self):
        return {"request": self.request}
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        self.check_object_permissions(request, instance)

        old_comment = instance.comment
        old_attachment = instance.attachment

        response = super().update(request, *args, **kwargs)

        instance.refresh_from_db()

        if old_comment != instance.comment:
            log_ticket_activity(
                ticket=instance.ticket,
                action="Comment Edited",
                user=request.user,
                field_name="comment",
                old_value=old_comment,
                new_value=instance.comment
            )

        if old_attachment != instance.attachment:
            log_ticket_activity(
                ticket=instance.ticket,
                action="Comment Attachment Updated",
                user=request.user,
                field_name="attachment",
                old_value=str(old_attachment) if old_attachment else None,
                new_value=str(instance.attachment) if instance.attachment else None
            )

        return Response({
            "message": "Comment updated successfully",
            "data": response.data
        })

class DeleteCommentView(generics.DestroyAPIView):
    permission_classes = [TicketCommentPermission]

    def get_queryset(self):
        return TicketComment.objects.filter(
            ticket_id=self.kwargs["ticket_id"]
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        self.check_object_permissions(request, instance)

        ticket = instance.ticket
        comment_text = instance.comment
        attachment = instance.attachment

        log_ticket_activity(
            ticket=ticket,
            action="Comment Deleted",
            user=request.user,
            field_name="comment",
            old_value=comment_text if comment_text else "Attachment deleted"
        )

        if attachment:
            log_ticket_activity(
                ticket=ticket,
                action="Comment Attachment Deleted",
                user=request.user,
                field_name="attachment",
                old_value=str(attachment)
            )

        super().destroy(request, *args, **kwargs)

        return Response({
            "message": "Comment deleted successfully"
        }, status=200)
        


class AddAttachmentView(generics.CreateAPIView):
    serializer_class = TicketAttachmentSerializer
    permission_classes = [TicketAttachmentPermission]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        ticket = get_object_or_404(Ticket, pk=self.kwargs["pk"])
        permission = TicketAttachmentPermission()

        if not permission.can_add_attachment(self.request.user, ticket):
            raise PermissionDenied("Only ticket creator can add attachments.")

        attachment = serializer.save(
            ticket=ticket,
            uploaded_by=self.request.user
        )
        log_ticket_activity(
            ticket=ticket,
            action="Attachment Added",
            user=self.request.user,
            field_name="attachment",
            new_value=str(attachment.file.name)
        )

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        return Response({
            "message": "Attachment added successfully",
            "data": response.data
        }, status=status.HTTP_201_CREATED)


class UpdateAttachmentView(generics.UpdateAPIView):
    serializer_class = TicketAttachmentSerializer
    permission_classes = [TicketAttachmentPermission]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return TicketAttachment.objects.filter(
            ticket_id=self.kwargs["ticket_id"]
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        old_file = instance.file

        response = super().update(request, *args, **kwargs)

        instance.refresh_from_db()

        if old_file != instance.file:
            log_ticket_activity(
                ticket=instance.ticket,
                action="Attachment Updated",
                user=request.user,
                field_name="attachment",
                old_value=str(old_file) if old_file else None,
                new_value=str(instance.file) if instance.file else None
            )
        
        return Response({
            "message": "Attachment updated successfully",
            "data": response.data
        })

class DeleteAttachmentView(generics.DestroyAPIView):
    permission_classes = [TicketAttachmentPermission]

    def get_queryset(self):
        return TicketAttachment.objects.filter(
            ticket_id=self.kwargs["ticket_id"]
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        ticket = instance.ticket
        file_name = instance.file

        log_ticket_activity(
            ticket=ticket,
            action="Attachment Deleted",
            user=request.user,
            field_name="attachment",
            old_value=str(file_name) if file_name else None
        )
        super().destroy(request, *args, **kwargs)

        return Response({
            "message": "Attachment deleted successfully"
        }, status=status.HTTP_200_OK)
    


class TicketAssignView(generics.UpdateAPIView):
    serializer_class = TicketAssignSerializer
    permission_classes = [permissions.IsAuthenticated, TicketAssignPermission]
    queryset = Ticket.objects.all()

    def update(self, request, *args, **kwargs):
        ticket = self.get_object()
        self.check_object_permissions(request, ticket)
        
        old_assigned = ticket.assigned_to

        assigned_user_id = request.data.get("assigned_to")

        if not assigned_user_id:
            return Response(
                {"error": "assigned_to field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            assigned_user = User.objects.get(id=assigned_user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid user selected."},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_user = request.user

        if assigned_user.role in ["client", "admin"]:
            return Response(
                {"error": "Cannot assign ticket to client or admin."},
                status=400
            )

        if current_user.role == "admin":
            if assigned_user.role not in ["manager", "team_lead", "employee"]:
                return Response(
                    {"error": "Admin can assign only to Manager, Team Lead, or Employee."},
                    status=400
                )

        elif current_user.role == "manager":
            if assigned_user.role not in ["team_lead", "employee"]:
                return Response(
                    {"error": "Manager can assign only to Team Lead or Employee."},
                    status=400
                )

        elif current_user.role == "team_lead":
            if assigned_user.role != "employee":
                return Response(
                    {"error": "Team Lead can assign only to Employee."},
                    status=400
                )

            if assigned_user.department != current_user.department:
                return Response(
                    {"error": "Cannot assign employee outside your department."},
                    status=400
                )

        else:
            return Response(
                {"error": "You are not allowed to assign this ticket."},
                status=403
            )

        ticket.assigned_to = assigned_user
        ticket.assigned_by = current_user   
        ticket.status = "assigned"
        ticket.save()

        log_ticket_activity(
            ticket,
            "Assignment Changed",
            current_user,
            "assigned_to",
            str(old_assigned) if old_assigned else None,
            str(assigned_user)
        )

        log_ticket_activity(
            ticket,
            "Status Changed",
            current_user,
            "status",
            "open",
            "assigned"
        )

        return Response({"message": "Ticket assigned successfully"})


class TicketUnassignView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ticket_id, user_id):
        ticket = get_object_or_404(Ticket, id=ticket_id)
        old_assigned = ticket.assigned_to

        current_user = request.user

        if not ticket.assigned_to:
            return Response(
                {"error": "Ticket is already unassigned."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if ticket.assigned_to.id != user_id:
            return Response(
                {"error": "This ticket is not assigned to the specified user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if ticket.assigned_by != current_user:
            return Response(
                {"error": "Only the user who assigned this ticket can unassign it."},
                status=status.HTTP_403_FORBIDDEN
            )

        ticket.assigned_to = None
        ticket.assigned_by = None
        ticket.status = Ticket._meta.get_field("status").default
        ticket.save()

        log_ticket_activity(
            ticket,
            "Unassigned",
            request.user,
            "assigned_to",
            str(old_assigned),
            None
        )

        return Response(
            {"message": "Ticket unassigned successfully."},
            status=status.HTTP_200_OK
        )
    

class TicketHistoryListView(generics.ListAPIView):
    serializer_class = TicketHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = TicketHistory.objects.select_related(
            "ticket", "performed_by", "ticket__department"
        ).order_by("-timestamp")

        if user.role in ["admin", "manager"]:
            pass  

        elif user.role == "team_lead":
            queryset = queryset.filter(
                ticket__department=user.department
            )

        elif user.role == "employee":
            queryset = queryset.filter(
                ticket__assigned_to=user
            )

        elif user.role == "client":
            queryset = queryset.filter(
                ticket__created_by=user
            )

        else:
            return TicketHistory.objects.none()

        month = self.request.query_params.get("month")
        if month:
            try:
                year, month_num = month.split("-")
                queryset = queryset.filter(
                    timestamp__year=int(year),     
                    timestamp__month=int(month_num)
                )
            except ValueError:
                pass

        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            queryset = queryset.filter(
                timestamp__date__gte=parse_date(start_date)
            )

        if end_date:
            queryset = queryset.filter(
                timestamp__date__lte=parse_date(end_date) 
            )

        return queryset
    

class TicketHistoryDetailView(generics.ListAPIView):
    serializer_class = TicketHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        ticket_id = self.kwargs.get("ticket_id")

        try:
            ticket = Ticket.objects.get(id=ticket_id)
        except Ticket.DoesNotExist:
            return TicketHistory.objects.none()

        if user.role in ["admin", "manager"]:
            pass

        elif user.role == "team_lead":
            if ticket.department != user.department:
                return TicketHistory.objects.none()

        elif user.role == "employee":
            if ticket.assigned_to != user:
                return TicketHistory.objects.none()

        elif user.role == "client":
            if ticket.created_by != user:
                return TicketHistory.objects.none()

        else:
            return TicketHistory.objects.none()

        return TicketHistory.objects.filter(
            ticket=ticket
        ).order_by("timestamp") 
    

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user=self.request.user
        return Notification.objects.filter(
            models.Q(user=user) |  
            models.Q(related_ticket__assigned_to=user) |
            models.Q(related_ticket__created_by=user) 
        ).order_by('-created_at')
        
    def list(self, request, *args, **kwargs):

        queryset = self.get_queryset() 
        unread_count = queryset.filter(is_read=False).count()
        queryset.filter(is_read=False).update(is_read=True)
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            "unread_count": unread_count,
            "notifications": serializer.data
        })

class DashboardTicketStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = Ticket.objects.all()

        if user.role == 'team_lead':
            queryset = queryset.filter(department=user.department)
        elif user.role == 'employee':
            queryset = queryset.filter(assigned_to=user)
        elif user.role == 'client':
            queryset = queryset.filter(created_by=user)

        data = queryset.values('status').annotate(count=Count('id'))
        serializer = TicketStatusCountSerializer(data, many=True)
        return Response(serializer.data)


class DashboardDepartmentStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = Ticket.objects.all()

        if user.role == 'team_lead':
            queryset = queryset.filter(department=user.department)
        elif user.role == 'employee':
            queryset = queryset.filter(assigned_to=user)
        elif user.role == 'client':
            queryset = queryset.filter(created_by=user)

        data = queryset.values('department__name').annotate(count=Count('id'))
        formatted_data = [{'department': d['department__name'], 'count': d['count']} for d in data]
        serializer = DepartmentTicketStatsSerializer(formatted_data, many=True)
        return Response(serializer.data)
    

class DashboardEmployeePerformanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = Ticket.objects.filter(status='closed')

        if user.role == 'team_lead':
            queryset = queryset.filter(department=user.department)
        elif user.role == 'employee':
            queryset = queryset.filter(assigned_to=user)
        elif user.role == 'client':
            queryset = queryset.filter(created_by=user)

        data = queryset.exclude(assigned_to=None)\
            .values(
                'assigned_to__id',
                'assigned_to__username',
                
            )\
            .annotate(resolved=Count('id'))\
            .order_by('-resolved')
        formatted_data = [
            {
                'id': d['assigned_to__id'],
                'employee': d['assigned_to__username'],
                'avatar': None,
                'resolved': d['resolved']
            }
            for d in data
        ]
        serializer = EmployeePerformanceSerializer(formatted_data, many=True)
        return Response(serializer.data)


class DashboardOverdueTicketsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = Ticket.objects.exclude(status='closed')

        if user.role == 'team_lead':
            queryset = queryset.filter(department=user.department)
        elif user.role == 'employee':
            queryset = queryset.filter(assigned_to=user)
        elif user.role not in ['admin', 'manager']:
            return Response({"error": "Not authorized"}, status=403)

        department = request.GET.get('department')
        priority = request.GET.get('priority')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if department:
            queryset = queryset.filter(department_id=department)

        if priority:
            queryset = queryset.filter(priority=priority)

        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)

        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        serializer = OverdueTicketSerializer(queryset, many=True)
        return Response(serializer.data)
    


class ExportTicketsCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role not in ['admin', 'manager', 'team_lead']:
            return Response({"error": "Not authorized"}, status=403)

        queryset = Ticket.objects.all()

        if user.role == 'team_lead':
            queryset = queryset.filter(department=user.department)

        department = request.GET.get('department')
        priority = request.GET.get('priority')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if department:
            queryset = queryset.filter(department_id=department)

        if priority:
            queryset = queryset.filter(priority=priority)

        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)

        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="tickets.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Ticket ID',
            'Title',
            'Status',
            'Priority',
            'Department',
            'Assigned To',
            'Created At'
        ])

        for t in queryset:
            writer.writerow([
                t.ticket_id,
                t.title,
                t.status,
                t.priority,
                t.department.name if t.department else '',
                t.assigned_to.username if t.assigned_to else '',
                t.created_at.strftime("%Y-%m-%d %H:%M")
            ])

        return response

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {} 
        # if user.role not in ["admin", "manager", "team_lead"]:
        #     return Response({"detail": "Not authorized"}, status=403)
        
        if user.role in ["admin", "manager"]:
            data = {
                "total_users": User.objects.count(),
                "departments": Department.objects.count(),
                "tickets": Ticket.objects.count(),
                "completed": Ticket.objects.filter(status="closed").count(),
            }
        
        elif user.role == "team_lead":
            dept = user.department
            data = {
                "total_users": User.objects.filter(department=dept).count(),
                "departments": 1 if dept else 0,
                "tickets": Ticket.objects.filter(department=dept).count(),
                "completed": Ticket.objects.filter(
                    department=dept,
                    status="closed"
                ).count(),
                "overdue": Ticket.objects.filter(
                    department=dept
                ).exclude(status="closed").filter(
                    created_at__lt=timezone.now() - timedelta(days=2)
                ).count()
            }

        elif user.role == "employee":
            tickets_qs = Ticket.objects.filter(assigned_to=user)

            data = {
                "my_tickets": tickets_qs.count(),
                "open": tickets_qs.exclude(status="closed").count(),
                "closed": tickets_qs.filter(status="closed").count(),
                "overdue": tickets_qs.exclude(status="closed").filter(
                    created_at__lt=timezone.now() - timedelta(days=2)
                ).count(),
                # "high_priority": tickets_qs.filter(priority="high").count(),
                # "medium_priority": tickets_qs.filter(priority="medium").count(),
                # "low_priority": tickets_qs.filter(priority="low").count(),
            }

        elif user.role == "client":
            tickets_qs = Ticket.objects.filter(created_by=user)
            data = {
                "my_tickets": tickets_qs.count(),
                "open": tickets_qs.exclude(status="closed").count(),
                "closed": tickets_qs.filter(status="closed").count(),
                "overdue": tickets_qs.exclude(status="closed")
                              .filter(created_at__lt=timezone.now()-timedelta(days=2))
                              .count(),
            }
        
        else:
            Response({"detail": "Invalid or missing role"}, status=400)

        return Response({"stats": data}, status=200)


class WeeklyTicketsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        today = timezone.now().date()
        start_week = today - timedelta(days=today.weekday()) 
        end_week = start_week + timedelta(days=6)  

        if user.role == "employee":
            tickets_qs = Ticket.objects.filter(
                assigned_to=user,
                created_at__date__range=[start_week, end_week]
            )
        elif user.role == "client":
            tickets_qs = Ticket.objects.filter(
                created_by=user,
                created_at__date__range=[start_week, end_week]
            )
        elif user.role == "team_lead":
            tickets_qs = Ticket.objects.filter(
                department=user.department,
                created_at__date__range=[start_week, end_week]
            )
        elif user.role in ["admin", "manager"]:
            tickets_qs = Ticket.objects.filter(
                created_at__date__range=[start_week, end_week]
            )
        else:
            tickets_qs = Ticket.objects.none()

        week_days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        data = {day: 0 for day in week_days}

        for i in range(7):
            day_date = start_week + timedelta(days=i)
            data[week_days[i]] = tickets_qs.filter(created_at__date=day_date).count()

        return Response(data)