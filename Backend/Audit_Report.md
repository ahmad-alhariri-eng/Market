---
## 📋 Executive Summary
This is a Django backend project acting as an e-commerce or marketplace platform (Store2). It includes product management, auctions, order processing, notifications, user reviews, and payment processing via Stripe. The project is API-first, using Django REST Framework for web and mobile clients.

## 🏗️ Architecture
### App Breakdown:
- **accounts**: User management and authentication (Custom User model, JWT auth, Email verifications).
- **products**: Product listings, categories, brands, sales events, wishlists, and carts.
- **orders**: Order processing, checkout, order status histories, and Stripe payment integration.
- **auctions**: Bidding and auction system for specialized product sales including auto-extend rules.
- **reviews**: User reviews for products with rating.
- **notifications**: System and email notifications, tracking unread statuses.
- **Store2**: Core Django settings and routing.
- **analytics_admin**: Specialized endpoints providing statistical dashboards to administrators (sales, top buyers, stock levels).

### Tech Stack:
- **Framework**: Django 4.2.20, Django REST Framework (DRF)
- **Authentication**: JWT (`rest_framework_simplejwt`)
- **Background Tasks**: Celery with Redis broker
- **API Documentation**: `drf_yasg` (Swagger/OpenAPI)
- **Database**: PostgreSQL (production) / SQLite3 (development)
- **Payment Gateway**: Stripe (handling webhook events)
- **CORS**: `django-cors-headers`

## 📡 API Endpoints — Total: 82

### 1. Accounts API (`/api/auth/`, `/api/profile/`, `/api/users/`, `/api/admins/`)
| # | Method | URL Pattern | View/ViewSet | Auth Required | Description |
|---|--------|-------------|--------------|---------------|-------------|
| 1 | POST | `/api/auth/register/request-code/` | EmailVerificationAPIView | None | Request email verification code for registration |
| 2 | POST | `/api/auth/register/verify-code/` | VerifyCodeAPIView | None | Verify email token/code |
| 3 | POST | `/api/auth/register/resend-code/` | ResendVerificationCodeAPIView | None | Resend email verification code |
| 4 | POST | `/api/auth/register/` | CompleteRegistrationAPIView | None | Complete user registration |
| 5 | POST | `/api/auth/login/` | LoginAPIView | None | User Login (JWT) |
| 6 | POST | `/api/auth/superadmin/login/` | SuperAdminLoginAPIView | None | SuperAdmin Login |
| 7 | POST | `/api/auth/logout/` | LogoutAPIView | IsAuthenticated | User Logout |
| 8 | POST | `/api/auth/password/reset/request/` | RequestPasswordResetCodeView | AllowAny | Request password reset code |
| 9 | POST | `/api/auth/password/reset/verify/` | VerifyResetCodeView | None | Verify password reset code |
| 10 | POST | `/api/auth/password/reset/confirm/` | ResetPasswordView | None | Confirm password reset |
| 11 | POST | `/api/auth/admin/verify-code/` | VerifyAdminCodeAPIView | None | Verify admin access code |
| 12 | GET, PUT | `/api/profile/me/` | UserProfileView | IsAuthenticated | Get/Update user profile |
| 13 | PATCH, DELETE | `/api/profile/me/image/` | UpdateProfileImageView | IsAuthenticated | Update/Delete profile image |
| 14 | POST | `/api/profile/me/email/request/` | RequestEmailChangeAPIView | IsAuthenticated | Request email change |
| 15 | POST | `/api/profile/me/email/confirm/` | ConfirmEmailChangeAPIView | IsAuthenticated | Confirm email change |
| 16 | PATCH | `/api/profile/me/location/` | UpdateMyLocationView | IsAuthenticated | Update profile location (lat/lng) |
| 17 | GET | `/api/users/` | ListUsersView | IsAuthenticated, IsAdmin | List all users |
| 18 | GET | `/api/admins/` | ListAdminsView | IsAuthenticated, IsAdmin | List all admins |
| 19 | GET | `/api/users/<int:user_id>/profile/` | PublicUserProfileView | None | Get a user's public profile |

