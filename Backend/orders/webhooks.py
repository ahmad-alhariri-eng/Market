import hmac
import hashlib
import json
import logging
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Order, OrderStatus
from notifications.models import EmailLog
from notifications.tasks import send_digital_product_email_task

logger = logging.getLogger(__name__)

class BinancePayWebhookView(APIView):
    """
    Handles Asynchronous Webhooks from Binance Pay.
    Docs: https://developers.binance.com/docs/binance-pay/api-order-notification
    """
    permission_classes = [AllowAny]  # Must be public for Binance to hit it

    def post(self, request):
        payment_signature = request.headers.get('Binancepay-Signature')
        timestamp = request.headers.get('Binancepay-Timestamp')
        nonce = request.headers.get('Binancepay-Nonce')

        if not payment_signature or not timestamp or not nonce:
            return Response({"returnCode": "FAIL", "returnMessage": "Missing headers"}, status=400)

        payload = request.body.decode('utf-8')
        api_secret = getattr(settings, 'BINANCE_PAY_API_SECRET', 'YOUR_SECRET_KEY')

        # 1. Verify HMAC-SHA512 Signature
        payload_to_sign = f"{timestamp}\n{nonce}\n{payload}\n"
        expected_signature = hmac.new(
            api_secret.encode('utf-8'),
            payload_to_sign.encode('utf-8'),
            hashlib.sha512
        ).hexdigest().upper()

        if expected_signature != payment_signature.upper() and not getattr(settings, 'DEBUG', False):
            logger.warning("Invalid Binance Pay webhook signature attempt.")
            return Response({"returnCode": "FAIL", "returnMessage": "Invalid signature"}, status=400)

        # 2. Process the business logic
        try:
            data = json.loads(payload)
            biz_type = data.get('bizType')
            # Extract internal data string from binance structure
            data_body = json.loads(data.get('data', '{}')) if isinstance(data.get('data'), str) else data.get('data', {})

            if biz_type == 'PAY.SUCCESS' or biz_type == 'PAY':
                status = data_body.get('status', data.get('status'))
                merchant_trade_no = data_body.get('merchantTradeNo', data.get('merchantTradeNo'))
                order_amount = Decimal(data_body.get('orderAmount', data.get('totalFee', '0.00')))

                if status == 'SUCCESS' or status == 'PAID':
                    with transaction.atomic():
                        try:
                            # Using select_for_update to prevent race conditions
                            order = Order.objects.select_for_update().get(order_number=merchant_trade_no)
                            
                            # Idempotency check: Already processed
                            if order.status == OrderStatus.COMPLETED:
                                return Response({"returnCode": "SUCCESS", "returnMessage": "OK"})

                            # Edge case 1: Underpayment handling
                            if order_amount < order.total_amount:
                                order.status = 'underpaid'
                                order.save(update_fields=['status'])
                                return Response({"returnCode": "SUCCESS", "returnMessage": "OK"})

                            # Normal Completion
                            order.status = OrderStatus.COMPLETED
                            order.save(update_fields=['status'])

                            # Reliable Async Notification Hand-off
                            email_log, created = EmailLog.objects.get_or_create(
                                order=order,
                                defaults={
                                    'recipient_email': order.buyer.email,
                                    'subject': f'Your Digital Product Access - Order {order.order_number}',
                                    'status': EmailLog.EmailStatus.PENDING
                                }
                            )

                            context_data = {
                                "customer_name": order.buyer.username,
                                "order_number": order.order_number,
                                "service_name": "Digital Subscription Package",
                                "subscription_code": f"SUB-{order.order_number[-6:]}",
                                "download_link": f"{settings.CORS_ALLOWED_ORIGINS[0] if hasattr(settings, 'CORS_ALLOWED_ORIGINS') else 'http://localhost:3000'}/orders/{order.id}"
                            }

                            # Send to Celery only if DB transaction completely commits
                            transaction.on_commit(lambda: send_digital_product_email_task.delay(
                                order.id, context_data
                            ))

                        except Order.DoesNotExist:
                            logger.error(f"Binance Webhook sent unknown order ID: {merchant_trade_no}")
                            return Response({"returnCode": "FAIL", "returnMessage": "Order Not Found"}, status=400)

            return Response({"returnCode": "SUCCESS", "returnMessage": "OK"}, status=200)

        except Exception as e:
            logger.error(f"Binance webhook processing error: {str(e)}")
            return Response({"returnCode": "FAIL", "returnMessage": "Server Exception"}, status=500)
