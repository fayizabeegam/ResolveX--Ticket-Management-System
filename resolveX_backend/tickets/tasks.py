from celery import shared_task
from django.contrib.auth import get_user_model
from tickets.models import Notification

User = get_user_model()

@shared_task
def create_notification_task(user_ids, title, message, ticket_id):
    from tickets.models import Ticket

    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return

    users = User.objects.filter(id__in=user_ids)

    notifications = [
        Notification(
            user=user,
            related_ticket=ticket,
            title=title,
            message=message
        )
        for user in users
    ]

    Notification.objects.bulk_create(notifications)