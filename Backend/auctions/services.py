# auctions/services.py
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

from .models import Auction, Bid, AuctionStatus
from notifications.models import Notification
from orders.models import Order, OrderItem, OrderStatus
from rest_framework.exceptions import ValidationError

User = get_user_model()


def _current_top(auction: Auction):
    top = auction.bids.order_by('-amount', '-created_at').first()
    return (top.bidder if top else None), (top.amount if top else None)


@transaction.atomic
def activate_scheduled_if_due(auction_id: int) -> bool:
    auction = Auction.objects.select_for_update().get(pk=auction_id)
    now = timezone.now()
    if auction.status == AuctionStatus.ACTIVE and auction.start_at <= now < auction.end_at:
        auction.status = AuctionStatus.ACTIVE
        auction.save(update_fields=['status'])
        return True
    return False


@transaction.atomic
def place_bid(auction_id: int, bidder: User, amount: Decimal):
    auction = Auction.objects.select_for_update().get(pk=auction_id)

    # live window check
    now = timezone.now()
    if auction.status != AuctionStatus.ACTIVE or not (auction.start_at <= now < auction.end_at):
        raise ValidationError("Auction is not active.")



    # enforce min increment
    curr_leader, curr_amount = _current_top(auction)
    min_allowed = auction.start_price if curr_amount is None else (curr_amount + auction.min_increment)
    if amount < min_allowed:
        raise ValidationError(f"Bid must be at least {min_allowed}.")

    # Bidder wallet check removed. Bidding is free in the silent-wallet model.
    # Payment is handled via Stripe after the auction ends.
    
    # prev leader refund logic removed

    # record bid
    bid = Bid.objects.create(auction=auction, bidder=bidder, amount=amount)

    # anti-sniping auto-extend
    time_left = (auction.end_at - now).total_seconds()
    if time_left <= auction.auto_extend_window_seconds:
        auction.end_at = auction.end_at + timezone.timedelta(seconds=auction.auto_extend_seconds)
        auction.save(update_fields=['end_at'])

    return bid




@transaction.atomic
def admin_close_auction(auction_id: int, admin_user: User):
    """
    Manually close an auction:
    - Decide winner (if reserve met)
    - Create PENDING order for winner (Payment via Stripe later)
    - Restock if no sale
    """
    auction = Auction.objects.select_for_update().get(pk=auction_id)

    bids_qs = Bid.objects.filter(auction=auction).order_by('-amount', '-created_at')
    winner_bid = bids_qs.first()
    reserve = auction.reserve_price

    # No sale case
    if not winner_bid or (reserve and winner_bid.amount < reserve):
        auction.status = AuctionStatus.ENDED
        auction.cancelled_at = timezone.now()
        auction.cancelled_by = admin_user
        auction.save()

        # restore reserved stock
        product = auction.product
        product.quantity += auction.quantity
        product.save()

        return {"status": "ended_no_sale"}

    # Figure out winner details
    winner = winner_bid.bidder
    winning_amount = winner_bid.amount

    # create order for winner as PENDING
    order = Order.objects.create(
        buyer=winner,
        total_amount=winning_amount,
        status=OrderStatus.PENDING,
    )
    OrderItem.objects.create(
        order=order,
        product=auction.product,
        quantity=auction.quantity,
        price_at_purchase=winning_amount,
        total_price=winning_amount,
    )

    # mark auction ended
    auction.status = AuctionStatus.ENDED
    auction.save()

    # notifications
    Notification.objects.create(
        user=winner,
        notification_type='auction_won',
        message_ar=f"ربحت المزاد #{auction.id} بمبلغ {winning_amount}. يرجى إتمام الدفع لتأكيد طلبك.",
        message_en=f"You won auction #{auction.id} for {winning_amount}. Please complete payment to confirm your order.",
        content_object=order,
    )
    return {"status": "ended_sold", "order_id": order.id}


@transaction.atomic
def cancel_auction(auction_id: int, actor: User, is_admin=False):
    """Cancel an auction. Admin can cancel anytime."""
    auction = Auction.objects.select_for_update().get(pk=auction_id)

    top_bid = auction.bids.order_by('-amount', '-created_at').first()
    if top_bid:
        Notification.objects.create(
            user=top_bid.bidder,
            notification_type='auction_cancelled',
            message_ar=f"تم إلغاء المزاد {auction.title}.",
            message_en=f"Auction {auction.title} was cancelled.",
            content_object=auction
        )

    # restore reserved stock
    product = auction.product
    product.quantity += auction.quantity
    product.save()

    auction.status = AuctionStatus.CANCELLED
    auction.cancelled_at = timezone.now()
    auction.cancelled_by = actor
    auction.save(update_fields=['status', 'cancelled_at', 'cancelled_by'])

    return auction
