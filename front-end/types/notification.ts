// types/notification.ts
export type NotificationType =
  | "order_created"
  | "order_cancelled"
  | "order_shipped"
  | "order_delivered"
  | "order_completed"
  | "order_claimed"
  | "refund_requested"
  | "system_alert"
  | string;

export type RelatedObjectType = "order" | "product" | "auction" | "returnrequest" | string;

export interface RelatedObject {
  type: RelatedObjectType;
  id: number;
  order_number?: string;
  status?: string;
}

export interface ExtraData {
  delivery_token?: string;
  qr_png_base64?: string;
  expires_at?: string;
  // Add other possible extra data fields
  [key: string]: any;
}

export interface Notification {
  id: number;
  notification_type: NotificationType;
  message_ar: string;
  message_en: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  related_object: RelatedObject | null; // Make it nullable
  extra_data: ExtraData | null;
}

export interface NotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface MarkAsReadResponse {
  status: string;
  read_at: string;
}