from tickets.models import TicketHistory
from tickets.tasks import create_notification_task


def log_ticket_activity(ticket, action, user=None, field_name=None, old_value=None, new_value=None):
    TicketHistory.objects.create(
        ticket=ticket,
        action=action,
        performed_by=user,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value
    )


def notify_users(users, title, message, ticket, exclude_user=None):
    filtered_users = []

    for user in users:
        if exclude_user and user.id == exclude_user.id:
            continue
        filtered_users.append(user)

    user_ids = list(set([u.id for u in filtered_users]))

    if not user_ids:
        return

    try:
        create_notification_task.delay(
            user_ids,
            title,
            message,
            ticket.id
        )
    except Exception as e:
        print("Celery error:", e)