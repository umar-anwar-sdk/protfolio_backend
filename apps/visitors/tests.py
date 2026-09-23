import uuid

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import VisitorTracker


class VisitorTrackingAPITests(APITestCase):
    def test_new_visitor_is_assigned_unique_uuid(self):
        response = self.client.post(
            '/api/visitors/track/',
            {
                'path': '/',
                'user_agent': 'Mozilla/5.0',
                'referrer': 'https://example.com/',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('visitor_id', response.data)
        uuid.UUID(response.data['visitor_id'])
        self.assertTrue(VisitorTracker.objects.filter(visitor_id=response.data['visitor_id']).exists())

    def test_returning_visitor_id_is_reused(self):
        visitor_id = '123e4567-e89b-12d3-a456-426614174000'

        first_response = self.client.post(
            '/api/visitors/track/',
            {
                'visitor_id': visitor_id,
                'path': '/',
                'user_agent': 'Mozilla/5.0',
            },
            format='json',
        )
        second_response = self.client.post(
            '/api/visitors/track/',
            {
                'visitor_id': visitor_id,
                'path': '/about/',
                'user_agent': 'Mozilla/5.0',
            },
            format='json',
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.data['visitor_id'], visitor_id)
        self.assertEqual(VisitorTracker.objects.filter(visitor_id=visitor_id).count(), 2)

    def test_geolocation_fields_are_kept_separate(self):
        payload = {
            'visitor_id': '223e4567-e89b-12d3-a456-426614174001',
            'path': '/projects/',
            'user_agent': 'Mozilla/5.0',
            'gps_permission_status': 'granted',
            'gps_location': {'latitude': 51.5074, 'longitude': -0.1278},
            'approx_ip_location': {'country': 'United Kingdom', 'city': 'London'},
        }

        response = self.client.post('/api/visitors/track/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        tracker = VisitorTracker.objects.get(visitor_id=payload['visitor_id'])
        self.assertEqual(tracker.gps_permission_status, 'granted')
        self.assertEqual(tracker.gps_location['latitude'], 51.5074)
        self.assertEqual(tracker.approx_ip_location['city'], 'London')

    def test_tracking_without_gps_permission_does_not_store_gps_coordinates(self):
        payload = {
            'visitor_id': '323e4567-e89b-12d3-a456-426614174002',
            'path': '/contact/',
            'user_agent': 'Mozilla/5.0',
            'gps_permission_status': 'denied',
            'approx_ip_location': {'country': 'France', 'city': 'Paris'},
        }

        response = self.client.post('/api/visitors/track/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        tracker = VisitorTracker.objects.get(visitor_id=payload['visitor_id'])
        self.assertEqual(tracker.gps_permission_status, 'denied')
        self.assertEqual(tracker.gps_location, {})
        self.assertEqual(tracker.approx_ip_location['city'], 'Paris')
