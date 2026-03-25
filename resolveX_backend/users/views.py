from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from django.shortcuts import get_object_or_404
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from users.serializers import*
from users.models import User
from rest_framework.views import APIView
from users.permissions import *


class ClientRegisterView(generics.CreateAPIView):
    serializer_class = ClientRegisterSerializer
    permission_classes = [permissions.AllowAny]


class ClientLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None or user.role != "client":
            return Response({"error": "Invalid client login"}, status=401)

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "user": ProfileSerializer(user,context={'request': request}).data
        })
    

class AdminRegisterUserView(generics.CreateAPIView):
    serializer_class = AdminRegisterUserSerializer
    permission_classes = [IsAdmin]


class StaffLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None or user.role == "client":
            return Response({"error": "Invalid staff login"}, status=401)

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "user": ProfileSerializer(user,context={'request': request}).data  
        })   


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        if request.data.get("remove_picture") == "true":
            if user.profile_picture:
                user.profile_picture.delete(save=True)
                serializer = self.get_serializer(user)
        
        return Response(serializer.data)
    
    def get_serializer_context(self):
        return {"request": self.request}

class ForgotPasswordView(generics.CreateAPIView):
    serializer_class = ForgotPasswordSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        email = serializer.validated_data["email"]
        user = get_object_or_404(User, email=email)
        uid = urlsafe_base64_encode(force_bytes(user.id))
        token = PasswordResetTokenGenerator().make_token(user)
        reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/?role={user.role}"

        send_mail(
            "Reset Password - ResolveX",
            f"Click the link to reset your password:\n{reset_link}",
            "admin@resolvex.com",
            [user.email],
        )

class ResetPasswordView(GenericAPIView):
    serializer_class = ResetPasswordSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, uid, token):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(id=user_id)
        except:
            return Response({"error": "Invalid user"}, status=400)

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=400)

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response({"msg": "Password reset successful"})



