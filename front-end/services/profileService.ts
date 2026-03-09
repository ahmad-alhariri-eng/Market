// services/profileService.ts
import { api } from "@/lib/api";
import { LocationData, UpdateLocationResponse } from "@/types/location";
import { Profile, UpdateProfileImageResponse } from "@/types/profile";

export const profileService = {
  async getMyProfile(token: string): Promise<Profile> {
    try {
      const response = await api.get(`/profile/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Backend returns nested data inside `profile` instead of `location` for getMyProfile
      if (response.data && response.data.profile) {
        response.data.location = {
          latitude: response.data.profile.latitude,
          longitude: response.data.profile.longitude,
          address_line: response.data.profile.address_line,
          city: response.data.profile.city,
          region: response.data.profile.region,
          country: response.data.profile.country,
          postal_code: response.data.profile.postal_code,
        };
        response.data.image = response.data.profile.image;
        response.data.bio = response.data.profile.bio;
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch profile");
    }
  },

  async getProfile(userId: number): Promise<Profile> {
    try {
      const response = await api.get(`/users/${userId}/profile/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch public profile");
    }
  },

  async updateProfileImage(
    image: File,
    token: string
  ): Promise<UpdateProfileImageResponse> {
    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await api.patch("/profile/me/image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return (
        error.response?.data || { error: "Failed to update profile image" }
      );
    }
  },
  async updateLocation(
    locationData: LocationData,
    token: string
  ): Promise<UpdateLocationResponse> {
    try {
      console.log(locationData);
      const response = await api.patch("/profile/me/location/", locationData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      return response.data;
    } catch (error: any) {
      console.log(error);
      return error.response?.data || { error: "Failed to update location" };
    }
  },

  async reverseGeocode(
    lat: number,
    lng: number,
    token: string
  ): Promise<LocationData> {
    try {
      const response = await api.get(
        `/reverse-geocode/?lat=${lat}&lng=${lng}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to get address");
    }
  },
};
