import uuid

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import VisitorTracker
from .serializers import VisitorTrackingSerializer


def normalize_visitor_payload(request):
    payload = request.data.copy()

    visitor_id = payload.get('visitor_id')
    payload['visitor_id'] = str(uuid.UUID(str(visitor_id))) if visitor_id else str(uuid.uuid4())
    payload['ip_address'] = payload.get('ip_address', request.META.get('REMOTE_ADDR')) or request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
    payload['user_agent'] = payload.get('user_agent') or request.META.get('HTTP_USER_AGENT', '')
    payload['path'] = payload.get('path') or request.path
    payload['referrer'] = payload.get('referrer') or request.META.get('HTTP_REFERER') or None
    payload['gps_permission_status'] = payload.get('gps_permission_status', 'unknown')
    payload['gps_location'] = payload.get('gps_location') if payload.get('gps_permission_status') == 'granted' and isinstance(payload.get('gps_location'), dict) else {}
    payload['approx_ip_location'] = payload.get('approx_ip_location') if isinstance(payload.get('approx_ip_location'), dict) else {'country': 'Unknown', 'city': 'Unknown'}

    if not payload.get('referrer'):
        payload['referrer'] = None

    return payload


class VisitorTrackingCreateAPIView(generics.CreateAPIView):
    queryset = VisitorTracker.objects.all()
    serializer_class = VisitorTrackingSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        payload = normalize_visitor_payload(request)
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {
                'detail': 'Visitor tracked successfully.',
                'visitor_id': str(serializer.instance.visitor_id),
            },
            status=status.HTTP_201_CREATED,
        )