### 2. Products API (`/api/product/`)
| # | Method | URL Pattern | View/ViewSet | Auth Required | Description |
|---|--------|-------------|--------------|---------------|-------------|
| 20 | GET | `/categories/localized/` | LocalizedCategoryListView | None | Get localized categories |
| 21 | POST | `/categories/create/` | CreateCategoryView | IsAuthenticated, IsSuperAdmin | Create category |
| 22 | PUT | `/categories/<id>/` | UpdateCategoryView | IsAuthenticated, IsSuperAdmin | Update category |
| 23 | DELETE | `/categories/<id>/delete/` | DeleteCategoryView | IsAuthenticated, IsSuperAdmin | Delete category |
| 24 | POST | `/categories/<id>/products/create/` | ProductCreateView | IsAuth, IsSuperAdminOrAdmin | Create product in category |
| 25 | GET | `/admin/brands/` | BrandListView | None | List brands |
| 26 | POST | `/admin/sales/product-sales/create/` | CreateProductSaleView | IsAuth, IsSuperAdminOrAdmin | Create product sale event |
| 27 | PATCH | `/admin/sales/product-sales/<id>/update/` | UpdateProductSaleView | IsAuth, IsSuperAdminOrAdmin | Update product sale event |
| 28 | DELETE | `/admin/sales/product-sales/<id>/delete/` | DeleteProductSaleView | IsAuth, IsSuperAdminOrAdmin | Delete product sale event |
| 29 | GET | `/` | ProductListView | None | List ALL products |
| 30 | GET | `/<id>/` | ProductDetailView | None | View product details |
| 31 | GET | `/category/<id>/products/` | CategoryProductsView | None | List products in a category |
| 32 | GET | `/category/<id>/top_products/` | CategoryTopProductsView | None | Top products in category |
| 33 | GET | `/search/` | ProductSearchView | None | Search products |
| 34 | GET | `/categories/parents/` | ParentCategoryListView | None | List parent categories |
| 35 | GET | `/categories/<id>/children/` | ChildCategoryListView | None | List child categories |
| 36 | PATCH | `/update-quantity/<id>/` | UpdateProductQuantityView | IsAuth, IsSuperAdminOrAdmin | Update product quantity |
| 37 | GET | `/cart/` | CartView | IsAuthenticated | View cart |
| 38 | POST | `/cart/add/` | AddToCartView | IsAuthenticated | Add to cart |
| 39 | PATCH | `/cart/update/<id>/` | UpdateCartItemView | IsAuthenticated | Update cart item |
| 40 | DELETE | `/cart/remove/<id>/` | RemoveFromCartView | IsAuthenticated | Remove from cart |
| 41 | GET | `/wishlist/` | WishlistView | IsAuthenticated | View wishlist |
| 42 | POST | `/wishlist/add/` | AddToWishlistView | IsAuthenticated | Add to wishlist |
| 43 | DELETE | `/wishlist/remove/<id>/` | RemoveFromWishlistView | IsAuthenticated | Remove from wishlist |
| 44 | POST | `/wishlist/move-to-cart/<id>/` | MoveToCartView | IsAuthenticated | Move item to cart |
| 45 | GET | `/sales/active/` | ActiveSaleEventListView | None | List active sales |
| 46 | GET | `/sales/<id>/products/` | ProductsInSaleView | None | Products in a sale |
| 47 | GET | `/sales/<id>/` | SaleEventDetailView | AllowAny | Sale event details |
| 48 | POST | `/admin/sales/create/` | CreateSaleEventView | IsAuthenticated, IsAdmin | Create sale event |
| 49 | PATCH | `/discounts/<id>/discount/` | ProductDiscountView | IsAuth, IsSuperAdminOrAdmin | Apply product discount |
| 50 | GET | `/brands/` | BrandListView | None | List approved brands |
| 51 | GET | `/brands/<id>/` | BrandDetailView | None | View approved brand |
| 52 | POST | `/brands/create/` | BrandCreateView | IsAuth, IsSuperAdminOrAdmin | Create brand |
| 53 | PATCH | `/brands/<id>/update/` | BrandUpdateView | IsAuth, IsSuperAdminOrAdmin | Update brand |
| 54 | DELETE | `/brands/<id>/delete/` | BrandDeleteView | IsAuth, IsSuperAdminOrAdmin | Delete brand |
| 55 | GET | `/brands/top-by-products/` | TopBrandsByProductCountView | None | Top brands |

