from django.conf import settings
from django.utils.module_loading import import_string
from .payment_providers.base import BasePaymentGateway

def get_payment_gateway() -> BasePaymentGateway:
    """
    Factory function to get the configured payment gateway.
    """
    config = getattr(settings, 'PAYMENT_GATEWAY', {})
    provider_path = config.get('PROVIDER')
    if not provider_path:
        # Fallback to Stripe if not configured
        provider_path = 'orders.payment_providers.stripe_provider.StripeGateway'
    
    gateway_class = import_string(provider_path)
    gateway = gateway_class()
    
    # Initialize with provider-specific config
    provider_config = config.get('PROVIDER_CONFIG', {
        'api_key': getattr(settings, 'STRIPE_SECRET_KEY', ''),
        'publishable_key': getattr(settings, 'STRIPE_PUBLISHABLE_KEY', ''),
        'webhook_secret': getattr(settings, 'STRIPE_WEBHOOK_SECRET', ''),
    })
    gateway.initialize(provider_config)
    
    return gateway
