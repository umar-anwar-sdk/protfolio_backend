from rest_framework import serializers

from .models import ContactInfo, ContactMessage


class ContactInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInfo
        fields = ['id', 'email', 'phone', 'location', 'availability_text', 'is_active', 'updated_at']


class ContactMessageSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    subject = serializers.CharField(max_length=180)
    message = serializers.CharField(trim_whitespace=True)
    is_read = serializers.BooleanField(read_only=True)

    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read', 'status', 'admin_notes']
        read_only_fields = ['id', 'created_at', 'is_read', 'status', 'admin_notes']

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Name is required.')
        return value.strip()

    def validate_subject(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Subject is required.')
        return value.strip()

    def validate_message(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Message is required.')
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Message must be at least 10 characters long.')
        return value.strip()


class AdminContactMessageSerializer(serializers.ModelSerializer):
    """Serializer for the limited message-management fields available to admins."""

    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read', 'status', 'admin_notes']
        read_only_fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
