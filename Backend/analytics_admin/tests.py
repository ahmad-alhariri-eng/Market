from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from decimal import Decimal
from products.models import Product, Category, Brand
from orders.models import Order, OrderItem, OrderStatus

User = get_user_model()


class AdminAnalyticsAccessTests(TestCase):
    """Verify admin-only access control"""

    def setUp(self):
        self.admin = User.objects.create_user(
            email='adm@test.com', password='p', username='admuser',
            first_name='A', last_name='B', is_staff=True, role='admin'
        )
        self.normal_user = User.objects.create_user(
            email='norm@test.com', password='p', username='normuser',
            first_name='C', last_name='D'
        )

    def test_unauthenticated_rejected(self):
        client = APIClient()
        response = client.get('/api/analytics/admin/summary/')
        self.assertIn(response.status_code, [401, 403])

    def test_normal_user_rejected(self):
        client = APIClient()
        client.force_authenticate(user=self.normal_user)
        response = client.get('/api/analytics/admin/summary/')
        self.assertEqual(response.status_code, 403)

    def test_admin_can_access_summary(self):
        client = APIClient()
        client.force_authenticate(user=self.admin)
        response = client.get('/api/analytics/admin/summary/')
        self.assertEqual(response.status_code, 200)


class AdminDashboardDataTests(TestCase):
    """Verify dashboard returns correct data shapes"""

    def setUp(self):
        self.admin = User.objects.create_user(
            email='admdata@test.com', password='p', username='admdatauser',
            first_name='A', last_name='B', is_staff=True, role='admin'
        )
        self.buyer = User.objects.create_user(
            email='buy@test.com', password='p', username='buyuser',
            first_name='C', last_name='D'
        )
        parent = Category.objects.create(name_ar='ر', name_en='Root')
        sub = Category.objects.create(name_ar='ف', name_en='Sub', parent=parent)
        self.product = Product.objects.create(
            name_en='Analytics Product', name_ar='م',
            price=Decimal('100.00'), quantity=50, category=sub
        )
        # Create a completed order
        order = Order.objects.create(
            buyer=self.buyer, total_amount=Decimal('100.00'),
            status=OrderStatus.COMPLETED
        )
        OrderItem.objects.create(
            order=order, product=self.product, quantity=1,
            price_at_purchase=Decimal('100.00'),
            total_price=Decimal('100.00')
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_summary_has_expected_keys(self):
        response = self.client.get('/api/analytics/admin/summary/')
        self.assertEqual(response.status_code, 200)
        data = response.data.get('kpis', response.data)
        expected_keys = ['gmv', 'completed_orders', 'total_products']
        for key in expected_keys:
            self.assertIn(key, data)

    def test_sales_over_time(self):
        response = self.client.get('/api/analytics/admin/sales-over-time/')
        self.assertEqual(response.status_code, 200)

    def test_top_products(self):
        response = self.client.get('/api/analytics/admin/top-products/')
        self.assertEqual(response.status_code, 200)

    def test_top_buyers(self):
        response = self.client.get('/api/analytics/admin/top-buyers/')
        self.assertEqual(response.status_code, 200)

    def test_ratings_distribution(self):
        response = self.client.get('/api/analytics/admin/ratings/')
        self.assertEqual(response.status_code, 200)

    def test_low_stock(self):
        response = self.client.get('/api/analytics/admin/low-stock/')
        self.assertEqual(response.status_code, 200)

    def test_brands_stats(self):
        response = self.client.get('/api/analytics/admin/brands-stats/')
        self.assertEqual(response.status_code, 200)

    def test_auctions_stats(self):
        response = self.client.get('/api/analytics/admin/auctions-stats/')
        self.assertEqual(response.status_code, 200)


