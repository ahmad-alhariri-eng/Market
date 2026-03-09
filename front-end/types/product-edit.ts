import { Product } from "./product";

// types/product-edit.ts
export interface ProductEditRequest {
  id: number;
  product: number;
  name_ar?: string | null;
  name_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  price?: string | null;
  category?: number | null;
  brand?: number | null;
  quantity?: number | null;
  new_images?: string[];
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  created_at: string;
  current_product_data: Product;
}

export interface ProductEditFormData {
  name_ar?: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
  price?: number;
  category?: number;
  brand?: number;
  quantity?: number;
  new_images?: File[];
}

export interface ProductEditResponse {
  id: number;
  product: number;
  name_ar?: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
  price: string;
  category?: number;
  brand?: number;
  quantity: number;
  new_images?: string[];
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  created_at: string;
  current_product_data?: Product;
}