### 3. Orders API (`/api/orders/`)
| # | Method | URL Pattern | View/ViewSet | Auth Required | Description |
|---|--------|-------------|--------------|---------------|-------------|
| 56 | POST | `/checkout/` | CheckoutView | None | Checkout order |
| 57 | GET | `/` | OrderListView | IsAuthenticated | List orders |
| 58 | POST | `/<id>/cancel/` | CancelOrderView | IsAuthenticated | Cancel order |
| 59 | GET | `/<id>/` | OrderDetailView | IsAuthenticated | View order details |
| 60 | POST | `/<id>/pay/` | PayOrderView | IsAuthenticated | Pay for order |
| 61 | POST | `/webhook/` | PaymentWebhookView | None | Verified fulfillment endpoint for Stripe |

### 4. Auctions API (`/api/auctions/`)
| # | Method | URL Pattern | View/ViewSet | Auth Required | Description |
|---|--------|-------------|--------------|---------------|-------------|
| 61 | GET | `/` | PublicAuctionListView | None | List public auctions |
| 62 | GET | `/<id>/` | AuctionDetailView | None | View auction details |
| 63 | GET | `/public/subcategory/<id>/` | PublicSubcategoryAuctionsView | None | List auctions by subcategory |
| 64 | POST | `/create/` | AuctionCreateView | IsSuperAdminOrAdmin | Create auction |
| 65 | POST | `/<id>/bid/` | PlaceBidView | None | Place a bid |
| 66 | GET | `/admin/all/` | AdminAllAuctionsView | IsSuperAdminOrAdmin | List all auctions (admin) |
| 67 | POST | `/admin/<id>/cancel/` | AdminCancelAuctionView | IsSuperAdminOrAdmin | Cancel auction |
| 68 | POST | `/admin/<id>/settle/` | AdminSettleAuctionView | IsSuperAdminOrAdmin | Settle auction |
| 69 | POST | `/admin/auctions/<id>/close/` | AdminCloseAuctionView | IsAuth, IsSuperAdminOrAdmin | Close auction |
| 70 | POST | `/admin/<id>/activate/` | AdminActivateAuctionView | IsSuperAdminOrAdmin | Activate auction |

### 5. Reviews API (`/api/reviews/`)
| # | Method | URL Pattern | View/ViewSet | Auth Required | Description |
|---|--------|-------------|--------------|---------------|-------------|
| 71 | POST | `/` | ReviewCreateView | None | Create review |
| 72 | POST | `/rate/` | RatingOnlyView | None | Submit a rating only |
| 73 | GET | `/product/<id>/` | ProductReviewsListView | None | Product reviews |
| 74 | GET | `/mine/` | MyReviewsListView | None | My reviews |
| 75 | GET | `/<id>/` | ReviewDetailView | None | Review detail |
| 76 | PATCH/DELETE| `/<id>/edit/` | ReviewUpdateDeleteView | IsOwner | Edit or delete review |

### 6. Notifications API (`/api/notifications/`)
| # | Method | URL Pattern | View/ViewSet | Auth Required | Description |
|---|--------|-------------|--------------|---------------|-------------|
| 83 | GET | `/` | NotificationListView | IsAuthenticated | List notifications |
| 84 | POST | `/<id>/read/` | MarkAsReadView | IsAuthenticated | Mark notification as read |
| 85 | GET | `/unread-count/` | UnreadCountView | IsAuthenticated | Unread notification count |
| 86 | POST | `/mark-all-read/` | MarkAllAsReadView | IsAuthenticated | Mark all as read |

