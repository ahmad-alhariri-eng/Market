from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from decimal import Decimal
from products.models import Product, Category
from orders.models import Order, OrderItem, OrderStatus
from reviews.models import Review

User = get_user_model()


class ReviewModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='rev@test.com', password='p', username='revuser',
            first_name='A', last_name='B'
        )
        parent = Category.objects.create(name_ar='ر', name_en='Root')
        self.sub = Category.objects.create(name_ar='ف', name_en='Sub', parent=parent)
        self.product = Product.objects.create(
            name_en='Reviewed', name_ar='م', price=Decimal('50.00'),
            quantity=5, category=self.sub
        )
        self.order = Order.objects.create(
            buyer=self.user, total_amount=Decimal('50.00'),
            status=OrderStatus.COMPLETED
        )
        self.order_item = OrderItem.objects.create(
            order=self.order, product=self.product,
            quantity=1, price_at_purchase=Decimal('50.00'),
            total_price=Decimal('50.00')
        )

    def test_create_review(self):
        r = Review.objects.create(
            buyer=self.user, product=self.product,
            order=self.order, order_item=self.order_item,
            rating=5, title='Great', comment='Excellent product'
        )
        self.assertEqual(r.rating, 5)
        self.assertEqual(r.buyer, self.user)

    def test_review_unique_constraint(self):
        Review.objects.create(
            buyer=self.user, product=self.product,
            order=self.order, order_item=self.order_item,
            rating=4
        )
        with self.assertRaises(Exception):
            Review.objects.create(
                buyer=self.user, product=self.product,
                order=self.order, order_item=self.order_item,
                rating=3
            )


class ReviewAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='revapi@test.com', password='p', username='revapiuser',
            first_name='A', last_name='B'
        )
        parent = Category.objects.create(name_ar='ر', name_en='Root')
        sub = Category.objects.create(name_ar='ف', name_en='Sub', parent=parent)
        self.product = Product.objects.create(
            name_en='Reviewable', name_ar='م', price=Decimal('50.00'),
            quantity=5, category=sub
        )
        self.order = Order.objects.create(
            buyer=self.user, total_amount=Decimal('50.00'),
            status=OrderStatus.COMPLETED
        )
        self.order_item = OrderItem.objects.create(
            order=self.order, product=self.product,
            quantity=1, price_at_purchase=Decimal('50.00'),
            total_price=Decimal('50.00')
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_list_product_reviews_public(self):
        Review.objects.create(
            buyer=self.user, product=self.product,
            order=self.order, order_item=self.order_item,
            rating=5, comment='Awesome'
        )
        client = APIClient()  # unauthenticated
        response = client.get(f'/api/reviews/product/{self.product.pk}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_list_my_reviews(self):
        Review.objects.create(
            buyer=self.user, product=self.product,
            order=self.order, order_item=self.order_item,
            rating=4
        )
        response = self.client.get('/api/reviews/mine/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
