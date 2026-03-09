from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from decimal import Decimal
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from products.models import Product, Category, Cart, CartItem
from orders.models import Order, OrderItem, OrderStatus
from orders.services import CheckoutService

User = get_user_model()

class StripeCheckoutTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com', 
            password='password123', 
            first_name='Test',
            username='testuser'
        )
        
        self.category = Category.objects.create(name_ar='تصنيف', name_en='Category')
        self.subcategory = Category.objects.create(name_ar='فرعي', name_en='Sub', parent=self.category)
        
        self.product = Product.objects.create(
            name_en='Test Product',
            name_ar='منتج تجريبي',
            price=Decimal('50.00'),
            quantity=10,
            category=self.subcategory
        )
        
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)

    @patch('orders.payment_providers.stripe_provider.stripe.checkout.Session.create')
    def test_process_checkout_initiation(self, mock_stripe_session):
        mock_stripe_session.return_value = MagicMock(url='https://stripe.com/test-checkout')
        
        checkout_url = CheckoutService.process_checkout(self.user)
        
        self.assertEqual(checkout_url, 'https://stripe.com/test-checkout')
        
        order = Order.objects.get(buyer=self.user)
        self.assertEqual(order.status, OrderStatus.PENDING)
        self.assertEqual(order.total_amount, Decimal('50.00'))
        self.assertEqual(order.items.count(), 1)
        
        # Stock should NOT have changed yet
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 10)
        
        # Cart should NOT be cleared yet
        self.assertTrue(CartItem.objects.filter(cart=self.cart).exists())

    def test_fulfill_order_success(self):
        order = Order.objects.create(
            buyer=self.user,
            total_amount=Decimal('50.00'),
            status=OrderStatus.PENDING
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=1,
            price_at_purchase=self.product.price,
            total_price=self.product.price
        )
        
        CheckoutService.fulfill_order(order.order_number)
        
        order.refresh_from_db()
        self.assertEqual(order.status, OrderStatus.COMPLETED)
        self.assertIsNotNone(order.completed_at)
        
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 9)
        
        
class OrderAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='api_test@example.com', 
            password='password123',
            username='apiuser'
        )
        # Use DRF's APIClient with force_authenticate
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(name_ar='تصنيف', name_en='Category')
        self.subcategory = Category.objects.create(name_ar='فرعي', name_en='Sub', parent=self.category)
        
        self.product = Product.objects.create(
            name_en='API Product',
            name_ar='منتج API',
            price=Decimal('100.00'),
            quantity=5,
            category=self.subcategory
        )
        self.cart = Cart.objects.create(user=self.user)
        self.cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)

    @patch('orders.payment_providers.stripe_provider.stripe.checkout.Session.create')
    def test_checkout_endpoint_returns_url(self, mock_stripe_session):
        mock_stripe_session.return_value = MagicMock(url='https://stripe.com/api-checkout')
        
        url = reverse('checkout')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['checkout_url'], 'https://stripe.com/api-checkout')
        
        order = Order.objects.get(buyer=self.user)
        self.assertEqual(order.status, OrderStatus.PENDING)

    @patch('orders.payment_providers.stripe_provider.stripe.checkout.Session.create')
    def test_pay_existing_order_endpoint(self, mock_stripe_session):
        mock_stripe_session.return_value = MagicMock(url='https://stripe.com/repay')
        
        order = Order.objects.create(buyer=self.user, total_amount=Decimal('50.00'), status=OrderStatus.PENDING)
        
        url = reverse('order-pay', kwargs={'pk': order.id})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['checkout_url'], 'https://stripe.com/repay')
