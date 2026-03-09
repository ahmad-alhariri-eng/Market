from django.db.models.signals import post_save
from django.dispatch import receiver
from products.models import Product, ProductSale, WishlistItem
from django.contrib.contenttypes.models import ContentType
from notifications.models import Notification



@receiver(post_save, sender=ProductSale)
def notify_wishlist_users(sender, instance, created, **kwargs):
    if created:
        product = instance.product
        product_content_type = ContentType.objects.get_for_model(product)
        
        # Get all wishlist items for this product with related users
        wishlist_items = WishlistItem.objects.filter(
            product=product
        ).select_related('wishlist__user')
        
        # Prepare notification messages in both languages
        message_ar = f"المنتج {product.name_ar} في قائمة أمنياتك أصبح في عرض! خصم {instance.discount_percentage}%"
        message_en = f"Product {product.name_en} in your wishlist is now on sale! {instance.discount_percentage}% off"
        
        # Create notifications for each user
        for item in wishlist_items:
            Notification.objects.create(
                user=item.wishlist.user,
                notification_type='wishlist_discount',
                message_ar=message_ar,
                message_en=message_en,
                content_type=product_content_type,
                object_id=product.id
            )