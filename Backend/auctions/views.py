# auctions/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status,generics
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from .models import Auction, AuctionStatus
from accounts.permissionsUsers import IsSuperAdminOrAdmin
from products.models import Category
from .models import Auction, AuctionStatus
from rest_framework.permissions import IsAuthenticated
from .services import admin_close_auction
from .serializers import AuctionListSerializer
from .serializers import (
    AuctionCreateSerializer, AuctionDetailSerializer,
    PlaceBidSerializer, BidSerializer
)
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from accounts.models import User
from products.models import Category
from .models import Auction, AuctionStatus
from .serializers import AuctionListSerializer
from .services import (
    place_bid,
    activate_scheduled_if_due,
    cancel_auction,
    admin_close_auction,
)
from accounts.permissionsUsers import IsSuperAdminOrAdmin
from notifications.models import Notification

PUBLIC_STATUSES = [
    AuctionStatus.ACTIVE,
    AuctionStatus.ENDED,
]

class AuctionCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def post(self, request):
        ser = AuctionCreateSerializer(data=request.data, context={'request': request})
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        auction = ser.save()
        Notification.objects.create(
            user=request.user,
            notification_type='auction_submitted',
            message_ar=f"تم إرسال مزادك '{auction.title}' للمراجعة.",
            message_en=f"Your auction '{auction.title}' was submitted for review.",
            content_object=auction
        )
        return Response(AuctionDetailSerializer(auction).data, status=201)



class PublicAuctionListView(APIView):
    permission_classes = []  # public

    def get(self, request):
        now = timezone.now()
        qs = Auction.objects.filter(status=AuctionStatus.ACTIVE, start_at__lte=now, end_at__gt=now).order_by('-created_at')
        return Response(AuctionDetailSerializer(qs, many=True).data)

class AuctionDetailView(APIView):
    permission_classes = []  # public

    def get(self, request, pk):
        auction = get_object_or_404(Auction, pk=pk)
        # opportunistic activation
        activate_scheduled_if_due(auction.id)
        auction.refresh_from_db()
        return Response(AuctionDetailSerializer(auction).data)

class PlaceBidView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        ser = PlaceBidSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        amount = ser.validated_data['amount']

        try:
            bid = place_bid(pk, request.user, amount)
            return Response(BidSerializer(bid).data, status=201)

        except (DRFValidationError, DjangoValidationError) as e:
            # normalize message(s)
            detail = getattr(e, "detail", None)
            if isinstance(detail, (list, dict)):
                return Response({"errors": detail}, status=400)
            msg = str(detail or e)
            return Response({"error": msg}, status=400)

        except ValueError as e:
            return Response({"error": str(e)}, status=400)




class AdminCancelAuctionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def post(self, request, pk):
        auction = cancel_auction(pk, actor=request.user, is_admin=True)
        return Response({'status': 'cancelled', 'auction_id': auction.id})

class AdminSettleAuctionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def post(self, request, pk):
            # opportunistically activate, then close
            activate_scheduled_if_due(pk)
            result = admin_close_auction(pk, request.user)
            return Response(result, status=200)



class AdminAllAuctionsView(generics.ListAPIView):
    """
    GET /api/auctions/admin/all/?status=&subcategory_id=&from=&to=
    """
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]
    serializer_class = AuctionListSerializer

    def get_queryset(self):
        qs = (Auction.objects
              .select_related('product', 'product__category', 'creator')
              .order_by('-created_at'))

        status_ = self.request.query_params.get('status')
        if status_:
            qs = qs.filter(status=status_)



        subcat_id = self.request.query_params.get('subcategory_id')
        if subcat_id:
            qs = qs.filter(product__category_id=subcat_id)

        # optional date filters
        from_dt = self.request.query_params.get('from')
        to_dt = self.request.query_params.get('to')
        if from_dt:
            qs = qs.filter(created_at__gte=from_dt)
        if to_dt:
            qs = qs.filter(created_at__lte=to_dt)

        return qs
    


class PublicSubcategoryAuctionsView(generics.ListAPIView):
    """
    GET /api/auctions/public/subcategory/<int:subcategory_id>/?status=
    Public list of auctions for a second-level (child) category.
    """
    permission_classes = []  # public
    serializer_class = AuctionListSerializer

    def get_queryset(self):
        subcat = get_object_or_404(Category, pk=self.kwargs['subcategory_id'])
        # enforce "second-level" (child) category
        if subcat.parent is None:
            # parent category => return empty queryset
            return Auction.objects.none()

        qs = (Auction.objects
              .filter(product__category=subcat, status__in=PUBLIC_STATUSES)
              .select_related('product', 'product__category')
              .order_by('-created_at'))

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        return qs
    
class AdminCloseAuctionView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOrAdmin]

    def post(self, request, pk):
        try:
            result = admin_close_auction(pk, request.user)
            return Response(result, status=status.HTTP_200_OK)
        except Auction.DoesNotExist:
            return Response({"error": "Auction not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class AdminActivateAuctionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]

    def post(self, request, pk):
        activated = activate_scheduled_if_due(pk)
        if activated:
            return Response({"detail": "Auction activated."}, status=200)
        return Response({"detail": "Auction not ready for activation."}, status=400)