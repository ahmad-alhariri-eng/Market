# wallet/payment_providers/gateway_loader.py
"""
Payment Gateway Loader
======================
Dynamically loads the configured payment gateway provider from Django settings.

Configuration in settings.py:
```python
PAYMENT_GATEWAY = {
    'PROVIDER': 'wallet.payment_providers.sandbox_provider.SandboxGateway',
    'PROVIDER_CONFIG': {
        # Provider-specific configuration (API keys, secrets, etc.)
        # For Stripe: 'secret_key': 'sk_live_...'
        # For Tap: 'api_key': 'sk_test_...'
        # For Moyasar: 'api_key': '...'
    },
    'CURRENCY': 'USD',           # Default currency
    'WEBHOOK_SECRET': '',        # Webhook signing secret
}
```
"""

from importlib import import_module
from django.conf import settings
from .base import BasePaymentGateway


_gateway_instance = None


def get_payment_gateway() -> BasePaymentGateway:
    """
    Get the configured payment gateway instance.
    Uses a singleton pattern — the gateway is initialized once and reused.
    
    Returns:
        Configured BasePaymentGateway implementation
        
    Raises:
        ImportError: If the provider module cannot be found
        AttributeError: If the provider class doesn't exist in the module
        TypeError: If the provider doesn't implement BasePaymentGateway
    """
    global _gateway_instance

    if _gateway_instance is not None:
        return _gateway_instance

    gateway_settings = getattr(settings, 'PAYMENT_GATEWAY', {})
    provider_path = gateway_settings.get(
        'PROVIDER',
        'wallet.payment_providers.sandbox_provider.SandboxGateway'
    )
    provider_config = gateway_settings.get('PROVIDER_CONFIG', {})

    # Dynamic import: 'wallet.payment_providers.stripe_provider.StripeGateway'
    module_path, class_name = provider_path.rsplit('.', 1)
    module = import_module(module_path)
    gateway_class = getattr(module, class_name)

    if not issubclass(gateway_class, BasePaymentGateway):
        raise TypeError(
            f"{provider_path} must be a subclass of BasePaymentGateway"
        )

    _gateway_instance = gateway_class()
    _gateway_instance.initialize(provider_config)
    return _gateway_instance


def get_default_currency() -> str:
    """Get the configured default currency"""
    gateway_settings = getattr(settings, 'PAYMENT_GATEWAY', {})
    return gateway_settings.get('CURRENCY', 'USD')
