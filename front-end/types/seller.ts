import { Brand } from "./brands";
import { Seller } from "./product";

// types/seller.ts
export interface SellerKPIs {
  revenue_all: string;
  orders_all: number;
  items_all: number;
  avg_order_value: string;
  revenue_30d: string;
  orders_30d: number;
  refund_rate_30d: number;
  low_stock_count: number;
  rating_avg: number;
  points: number;
  rank: string;
  is_verified_seller: boolean;
}

export interface SellerWallet {
  balance: string;
  held_balance: string;
}

export interface SellerSummary {
  kpis: SellerKPIs;
  wallet: SellerWallet;
}

export interface OrdersOverTime {
  date: string | null;
  revenue: number;
  orders: number;
  items: number;
}

export interface TopProduct {
  product_id: number;
  name_en: string;
  name_ar: string;
  revenue: number;
  quantity: number;
}

export interface LowStockProduct {
  id: number;
  name_en: string;
  name_ar: string;
  quantity: number;
}

export interface ReturnByReason {
  reason: string;
  qty: number;
}

export interface ReturnsData {
  total_returned_qty: number;
  by_reason: ReturnByReason[];
}

export interface RatingsData {
  avg: number;
  buckets: {
    [key: string]: number;
  };
}

// types/product.ts - Update interfaces

export interface ProductDetail {
  id: number;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: string;
  current_price: number;
  category_id: number;
  category_name: string;
  parent_category_name: string | null;
  parent_category_id: string | null;
  created_at: string;
  updated_at: string;
  is_approved: boolean;
  status: string;
  images: string[];
  quantity: number;
  has_active_discount: boolean;
  has_standalone_discount: boolean;
  standalone_discount_percentage: number | null;
  standalone_discount_start: string | null;
  standalone_discount_end: string | null;
  discount_percentage: number | null;
  seller_id: number;
  brand_id: number | null;
  brand_name: string | null;
  brand_slug: string | null;
  rating: string | null;
  ratings_count: number;
  disapproval_reason_ar: string | null;
  disapproval_reason_en: string | null;
  condition: string;
}

export interface ProductDetailResponse {
  product: ProductDetail;
  seller: Seller;
  brand: Brand | null;
}
