from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('order_created', 'Order Created'),
        ('order_shipped', 'Order Shipped'),
        ('system_alert', 'System Alert'),
        ('wishlist_discount', 'Wishlist Discount'),
        ('order_processing', 'Order Processing'),
        ('order_delivered', 'Order Delivered'),
        ('order_completed', 'Order Completed'),
        ('order_cancelled', 'Order Cancelled'),
        ('order_refunded', 'Order Refunded'),
        ('refund_requested', 'Refund Requested'),
        ('refund_approved', 'Refund Approved'),
        ('refund_rejected', 'Refund Rejected'),
        ('low_stock', 'Low Stock'),
        ('auction_new_bid', 'Auction New Bid'),
        ('auction_outbid', 'Auction Outbid'),
        ('auction_won', 'Auction Won'),
        ('auction_ended_no_winner', 'Auction Ended No Winner'),
        ('auction_order_created', 'Auction Order Created'),
        ('auction_cancelled', 'Auction Cancelled')
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_notifications'  # Changed to unique name
    )
    
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    message_ar = models.TextField()
    message_en = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    extra_data = models.JSONField(null=True, blank=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['-created_at']
        db_table = 'notifications_notification'

class EmailLog(models.Model):
    """
    نموذج (Model) يُسجل حالة الإيميل المُرسل لكل طلبية، ويستخدم لحل مشكلة الإرسال المتكرر أو محاولات الإرسال عند الفشل (Retries).
    """
    class EmailStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT = 'sent', 'Sent'
        FAILED = 'failed', 'Failed'
        
    order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='email_log')
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=255)
    
    status = models.CharField(max_length=20, choices=EmailStatus.choices, default=EmailStatus.PENDING)
    error_message = models.TextField(blank=True, null=True)
    retry_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Email for Order #{self.order.order_number} - {self.status}"