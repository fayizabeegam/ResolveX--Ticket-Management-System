from django.contrib.auth import get_user_model

User = get_user_model()

def get_users_for_ticket_event(ticket):

    creator = ticket.created_by
    dept = ticket.department
    users = []

    if creator.role == "admin":
        return []

    elif creator.role == "client":
        users += list(User.objects.filter(role="admin"))
        users += list(User.objects.filter(role="manager"))
        if dept:
            users += list(
                User.objects.filter(role="team_lead", department=dept)
            )

    elif creator.role == "manager":
        users += list(User.objects.filter(role="admin"))
        if dept:
            users += list(
                User.objects.filter(role="team_lead", department=dept)
            )

    elif creator.role == "team_lead":
        users += list(User.objects.filter(role="admin"))
        users += list(User.objects.filter(role="manager"))

    final_users = []

    for user in users:

        # Admin -> all
        if user.role == "admin":
            final_users.append(user)

        # Manager -> all
        elif user.role == "manager":
            final_users.append(user)

        # TeamLead -> same department
        elif user.role == "team_lead":
            if user.department == dept:
                final_users.append(user)

        # Employee -> only assigned
        elif user.role == "employee":
            if ticket.assigned_to == user:
                final_users.append(user)

        # Client -> own ticket
        elif user.role == "client":
            if ticket.created_by == user:
                final_users.append(user)

    return list(set(final_users))