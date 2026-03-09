// types/location.ts
export interface LocationData {
  latitude: number;
  longitude: number;
  address_line: string;
  city: string;
  region: string;
  country: string;
  postal_code: string;
}

export interface UpdateLocationResponse {
  message?: string;
  error?: string;
  location?: LocationData;
}
