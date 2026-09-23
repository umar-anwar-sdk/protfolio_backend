from rest_framework import serializers

from .models import VisitorTracker


class VisitorTrackingSerializer(serializers.ModelSerializer):
    visitor_id = serializers.UUIDField(required=False)
    gps_location = serializers.JSONField(required=False, default=dict, allow_null=True)
    approx_ip_location = serializers.JSONField(required=False, default=dict, allow_null=True)

    class Meta:
        model = VisitorTracker
        fields = [
            'id',
            'visitor_id',
            'ip_address',
            'user_agent',
            'path',
            'referrer',
            'gps_permission_status',
            'gps_location',
            'approx_ip_location',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['visitor_id'] = str(instance.visitor_id)
        return data
