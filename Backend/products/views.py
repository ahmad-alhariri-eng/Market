from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.forms import ValidationError
from django.db.models import Count
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from notifications.models import Notification
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from accounts.permissionsUsers import (
    IsSuperAdmin, IsAdmin,
    IsSuperAdminOrAdmin
)

from .models import (
    Category, Product, ProductImage, WishlistItem,
    Wishlist, Cart, CartItem, SaleEvent, ProductSale,Brand
)


from .serializers import (
    ProductSerializer, CartSerializer, CartItemSerializer,
    ProductLanguageSerializer, SaleEventSerializer,
    ProductSaleSerializer, WishlistItemSerializer,
    WishlistSerializer, CreateProductSaleSerializer,
    UpdateProductSaleSerializer, ProductDiscountSerializer,
    CategorySerializer,BrandSerializer, BrandCreateSerializer, 
    BrandReadSerializer,BrandUpdateSerializer
)

class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer

class TopBrandsByProductCountView(APIView):
    permission_classes = []  # Public access
    
    def get(self, request):
        # Get top 5 brands with most products
        top_brands = Brand.objects.annotate(
            product_count=Count('products')
        ).filter(
            is_active=True
        ).order_by('-product_count')[:5]  # Get top 5 only
        
        serializer = BrandSerializer(top_brands, many=True, context={'request': request})
        
        # Add product counts to the response
        response_data = []
        for brand, data in zip(top_brands, serializer.data):
            response_data.append({
                **data,
                'product_count': brand.product_count
            })
        
        return Response({
            'count': len(response_data),
            'results': response_data
        })

class BrandCreateView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOrAdmin]
    def post(self, request):
        ser = BrandCreateSerializer(data=request.data, context={'request': request})
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        brand = ser.save()
        return Response(BrandSerializer(brand).data, status=201)
     
class BrandUpdateView(generics.UpdateAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandUpdateSerializer
    permission_classes = [IsAuthenticated, IsSuperAdminOrAdmin]

    def get_object(self):
        brand = get_object_or_404(Brand, pk=self.kwargs['pk'], is_active=True)
        return brand

class BrandDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOrAdmin]

    def delete(self, request, pk):
        brand = get_object_or_404(Brand, pk=pk, is_active=True)
        from products.models import Product
        if Product.objects.filter(brand=brand).exists():
            return Response({"error": "Cannot delete a brand that is used by products."}, status=400)
        brand.is_active = False  # soft delete
        brand.save(update_fields=['is_active'])
        return Response(status=204)

class BrandDetailView(generics.RetrieveAPIView):
    serializer_class = BrandReadSerializer
    permission_classes = []
    queryset = Brand.objects.filter(is_active=True)

    def get_serializer_context(self):
        return {'request': self.request}

class BrandProductsView(APIView):
    permission_classes = [AllowAny]  # public (for approved brands)

    def get(self, request, brand_id=None, slug=None):
        """
        List approved products for an approved brand.
        Access:
          - /api/product/brands/<int:brand_id>/products/
          - /api/product/brands/slug/<slug:slug>/products/
        """
        # language like elsewhere
        lang = request.headers.get('Accept-Language', 'ar').lower()
        if lang not in ['ar', 'en']:
            lang = 'ar'

        # find the brand
        if brand_id is not None:
            brand = get_object_or_404(Brand, pk=brand_id)
        else:
            brand = get_object_or_404(Brand, slug__iexact=slug)

        qs = Product.objects.filter(brand=brand).order_by('-created_at')

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = ProductLanguageSerializer(page, many=True, context={
            'lang': lang,
            'request': request,
            'show_discount_price': True
        })
        return paginator.get_paginated_response(serializer.data)

