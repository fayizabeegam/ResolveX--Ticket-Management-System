from django.urls import path
from users.models import*
from users.views import*
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [

    path("register/", ClientRegisterView.as_view(), name="client-register"),
    path("login/", ClientLoginView.as_view(), name="client-login"),

    path("admin/register-user/", AdminRegisterUserView.as_view(),name="admin-user-register"),
    path("staff-login/", StaffLoginView.as_view(), name="staff-login"),

    path("profile/", ProfileView.as_view(), name="profile"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/<str:uid>/<str:token>/", ResetPasswordView.as_view(), name="reset-password"),
] 

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)