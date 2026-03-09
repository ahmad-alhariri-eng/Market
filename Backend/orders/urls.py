# orders/urls.py
from django.urls import path
from .views import (
    CheckoutView,
    OrderListView,
    CancelOrderView,
    OrderDetailView,
    PayOrderView,
    PaymentWebhookView,
)

urlpatterns = [
    # Order creation and management
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('', OrderListView.as_view(), name='order-list'),
    path('<int:pk>/cancel/', CancelOrderView.as_view(), name='cancel-order'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/pay/', PayOrderView.as_view(), name='order-pay'),
    path('webhook/', PaymentWebhookView.as_view(), name='payment-webhook'),
]