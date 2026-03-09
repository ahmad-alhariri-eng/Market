// types/brand.ts
export enum BrandStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export type Brand = {
  id: number;
  name: string;
  owner_id: number;
  slug: string;
  logo: string | null;
  description: string | null;
  status: BrandStatus;
  rejection_reason: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner: {
    id: number;
    username: string;
  };
  approved_by?: {
    id: number;
    username: string;
  } | null;
  approved_at?: string | null;
};

export type BrandProduct = {
  id: number;
  name: string;
  price: number;
  current_price: number;
  has_active_discount: boolean;
  discount_percentage: number;
  rating: number | null;
  ratings_count: number;
  images: string[];
  category_name: string;
};

export interface BrandsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Brand[];
}

export interface BrandFormData {
  name: string;
  description?: string;
  logo?: File;
}

export interface CreateBrandResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string;
  status: BrandStatus;
  owner_id: number;
  created_at: string;
}
