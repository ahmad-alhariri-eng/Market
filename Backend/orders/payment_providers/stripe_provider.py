# wallet/payment_providers/stripe_provider.py
import stripe
from decimal import Decimal
from typing import Optional
from django.conf import settings
from .base import BasePaymentGateway, PaymentResult, PaymentStatus

class StripeGateway(BasePaymentGateway):
    """
    Stripe Payment Gateway Implementation.
    """

    def initialize(self, config: dict) -> None:
        self.api_key = config.get('api_key')
        self.publishable_key = config.get('publishable_key')
        self.webhook_secret = config.get('webhook_secret')
        stripe.api_key = self.api_key

    def create_deposit(
        self,
        user_id: int,
        amount: Decimal,
        currency: str = 'USD',
        payment_method_token: Optional[str] = None,
        return_url: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> PaymentResult:
        try:
            # Create a PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Stripe uses cents
                currency=currency.lower(),
                payment_method=payment_method_token,
                confirm=True if payment_method_token else False,
                metadata=metadata or {},
                return_url=return_url
            )

            status_map = {
                'succeeded': PaymentStatus.COMPLETED,
                'requires_action': PaymentStatus.PENDING,
                'requires_payment_method': PaymentStatus.FAILED,
                'processing': PaymentStatus.PROCESSING,
                'canceled': PaymentStatus.CANCELLED,
            }

            return PaymentResult(
                success=intent.status == 'succeeded',
                transaction_id=intent.id,
                status=status_map.get(intent.status, PaymentStatus.PENDING),
                amount=amount,
                currency=currency,
                message=f"Stripe PaymentIntent {intent.status}",
                provider_name="stripe",
                raw_response=intent,
                redirect_url=intent.next_action.redirect_to_url.url if intent.next_action else None
            )
        except stripe.error.StripeError as e:
            return PaymentResult(
                success=False,
                transaction_id="ERROR",
                status=PaymentStatus.FAILED,
                amount=amount,
                currency=currency,
                message=str(e),
                provider_name="stripe"
            )

    def create_withdrawal(
        self,
        user_id: int,
        amount: Decimal,
        currency: str = 'USD',
        destination: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> PaymentResult:
        # Payouts typically require Stripe Connect. 
        # For simplicity in this demo, we'll mark it as pending/manually processed.
        return PaymentResult(
            success=False,
            transaction_id="N/A",
            status=PaymentStatus.PROCESSING,
            amount=amount,
            currency=currency,
            message="Withdrawals via Stripe require Connect. Manual processing recommended.",
            provider_name="stripe"
        )

    def verify_payment(self, transaction_id: str) -> PaymentResult:
        try:
            intent = stripe.PaymentIntent.retrieve(transaction_id)
            return PaymentResult(
                success=intent.status == 'succeeded',
                transaction_id=intent.id,
                status=PaymentStatus.COMPLETED if intent.status == 'succeeded' else PaymentStatus.PENDING,
                amount=Decimal(intent.amount) / 100,
                currency=intent.currency.upper(),
                message=f"Stripe status: {intent.status}",
                provider_name="stripe",
                raw_response=intent
            )
        except stripe.error.StripeError as e:
            return PaymentResult(
                success=False,
                transaction_id=transaction_id,
                status=PaymentStatus.FAILED,
                amount=Decimal('0.00'),
                currency='USD',
                message=str(e),
                provider_name="stripe"
            )

    def refund_payment(
        self,
        transaction_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None,
    ) -> PaymentResult:
        try:
            params = {'payment_intent': transaction_id}
            if amount:
                params['amount'] = int(amount * 100)
            
            refund = stripe.Refund.create(**params)
            return PaymentResult(
                success=True,
                transaction_id=refund.id,
                status=PaymentStatus.REFUNDED,
                amount=Decimal(refund.amount) / 100,
                currency=refund.currency.upper(),
                message="Stripe refund successful",
                provider_name="stripe",
                raw_response=refund
            )
        except stripe.error.StripeError as e:
            return PaymentResult(
                success=False,
                transaction_id="ERROR",
                status=PaymentStatus.FAILED,
                amount=amount or Decimal('0.00'),
                currency='USD',
                message=str(e),
                provider_name="stripe"
            )

    def create_checkout_session(
        self,
        order_number: str,
        amount: Decimal,
        customer_email: str,
        success_url: str,
        cancel_url: str,
        metadata: Optional[dict] = None,
    ) -> str:
        """
        Create a Stripe Checkout Session for a direct payment flow.
        Returns the session URL.
        """
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'Order #{order_number}',
                    },
                    'unit_amount': int(amount * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=customer_email,
            metadata=metadata or {},
            client_reference_id=order_number,
        )
        return session.url

    def process_webhook(self, payload: bytes, sig_header: str) -> PaymentResult:
        """
        Verify and process Stripe Webhook.
        """
        from .base import PaymentStatus
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.webhook_secret
            )
        except ValueError as e:
            # Invalid payload
            return PaymentResult(
                success=False, 
                transaction_id="", 
                status=PaymentStatus.FAILED, 
                amount=Decimal('0.00'), 
                currency="", 
                message="Invalid payload", 
                provider_name="stripe"
            )
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return PaymentResult(
                success=False, 
                transaction_id="", 
                status=PaymentStatus.FAILED, 
                amount=Decimal('0.00'), 
                currency="", 
                message="Invalid signature", 
                provider_name="stripe"
            )

        data_object = event['data']['object']
        
        if event['type'] == 'checkout.session.completed':
            return PaymentResult(
                success=True,
                transaction_id=data_object.get('id'),
                status=PaymentStatus.COMPLETED,
                amount=Decimal(data_object.get('amount_total')) / 100,
                currency=data_object.get('currency', 'usd').upper(),
                message="Webhook: Checkout succeeded",
                provider_name="stripe",
                raw_response=data_object
            )
        
        return PaymentResult(
            success=False,
            transaction_id=data_object.get('id', 'unknown'),
            status=PaymentStatus.PENDING,
            amount=Decimal('0.00'),
            currency='USD',
            message=f"Webhook: Event {event['type']} not handled as success",
            provider_name="stripe"
        )
