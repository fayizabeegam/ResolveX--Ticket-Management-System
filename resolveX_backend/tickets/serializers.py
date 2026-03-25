from rest_framework import serializers
from tickets.models import*
from admin.serializers import*


class TicketAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketAttachment
        fields = ["id", "file", "uploaded_at", "uploaded_by"]


class TicketCommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = TicketComment
        fields = ["id", "user", "comment", "attachment",
                  "attachment_url","created_at"]

    def get_attachment_url(self, obj):
        request = self.context.get("request")
        if obj.attachment and request:
            return request.build_absolute_uri(obj.attachment.url)
        return None


class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            "id",
            "ticket_id",
            "title",
            "description",
            "department",
            "priority",
        ]
        read_only_fields = ["ticket_id"]
    
    def validate_department(self, value):
        user = self.context["request"].user
        if isinstance(value, str) and value.isdigit():
            value = int(value)
        if user.role == "team_lead" and value != user.department:
            return user.department
        return value
    
    def create(self, validated_data):
        user = self.context["request"].user

        if user.role == "team_lead":
            validated_data["department"] = user.department

        dept_id = validated_data.get("department")
        if isinstance(dept_id, int):
            validated_data["department"] = Department.objects.get(id=dept_id)

        validated_data["created_by"] = user
        validated_data["client"] = user

        return Ticket.objects.create(**validated_data)


class TicketListSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    class Meta:
        model = Ticket
        fields = "__all__"

    def validate_status(self, value):
        valid_statuses = ['open', 'assigned', 'in_progress', 'closed']
        if value not in valid_statuses:
            raise serializers.ValidationError("Invalid status")
        return value


class TicketDetailSerializer(serializers.ModelSerializer):
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    comments = TicketCommentSerializer(many=True, read_only=True)
    department = serializers.CharField(source="department.name", read_only=True)
    client = serializers.CharField(source="client.username", read_only=True)
    created_by = serializers.CharField(source="created_by.username", read_only=True)
    assigned_by = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = "__all__"

    def get_assigned_by(self, obj):
        if obj.assigned_by:
            return {
                "id": obj.assigned_by.id,
                "username": obj.assigned_by.username
            }
        return None


class TicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        exclude = [
            "id",
            "ticket_id",
            "client",
            "created_by",
            "created_at",
            "updated_at",
            "assigned_to",
        ]


class TicketStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ["status"]


class TicketAssignSerializer(serializers.ModelSerializer):
    assigned_to = serializers.SerializerMethodField()
    assigned_by = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = "__all__"

    def get_assigned_to(self, obj):
        if obj.assigned_to:
            return {
                "id": obj.assigned_to.id,
                "username": obj.assigned_to.username
            }
        return None

    def get_assigned_by(self, obj):
        if obj.assigned_by:
            return {
                "id": obj.assigned_by.id,
                "username": obj.assigned_by.username
            }
        return None


class TicketHistorySerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    ticket = serializers.StringRelatedField()
    department = serializers.CharField(
        source="ticket.department.name",
        read_only=True
    )

    class Meta:
        model = TicketHistory
        fields = "__all__"

    def get_user(self, obj):
        if obj.performed_by:
            return obj.performed_by.username
        return "Unknown"
    

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'related_ticket',
                   'is_read', 'created_at']


class TicketStatusCountSerializer(serializers.Serializer):
    status = serializers.CharField()
    count = serializers.IntegerField()

class DepartmentTicketStatsSerializer(serializers.Serializer):
    department = serializers.CharField()
    count = serializers.IntegerField()

class EmployeePerformanceSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    employee = serializers.CharField()
    resolved = serializers.IntegerField()
    avatar = serializers.CharField(allow_null=True)


class OverdueTicketSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source='department.name')
    assigned_to = serializers.CharField(source='assigned_to.username', default=None)

    class Meta:
        model = Ticket
        fields = ['id','ticket_id', 'title', 'status',
                   'priority', 'department', 'assigned_to', 'created_at']