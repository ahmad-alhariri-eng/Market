# wallet/payment_providers/sandbox_provider.py
"""
Sandbox Payment Provider
========================
A development/testing provider that simulates payment operations.
Use this for local development while real API credentials are not yet configured.

In production, replace this with a real provider (e.g., StripeGateway, TapGateway).
"""

import uuid
from decimal import Decimal
from typing import Optional

from .base import BasePaymentGateway, PaymentResult, PaymentStatus


class SandboxGateway(BasePaymentGateway):
    """
    Sandbox/development payment gateway.
    Simulates successful payments for testing purposes.
    
    Configure in settings.py:
    ```python
    PAYMENT_GATEWAY = {
        'PROVIDER': 'wallet.payment_providers.sandbox_provider.SandboxGateway',
        'PROVIDER_CONFIG': {
            'simulate_failures': False,  # Set True to test failure handling
        }
    }
    ```
    """

    def __init__(self):
        self.simulate_failures = False

    def initialize(self, config: dict) -> None:
        self.simulate_failures = config.get('simulate_failures', False)

    def create_deposit(
        self,
        user_id: int,
        amount: Decimal,
        currency: str = 'USD',
        payment_method_token: Optional[str] = None,
        return_url: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> PaymentResult:
        if self.simulate_failures:
            return PaymentResult(
                success=False,
                transaction_id=f"SANDBOX-FAIL-{uuid.uuid4().hex[:8]}",
                status=PaymentStatus.FAILED,
                amount=amount,
                currency=currency,
                message="Simulated payment failure (sandbox mode)",
                provider_name="sandbox",
            )

        return PaymentResult(
            success=True,
            transaction_id=f"SANDBOX-DEP-{uuid.uuid4().hex[:8]}",
            status=PaymentStatus.COMPLETED,
            amount=amount,
            currency=currency,
            message=f"Sandbox deposit of {amount} {currency} successful",
            provider_name="sandbox",
            metadata=metadata,
        )

    def create_withdrawal(
        self,
        user_id: int,
        amount: Decimal,
        currency: str = 'USD',
        destination: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> PaymentResult:
        if self.simulate_failures:
            return PaymentResult(
                success=False,
                transaction_id=f"SANDBOX-FAIL-{uuid.uuid4().hex[:8]}",
                status=PaymentStatus.FAILED,
                amount=amount,
                currency=currency,
                message="Simulated withdrawal failure (sandbox mode)",
                provider_name="sandbox",
            )

        return PaymentResult(
            success=True,
            transaction_id=f"SANDBOX-WDR-{uuid.uuid4().hex[:8]}",
            status=PaymentStatus.COMPLETED,
            amount=amount,
            currency=currency,
            message=f"Sandbox withdrawal of {amount} {currency} successful",
            provider_name="sandbox",
            metadata=metadata,
        )

    def verify_payment(self, transaction_id: str) -> PaymentResult:
        return PaymentResult(
            success=True,
            transaction_id=transaction_id,
            status=PaymentStatus.COMPLETED,
            amount=Decimal('0.00'),
            currency='USD',
            message="Sandbox: payment verified",
            provider_name="sandbox",
        )

    def refund_payment(
        self,
        transaction_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None,
    ) -> PaymentResult:
        return PaymentResult(
            success=True,
            transaction_id=f"SANDBOX-REF-{uuid.uuid4().hex[:8]}",
            status=PaymentStatus.REFUNDED,
            amount=amount or Decimal('0.00'),
            currency='USD',
            message=f"Sandbox refund processed: {reason or 'no reason'}",
            provider_name="sandbox",
        )

    def process_webhook(self, payload: dict, headers: dict) -> PaymentResult:
        return PaymentResult(
            success=True,
            transaction_id=payload.get('transaction_id', 'unknown'),
            status=PaymentStatus.COMPLETED,
            amount=Decimal(str(payload.get('amount', '0.00'))),
            currency=payload.get('currency', 'USD'),
            message="Sandbox webhook processed",
            provider_name="sandbox",
        )
