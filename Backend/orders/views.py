# orders/views.py
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from notifications.utils import send_order_notification

# Import models
from products.models import Cart, CartItem, Product
from accounts.models import User
from .models import Order, OrderItem, OrderStatus

# Import services
from .services import CheckoutService, OrderService

# Import serializers
from .serializers import OrderSerializer,OrderDetailSerializer

def calculate_penalty(created_at):
    time_elapsed = timezone.now() - created_at
    if time_elapsed < timezone.timedelta(hours=1):
        return Decimal('0.00')  # No penalty within 1 hour
    elif time_elapsed < timezone.timedelta(days=1):
        return Decimal('0.10')  # 10% penalty within 1 day
    else:
        return Decimal('0.15')  # 15% penalty after 1 day

class CheckoutView(APIView):
    def post(self, request):
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
            if not cart.items.exists():
                return Response(
                    {"error": "Cart is empty", "detail": "No items found in cart"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                checkout_url = CheckoutService.process_checkout(user)
                return Response(
                    {"checkout_url": checkout_url},
                    status=status.HTTP_201_CREATED
                )
            except ValueError as e:
                return Response(
                    {"error": "Checkout error", "detail": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                import traceback
                traceback.print_exc()
                return Response(
                    {
                        "error": "Checkout failed",
                        "detail": str(e),
                        "type": type(e).__name__
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Cart.DoesNotExist:
            return Response(
                {"error": "Cart not found", "detail": "No cart exists for this user"},
                status=status.HTTP_400_BAD_REQUEST
            )


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status']
    
    def get_queryset(self):
        return Order.objects.filter(
            buyer=self.request.user
        ).prefetch_related(
            'items',
            'items__product'
        ).order_by('-created_at')

class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        """
        Retrieve detailed information about a specific order
        """
        try:
            order = Order.objects.prefetch_related(
                'items',
                'items__product',
                'items__product__images'
            ).get(pk=pk)
            
            # Check if user has permission to view this order
            if order.buyer != request.user and not request.user.is_staff:
                return Response(
                    {"error": "You don't have permission to view this order"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = OrderDetailSerializer(order, context={'request': request})
            return Response(serializer.data)
            
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"},
                status=status.HTTP_404_NOT_FOUND
            )



class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            with transaction.atomic():
                order = Order.objects.select_for_update().get(
                    pk=pk,
                    buyer=request.user,
                    status__in=[OrderStatus.CREATED, OrderStatus.PROCESSING, OrderStatus.COMPLETED]
                )
                
                penalty_percentage = calculate_penalty(order.created_at)
                penalty_amount = order.total_amount * penalty_percentage
                refund_amount = order.total_amount - penalty_amount
                
                # Note: Actual refund needs to be processed with Stripe here if order.status was PAID/PROCESSING.
                
                
                # Restock products
                for item in order.items.all():
                    product = Product.objects.select_for_update().get(pk=item.product.pk)
                    product.quantity += item.quantity
                    product.save()
                
                order.status = OrderStatus.CANCELLED
                order.save()

                send_order_notification(order.buyer, order, 'order_cancelled')

                return Response({
                    "status": "cancelled",
                    "refund_amount": str(refund_amount),
                    "penalty_percentage": str(penalty_percentage * 100) + "%",
                    "penalty_amount": str(penalty_amount)
                })
                
        except Order.DoesNotExist:
            return Response(
                {"error": "Order cannot be cancelled (either doesn't exist or is in wrong status)"},
                status=status.HTTP_400_BAD_REQUEST
            )


class PayOrderView(APIView):
    """
    POST /api/orders/<pk>/pay/
    Redirects to Stripe for an existing PENDING order.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        from orders.utils import get_payment_gateway
        from django.conf import settings
        
        order = get_object_or_404(Order, pk=pk, buyer=request.user, status=OrderStatus.PENDING)
        
        gateway = get_payment_gateway()
        success_url = f"{settings.FRONTEND_URL}/order-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{settings.FRONTEND_URL}/orders/{order.id}"
        
        checkout_url = gateway.create_checkout_session(
            order_number=order.order_number,
            amount=order.total_amount,
            customer_email=request.user.email,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={'order_id': order.id}
        )
        
        return Response({"checkout_url": checkout_url})

class PaymentWebhookView(APIView):
    """
    POST /api/orders/webhook/
    Verified fulfillment endpoint for Stripe events.
    """
    permission_classes = []  # Verified by signature

    def post(self, request):
        from orders.utils import get_payment_gateway
        from orders.services import CheckoutService
        
        gateway = get_payment_gateway()
        
        # Stripe needs the raw body for signature verification
        payload = request.body
        sig_header = request.headers.get('STRIPE_SIGNATURE')
        
        result = gateway.process_webhook(payload, sig_header)

        if result.success:
            # client_reference_id is the order number
            order_number = result.raw_response.get('client_reference_id')
            if order_number:
                try:
                    CheckoutService.fulfill_order(order_number)
                    return Response({'status': 'fulfilled'}, status=status.HTTP_200_OK)
                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    return Response({'error': f"Fulfillment error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({'status': 'received_no_action'}, status=status.HTTP_200_OK)

        return Response(
            {'error': result.message}, status=status.HTTP_400_BAD_REQUEST
        )

