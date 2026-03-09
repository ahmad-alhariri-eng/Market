export interface Discount {
  id: number;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  image: string;
}
export type DiscountsResponse = Discount[];
export interface DiscountResponse extends Discount {}
