from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import ContactInfo, ContactMessage


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class ContactAPITests(APITestCase):
    def setUp(self):
        self.contact_info = ContactInfo.objects.create(
            email='hello@example.com',
            phone='+1 (555) 123-4567',
            location='Remote',
            availability_text='Open for projects.',
            is_active=True,
        )
        mail.outbox = []

    def test_contact_info_endpoint_returns_active_record(self):
        response = self.client.get('/api/contact/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'hello@example.com')

    def test_contact_info_endpoint_returns_whatsapp_number(self):
        self.contact_info.whatsapp_number = '923001234567'
        self.contact_info.save(update_fields=['whatsapp_number'])

        response = self.client.get('/api/contact/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['whatsapp_number'], '923001234567')

    def test_contact_message_create_endpoint_accepts_valid_data(self):
        payload = {
            'name': 'Jane Doe',
            'email': 'jane@example.com',
            'subject': 'Project inquiry',
            'message': 'I would like to discuss a project and need a frontend developer.',
        }
        response = self.client.post('/api/contact/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.count(), 1)
        self.assertEqual(ContactMessage.objects.get().name, 'Jane Doe')
        self.assertEqual(ContactMessage.objects.get().subject, 'Project inquiry')
        self.assertEqual(len(mail.outbox), 1)

    def test_contact_message_rejects_invalid_email(self):
        payload = {
            'name': 'Jane Doe',
            'email': 'not-an-email',
            'subject': 'Project inquiry',
            'message': 'I would like to discuss a project and need a frontend developer.',
        }
        response = self.client.post('/api/contact/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_contact_message_rejects_empty_fields(self):
        payload = {
            'name': '',
            'email': '',
            'subject': '',
            'message': '',
        }
        response = self.client.post('/api/contact/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)

    def test_contact_message_stores_database_record(self):
        payload = {
            'name': 'Alice Smith',
            'email': 'alice@example.com',
            'subject': 'Custom build question',
            'message': 'I would like a quote for a small web application rebuild.',
        }
        self.client.post('/api/contact/', payload, format='json')
        message = ContactMessage.objects.get(email='alice@example.com')
        self.assertEqual(message.subject, 'Custom build question')
        self.assertFalse(message.is_read)

    def test_contact_message_email_delivery_contains_submission_details(self):
        payload = {
            'name': 'Alice Smith',
            'email': 'alice@example.com',
            'subject': 'Custom build question',
            'message': 'I would like a quote for a small web application rebuild.',
        }
        self.client.post('/api/contact/', payload, format='json')
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Alice Smith', mail.outbox[0].body)
        self.assertIn('alice@example.com', mail.outbox[0].body)
        self.assertIn('Custom build question', mail.outbox[0].body)

    def test_contact_message_handles_email_send_failure(self):
        payload = {
            'name': 'Jane Doe',
            'email': 'jane@example.com',
            'subject': 'Project inquiry',
            'message': 'I would like to discuss a project and need a frontend developer.',
        }
        from unittest.mock import patch
        with patch('apps.contact.views.EmailMessage.send', side_effect=Exception('SMTP failure')):
            response = self.client.post('/api/contact/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContactMessage.objects.filter(email='jane@example.com').count(), 1)
        self.assertIn('email notification', response.data['detail'])

    def test_contact_info_missing_returns_404(self):
        ContactInfo.objects.all().delete()
        response = self.client.get('/api/contact/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
