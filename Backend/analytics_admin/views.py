# analytics_admin/views.py
from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from accounts.permissionsUsers import IsSuperAdminOrAdmin
from accounts.models import User
from orders.models import Order, OrderItem, OrderStatus
from products.models import Product, Brand
from reviews.models import Review
from auctions.models import Auction, AuctionStatus
from django.utils.dateparse import parse_date


# --- Helpers ---
def _daterange(request, default_days=30):
    """
    Accepts ?from=YYYY-MM-DD&to=YYYY-MM-DD (inclusive of 'to' day).
    Falls back to last N days.
    """
    f = request.query_params.get("from")
    t = request.query_params.get("to")

    if f and t:
        # parse_date returns a date (no time); include whole 'to' day
        start_date = parse_date(f)
        end_date = parse_date(t)
        if start_date and end_date:
            start = timezone.make_aware(timezone.datetime.combine(start_date, timezone.datetime.min.time()))
            end = timezone.make_aware(timezone.datetime.combine(end_date, timezone.datetime.max.time()))
            return start, end

    # fallback: last N days up to now
    end = timezone.now()
    start = end - timedelta(days=default_days)
    return start, end


# 1) High-level KPIs (GMV, completed orders, items, AOV, refunds, users, products, etc.)
class AdminDashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def get(self, request):
        start, end = _daterange(request, default_days=30)

        # GMV = sum of completed order items' total_price
        completed_items = OrderItem.objects.filter(
            order__status=OrderStatus.COMPLETED,
            order__completed_at__gte=start,
            order__completed_at__lt=end,
        )
        gmv = completed_items.aggregate(v=Sum('total_price'))['v'] or Decimal('0.00')
        orders_cnt = completed_items.values('order_id').distinct().count()
        items_cnt = completed_items.aggregate(c=Sum('quantity'))['c'] or 0
        aov = (gmv / orders_cnt) if orders_cnt else Decimal('0.00')

        # Refunds (Returns feature removed)
        refunded_qty = 0
        refund_rate = 0

        # Users & products
        new_users = User.objects.filter(created_at__gte=start, created_at__lte=end).count()
        active_buyers = (Order.objects
                         .filter(created_at__gte=start, created_at__lt=end)
                         .values('buyer_id').distinct().count())
        total_products = Product.objects.count()
        low_stock = Product.objects.filter(quantity__lte=5).count()

        # Queues (moderation workload)

        # Reviews
        avg_rating = Review.objects.aggregate(a=Avg('rating'))['a'] or 0
        reviews_30 = Review.objects.filter(created_at__gte=start, created_at__lt=end).count()

        return Response({
            "window": {"from": start.isoformat(), "to": (end - timedelta(seconds=1)).isoformat()},
            "kpis": {
                "gmv": str(gmv),
                "completed_orders": orders_cnt,
                "items_sold": items_cnt,
                "avg_order_value": str(aov),
                "refund_rate": round(refund_rate, 4),
                "new_users": new_users,
                "active_buyers": active_buyers,
                "total_products": total_products,
                "low_stock_count": low_stock,
                "pending": {
                    "returns": 0,
                },
                "reviews": {
                    "avg_rating": round(float(avg_rating), 2),
                    "count_window": reviews_30
                }
            }
        })


# 2) GMV / Orders over time (chart)
class AdminSalesOverTimeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def get(self, request):
        start, end = _daterange(request, default_days=30)
        qs = (OrderItem.objects
              .filter(order__status=OrderStatus.COMPLETED,
                      order__completed_at__gte=start,
                      order__completed_at__lt=end)
              .values(date=F('order__completed_at__date'))
              .annotate(gmv=Sum('total_price'),
                        orders=Count('order', distinct=True),
                        items=Sum('quantity'))
              .order_by('date'))
        data = [{
            "date": r['date'],
            "gmv": float(r['gmv'] or 0),
            "orders": r['orders'],
            "items": r['items'] or 0
        } for r in qs]
        return Response(data)





