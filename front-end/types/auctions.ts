// types/auction.ts
export interface Auction {
  id: number;
  status:
    | "draft"
    | "pending"
    | "approved"
    | "active"
    | "ended"
    | "cancelled"
    | "completed";
  start_at: string;
  end_at: string;
  start_price: string;
  min_increment: string;
  created_at: string;
  product_id: number;
  product_name: string;
  subcategory_id: number;
  seller_id: number;
  seller_email: string;
  top_bid: string | null;
  title?: string;
  description?: string;
  quantity?: number;
  reserve_price?: string;
  buy_now_price?: string;
}

export interface CreateAuctionData {
  title: string;
  description: string;
  product_id: number;
  quantity: number;
  start_price: string;
  reserve_price: string;
  buy_now_price: string;
  min_increment: string;
  start_at: string;
  end_at: string;
}

export interface SellerProduct {
  id: number;
  name: string;
  price: string;
  quantity: number;
  images: string[];
  is_approved: boolean;
  created_at: string;
}

export interface PublicAuction {
  id: number;
  title: string;
  description: string;
  status:
    | "draft"
    | "pending"
    | "approved"
    | "active"
    | "ended"
    | "cancelled"
    | "completed";
  rejection_reason: string | null;
  product: {
    id: number;
    name_en: string;
    name_ar: string;
    price: string;
  };
  quantity: number;
  start_price: string;
  reserve_price: string;
  buy_now_price: string;
  min_increment: string;
  start_at: string;
  end_at: string;
  auto_extend_window_seconds: number;
  auto_extend_seconds: number;
  approved_at: string | null;
  highest_bid: {
    id: number;
    bidder: number;
    amount: string;
    created_at: string;
  } | null;
  current_price: string;
  seller_id?: number; // Add seller_id to identify auction owner
  seller_email?: string; // Add seller email for display
}
export interface CategoryAuction {
  id: number;
  status: string;
  start_at: string;
  end_at: string;
  start_price: string;
  min_increment: string;
  created_at: string;
  product_id: number;
  product_name: string;
  subcategory_id: number;
  seller_id: number;
  seller_email: string;
  top_bid: string | null;
}

export interface BidData {
  amount: string;
}

export interface BidResponse {
  id: number;
  auction: number;
  bidder: number;
  amount: string;
  created_at: string;
}

export interface BidError {
  errors: string[];
}
