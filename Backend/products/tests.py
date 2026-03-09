from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from decimal import Decimal
from products.models import (
    Product, Category, Cart, CartItem, Brand,
    Wishlist, WishlistItem, Favorite
)

User = get_user_model()


# ─── Helper ────────────────────────────────────────────────────
def _make_product(subcategory, **kw):
    defaults = dict(
        name_en='Product', name_ar='منتج',
        price=Decimal('50.00'), quantity=10,
        category=subcategory,
    )
    defaults.update(kw)
    return Product.objects.create(**defaults)


# ================ MODEL TESTS ================

class CategoryModelTests(TestCase):
    def test_parent_child_hierarchy(self):
        parent = Category.objects.create(name_ar='ر', name_en='Root')
        child = Category.objects.create(name_ar='ف', name_en='Child', parent=parent)
        self.assertTrue(parent.is_parent)
        self.assertTrue(child.is_child)
        self.assertIn(child, parent.children.all())

    def test_category_str(self):
        cat = Category.objects.create(name_ar='ت', name_en='Tech')
        self.assertIn('Tech', str(cat))


class ProductModelTests(TestCase):
    def setUp(self):
        self.parent = Category.objects.create(name_ar='ر', name_en='Root')
        self.sub = Category.objects.create(name_ar='ف', name_en='Sub', parent=self.parent)

    def test_create_product(self):
        p = _make_product(self.sub)
        self.assertEqual(p.price, Decimal('50.00'))
        self.assertEqual(p.quantity, 10)
        self.assertEqual(p.category, self.sub)

    def test_current_price_without_discount(self):
        p = _make_product(self.sub, price=Decimal('100.00'))
        self.assertEqual(p.current_price, Decimal('100.00'))

    def test_current_price_with_standalone_discount(self):
        p = _make_product(
            self.sub, price=Decimal('200.00'),
            has_standalone_discount=True,
            standalone_discount_percentage=Decimal('25.00')
        )
        self.assertEqual(p.current_price, Decimal('150.00'))

    def test_product_default_condition(self):
        p = _make_product(self.sub)
        self.assertEqual(p.condition, 'new')


class CartModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='cart@test.com', password='p', username='cartuser',
            first_name='A', last_name='B'
        )
        self.parent = Category.objects.create(name_ar='ر', name_en='Root')
        self.sub = Category.objects.create(name_ar='ف', name_en='Sub', parent=self.parent)
        self.product = _make_product(self.sub, price=Decimal('30.00'), quantity=5)
        self.cart = Cart.objects.create(user=self.user)

    def test_add_item_to_cart(self):
        item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)
        self.assertEqual(self.cart.total_items, 2)

    def test_cart_prevents_duplicate_product(self):
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)
        with self.assertRaises(Exception):
            CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)

    def test_cart_rejects_over_stock(self):
        with self.assertRaises(Exception):
            CartItem.objects.create(cart=self.cart, product=self.product, quantity=999)


class BrandModelTests(TestCase):
    def test_create_brand(self):
        b = Brand.objects.create(name='TestBrand')
        self.assertEqual(str(b), 'TestBrand')


# ================ API TESTS ================

class ProductAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='api@test.com', password='p', username='apiuser',
            first_name='A', last_name='B'
        )
        self.parent = Category.objects.create(name_ar='ر', name_en='Root')
        self.sub = Category.objects.create(name_ar='ف', name_en='Sub', parent=self.parent)
        self.product = _make_product(self.sub, name_en='Visible')
        self.client = APIClient()

    def test_product_list_public(self):
        response = self.client.get('/api/product/')
        self.assertEqual(response.status_code, 200)

    def test_product_detail_public(self):
        response = self.client.get(f'/api/product/{self.product.pk}/')
        self.assertEqual(response.status_code, 200)

    def test_search_products(self):
        response = self.client.get('/api/product/search/', {'q': 'Visible'})
        self.assertEqual(response.status_code, 200)


class CategoryAPITests(TestCase):
    def setUp(self):
        self.parent = Category.objects.create(name_ar='ر', name_en='Electronics')
        self.child = Category.objects.create(name_ar='ف', name_en='Phones', parent=self.parent)
        self.client = APIClient()

    def test_parent_categories_list(self):
        response = self.client.get('/api/product/categories/parents/')
        self.assertEqual(response.status_code, 200)

    def test_child_categories_list(self):
        response = self.client.get(f'/api/product/categories/{self.parent.pk}/children/')
        self.assertEqual(response.status_code, 200)

    def test_localized_categories(self):
        response = self.client.get('/api/product/categories/localized/')
        self.assertEqual(response.status_code, 200)


class CartAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='cartapi@test.com', password='p', username='cartapi',
            first_name='A', last_name='B'
        )
        self.parent = Category.objects.create(name_ar='ر', name_en='Root')
        self.sub = Category.objects.create(name_ar='ف', name_en='Sub', parent=self.parent)
        self.product = _make_product(self.sub)

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_view_empty_cart(self):
        Cart.objects.create(user=self.user)
        response = self.client.get('/api/product/cart/')
        self.assertEqual(response.status_code, 200)

    def test_add_to_cart(self):
        Cart.objects.create(user=self.user)
        response = self.client.post('/api/product/cart/add/', {
            'product_id': self.product.pk, 'quantity': 1
        })
        self.assertIn(response.status_code, [200, 201])

    def test_unauthenticated_cart_rejected(self):
        client = APIClient()
        response = client.get('/api/product/cart/')
        self.assertIn(response.status_code, [401, 403])


class WishlistAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='wish@test.com', password='p', username='wishuser',
            first_name='A', last_name='B'
        )
        self.parent = Category.objects.create(name_ar='ر', name_en='Root')
        self.sub = Category.objects.create(name_ar='ف', name_en='Sub', parent=self.parent)
        self.product = _make_product(self.sub)

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_view_wishlist(self):
        Wishlist.objects.create(user=self.user)
        response = self.client.get('/api/product/wishlist/')
        self.assertEqual(response.status_code, 200)

    def test_add_to_wishlist(self):
        Wishlist.objects.create(user=self.user)
        response = self.client.post('/api/product/wishlist/add/', {
            'product_id': self.product.pk
        })
        self.assertIn(response.status_code, [200, 201])


class BrandAPITests(TestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name='Nike')
        self.client = APIClient()

    def test_list_brands(self):
        response = self.client.get('/api/product/brands/')
        self.assertEqual(response.status_code, 200)

    def test_brand_detail(self):
        response = self.client.get(f'/api/product/brands/{self.brand.pk}/')
        self.assertEqual(response.status_code, 200)
