from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from notifications.models import Notification

User = get_user_model()


class NotificationModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='nmodel@test.com', password='p', username='nmodel',
            first_name='A', last_name='B'
        )

    def test_create_notification(self):
        n = Notification.objects.create(
            user=self.user,
            notification_type='system_alert',
            message_ar='رسالة', message_en='Message'
        )
        self.assertFalse(n.is_read)
        self.assertEqual(n.user, self.user)

    def test_notification_ordering(self):
        for i in range(3):
            Notification.objects.create(
                user=self.user,
                notification_type='system_alert',
                message_ar=f'ر{i}', message_en=f'M{i}'
            )
        notifs = Notification.objects.filter(user=self.user)
        # Should be newest first
        self.assertTrue(notifs[0].created_at >= notifs[1].created_at)


class NotificationAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='napi@test.com', password='p', username='napi',
            first_name='A', last_name='B'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create some notifications
        for i in range(3):
            Notification.objects.create(
                user=self.user,
                notification_type='system_alert',
                message_ar=f'ر{i}', message_en=f'Notif {i}'
            )

    def test_list_notifications(self):
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

    def test_unread_count(self):
        response = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['unread_count'], 3)

    def test_mark_single_as_read(self):
        n = Notification.objects.filter(user=self.user).first()
        response = self.client.post(f'/api/notifications/{n.id}/read/')
        self.assertEqual(response.status_code, 200)
        n.refresh_from_db()
        self.assertTrue(n.is_read)

    def test_mark_all_as_read(self):
        response = self.client.post('/api/notifications/mark-all-read/')
        self.assertEqual(response.status_code, 200)
        unread = Notification.objects.filter(user=self.user, is_read=False).count()
        self.assertEqual(unread, 0)

    def test_filter_by_read_status(self):
        n = Notification.objects.filter(user=self.user).first()
        n.is_read = True
        n.save()
        response = self.client.get('/api/notifications/', {'is_read': 'false'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_unauthenticated_rejected(self):
        client = APIClient()
        response = client.get('/api/notifications/')
        self.assertIn(response.status_code, [401, 403])
