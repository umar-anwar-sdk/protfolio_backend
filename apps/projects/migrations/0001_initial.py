from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Technology',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80, unique=True)),
                ('slug', models.SlugField(blank=True, max_length=90, unique=True)),
                ('icon', models.CharField(blank=True, default='', max_length=120)),
                ('description', models.TextField(blank=True, default='')),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ['sort_order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=150)),
                ('slug', models.SlugField(blank=True, unique=True)),
                ('short_description', models.CharField(max_length=250)),
                ('overview', models.TextField(blank=True, default='')),
                ('description', models.TextField()),
                ('features', models.TextField(blank=True, default='')),
                ('development_details', models.TextField(blank=True, default='')),
                ('thumbnail_image', models.ImageField(blank=True, null=True, upload_to='projects/')),
                ('project_url', models.URLField(blank=True, null=True)),
                ('github_url', models.URLField(blank=True, null=True)),
                ('featured', models.BooleanField(default=False)),
                ('is_published', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('technologies', models.ManyToManyField(blank=True, related_name='projects', to='projects.technology')),
            ],
            options={
                'ordering': ['-featured', '-created_at'],
                'indexes': [models.Index(fields=['is_published', 'featured'], name='projects_pro_is_publ_a2d417_idx'), models.Index(fields=['slug'], name='projects_pro_slug_5af2d8_idx'), models.Index(fields=['created_at'], name='projects_pro_created_7c7f75_idx')],
            },
        ),
        migrations.CreateModel(
            name='ProjectImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='projects/gallery/')),
                ('title', models.CharField(blank=True, default='', max_length=120)),
                ('description', models.TextField(blank=True, default='')),
                ('order', models.PositiveIntegerField(default=0)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='projects.project')),
            ],
            options={
                'ordering': ['order', 'id'],
                'indexes': [models.Index(fields=['project', 'order'], name='projects_pro_project_4a4aa7_idx')],
            },
        ),
        migrations.CreateModel(
            name='ProjectSection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('heading', models.CharField(max_length=150)),
                ('content', models.TextField()),
                ('image', models.ImageField(blank=True, null=True, upload_to='projects/sections/')),
                ('order', models.PositiveIntegerField(default=0)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sections', to='projects.project')),
            ],
            options={
                'ordering': ['order', 'id'],
                'indexes': [models.Index(fields=['project', 'order'], name='projects_pro_project_7d7c4c_idx')],
            },
        ),
    ]
