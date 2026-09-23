from django.db import models


class Profile(models.Model):
    full_name = models.CharField(max_length=120)
    role = models.CharField(max_length=120, default='Software Engineer')
    headline = models.CharField(max_length=200, default='Crafting digital experiences with precision.')
    intro = models.TextField()
    mission_quote = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='profile/', blank=True, null=True)
    background_image = models.ImageField(upload_to='hero/', blank=True, null=True)
    cv_file = models.FileField(upload_to='cv/', blank=True, null=True)
    years_experience = models.PositiveIntegerField(default=5)
    availability_text = models.CharField(max_length=120, default='Available for work')
    is_available = models.BooleanField(default=True)
    is_published = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'

    def __str__(self):
        return self.full_name


class SocialLink(models.Model):
    PLATFORM_CHOICES = [
        ('github', 'GitHub'),
        ('linkedin', 'LinkedIn'),
        ('twitter', 'Twitter'),
    ]

    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    url = models.URLField()
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'platform']

    def __str__(self):
        return self.get_platform_display()


class Skill(models.Model):
    name = models.CharField(max_length=80)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class AboutHighlight(models.Model):
    about = models.TextField()
    title = models.CharField(max_length=80)
    description = models.TextField()
    icon_name = models.CharField(max_length=60, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'title']

    def __str__(self):
        return self.title


class Experience(models.Model):
    period = models.CharField(max_length=80)
    role = models.CharField(max_length=120)
    company = models.CharField(max_length=120)
    description = models.TextField()
    current = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order', '-current', 'company']

    def __str__(self):
        return f'{self.role} @ {self.company}'


class Education(models.Model):
    institution = models.CharField(max_length=150)
    degree = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order', '-end_date', 'institution']

    def __str__(self):
        return f'{self.degree} @ {self.institution}'


class Testimonial(models.Model):
    quote = models.TextField()
    author = models.CharField(max_length=100)
    role = models.CharField(max_length=120)
    avatar = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'author']

    def __str__(self):
        return f'{self.author} - {self.role}'


class CVDownloadLog(models.Model):
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, default='')
    referrer = models.URLField(blank=True, null=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-downloaded_at']

    def __str__(self):
        return f'CV download from {self.ip_address or "unknown"}'
