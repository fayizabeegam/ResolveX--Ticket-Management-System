from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from users.models import*



class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id","name","description"]

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=False)
    enrolled = serializers.DateTimeField(source="date_joined", read_only=True)
    department = serializers.SerializerMethodField() 
    profile_picture = serializers.SerializerMethodField()


    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password','confirm_password',
                   'role','department', 'is_active','enrolled','profile_picture')
        
    def get_department(self, obj):
        if obj.department:
            return {
                "id": obj.department.id,
                "name": obj.department.name
            }
        return None
    
    def get_profile_picture(self, obj):
        request = self.context.get("request")
        if obj.profile_picture:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None

    def validate_role(self, value):
        if value == "admin":
            raise serializers.ValidationError("Admin role cannot be assigned.")
        return value

    def validate(self, attrs):
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        if password:
            if not confirm_password:
                raise serializers.ValidationError(
                    {"confirm_password": "Confirm password is required."}
                )
            if password != confirm_password:
                raise serializers.ValidationError(
                    {"password": "Passwords do not match."}
                )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        validated_data.pop("confirm_password", None)

        user = User(**validated_data)

        if password:
            user.set_password(password)

        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        validated_data.pop("confirm_password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance