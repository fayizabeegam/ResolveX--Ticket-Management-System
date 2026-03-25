from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from tickets.models import Ticket, TicketComment,TicketAttachment
from tickets.policy import get_users_for_ticket_event
from tickets.utils import notify_users

@receiver(post_save, sender=Ticket)
def ticket_created(sender, instance, created, **kwargs):
    if created:
        print("SIGNAL TRIGGERED")
        users = get_users_for_ticket_event(instance)
        notify_users(users, "Ticket Created",
                     f"Ticket '{instance.title}' created",
                     instance,exclude_user=instance.created_by)


@receiver(post_save, sender=Ticket)
def ticket_updated(sender, instance, created, **kwargs):
    if not created:
        users = get_users_for_ticket_event(instance)
        notify_users(users, "Ticket Updated",
                     f"Ticket '{instance.title}' updated",
                     instance,exclude_user=instance.created_by)

@receiver(post_delete, sender=Ticket)
def ticket_deleted(sender, instance, **kwargs):
    users = get_users_for_ticket_event(instance)
    notify_users(users, "Ticket Deleted",
                 f"Ticket '{instance.title}' deleted",
                 instance,exclude_user=instance.created_by)
    

@receiver(post_save, sender=TicketComment)
def comment_saved(sender, instance, created, **kwargs):
    ticket = instance.ticket
    users = get_users_for_ticket_event(ticket)

    action = "added" if created else "updated"

    notify_users(users, "Comment Update",
                 f"Comment {action} on '{ticket.title}'",
                 ticket,exclude_user=instance.user)


@receiver(post_delete, sender=TicketComment)
def comment_deleted(sender, instance, **kwargs):
    ticket = instance.ticket
    users = get_users_for_ticket_event(ticket)

    notify_users(users, "Comment Deleted",
                 f"Comment deleted on '{ticket.title}'",
                 ticket,exclude_user=instance.user)


@receiver(post_save, sender=TicketAttachment)
def attachment_saved(sender, instance, created, **kwargs):
    ticket = instance.ticket
    users = get_users_for_ticket_event(ticket)

    action = "added" if created else "updated"

    notify_users(
        users,
        "Attachment Update",
        f"Attachment {action} on '{ticket.title}'",
        ticket, exclude_user=instance.uploaded_by 
    )

@receiver(post_delete, sender=TicketAttachment)
def attachment_deleted(sender, instance, **kwargs):
    ticket = instance.ticket
    users = get_users_for_ticket_event(ticket)

    notify_users(
        users,
        "Attachment Deleted",
        f"Attachment deleted from '{ticket.title}'",
        ticket, exclude_user=instance.uploaded_by 
    )

@receiver(pre_save, sender=Ticket)
def ticket_field_changes(sender, instance, **kwargs):
    if not instance.pk:
        return

    old = Ticket.objects.get(pk=instance.pk)

    users = get_users_for_ticket_event(instance)

    #Status Change
    if old.status != instance.status:
        notify_users(
            users,
            "Status Changed",
            f"Status changed from {old.status} to {instance.status}",
            instance
        )

    #Assignment Change
    if old.assigned_to != instance.assigned_to:
        notify_users(
            users,
            "Assignment Updated",
            f"Assignment updated for '{instance.title}'",
            instance
        )