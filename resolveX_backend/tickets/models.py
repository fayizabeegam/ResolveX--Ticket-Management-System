from django.db import models
from django.conf import settings
from users.models import*
from django.core.exceptions import ValidationError

import uuid
# User = settings.AUTH_USER_MODEL

class Ticket(models.Model):
    PRIORITY = (
        ('low','Low'),
        ('medium','Medium'),
        ('high','High'),
        ('urgent','Urgent')
    )
    STATUS = (
        ('open','Open'),
        ('assigned','Assigned'),
        ('in_progress','In Progress'),
        ('closed','Closed'),
    )

    ticket_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    priority = models.CharField(max_length=20, choices=PRIORITY, default='medium')
    status = models.CharField(max_length=20,choices=STATUS,default='open')

    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_tickets')

    
    assigned_to = models.ForeignKey(User, related_name='assigned_tickets',null=True,blank=True,
                                     on_delete=models.SET_NULL)
    assigned_by = models.ForeignKey(User, related_name='tickets_assigned_by',null=True,blank=True,
                                    on_delete=models.SET_NULL)
    
    created_by = models.ForeignKey(User, related_name='created_tickets', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    

    def __str__(self):
        return f"{self.ticket_id} - {self.title}"



class TicketAttachment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="ticket_files/")
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class TicketComment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField(blank=True, null=True)
    attachment = models.FileField(upload_to="comment_files/",blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if not self.comment and not self.attachment:
            raise ValidationError("Comment must contain text or attachment.")
        

class TicketHistory(models.Model):

    ticket = models.ForeignKey(Ticket,on_delete=models.CASCADE,related_name="history")
    action = models.CharField(max_length=100)
    field_name = models.CharField(max_length=100, blank=True, null=True)

    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)

    performed_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]   # chronological order

    def __str__(self):
        return f"{self.ticket.ticket_id} - {self.action}"


class Notification(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    related_ticket = models.ForeignKey(Ticket,on_delete=models.SET_NULL,null=True,blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"