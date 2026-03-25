from django.urls import path
from tickets.views import *
from tickets import views

urlpatterns = [
    
    path("tickets/create/",TicketCreateView.as_view(),name="ticket-create"),
    path("tickets/",TicketListView.as_view(),name="ticket-list"),
    path("tickets/<int:pk>/",TicketDetailView.as_view(),name="ticket-detail"),
    path("tickets/<int:pk>/update/",TicketUpdateView.as_view(),name="ticket-update"),
    path("tickets/<int:pk>/delete/", TicketDeleteView.as_view(), name="delete-ticket"),
    path("tickets/<int:pk>/close/", TicketCloseView.as_view(), name="ticket-close"),
    path("tickets/<int:pk>/reopen/", TicketReopenView.as_view(), name="ticket-reopen"),

 
    path("tickets/<int:pk>/comments/add/",AddCommentView.as_view(),
          name="add-comment"),
    path("tickets/<int:ticket_id>/comments/<int:pk>/update/",UpdateCommentView.as_view(),
         name="update-comment"),
    path("tickets/<int:ticket_id>/comments/<int:pk>/delete/",DeleteCommentView.as_view(),
         name="delete-comment"),


    path("tickets/<int:pk>/attachments/add/",AddAttachmentView.as_view(),
         name="add-attachment"),
    path("tickets/<int:ticket_id>/attachments/<int:pk>/update/",UpdateAttachmentView.as_view(),
         name="update-attachment"),
    path("tickets/<int:ticket_id>/attachments/<int:pk>/delete/",DeleteAttachmentView.as_view(),
         name="delete-attachment"),


    path("tickets/<int:pk>/assign/", TicketAssignView.as_view(),
          name="ticket-assign"),  
    path("tickets/<int:ticket_id>/unassign/<int:user_id>/", TicketUnassignView.as_view(),
          name="ticket-unassign"),   


     path("tickets/history/", TicketHistoryListView.as_view(),
           name="ticket-history-list"),
     path("tickets/<int:ticket_id>/history/", TicketHistoryDetailView.as_view(),
           name="ticket-history-detail"),
     path("tickets/notifications/", NotificationListView.as_view(),
           name="ticket-notifications"),


     path('dashboard/status/', views.DashboardTicketStatusView.as_view(),
           name="dashboard-status-count"),
     path('dashboard/department/', views.DashboardDepartmentStatsView.as_view(),
          name='dashboard-department-count'),
     path('dashboard/employee/', views.DashboardEmployeePerformanceView.as_view(),
          name='dashboard-employee'),
     path('dashboard/overdue/', views.DashboardOverdueTicketsView.as_view(),
          name='dashboard-overdue'),
     path('dashboard/export/csv/', views.ExportTicketsCSVView.as_view(),
          name='dashboard-download'),
     path("dashboard/stats/", DashboardStatsView.as_view(),
           name="dashboard-stats"),
     path("dashboard/weekly-tickets/", WeeklyTicketsView.as_view(),
           name="weekly-tickets"),
]
             

