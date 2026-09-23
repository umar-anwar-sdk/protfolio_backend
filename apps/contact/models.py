from django.db import models


class ContactInfo(models.Model):
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    whatsapp_number = models.CharField(max_length=30, blank=True, default='')
    location = models.CharField(max_length=150)
    availability_text = models.TextField(default='I\'m currently open to new opportunities and exciting projects.')
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Contact Info'
        verbose_name_plural = 'Contact Info'

    def __str__(self):
        return self.email


class ContactMessage(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('replied', 'Replied'),
        ('archived', 'Archived'),
    ]

    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=180, default='')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    admin_notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} <{self.email}>'
