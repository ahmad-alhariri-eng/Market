# orders/models.py
from django.db import models
from django.conf import settings
from products.models import Product
from accounts.models import User
from django.utils import timezone
import uuid

class OrderStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    CREATED = 'created', 'Created'
    PROCESSING = 'processing', 'Processing'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'

class Order(models.Model):
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='orders'
    )
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.CREATED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    payment_hold_reference = models.CharField(max_length=100, blank=True, null=True)
    completed_at = models.DateTimeField(null=True, blank=True)


    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.order_number} - {self.buyer.username}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate a unique order number
            date_part = timezone.now().strftime('%Y%m%d')
            unique_part = uuid.uuid4().hex[:6].upper()
            self.order_number = f"ORD-{date_part}-{unique_part}"
        super().save(*args, **kwargs)
   
    # Refund logic removed as digital goods have final sales

class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='order_items'
    )
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        self.total_price = self.price_at_purchase * self.quantity
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name_en} in Order #{self.order.order_number}"

class OrderStatusHistory(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    status = models.CharField(max_length=20, choices=OrderStatus.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Order Status History'
    
    def __str__(self):
        return f"Order #{self.order.order_number} changed to {self.status}"
    
    def __str__(self):
        return f"Order #{self.order.order_number} changed to {self.status}"