from django.urls import path
from .views import (
    CreateCategoryView,
    UpdateCategoryView,
    DeleteCategoryView,LocalizedCategoryListView,
    ProductCreateView,ProductListView,
    ProductDetailView,
    CategoryProductsView,
    ProductSearchView,
    ParentCategoryListView,
    ChildCategoryListView,
    UpdateProductQuantityView,
    CartView,
    AddToCartView,
    UpdateCartItemView,
    RemoveFromCartView,
    WishlistView,
    AddToWishlistView,
    RemoveFromWishlistView,
    MoveToCartView,
    CreateSaleEventView,
    ActiveSaleEventListView,
    ProductsInSaleView,
    ProductDiscountView,
    BrandListView, BrandCreateView,
    BrandDetailView,
    BrandUpdateView,
    BrandDeleteView,
    CategoryTopProductsView,
    SaleEventDetailView,
    TopBrandsByProductCountView,
    BrandProductsView,
    CreateProductSaleView,
    UpdateProductSaleView,
    DeleteProductSaleView
)
urlpatterns = [
    path('categories/localized/', LocalizedCategoryListView.as_view(), name='localized-category-list'),##  عرض الفئات حسب اللغة من الهيدر لاي شخص
    path('categories/create/', CreateCategoryView.as_view(), name='category-create'),
    path('categories/<int:pk>/', UpdateCategoryView.as_view(), name='category-update'), # Changed update to PUT/PATCH on id
    path('categories/<int:pk>/delete/', DeleteCategoryView.as_view(), name='category-delete'), # Django usually prefers a separate delete view, but keeping /delete/ prefix for safety if PUT and DELETE aren't handled by one generic view 
    path('categories/<int:category_id>/products/create/', ProductCreateView.as_view(), name='ProductCreate'),##  اضافة منتج

     path('admin/brands/', BrandListView.as_view(), name='admin-brand-list'),
    path('admin/sales/product-sales/create/', CreateProductSaleView.as_view(), name='create-product-sale'),
    path('admin/sales/product-sales/<int:pk>/update/', UpdateProductSaleView.as_view(), name='update-product-sale'),
    path('admin/sales/product-sales/<int:pk>/delete/', DeleteProductSaleView.as_view(), name='delete-product-sale'),
    path('', ProductListView.as_view(), name='product-list'),  # List all approved products
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),  # Single product
    path('category/<int:category_id>/products/', CategoryProductsView.as_view(), name='category-products'),
    path('category/<int:category_id>/top_products/', CategoryTopProductsView.as_view(), name='category-products'),
    path('search/', ProductSearchView.as_view(), name='product-search'),
    path('categories/parents/', ParentCategoryListView.as_view(), name='parent-categories'),
    path('categories/<int:parent_id>/children/', ChildCategoryListView.as_view(), name='child-categories'),
    path('update-quantity/<int:product_id>/', UpdateProductQuantityView.as_view(), name='update-product-quantity'),
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', AddToCartView.as_view(), name='add-to-cart'),
    path('cart/update/<int:item_id>/', UpdateCartItemView.as_view(), name='update-cart-item'),
    path('cart/remove/<int:item_id>/', RemoveFromCartView.as_view(), name='remove-from-cart'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/add/', AddToWishlistView.as_view(), name='add-to-wishlist'),
    path('wishlist/remove/<int:item_id>/', RemoveFromWishlistView.as_view(), name='remove-from-wishlist'),
    path('wishlist/move-to-cart/<int:item_id>/', MoveToCartView.as_view(), name='move-to-cart'),
    path('sales/active/', ActiveSaleEventListView.as_view(), name='active-sales'),
    path('sales/<int:sale_id>/products/', ProductsInSaleView.as_view(), name='sale-products'),
    path('sales/<int:pk>/', SaleEventDetailView.as_view(), name='sale-detail'),
    # Admin endpoints
    path('admin/sales/create/', CreateSaleEventView.as_view(), name='create-sale'),
    path('discounts/<int:pk>/discount/', 
         ProductDiscountView.as_view(), 
         name='product-discount'),
    path('brands/', BrandListView.as_view(), name='brand-list'),                                   # GET approved brands
    path('brands/<int:pk>/', BrandDetailView.as_view(), name='brand-detail'),                      # GET single approved brand

    # Admin Brand Management
    path('brands/create/', BrandCreateView.as_view(), name='brand-create'),                        # POST create brand
    path('brands/<int:pk>/update/', BrandUpdateView.as_view(), name='brand-update'),               # PATCH
    path('brands/<int:pk>/delete/', BrandDeleteView.as_view(), name='brand-delete'),               # DELETE (soft, if unused)

    path('brands/top-by-products/', TopBrandsByProductCountView.as_view(), name='top-brands-by-products'),
    ]