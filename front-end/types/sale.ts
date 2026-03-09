// types/sale.ts
export interface Sale {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  days_until_start: number;
  image: string | null;
  status: "active" | "upcoming" | "ended";
  total_products: number;
}

export interface SaleDetail {
  id: number;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  image: string | null;
}

export interface SaleProduct {
  id: number;
  name_ar: string;
  name_en: string;
  image: string;
}

export interface SaleProductsResponse {
  count: number;
  products: SaleProduct[];
}

export interface AddProductToSaleData {
  product: number;
  sale_event: number;
  discount_percentage: number;
}

export interface AddProductToSaleResponse {
  product: number;
  sale_event: number;
  discount_percentage: string;
}

export interface SalesResponse {
  count: number;
  upcoming_sales: Sale[];
  active_sales?: Sale[]; // Some endpoints might return active sales separately
}

// types/sale.ts (add these interfaces)
export interface SaleParticipationProduct {
  product_id: number;
  product_name_ar: string;
  product_name_en: string;
  product_image: string;
  original_price: number;
  current_price: number;
  discount_percentage: number;
  sale_start_date: string;
  sale_end_date: string;
}

export interface SaleParticipation {
  sale_id: number;
  sale_name_ar: string;
  sale_name_en: string;
  sale_image: string | null;
  sale_start_date: string;
  sale_end_date: string;
  sale_status: "active" | "upcoming" | "ended";
  products: SaleParticipationProduct[];
}

export interface SalesParticipationResponse {
  count: number;
  sales: SaleParticipation[];
}


// types/sale.ts - Add these types

export interface Sale {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  image: string | null;
}

export interface SaleProduct {
  id: number;
  product: {
    id: number;
    price: string;
    current_price: number;
    category_id: number;
    category_name: string;
    parent_category_name: string;
    parent_category_id: number;
    created_at: string;
    is_approved: boolean;
    images: string[];
    quantity: number;
    has_active_discount: boolean;
    seller_id: number;
    brand_name: string | null;
    rating: number | null;
    ratings_count: number;
    name: string;
    description: string;
  };
  sale_event: {
    id: number;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
    image: string | null;
  };
  discount_percentage: string;
  discounted_price: number;
  is_active: boolean;
}

export interface SaleProductsResponse {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: SaleProduct[];
}