// types/product.ts
export interface Product {
  id: number;
  price: string;
  current_price: number;
  category_id: number;
  category_name: string;
  parent_category_name: string | null;
  parent_category_id: string | null;
  created_at: string;
  is_approved: boolean;
  images: string[];
  quantity: number;
  has_active_discount: boolean;
  discount_percentage?: number;
  seller_id: number;
  brand_id?: number;
  brand_name?: string | null;
  brand_slug?: string | null;
  rating: string | null;
  ratings_count: number;
  name: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  description: string;
}

export interface ProductsResponse {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface ProductFilters {
  page?: number;
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: "price" | "rating" | "newest" | "popular";
  sort_order?: "asc" | "desc";
  has_discount?: boolean;
  in_stock?: boolean;
}

export interface ProductQueryParams {
  q?: string;
  page?: number;
  category_id?: number;
  parent_category_id?: number;
  brand_id?: number;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  max_rating?: number;
  min_quantity?: number;
  max_quantity?: number;
  has_discount?: boolean;
  in_stock?: boolean;
  sort_by?: "price" | "rating" | "created_at";
  sort_direction?: "asc" | "desc";
  brand_slug?: string;
  brand_name?: string;
}

export interface CategoryProductsResponse {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface CategoryProductsParams {
  page?: number;
  min_quantity?: number;
  min_price?: number;
  max_price?: number;
  has_discount?: boolean;
  sort_by?: "price" | "rating" | "newest";
  sort_order?: "asc" | "desc";
}

export interface TopProductsResponse {
  count: number;
  results: Product[]; // Reuses the existing Product interface
}

export interface SearchProductsResponse {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export type SortOption = "relevance" | "price" | "rating" | "created_at";
export type SortOrder = "asc" | "desc";

export interface SearchProductsParams {
  q: string;
  page?: number;
  category_id?: number;
  parent_category_id?: number;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  max_rating?: number;
  min_quantity?: number;
  max_quantity?: number;
  has_discount?: boolean;
  in_stock?: boolean;
  sort_by?: SortOption;
  sort_direction?: SortOrder;
  brand_id?: number;
  brand_slug?: string;
  brand_name?: string;
}

// Add this new interface for filter options
export interface FilterOptions {
  sortOptions: {
    value: SortOption;
    label: string;
  }[];
  sortOrders: {
    value: SortOrder;
    label: string;
  }[];
}

// types/product.ts
export interface SellerProfile {
  bio: string | null;
  image: string | null;
  is_certified: boolean;
}

export interface Seller {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  points: number;
  is_verified_seller: boolean;
  profile: SellerProfile;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  // Add other brand properties as needed
}

export interface ProductDetailResponse {
  product: Product;
  seller: Seller;
  brand: Brand | null;
}

// Add to your existing types in types/product.ts
export interface ProductReview {
  id: number;
  product: number;
  product_name: string;
  order: number;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
}

export interface ProductReviewsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductReview[];
}

export interface SellerProduct extends Product {
  disapproval_reason_ar?: string;
  disapproval_reason_en?: string;
}

export interface SellerProductsResponse {
  status_filter: string;
  search_query: string | null;
  sorting: {
    by: string;
    order: string;
  };
  pagination: {
    current_page: number;
    page_size: number;
    total_pages: number;
    total_items: number;
    has_next: boolean;
    has_previous: boolean;
    next_page_number: number | null;
    previous_page_number: number | null;
    next_page_url: string | null;
    previous_page_url: string | null;
  };
  counts: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  products: SellerProduct[];
}

export interface SellerProductsFilters {
  status?: "all" | "pending" | "approved" | "rejected";
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: "created_at" | "updated_at" | "name" | "price";
  sort_order?: "asc" | "desc";
}

// types/product.ts
export interface ProductCreateData {
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  quantity: number;
  category_id: number;
  brand_id?: number;
  images: File[];
}

export interface ProductCreateResponse {
  id: number;
  name: string;
  description: string;
  price: string;
  current_price: number;
  category_id: number;
  category_name: string;
  parent_category_name: string | null;
  parent_category_id: string | null;
  created_at: string;
  is_approved: boolean;
  images: string[];
  quantity: number;
  has_active_discount: boolean;
  discount_percentage?: number;
  seller_id: number;
  brand_id?: number;
  brand_name?: string | null;
  brand_slug?: string | null;
  rating: string | null;
  ratings_count: number;
}

export interface ProductCreateErrors {
  name_ar?: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
  price?: string;
  quantity?: string;
  category_id?: string;
  brand_id?: string;
  images?: string;
}
