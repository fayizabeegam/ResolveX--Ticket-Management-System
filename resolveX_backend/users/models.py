from django.db import models
from django.contrib.auth.models import AbstractUser,UserManager

class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')  
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return super().create_superuser(username, email, password, **extra_fields)


class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin','Admin'),
        ('manager','Manager'),
        ('team_lead','Team Lead'),
        ('employee','Employee'),
        ('client','Client')
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.ForeignKey(Department,on_delete=models.SET_NULL,null=True,blank=True)
    profile_picture = models.ImageField(upload_to="profile_pics/", null=True, blank=True)

    objects = CustomUserManager()

    def save(self, *args, **kwargs):
        # 🔥 safety: always enforce admin for superuser
        if self.is_superuser:
            self.role = 'admin'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
    
