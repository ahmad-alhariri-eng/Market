// types/order.ts
export type OrderStatus =
  | "created"
  | "processing"
  | "completed"
  | "cancelled"
  | "underpaid"
  | "expired";

export type OrderStatusDisplay =
  | "Created"
  | "Processing"
  | "Completed"
  | "Cancelled"
  | "Underpaid"
  | "Expired";

export interface OrderProduct {
  id: number;
  name_en: string;
  name_ar: string;
  price: string;
  images: string[];
}

export interface OrderItem {
  id: number;
  product: OrderProduct;
  seller: string;
  quantity: number;
  price_at_purchase: string;
  total_price: string;
}

export interface Order {
  order_number: string;
  id: number;
  total_amount: string;
  status: OrderStatus;
  status_display: OrderStatusDisplay;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  checkout_url?: string;
  qr_code?: string;
}

export interface CancelOrderResponse {
  status?: OrderStatus;
  refund_amount?: string;
  penalty_percentage?: string;
  penalty_amount?: string;
  delivery_fee_kept?: string;
  error?: string;
}

export interface CreateOrderResponse {
  order_number?: string;
  order_id?: string;
  checkout_url?: string;
  qr_code?: string;
  error?: string;
  detail?: string;
}
