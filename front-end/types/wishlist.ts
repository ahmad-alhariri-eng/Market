import { Product } from "./product";

// types/wishlist.ts
export interface WishlistItem {
  id: number;
  product: Product;
  added_at: string;
  has_discount: boolean;
  discount_percentage: number | null;
  current_price: number;
}

export interface Wishlist {
  id: number;
  items: WishlistItem[];
}

export interface AddToWishlistPayload {
  product_id: string | number;
}

export interface RemoveFromWishlistResponse {
  message: string;
}

// Add this interface for the service return type
export interface WishlistService {
  getWishlist: () => Promise<Wishlist>;
  addToWishlist: (data: AddToWishlistPayload) => Promise<Wishlist>;
  removeFromWishlist: (itemId: number) => Promise<RemoveFromWishlistResponse>;
  clearWishlist: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}
