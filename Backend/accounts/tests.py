from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from accounts.models import Role, Profile

User = get_user_model()


class UserModelTests(TestCase):
    """Test User model creation and properties"""

    def test_create_user_with_email(self):
        user = User.objects.create_user(
            email='user@test.com', password='pass1234',
            username='testuser1', first_name='Ali', last_name='Hassan'
        )
        self.assertEqual(user.email, 'user@test.com')
        self.assertEqual(user.role, Role.USER)
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_create_superuser(self):
        su = User.objects.create_superuser(
            email='super@test.com', password='pass1234',
            username='superuser', first_name='Super', last_name='Admin'
        )
        self.assertTrue(su.is_staff)
        self.assertTrue(su.is_superuser)

    def test_duplicate_email_rejected(self):
        User.objects.create_user(
            email='dup@test.com', password='p', username='u1',
            first_name='A', last_name='B'
        )
        with self.assertRaises(Exception):
            User.objects.create_user(
                email='dup@test.com', password='p', username='u2',
                first_name='C', last_name='D'
            )

    def test_duplicate_username_rejected(self):
        User.objects.create_user(
            email='a@test.com', password='p', username='same',
            first_name='A', last_name='B'
        )
        with self.assertRaises(Exception):
            User.objects.create_user(
                email='b@test.com', password='p', username='same',
                first_name='C', last_name='D'
            )

    def test_user_str_returns_email(self):
        user = User.objects.create_user(
            email='str@test.com', password='p', username='struser',
            first_name='A', last_name='B'
        )
        self.assertEqual(str(user), 'str@test.com')



    def test_notification_methods(self):
        user = User.objects.create_user(
            email='notif@test.com', password='p', username='notifuser',
            first_name='A', last_name='B'
        )
        # Initially no unread notifications
        self.assertEqual(user.get_unread_notifications().count(), 0)
        # Send a notification
        notif = user.send_notification(
            'system_alert', 'تنبيه', 'Alert test'
        )
        self.assertEqual(user.get_unread_notifications().count(), 1)
        # Mark all as read
        user.mark_all_notifications_read()
        self.assertEqual(user.get_unread_notifications().count(), 0)


class LoginAPITests(TestCase):
    """Test Login endpoint"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='login@test.com', password='securepass',
            username='loginuser', first_name='Login', last_name='Test'
        )
        self.client = APIClient()

    def test_login_success(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'login@test.com', 'password': 'securepass'
        })
        self.assertIn(response.status_code, [200, 201])
        self.assertIn('token', response.data)

    def test_login_wrong_password(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'login@test.com', 'password': 'wrongpass'
        })
        self.assertIn(response.status_code, [400, 401])

    def test_login_nonexistent_email(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'nope@test.com', 'password': 'pass'
        })
        self.assertIn(response.status_code, [400, 401, 404])


class ProfileAPITests(TestCase):
    """Test Profile endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='profile@test.com', password='pass1234',
            username='profileuser', first_name='Profile', last_name='User'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_get_own_profile(self):
        response = self.client.get('/api/profile/me/')
        self.assertEqual(response.status_code, 200)

    def test_unauthenticated_profile_rejected(self):
        client = APIClient()
        response = client.get('/api/profile/me/')
        self.assertIn(response.status_code, [401, 403])