### 7. Analytics Admin API (`/api/analytics/admin/`)
*All require IsSuperAdminOrAdmin permissions*
| # | Method | URL Pattern | View/ViewSet | Auth Required | Description |
|---|--------|-------------|--------------|---------------|-------------|
| 87 | GET | `/summary/` | AdminDashboardSummaryView | IsSuperAdminOrAdmin | Dashboard summary stats |
| 88 | GET | `/sales-over-time/` | AdminSalesOverTimeView | IsSuperAdminOrAdmin | Sales over time |
| 89 | GET | `/top-products/` | AdminTopProductsView | IsSuperAdminOrAdmin | Top products |
| 90 | GET | `/top-buyers/` | AdminTopBuyersView | IsSuperAdminOrAdmin | Top buyers |
| 91 | GET | `/ratings/` | AdminRatingsDistributionView| IsSuperAdminOrAdmin | Ratings distribution |
| 92 | GET | `/low-stock/` | AdminLowStockView | IsSuperAdminOrAdmin | Low stock items |
| 93 | GET | `/brands-stats/` | AdminBrandsStatsView | IsSuperAdminOrAdmin | Brand statistics |
| 94 | GET | `/auctions-stats/` | AdminAuctionsStatsView | IsSuperAdminOrAdmin | Auctions statistics |
| 95 | GET | `/transaction-logs/`| AdminTransactionLogsView | IsSuperAdminOrAdmin | Wallet transaction logs |

## 🔐 Auth & Permissions
- **Mechanism**: JWT Authentication (Bearer token) via `rest_framework_simplejwt`.
- **Permissions Breakdown**: 
    - `AllowAny`: Publicly available endpoints (e.g. login, product search, auction listings).
    - `IsAuthenticated`: Require a valid JWT token.
    - `IsOwner`: Custom permission typically checking if `request.user == obj.user`.
    - `IsSuperAdminOrAdmin`: Custom permission for backend staff roles.
- **Roles**: `User` and `Admin` (`SuperAdmin`). Defined under `Role` model. The authentication views enforce restrictions based on `role` definitions.

## 🗄️ Data Models

### `accounts` Models
- **User (AbstractBaseUser, PermissionsMixin)**: `email`, `username`, `first_name`, `last_name`, `phone_number`, `address`, `role`, `is_active`, `is_staff`, `current_token_user`, `created_at`. Uses `CustomUserManager`.
- **EmailVerification**: Tracks OTP flows with fields like `email`, `role`, `purpose`, `encrypted_code`, `send_count_today`, `first_sent_today`, `last_sent_at`, `is_verified`, `verified_at`, `expires_at`, `current_token`. Unique constraint on `['email', 'purpose']`.
- **Profile**: Extended user details linked One-to-One with User. Contains `bio`, `image`, `latitude`, `longitude`, `address_line`, `city`, `region`, `country`, `postal_code`, `is_certified`.

### `products` Models
- **Brand**: `name`, `slug`, `logo`, `is_active`, `created_at`, `updated_at`.
- **Category**: `name_ar`, `name_en`, `parent` (self-referential FK), `logo`.
- **Product**: `category` (FK), `brand` (FK), `rating`, `name_ar`, `name_en`, `description_ar`, `description_en`, `price`, `quantity`, `has_standalone_discount`, `standalone_discount_percentage`, etc.
- **ProductImage**: `product` (FK), `image`, `uploaded_at`.
- **SaleEvent**: Represents a promotional event. `name_ar`, `name_en`, `start_date`, `end_date`, `image`, `is_active`.
- **ProductSale**: Links `Product` to `SaleEvent` with `discount_percentage`, `start_date`, and `end_date`.
- **Favorite**, **Cart**, **CartItem**, **Wishlist**, **WishlistItem**: Standard relation tables to manage user carts and favorited items.