# 4) Top products (by revenue or by quantity) in a window
class AdminTopProductsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def get(self, request):
        start, end = _daterange(request, default_days=30)
        metric = request.query_params.get('metric', 'revenue')  # 'revenue' or 'quantity'
        limit = int(request.query_params.get('limit', 10))
        qs = (OrderItem.objects
              .filter(order__status=OrderStatus.COMPLETED,
                      order__completed_at__gte=start,
                      order__completed_at__lt=end)
              .values('product_id', 'product__name_en', 'product__name_ar')
              .annotate(
                  revenue=Sum('total_price'),
                  quantity=Sum('quantity'))
              .order_by('-revenue' if metric == 'revenue' else '-quantity')[:limit])
        data = [{
            "product_id": r['product_id'],
            "name_en": r['product__name_en'],
            "name_ar": r['product__name_ar'],
            "revenue": float(r['revenue'] or 0),
            "quantity": r['quantity'] or 0
        } for r in qs]
        return Response(data)


# 5) Top buyers (by spend or by orders) in a window
class AdminTopBuyersView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def get(self, request):
        start, end = _daterange(request, default_days=30)
        metric = request.query_params.get('metric', 'spend')  # 'spend' or 'orders'
        limit = int(request.query_params.get('limit', 10))
        oi = (OrderItem.objects
              .filter(order__status=OrderStatus.COMPLETED,
                      order__completed_at__gte=start,
                      order__completed_at__lt=end)
              .values('order__buyer_id',
                      'order__buyer__username',
                      'order__buyer__first_name',
                      'order__buyer__last_name',
                      'order__buyer__email')
              .annotate(
                  spend=Sum('total_price'),
                  orders=Count('order', distinct=True),
                  items=Sum('quantity'))
              .order_by('-spend' if metric == 'spend' else '-orders')[:limit])
        data = [{
            "buyer_id": r['order__buyer_id'],
            "username": r['order__buyer__username'],
            "first_name": r['order__buyer__first_name'],
            "last_name": r['order__buyer__last_name'],
            "email": r['order__buyer__email'],
            "spend": float(r['spend'] or 0),
            "orders": r['orders'],
            "items": r['items'] or 0
        } for r in oi]
        return Response(data)



# 7) Ratings distribution (global)
class AdminRatingsDistributionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def get(self, request):
        buckets = {i: 0 for i in range(1, 6)}
        agg = Review.objects.values('rating').annotate(c=Count('id'))
        for row in agg:
            buckets[row['rating']] = row['c']
        avg = Review.objects.aggregate(a=Avg('rating'))['a'] or 0
        return Response({"avg": round(float(avg), 2), "buckets": buckets})


# 8) Inventory health (low stock list)
class AdminLowStockView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def get(self, request):
        threshold = int(request.query_params.get('threshold', 5))
        limit = int(request.query_params.get('limit', 50))
        qs = (Product.objects
              .filter(quantity__lte=threshold)
              .values('id', 'name_en', 'name_ar', 'quantity')
              .order_by('quantity', 'id')[:limit])
        return Response(list(qs))


# 9) Brands stats
class AdminBrandsStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def get(self, request):
        totals = dict(Brand.objects.values('is_active').annotate(c=Count('id')).values_list('is_active', 'c'))
        used = (Product.objects
                .filter(brand__isnull=False)
                .values('brand_id', 'brand__name')
                .annotate(products=Count('id'))
                .order_by('-products')[:10])
        return Response({
            "counts_by_is_active": totals,
            "top_used_brands": [{"brand_id": r['brand_id'], "name": r['brand__name'], "products": r['products']} for r in used]
        })


# 10) Auctions stats
class AdminAuctionsStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def get(self, request):
        totals = dict(Auction.objects.values('status').annotate(c=Count('id')).values_list('status', 'c'))
        active = Auction.objects.filter(status=AuctionStatus.ACTIVE).count()
        ended = Auction.objects.filter(status=AuctionStatus.ENDED).count()
        return Response({
            "totals_by_status": totals,
        })