class CreateCategoryView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request):
        name_ar = request.data.get('name_ar')
        name_en = request.data.get('name_en')
        parent_id = request.data.get('parent_id')
        logo = request.FILES.get('logo')  # Get the uploaded logo file

        if not name_ar or not name_en:
            return Response({'error': 'يجب إدخال الاسم بالعربي والإنجليزي.'}, status=400)

        # Check for duplicate names at the same level
        duplicate_filter = Q(name_ar__iexact=name_ar) | Q(name_en__iexact=name_en)
        if parent_id:
            duplicate_filter &= Q(parent_id=parent_id)
        else:
            duplicate_filter &= Q(parent__isnull=True)

        if Category.objects.filter(duplicate_filter).exists():
            return Response({'error': 'اسم الفئة موجود مسبقًا في هذا المستوى.'}, status=400)

        parent = None
        if parent_id:
            try:
                parent = Category.objects.get(pk=parent_id)
                
                # Prevent selecting a child category as parent
                if parent.parent:
                    return Response(
                        {'error': 'لا يمكن اختيار قسم فرعي كقسم رئيسي.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
            except Category.DoesNotExist:
                return Response({'error': 'الفئة الرئيسية غير موجودة.'}, status=404)

        # Create the category with logo if provided
        category_data = {
            'name_ar': name_ar,
            'name_en': name_en,
            'parent': parent
        }
        
        if logo:
            # Validate it's an image file
            if not logo.content_type.startswith('image/'):
                return Response({'error': 'يجب رفع ملف صورة فقط للشعار.'}, status=400)
            category_data['logo'] = logo

        category = Category.objects.create(**category_data)
        
        serializer = CategorySerializer(category, context={'request': request})
        return Response({
            'message': 'تم إنشاء الفئة بنجاح.',
            'category': serializer.data
        }, status=201)

class UpdateCategoryView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def put(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response({'error': 'الفئة غير موجودة.'}, status=404)

        name_ar = request.data.get('name_ar')
        name_en = request.data.get('name_en')
        parent_id = request.data.get('parent_id')

        if not name_ar or not name_en:
            return Response({'error': 'الاسم العربي والإنجليزي مطلوبان.'}, status=400)

        # Check for duplicate names at the same level
        duplicate_filter = (Q(name_ar__iexact=name_ar) | Q(name_en__iexact=name_en)) & ~Q(pk=pk)
        if parent_id:
            duplicate_filter &= Q(parent_id=parent_id)
        else:
            duplicate_filter &= Q(parent__isnull=True)

        if Category.objects.filter(duplicate_filter).exists():
            return Response({'error': 'اسم الفئة موجود مسبقًا في هذا المستوى.'}, status=400)

        # Prevent making a category its own parent
        if parent_id and int(parent_id) == pk:
            return Response({'error': 'لا يمكن جعل الفئة ابنة لنفسها.'}, status=400)

        # Prevent changing parent if category has children
        if category.children.exists() and parent_id and category.parent_id != int(parent_id):
            return Response({'error': 'لا يمكن تغيير المستوى لفئة لديها أقسام فرعية.'}, status=400)

        parent = None
        if parent_id:
            try:
                parent = Category.objects.get(pk=parent_id)
                
                # NEW VALIDATION: Prevent selecting a child category as parent
                if parent.parent:
                    return Response(
                        {'error': 'لا يمكن اختيار قسم فرعي كقسم رئيسي.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
                # NEW VALIDATION: Prevent circular relationships
                if self._is_circular_relationship(category, parent):
                    return Response(
                        {'error': 'لا يمكن إنشاء علاقة دائرية بين الأقسام.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
            except Category.DoesNotExist:
                return Response({'error': 'الفئة الرئيسية غير موجودة.'}, status=404)

        category.name_ar = name_ar
        category.name_en = name_en
        category.parent = parent
        category.save()

        return Response({'message': 'تم تحديث الفئة بنجاح.'})
    
    def _is_circular_relationship(self, category, potential_parent):
        """
        Check if assigning potential_parent as parent would create a circular relationship
        """
        # If the potential parent is already a child of this category
        current = potential_parent
        while current is not None:
            if current.id == category.id:
                return True
            current = current.parent
        return False
    
class DeleteCategoryView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
            
            # Prevent deletion if category has children
            if category.children.exists():
                return Response({'error': 'لا يمكن حذف فئة لديها أقسام فرعية.'}, status=400)
                
            # Prevent deletion if category has products
            if category.products.exists():
                return Response({'error': 'لا يمكن حذف فئة تحتوي على منتجات.'}, status=400)
                
            category.delete()
            return Response({'message': 'تم حذف الفئة بنجاح.'})
        except Category.DoesNotExist:
            return Response({'error': 'الفئة غير موجودة.'}, status=404)

class LocalizedCategoryListView(APIView):
    permission_classes = []  # Accessible to everyone
    
    def get(self, request):
        language = request.headers.get('Accept-Language', 'ar').lower()
        if language not in ['ar', 'en']:
            language = 'ar'

        # Get all parent categories with their children
        parent_categories = Category.objects.filter(parent__isnull=True).prefetch_related('children')
        
        results = []
        for parent in parent_categories:
            parent_data = {
                'id': parent.id,
                'name': parent.name_ar if language == 'ar' else parent.name_en,
                'logo': request.build_absolute_uri(parent.logo.url) if parent.logo else None,
                'children': [],
            }
            
            for child in parent.children.all():
                parent_data['children'].append({
                    'id': child.id,
                    'name': child.name_ar if language == 'ar' else child.name_en,
                    'logo': request.build_absolute_uri(child.logo.url) if child.logo else None,
                })
            
            results.append(parent_data)

        return Response(results)

class ParentCategoryListView(APIView):
    permission_classes = []
    
    def get(self, request):
        lang = request.headers.get('Accept-Language', 'ar').lower()
        if lang not in ['ar', 'en']:
            lang = 'ar'
        
        parent_categories = Category.objects.filter(parent__isnull=True)
        results = []
        
        for cat in parent_categories:
            results.append({
                'id': cat.id,
                'name': cat.name_ar if lang == 'ar' else cat.name_en,
                'has_children': cat.children.exists()
            })
        
        return Response(results)

class ChildCategoryListView(APIView):
    permission_classes = []
    
    def get(self, request, parent_id):
        lang = request.headers.get('Accept-Language', 'ar').lower()
        if lang not in ['ar', 'en']:
            lang = 'ar'
        
        parent = get_object_or_404(Category, id=parent_id)
        children = parent.children.all()
        
        results = []
        for child in children:
            results.append({
                'id': child.id,
                'name': child.name_ar if lang == 'ar' else child.name_en
            })
        
        return Response(results)

class ProductCreateView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOrAdmin]

    def post(self, request, category_id):

        quantity = request.data.get('quantity', 1)  # Default to 1 if not provided

        try:
            quantity = int(quantity)
            if quantity < 0:
                return Response(
                    {"error": "Quantity must be a positive number"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid quantity value"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # التحقق من وجود الفئة
        category = get_object_or_404(Category, id=category_id)
        
        # Changed from if not category.is_child:
        if not category.parent:  # This checks if it's a parent category
            return Response(
                {"error": "يجب اختيار قسم فرعي وليس رئيسي"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # التحقق من المدخلات الأساسية
        name_ar = request.data.get('name_ar')
        name_en = request.data.get('name_en')
        description_ar = request.data.get('description_ar')
        description_en = request.data.get('description_en')
        price = request.data.get('price')
        images = request.FILES.getlist('images')
        brand_id = request.data.get('brand_id')
        brand = None
        if brand_id is not None and str(brand_id).strip() != "":
            try:
                brand = Brand.objects.get(pk=brand_id)
            except Brand.DoesNotExist:
                return Response({"error": "Brand not found"}, status=status.HTTP_404_NOT_FOUND)

        if not all([name_ar, name_en, description_ar, description_en, price]):
            return Response({"error": "جميع الحقول النصية مطلوبة"}, status=status.HTTP_400_BAD_REQUEST)

        if len(images) == 0:
            return Response({"error": "يجب رفع صورة واحدة على الأقل للمنتج"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            price = float(price)
            if price <= 0:
                return Response({"error": "يجب أن يكون السعر رقمًا موجبًا"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "السعر يجب أن يكون رقمًا صحيحًا أو عشريًا"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                product = Product.objects.create(
                    category=category,
                    quantity=quantity,
                    name_ar=name_ar,
                    name_en=name_en,
                    description_ar=description_ar,
                    description_en=description_en,
                    price=price,
                    brand=brand
                )

                for image in images:
                    if not image.content_type.startswith('image/'):
                        raise ValidationError("يجب رفع ملفات صور فقط")
                    ProductImage.objects.create(product=product, image=image)

                serializer = ProductSerializer(product)
                return Response({
                    "message": "تم إنشاء المنتج بنجاح",
                    "product": serializer.data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def paginate_queryset(self, queryset, request, view=None):
        """
        Add page number validation and total pages count
        """
        self.request = request  # Store the request object for link generation
        page_size = self.get_page_size(request)
        paginator = self.django_paginator_class(queryset, page_size)
        page_number = request.query_params.get(self.page_query_param, 1)
        
        try:
            page_number = int(page_number)
        except (TypeError, ValueError):
            raise NotFound("Invalid page number. Please provide a positive integer.")
            
        if page_number < 1:
            raise NotFound("Invalid page number. Pages start from 1.")
            
        try:
            self.page = paginator.page(page_number)
        except:
            raise NotFound("Invalid page number. Page does not exist.")
            
        self.total_pages = paginator.num_pages
        return list(self.page)
    
    def get_paginated_response(self, data):
        """
        Include total pages in response with proper request context for links
        """
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.total_pages,
            'current_page': self.page.number,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })

class ProductListView(APIView):
    permission_classes = []  # Accessible to anyone
    
    def get(self, request):
        lang = request.headers.get('Accept-Language', 'ar').lower()
        if lang not in ['ar', 'en']:
            lang = 'ar'
        
        # Get all filter parameters
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        min_rating = request.query_params.get('min_rating')
        max_rating = request.query_params.get('max_rating')
        category_id = request.query_params.get('category_id')
        parent_category_id = request.query_params.get('parent_category_id')
        min_quantity = request.query_params.get('min_quantity')
        max_quantity = request.query_params.get('max_quantity')
        in_stock = request.query_params.get('in_stock')
        has_discount = request.query_params.get('has_discount')
        brand_id = request.query_params.get('brand_id')
        brand_slug = request.query_params.get('brand_slug')
        brand_name = request.query_params.get('brand_name')
        # Get sorting parameters
        sort_by = request.query_params.get('sort_by', '-created_at')  # Default: newest first
        sort_direction = request.query_params.get('sort_direction', 'desc')  # Default: descending
        
        # Validate sort options
        valid_sort_fields = ['price', 'created_at', 'rating']
        if sort_by not in valid_sort_fields:
            sort_by = 'created_at'
        
        # Validate sort direction
        sort_direction = sort_direction.lower()
        if sort_direction not in ['asc', 'desc']:
            sort_direction = 'desc'
        
        # Build sort parameter
        sort_prefix = '' if sort_direction == 'asc' else '-'
        sort_param = f"{sort_prefix}{sort_by}"
        
        # Start with base queryset
        products = Product.objects.all()
        
        # Apply category filters
        if category_id:
            products = products.filter(category_id=category_id)
        elif parent_category_id:
            products = products.filter(category__parent_id=parent_category_id)
        
        # Apply price filters
        if min_price:
            try:
                products = products.filter(price__gte=float(min_price))
            except (ValueError, TypeError):
                pass
                
        if max_price:
            try:
                products = products.filter(price__lte=float(max_price))
            except (ValueError, TypeError):
                pass
        
        # Apply rating filters
        if min_rating:
            try:
                products = products.filter(rating__gte=float(min_rating))
            except (ValueError, TypeError):
                pass
                
        if max_rating:
            try:
                products = products.filter(rating__lte=float(max_rating))
            except (ValueError, TypeError):
                pass

        # Apply quantity filters
        if min_quantity:
            try:
                products = products.filter(quantity__gte=int(min_quantity))
            except (ValueError, TypeError):
                pass
                
        if max_quantity:
            try:
                products = products.filter(quantity__lte=int(max_quantity))
            except (ValueError, TypeError):
                pass
                
        # Apply in-stock filter
        if in_stock and in_stock.lower() in ['true', '1', 'yes']:
            products = products.filter(quantity__gt=0)

        # Apply discount filter
        if has_discount and has_discount.lower() in ['true', '1', 'yes']:
            now = timezone.now()
            products = products.filter(
                Q(has_standalone_discount=True) &
                Q(standalone_discount_percentage__isnull=False) &
                (
                    Q(standalone_discount_start__isnull=True) | 
                    Q(standalone_discount_start__lte=now)
                ) &
                (
                    Q(standalone_discount_end__isnull=True) | 
                    Q(standalone_discount_end__gte=now)
                )
            )
        
        if brand_id:
            try:
                products = products.filter(brand_id=int(brand_id))
            except (TypeError, ValueError):
                pass

        if brand_slug:
            products = products.filter(brand__slug__iexact=brand_slug)

        if brand_name:
            products = products.filter(brand__name__icontains=brand_name)
        
        # Apply sorting
        products = products.order_by(sort_param)
        # Pagination with proper request context
        paginator = StandardResultsSetPagination()
        result_page = paginator.paginate_queryset(products, request)
        
        serializer = ProductLanguageSerializer(result_page, many=True, context={
            'lang': lang,
            'request': request,
            'show_discount_price': True
        })
        
        return paginator.get_paginated_response(serializer.data)
    
class ProductDetailView(APIView):
    permission_classes = []  # Accessible to anyone
    
    def get(self, request, pk):
        lang = request.headers.get('Accept-Language', 'ar').lower()
        if lang not in ['ar', 'en']:
            lang = 'ar'
            
        product = get_object_or_404(Product, pk=pk)
        
        # Get basic product data
        product_data = ProductLanguageSerializer(product, context={
            'lang': lang,
            'request': request,
            'show_discount_price': True
        }).data
        
        
        # Add brand info if exists
        brand_data = None
        if product.brand:
            brand_data = {
                'id': product.brand.id,
                'name': product.brand.name,
                'logo': request.build_absolute_uri(product.brand.logo.url) if product.brand.logo else None,
            }
        
        response_data = {
            'product': product_data,
            'brand': brand_data
        }
        
        return Response(response_data)

class CategoryProductsView(APIView):
    permission_classes = []
    
    def get(self, request, category_id):
        lang = request.headers.get('Accept-Language', 'ar').lower()
        if lang not in ['ar', 'en']:
            lang = 'ar'
        
        category = get_object_or_404(Category, pk=category_id)
        
        # If it's a parent category, get products from all its children
        if category.is_parent:
            products = Product.objects.filter(
                category__in=category.children.all()
            ).order_by('-created_at')
        else:
            # If it's a child category, get its products directly
            products = Product.objects.filter(
                category=category
            ).order_by('-created_at')

        # Paginate the results
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(products, request)
        
        serializer = ProductLanguageSerializer(page, many=True, context={
            'lang': lang,
            'request': request
        })
        
        return paginator.get_paginated_response(serializer.data)

class CategoryTopProductsView(APIView):
    permission_classes = []
    
    def get(self, request, category_id):
        lang = request.headers.get('Accept-Language', 'ar').lower()
        if lang not in ['ar', 'en']:
            lang = 'ar'
        
        category = get_object_or_404(Category, pk=category_id)
        
        # If it's a parent category, get products from all its children
        if category.is_parent:
            products = Product.objects.filter(
                category__in=category.children.all()
            ).order_by('-created_at')[:5]  # Limit to 5 products
        else:
            # If it's a child category, get its products directly
            products = Product.objects.filter(
                category=category
            ).order_by('-created_at')[:5]  # Limit to 5 products

        serializer = ProductLanguageSerializer(products, many=True, context={
            'lang': lang,
            'request': request
        })
        return Response({
            'count': products.count(),
            'results': serializer.data
        })

class ProductSearchView(APIView):
    permission_classes = []  # Accessible to anyone
    
    def get(self, request):
        lang = request.headers.get('Accept-Language', 'ar').lower()
        if lang not in ['ar', 'en']:
            lang = 'ar'
        
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({"error": "Search query is required"}, status=400)
        
        # Get all filter parameters
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        min_rating = request.query_params.get('min_rating')
        max_rating = request.query_params.get('max_rating')
        category_id = request.query_params.get('category_id')
        parent_category_id = request.query_params.get('parent_category_id')
        min_quantity = request.query_params.get('min_quantity')
        max_quantity = request.query_params.get('max_quantity')
        in_stock = request.query_params.get('in_stock')
        has_discount = request.query_params.get('has_discount')
        brand_id = request.query_params.get('brand_id')
        brand_slug = request.query_params.get('brand_slug')
        brand_name = request.query_params.get('brand_name')
        
        # Get sorting parameters
        sort_by = request.query_params.get('sort_by', '-created_at')  # Default: newest first
        sort_direction = request.query_params.get('sort_direction', 'desc')  # Default: descending
        
        # Validate sort options
        valid_sort_fields = ['price', 'created_at', 'rating']
        if sort_by not in valid_sort_fields:
            sort_by = 'created_at'
        
        # Validate sort direction
        sort_direction = sort_direction.lower()
        if sort_direction not in ['asc', 'desc']:
            sort_direction = 'desc'
        
        # Build sort parameter
        sort_prefix = '' if sort_direction == 'asc' else '-'
        sort_param = f"{sort_prefix}{sort_by}"
        
        # Base queryset with search
        products = Product.objects.filter(
            Q(name_ar__icontains=query) | 
            Q(description_ar__icontains=query) |
            Q(name_en__icontains=query) | 
            Q(description_en__icontains=query) |
            Q(brand__name__icontains=query)
        )
        
        # Apply category filters
        if category_id:
            products = products.filter(category_id=category_id)
        elif parent_category_id:
            products = products.filter(category__parent_id=parent_category_id)
        
        # Apply price filters
        if min_price:
            try:
                products = products.filter(price__gte=float(min_price))
            except (ValueError, TypeError):
                pass
                
        if max_price:
            try:
                products = products.filter(price__lte=float(max_price))
            except (ValueError, TypeError):
                pass
        
        # Apply rating filters
        if min_rating:
            try:
                products = products.filter(rating__gte=float(min_rating))
            except (ValueError, TypeError):
                pass
                
        if max_rating:
            try:
                products = products.filter(rating__lte=float(max_rating))
            except (ValueError, TypeError):
                pass

        # Apply quantity filters
        if min_quantity:
            try:
                products = products.filter(quantity__gte=int(min_quantity))
            except (ValueError, TypeError):
                pass
                
        if max_quantity:
            try:
                products = products.filter(quantity__lte=int(max_quantity))
            except (ValueError, TypeError):
                pass
                
        # Apply in-stock filter
        if in_stock and in_stock.lower() in ['true', '1', 'yes']:
            products = products.filter(quantity__gt=0)

        # Apply discount filter
        if has_discount and has_discount.lower() in ['true', '1', 'yes']:
            now = timezone.now()
            products = products.filter(
                Q(has_standalone_discount=True) &
                Q(standalone_discount_percentage__isnull=False) &
                (
                    Q(standalone_discount_start__isnull=True) | 
                    Q(standalone_discount_start__lte=now)
                ) &
                (
                    Q(standalone_discount_end__isnull=True) | 
                    Q(standalone_discount_end__gte=now)
                )
            )
        
        # Apply brand filters
        if brand_id:
            try:
                products = products.filter(brand_id=int(brand_id))
            except (TypeError, ValueError):
                pass

        if brand_slug:
            products = products.filter(brand__slug__iexact=brand_slug)

        if brand_name:
            products = products.filter(brand__name__icontains=brand_name)
        
        # Apply sorting
        products = products.order_by(sort_param)

        # Pagination
        paginator = StandardResultsSetPagination()
        result_page = paginator.paginate_queryset(products, request)
        
        serializer = ProductLanguageSerializer(result_page, many=True, context={
            'lang': lang,
            'request': request,
            'show_discount_price': True
        })
        
        return paginator.get_paginated_response(serializer.data)

class UpdateProductQuantityView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOrAdmin]
    
    def patch(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        
        quantity = request.data.get('quantity')
        if quantity is None:
            return Response(
                {"error": "Quantity field is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            quantity = int(quantity)
            if quantity < 0:
                return Response(
                    {"error": "Quantity must be a positive number"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {"error": "Quantity must be a valid integer"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product.quantity = product.quantity + quantity
        product.save()
        
        return Response({
            "message": "Product quantity updated successfully",
            "product_id": product.id,
            "new_quantity": product.quantity
        })

class CartView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from django.db import transaction
        from notifications.models import Notification

        cart, _ = Cart.objects.get_or_create(user=request.user)

        # Safety pass: clamp/remove any lines that exceed current stock
        with transaction.atomic():
            for item in cart.items.select_for_update().select_related('product'):
                p = item.product
                if p.quantity <= 0:
                    item.delete()
                    Notification.objects.create(
                        user=request.user,
                        notification_type='system_alert',
                        message_ar=f"تمت إزالة ({p.name_ar}) من السلة لنفاد المخزون.",
                        message_en=f"{p.name_en} was removed from your cart (out of stock).",
                        content_object=p
                    )
                elif item.quantity > p.quantity:
                    item.quantity = p.quantity
                    item.save(update_fields=['quantity'])
                    Notification.objects.create(
                        user=request.user,
                        notification_type='system_alert',
                        message_ar=f"تم تقليل كمية ({p.name_ar}) إلى {p.quantity} بسبب انخفاض المخزون.",
                        message_en=f"Quantity of {p.name_en} reduced to {p.quantity} due to low stock.",
                        content_object=p
                    )

        serializer = CartSerializer(cart)
        return Response(serializer.data)

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {"error": "Quantity must be a positive integer"},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart, _ = Cart.objects.get_or_create(user=request.user)

        try:
            with transaction.atomic():
                # Check available quantity
                if quantity > product.quantity:
                    return Response(
                        {"error": f"Only {product.quantity} available in stock"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                cart_item, created = CartItem.objects.get_or_create(
                    cart=cart,
                    product=product,
                    defaults={'quantity': quantity}
                )

                if not created:
                    new_quantity = cart_item.quantity + quantity
                    if new_quantity > product.quantity:
                        return Response(
                            {"error": f"Cannot add {quantity} more (only {product.quantity - cart_item.quantity} available)"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    cart_item.quantity = new_quantity
                    cart_item.save()

                serializer = CartSerializer(cart)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        quantity = request.data.get('quantity')

        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {"error": "Quantity must be a positive integer"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Item not found in your cart"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            with transaction.atomic():
                if quantity > cart_item.product.quantity:
                    return Response(
                        {"error": f"Only {cart_item.product.quantity} available in stock"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                cart_item.quantity = quantity
                cart_item.save()
                
                serializer = CartSerializer(cart_item.cart)
                return Response(serializer.data)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class RemoveFromCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
            cart_item.delete()
            return Response(
                {"message": "Item removed from cart"},
                status=status.HTTP_204_NO_CONTENT
            )
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Item not found in your cart"},
                status=status.HTTP_404_NOT_FOUND
            )

class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data)

class AddToWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)

        if WishlistItem.objects.filter(wishlist=wishlist, product=product).exists():
            return Response(
                {"error": "Product already in wishlist"},
                status=status.HTTP_400_BAD_REQUEST
            )

        WishlistItem.objects.create(wishlist=wishlist, product=product)
        
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class RemoveFromWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        try:
            item = WishlistItem.objects.get(
                id=item_id,
                wishlist__user=request.user
            )
            item.delete()
            return Response(
                {"message": "Item removed from wishlist"},
                status=status.HTTP_204_NO_CONTENT
            )
        except WishlistItem.DoesNotExist:
            return Response(
                {"error": "Item not found in your wishlist"},
                status=status.HTTP_404_NOT_FOUND
            )

class MoveToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, item_id):
        try:
            wishlist_item = WishlistItem.objects.get(
                id=item_id,
                wishlist__user=request.user
            )
            
            cart, _ = Cart.objects.get_or_create(user=request.user)
            
            # Check if product already in cart
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=wishlist_item.product,
                defaults={'quantity': 1}
            )
            
            if not created:
                if cart_item.quantity < cart_item.product.quantity:
                    cart_item.quantity += 1
                    cart_item.save()
            
            wishlist_item.delete()
            
            return Response(
                {
                    "message": "Item moved to cart",
                    "cart": CartSerializer(cart).data,
                    "wishlist": WishlistSerializer(wishlist_item.wishlist).data
                },
                status=status.HTTP_200_OK
            )
            
        except WishlistItem.DoesNotExist:
            return Response(
                {"error": "Item not found in your wishlist"},
                status=status.HTTP_404_NOT_FOUND
            )

class ActiveSaleEventListView(APIView):
    permission_classes = []

    def get(self, request):
        now = timezone.now()
        events = SaleEvent.objects.filter(
            start_date__lte=now,
            end_date__gte=now
        )
        
        # Handle language
        lang = request.headers.get('Accept-Language', 'en').lower()
        if lang not in ['ar', 'en']:
            lang = 'en'
        
        data = []
        for event in events:
            event_data = SaleEventSerializer(event, context={'request': request}).data
            data.append({
                'id': event.id,
                'name': event.name_ar if lang == 'ar' else event.name_en,
                'description': event.description_ar if lang == 'ar' else event.description_en,
                'start_date': event.start_date,
                'end_date': event.end_date,
                'image': event_data['image']
            })
        
        return Response(data)

class ProductsInSaleView(APIView):
    permission_classes = []

    def get(self, request, sale_id):
        now = timezone.now()
        products = ProductSale.objects.filter(
            sale_event_id=sale_id,
            sale_event__start_date__lte=now,
            sale_event__end_date__gte=now
        ).select_related('product', 'sale_event')
        
        serializer = ProductSaleSerializer(products, many=True)
        return Response(serializer.data)

class CreateSaleEventView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        # Create a mutable copy of the request data
        data = request.data.dict() if hasattr(request.data, 'dict') else request.data.copy()
        
        # Create serializer with data and context
        serializer = SaleEventSerializer(
            data=data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Save the sale event with the creator user
            sale_event = serializer.save(created_by=request.user)
            
            # Handle image separately if it exists
            if 'image' in request.FILES:
                sale_event.image = request.FILES['image']
                sale_event.save()
            
            # Return the created sale event data
            return Response(
                SaleEventSerializer(sale_event, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SaleEventDetailView(APIView):
    permission_classes = [AllowAny]  # Or set appropriate permissions
    
    def get(self, request, pk):
        try:
            sale_event = SaleEvent.objects.get(pk=pk)
            serializer = SaleEventSerializer(sale_event, context={'request': request})
            return Response(serializer.data)
        except SaleEvent.DoesNotExist:
            return Response(
                {"error": "Sale event not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class CreateProductSaleView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOrAdmin]

    def post(self, request):
        serializer = CreateProductSaleSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateProductSaleView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOrAdmin]

    def patch(self, request, pk):
        sale = get_object_or_404(ProductSale, pk=pk)
        serializer = UpdateProductSaleSerializer(
            sale,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeleteProductSaleView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOrAdmin]

    def delete(self, request, pk):
        sale = get_object_or_404(ProductSale, pk=pk)
        sale.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProductDiscountView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdminOrAdmin]
    
    def patch(self, request, pk):
        if not request.data:
            return Response(
                {"error": "No data provided for update"},
                status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(Product, pk=pk)
        
        serializer = ProductDiscountSerializer(
            product,
            data=request.data,
            partial=True
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            product = serializer.save()
            return Response(
                ProductSerializer(product).data,
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    



