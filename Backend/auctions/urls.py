# auctions/urls.py
from django.urls import path
from .views import (
    AuctionCreateView, PublicAuctionListView, AuctionDetailView,
    PlaceBidView,
    AdminCancelAuctionView, AdminSettleAuctionView,
    AdminAllAuctionsView,
    PublicSubcategoryAuctionsView,
    AdminCloseAuctionView,
    AdminActivateAuctionView
)

urlpatterns = [
    # public
    path('', PublicAuctionListView.as_view(), name='auction-list'),
    path('<int:pk>/', AuctionDetailView.as_view(), name='auction-detail'),
    path('public/subcategory/<int:subcategory_id>/', PublicSubcategoryAuctionsView.as_view(), name='public-subcategory-auctions'),

    # create (admin only)
    path('create/', AuctionCreateView.as_view(), name='auction-create'),

    # bidding
    path('<int:pk>/bid/', PlaceBidView.as_view(), name='auction-bid'),

    # admin management
    path('admin/all/', AdminAllAuctionsView.as_view(), name='admin-all-auctions'),
    path('admin/<int:pk>/cancel/', AdminCancelAuctionView.as_view(), name='auction-admin-cancel'),
    path('admin/<int:pk>/settle/', AdminSettleAuctionView.as_view(), name='auction-admin-settle'),
    path('admin/auctions/<int:pk>/close/', AdminCloseAuctionView.as_view(), name='auction-admin-close'),
    path('admin/<int:pk>/activate/', AdminActivateAuctionView.as_view(), name='auction-admin-activate'),
]
