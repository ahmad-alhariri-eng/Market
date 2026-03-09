// types/discount.ts
export interface ProductDiscount {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_current_price: number;
  has_active_discount: boolean;
  has_standalone_discount: boolean;
  standalone_discount_percentage: number | null;
  standalone_discount_start: string | null;
  standalone_discount_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiscountFormData {
  has_standalone_discount: boolean;
  standalone_discount_percentage?: number;
  standalone_discount_start?: string;
  standalone_discount_end?: string;
}

export interface DiscountResponse {
  message: string;
  product_id: number;
  discount: ProductDiscount;
}
