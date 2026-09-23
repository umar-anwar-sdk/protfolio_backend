import uuid

from django.db import models


class VisitorTracker(models.Model):
    visitor_id = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, default='')
    path = models.CharField(max_length=255, blank=True, default='')
    referrer = models.URLField(blank=True, null=True)
    gps_permission_status = models.CharField(
        max_length=20,
        choices=(
            ('unknown', 'Unknown'),
            ('granted', 'Granted'),
            ('denied', 'Denied'),
            ('prompt', 'Prompt'),
            ('unsupported', 'Unsupported'),
        ),
        default='unknown',
        blank=True,
    )
    gps_location = models.JSONField(default=dict, blank=True)
    approx_ip_location = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.visitor_id} - {self.path}'
