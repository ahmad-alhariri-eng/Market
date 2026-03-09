# orders/services.py
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from itertools import groupby
from operator import attrgetter
from notifications.utils import send_order_notification

# Import models from other apps
from products.models import Cart, CartItem, Product
from accounts.models import User
from notifications.models import Notification
from decimal import Decimal, ROUND_HALF_UP
from itertools import groupby
from operator import attrgetter
from django.conf import settings
# Import models from current app
from .models import Order, OrderItem, OrderStatus
from notifications.models import EmailLog
from notifications.tasks import send_digital_product_email_task


FEE_RATE = Decimal(getattr(settings, 'PLATFORM_FEE_RATE', '0.04'))
MIN_FEE = Decimal(getattr(settings, 'PLATFORM_MIN_FEE', '0.00'))
MAX_FEE = (Decimal(settings.PLATFORM_MAX_FEE)
           if getattr(settings, 'PLATFORM_MAX_FEE', None) else None)


class CheckoutService:
    @classmethod
    def process_checkout(cls, user):
        """
        Phase 1: Initiate Order and return Stripe Session URL.
        """
        from orders.utils import get_payment_gateway
        
        with transaction.atomic():
            cart = Cart.objects.select_for_update().get(user=user)
            cart_items = CartItem.objects.filter(cart=cart).select_related('product')
            
            if not cart_items.exists():
                raise ValueError("Cart has no items")
            
            # Basic stock check before redirecting to Stripe
            for item in cart_items:
                if item.product.quantity < item.quantity:
                    raise ValueError(f"Not enough stock for {item.product.name_en}")

            product_total = sum(Decimal(item.product.current_price) * item.quantity for item in cart_items)
            
            # Create Order as PENDING
            order = Order.objects.create(
                buyer=user,
                total_amount=product_total,
                status=OrderStatus.PENDING,
            )
            
            # Create Order Items (snapshot)
            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price_at_purchase=item.product.current_price,
                    total_price=Decimal(item.product.current_price) * item.quantity
                )

            # Initiate Stripe Checkout Session
            gateway = get_payment_gateway()
            
            # Frontend should provide success/cancel URLs, but we'll use defaults from settings
            success_url = f"{settings.FRONTEND_URL}/order-success?session_id={{CHECKOUT_SESSION_ID}}"
            cancel_url = f"{settings.FRONTEND_URL}/cart"
            
            checkout_url = gateway.create_checkout_session(
                order_number=order.order_number,
                amount=product_total,
                customer_email=user.email,
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={'order_id': order.id}
            )
            
            # We don't clear the cart or reduce stock yet. 
            # We do that upon payment confirmation to avoid locking items for unpaid sessions.
            return checkout_url

    @classmethod
    def fulfill_order(cls, order_number):
        """
        Phase 2: Fulfill Order after successful Stripe payment.
        Triggered by Webhook.
        """
        with transaction.atomic():
            order = Order.objects.select_for_update().get(order_number=order_number)
            if order.status == OrderStatus.COMPLETED:
                return order # Already processed
            
            # Final Stock Check & Update
            for item in order.items.all():
                product = Product.objects.select_for_update().get(pk=item.product.pk)
                if product.quantity < item.quantity:
                    # Rare edge case: stock sold while user was on Stripe
                    # In a real app, you might want a "lock" period or a refund.
                    # For now, we'll log it and let it pass (oversell prevention should be handled better)
                    pass 
                
                product.quantity -= item.quantity
                product.save()

                from products.utils import reconcile_carts_for_product
                reconcile_carts_for_product(product)

            order.status = OrderStatus.COMPLETED
            order.completed_at = timezone.now()
            order.save()
            

            # Notifications & Email
            email_log, created = EmailLog.objects.get_or_create(
                order=order,
                defaults={
                    'recipient_email': order.buyer.email,
                    'subject': f"Order #{order.order_number} Confirmed",
                    'status': EmailLog.EmailStatus.PENDING
                }
            )
            
            if created:
                context_data = {
                    'customer_name': order.buyer.first_name,
                    'order_number': order.order_number,
                    'service_name': order.items.first().product.name_ar if order.items.exists() else '',
                    'subscription_code': "XXXX-YYYY-ZZZZ",
                    'download_link': f"{settings.FRONTEND_URL}/orders/{order.id}",
                }
                transaction.on_commit(
                    lambda: send_digital_product_email_task.delay(email_log.id, context_data)
                )

            send_order_notification(order.buyer, order, 'order_completed')
            
            # Clear user cart now that payment is confirmed
            CartItem.objects.filter(cart__user=order.buyer).delete()
            
            return order





class OrderService:
    CANCEL_PENALTY = Decimal('0.10')  # 10% penalty

    @classmethod
    def cancel_order(cls, order_id, user):
        with transaction.atomic():
            order = Order.objects.select_for_update().get(
                pk=order_id,
                buyer=user,
                status__in=[OrderStatus.CREATED, OrderStatus.PROCESSING]
            )
            
            # Restock products
            for item in order.items.all():
                product = Product.objects.select_for_update().get(pk=item.product.pk)
                product.quantity += item.quantity
                product.save()
            
            order.status = OrderStatus.CANCELLED
            order.save()
            return order



# RefundService removed per digital sales policy.