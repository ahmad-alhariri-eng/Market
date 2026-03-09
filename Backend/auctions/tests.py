from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from auctions.models import Auction, Bid, AuctionStatus
from auctions.services import admin_close_auction, place_bid
from products.models import Product, Category
from orders.models import Order, OrderStatus

User = get_user_model()

class AuctionStripeFlowTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@example.com', 
            password='password', 
            is_staff=True,
            username='adminuser'
        )
        self.bidder = User.objects.create_user(
            email='bidder@example.com', 
            password='password',
            username='bidderuser'
        )
        
        self.category = Category.objects.create(name_ar='مزاد', name_en='Auction')
        self.subcategory = Category.objects.create(name_ar='فرعي', name_en='Sub', parent=self.category)
        
        self.product = Product.objects.create(
            name_en='Auction Item',
            name_ar='منتج مزاد',
            price=Decimal('100.00'),
            quantity=1,
            category=self.subcategory
        )
        
        self.auction = Auction.objects.create(
            title='Test Auction',
            product=self.product,
            quantity=1,
            start_price=Decimal('100.00'),
            reserve_price=Decimal('150.00'),
            start_at=timezone.now() - timezone.timedelta(hours=1),
            end_at=timezone.now() + timezone.timedelta(hours=1),
            status=AuctionStatus.ACTIVE
        )

    def test_auction_win_creates_pending_order(self):
        # Place a winning bid
        place_bid(self.auction.id, self.bidder, Decimal('200.00'))
        
        # Close auction
        result = admin_close_auction(self.auction.id, self.admin)
        
        self.assertEqual(result['status'], 'ended_sold')
        
        # Verify Order created as CREATED
        order = Order.objects.get(pk=result['order_id'])
        self.assertEqual(order.buyer, self.bidder)
        self.assertEqual(order.status, OrderStatus.PENDING)
        self.assertEqual(order.total_amount, Decimal('200.00'))
        
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 1) 

    def test_auction_fail_reserve_restores_stock(self):
        # Place a bid below reserve
        place_bid(self.auction.id, self.bidder, Decimal('120.00'))
        
        result = admin_close_auction(self.auction.id, self.admin)
        self.assertEqual(result['status'], 'ended_no_sale')
        
        self.product.refresh_from_db()
        self.assertTrue(self.product.quantity >= 1)
