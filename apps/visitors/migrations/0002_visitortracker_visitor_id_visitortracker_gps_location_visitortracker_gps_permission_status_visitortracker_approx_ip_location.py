import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('visitors', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='visitortracker',
            name='visitor_id',
            field=models.UUIDField(db_index=True, default=uuid.uuid4, editable=False),
        ),
        migrations.AddField(
            model_name='visitortracker',
            name='gps_permission_status',
            field=models.CharField(blank=True, choices=[('unknown', 'Unknown'), ('granted', 'Granted'), ('denied', 'Denied'), ('prompt', 'Prompt'), ('unsupported', 'Unsupported')], default='unknown', max_length=20),
        ),
        migrations.AddField(
            model_name='visitortracker',
            name='gps_location',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='visitortracker',
            name='approx_ip_location',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
