# wallet/payment_providers/base.py
"""
Abstract Base Payment Gateway
==============================
This module defines the interface that all payment gateway providers must implement.
To integrate a new payment provider (Stripe, PayPal, Tap, Moyasar, etc.):

1. Create a new file in this directory (e.g., `stripe_provider.py`)
2. Subclass `BasePaymentGateway`
3. Implement all abstract methods
4. Register your provider in settings.py under PAYMENT_GATEWAY config
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal
from enum import Enum
from typing import Optional


class PaymentStatus(Enum):
    """Status of a payment operation"""
    PENDING = 'pending'
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'
    REFUNDED = 'refunded'


@dataclass
class PaymentResult:
    """
    Standardized result returned by all payment gateway operations.
    Every provider must return this structure regardless of their internal API format.
    """
    success: bool
    transaction_id: str        # Provider's transaction/reference ID
    status: PaymentStatus
    amount: Decimal
    currency: str
    message: str               # Human-readable status message
    provider_name: str         # e.g. 'stripe', 'paypal', 'tap'
    raw_response: Optional[dict] = None  # Full provider response for debugging
    redirect_url: Optional[str] = None   # For 3D Secure / redirect-based flows
    metadata: Optional[dict] = None      # Any extra data from the provider


class BasePaymentGateway(ABC):
    """
    Abstract base class for payment gateway integrations.
    
    All concrete payment providers must implement these methods.
    This ensures a consistent interface regardless of which 
    payment company or bank API is being used.
    
    Usage Example:
    --------------
    ```python
    from wallet.payment_providers.stripe_provider import StripeGateway
    gateway = StripeGateway()
    
    # Deposit money into wallet
    result = gateway.create_deposit(
        user_id=42,
        amount=Decimal('100.00'),
        currency='USD',
        payment_method_token='pm_card_visa',
    )
    
    if result.success:
        # Update wallet balance
        ...
    ```
    """

    @abstractmethod
    def initialize(self, config: dict) -> None:
        """
        Initialize the gateway with configuration.
        Called once when the gateway is instantiated.
        
        Args:
            config: Dictionary containing API keys, secrets, and provider-specific settings.
                    Loaded from Django settings.PAYMENT_GATEWAY['PROVIDER_CONFIG']
        """
        pass

    @abstractmethod
    def create_deposit(
        self,
        user_id: int,
        amount: Decimal,
        currency: str = 'USD',
        payment_method_token: Optional[str] = None,
        return_url: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> PaymentResult:
        """
        Create a deposit (add funds) to a user's wallet.
        
        This initiates a charge on the user's payment method and,
        upon success, the wallet balance should be credited.
        
        Args:
            user_id: The internal user ID
            amount: Amount to deposit
            currency: ISO 4217 currency code (e.g., 'USD', 'SAR', 'EUR')
            payment_method_token: Token from the frontend (card token, etc.)
            return_url: URL for redirect-based payment flows (3D Secure)
            metadata: Additional data to attach to the transaction
            
        Returns:
            PaymentResult with the outcome of the operation
        """
        pass

    @abstractmethod
    def create_withdrawal(
        self,
        user_id: int,
        amount: Decimal,
        currency: str = 'USD',
        destination: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> PaymentResult:
        """
        Create a withdrawal (cashout) from a user's wallet to their bank account.
        
        Args:
            user_id: The internal user ID
            amount: Amount to withdraw
            currency: ISO 4217 currency code
            destination: Bank account or payout destination identifier
            metadata: Additional data to attach to the transaction
            
        Returns:
            PaymentResult with the outcome of the operation
        """
        pass

    @abstractmethod
    def verify_payment(self, transaction_id: str) -> PaymentResult:
        """
        Verify the status of a payment transaction.
        Used for webhook verification and status polling.
        
        Args:
            transaction_id: The provider's transaction ID
            
        Returns:
            PaymentResult with the current status
        """
        pass

    @abstractmethod
    def refund_payment(
        self,
        transaction_id: str,
        amount: Optional[Decimal] = None,
        reason: Optional[str] = None,
    ) -> PaymentResult:
        """
        Refund a previously completed payment.
        
        Args:
            transaction_id: The provider's transaction ID to refund
            amount: Amount to refund (None = full refund)
            reason: Reason for the refund
            
        Returns:
            PaymentResult with the refund outcome
        """
        pass

    @abstractmethod
    def process_webhook(self, payload: dict, headers: dict) -> PaymentResult:
        """
        Process an incoming webhook from the payment provider.
        Validates the webhook signature and extracts payment information.
        
        Args:
            payload: The webhook request body (parsed JSON)
            headers: The webhook request headers (for signature verification)
            
        Returns:
            PaymentResult with the payment status from the webhook
        """
        pass

    def get_provider_name(self) -> str:
        """Return the name of this payment provider"""
        return self.__class__.__name__
