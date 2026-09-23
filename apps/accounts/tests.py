from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AdminAuthAPITests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin',
            password='StrongPass123!',
            is_staff=True,
            is_superuser=True,
        )

    def test_login_returns_tokens_for_admin(self):
        response = self.client.post('/api/auth/login/', {'username': 'admin', 'password': 'StrongPass123!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'admin')

    def test_login_rejects_invalid_credentials(self):
        response = self.client.post('/api/auth/login/', {'username': 'admin', 'password': 'wrong-password'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_me_requires_valid_jwt(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        login = self.client.post('/api/auth/login/', {'username': 'admin', 'password': 'StrongPass123!'}, format='json')
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        me_response = self.client.get('/api/auth/me/')
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data['username'], 'admin')

    def test_logout_returns_success(self):
        login = self.client.post('/api/auth/login/', {'username': 'admin', 'password': 'StrongPass123!'}, format='json')
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.post('/api/auth/logout/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], 'Logout successful.')

    def test_dashboard_routes_are_protected(self):
        response = self.client.get('/api/admin/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        login = self.client.post('/api/auth/login/', {'username': 'admin', 'password': 'StrongPass123!'}, format='json')
        token = login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        protected = self.client.get('/api/admin/dashboard/')
        self.assertEqual(protected.status_code, status.HTTP_200_OK)
