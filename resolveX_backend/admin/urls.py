from django.urls import path
from admin.views import*

urlpatterns = [
    path("departments/", DepartmentListCreateView.as_view(),name='departments'),
    path("departments/<int:pk>/", DepartmentRetrieveUpdateDestroyView.as_view(),name='retrieve_departments'),

    path("users/", AdminUserListView.as_view(),name='users'),
    path("users/<int:pk>/", AdminUserUpdateView.as_view(),name='user_details'),

    path("users/<int:pk>/toggle-status/", ToggleUserStatusView.as_view(),name='toggle_users'),
]