### `orders` Models
- **Order**: `buyer` (FK User), `order_number`, `total_amount`, `status`, `payment_hold_reference`, `completed_at`.
- **OrderItem**: `order` (FK), `product` (FK), `quantity`, `price_at_purchase`, `total_price`.
- **OrderStatusHistory**: Tracks status changes for an Order. `order` (FK), `status`, `changed_by` (FK), `notes`.

### `auctions` Models
- **Auction**: `product` (FK), `quantity`, `title`, `description`, `start_price`, `reserve_price`, `buy_now_price`, `min_increment`, `start_at`, `end_at`, `auto_extend_window_seconds`, `status`.
- **Bid**: `auction` (FK), `bidder` (FK User), `amount`, `created_at`.

### `reviews` Models
- **Review**: `buyer` (FK User), `product` (FK), `order` (FK), `order_item` (FK), `rating`, `title`, `comment`, `is_edited`.

### `notifications` Models
- **Notification**: `user` (FK), `notification_type`, `message_ar`, `message_en`, `is_read`, `extra_data` (JSONField), Support for GenericForeignKey via `content_type` and `object_id`.
- **EmailLog**: Detailed tracking of sent emails. `order` (1:1), `recipient_email`, `subject`, `status`, `error_message`, `retry_count`.

## ⚙️ Business Logic & Features
1. **User Management**:
   - Secure stateless authentication using `rest_framework_simplejwt`.
   - Advanced multi-step verification flows using OTP to Email for registration and password resets.
   - Profile management with dynamic geographic locations (lat/lng constraints).

2. **E-commerce Core**:
   - Multi-vendor style listings with strict associations to Categories and global Brands.
   - Time-bounded SaleEvents that modify pricing dynamically via `ProductSale`.

3. **Auctions System**:
   - Allows placing competitive bids on single or multiple quantity items.
   - Extends closing times automatically if active bidding occurs right before the end time (via Celery logic / tasks).

4. **Background Async Tasks (Celery)**:
   - **Emails**: Notifications and OTPs decoupled into the Celery queue. EmailLogs track delivery state with automated retry/exponential backoff algorithms.
   - **Sales Expiration**: Worker to automatically disable expired sales and campaigns. 
   - **Orders Workflow**: Completes orders successfully upon passing duration checks.

5. **Payments**:
   - Direct Stripe integration for secure checkouts.
   - Stripe incoming webhook handler for robust order fulfillment logic without intermediate wallet dependencies.

## 🚨 Observations & Recommendations

**Security Flags & Missing Validations:**
1. **Settings Hardcoding:** The project defaults to insecure strings if environment variables are missing (e.g., `SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-insecure-key-change-me')`). It is heavily advised to fail entirely in production if `SECRET_KEY` is not present.
2. **Missing JWT Verifying Key:** In `settings.py`, `VERIFYING_KEY` is None, suggesting it uses symmetric `SIGNING_KEY` (HS256). Moving to asymmetric (RS256) improves scaled security.
3. **Overly Lenient Throttling:** `AnonRateThrottle` handles 1,000 requests/minute. Standard DDOS and brute-force protections typically cap anonymous connections much tighter (e.g., 20/min for auth endpoints).

**Performance Considerations:**
1. Custom Header Extractions (e.g., `X-Email-Token` in Accounts App vs standard `Authorization`). While it enforces security layers during registration, caching layers (like Nginx) might drop unrecognized headers without specific allow-list configuration.

**Code Quality / Consistency:**
1. **URL Naming Consistency:** App routes mix between trailing slashes and non-trailing slashes heavily (e.g., `path('admin/brands/',...)` vs `path('categories/<int:pk>/delete/', ...)`). Ensure DRF routers are used wherever possible to standardize URLs automatically.
2. **Empty Task Implementations:** The `auctions/tasks.py` is empty (commented out), possibly a sign of unresolved auction extension or expiration schedules needing active Celery beats that were moved out.
---
