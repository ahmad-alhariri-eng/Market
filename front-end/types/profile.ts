import { LocationData } from "./location";

// types/profile.ts
export interface Profile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: "user" | "seller";
  phone_number: string;
  address: string;
  bio: string | null;
  image: string | null;
  points?: number;
  is_verified_seller?: boolean;
  location: LocationData;
}

export interface UpdateProfileImageResponse {
  message?: string;
  image_url?: string;
  error?: string;
}
