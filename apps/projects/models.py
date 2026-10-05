from django.db import models
from django.utils.text import slugify


class Technology(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True, blank=True)
    icon = models.CharField(max_length=120, blank=True, default='')
    description = models.TextField(blank=True, default='')
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Project(models.Model):
    title = models.CharField(max_length=150)
    slug = models.SlugField(unique=True, blank=True)
    short_description = models.CharField(max_length=250)
    overview = models.TextField(blank=True, default='')
    description = models.TextField()
    features = models.TextField(blank=True, default='')
    development_details = models.TextField(blank=True, default='')
    technologies = models.ManyToManyField('Technology', related_name='projects', blank=True)
    thumbnail_image = models.ImageField(upload_to='projects/', blank=True, null=True)
    project_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-featured', '-created_at']
        indexes = [
            models.Index(fields=['is_published', 'featured']),
            models.Index(fields=['slug']),
            models.Index(fields=['created_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProjectImage(models.Model):
    project = models.ForeignKey(Project, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='projects/gallery/')
    title = models.CharField(max_length=120, blank=True, default='')
    description = models.TextField(blank=True, default='')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']
        indexes = [models.Index(fields=['project', 'order'])]

    def __str__(self):
        return f'{self.project.title} gallery image'


class ProjectHighlight(models.Model):
    project = models.ForeignKey(Project, related_name='highlights', on_delete=models.CASCADE)
    icon = models.CharField(max_length=80, blank=True, default='')
    value = models.CharField(max_length=120, blank=True, default='')
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True, default='')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']
        indexes = [models.Index(fields=['project', 'order'])]

    def __str__(self):
        return f'{self.project.title} - {self.title}'


class ProjectSection(models.Model):
    class LayoutType(models.TextChoices):
        FULL_WIDTH_IMAGE = 'full_width_image', 'Full Width Image'
        IMAGE_TEXT_LEFT = 'image_text_left', 'Image + Text Left'
        IMAGE_TEXT_RIGHT = 'image_text_right', 'Image + Text Right'
        TEXT_IMAGE = 'text_image', 'Text + Image'
        TWO_COLUMN = 'two_column', 'Two Column'
        LARGE_BANNER = 'large_banner', 'Large Banner'

    project = models.ForeignKey(Project, related_name='sections', on_delete=models.CASCADE)
    heading = models.CharField(max_length=150)
    subtitle = models.CharField(max_length=120, blank=True, default='')
    content = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='projects/sections/', blank=True, null=True)
    layout_type = models.CharField(max_length=30, choices=LayoutType.choices, default=LayoutType.IMAGE_TEXT_RIGHT)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']
        indexes = [models.Index(fields=['project', 'order'])]

    def __str__(self):
        return f'{self.project.title} - {self.heading}'
