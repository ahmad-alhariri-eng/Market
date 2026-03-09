// types/cart.ts
import { Product } from "./product";

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  added_at: string;
  max_available: number;
  current_price: number; // This should be number
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  total_price: number; // Changed from string to number
  total_discount: number;
}

export interface AddToCartPayload {
  product_id: string | number;
  quantity: string | number;
}

export interface UpdateCartItemPayload {
  quantity: string | number;
}
