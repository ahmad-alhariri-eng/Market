// app/[locale]/profile/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import Image from "next/image";
import { profileService } from "@/services/profileService";
import { Profile } from "@/types/profile";
import {
  FaUser,
  FaEdit,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaCamera,
  FaStore,
  FaAward,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { LocationData } from "@/types/location";
import LocationForm from "@/components/profile/location-form";
import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("@/components/profile/location-map"), {
  ssr: false,
});

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: 33.5138,
    longitude: 36.2765,
    address_line: "",
    city: "",
    region: "",
    country: "",
    postal_code: "",
  });

  const fetchProfile = useCallback(async () => {
    if (!user?.id || !token) return;

    try {
      setLoading(true);
      setError("");
      const profileData = await profileService.getMyProfile(token);
      setProfile(profileData);
      console.log(profileData.location);
      if (profileData.location.latitude) setLocationData(profileData.location);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t("fetch_error"));
    } finally {
      setLoading(false);
    }
  }, [user?.id, token, t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!token) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("invalid_image"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("image_too_large"));
      return;
    }

    try {
      setImageLoading(true);
      setError("");
      setSuccess("");

      const result = await profileService.updateProfileImage(file, token);

      if (result.error) {
        setError(result.error);
      } else if (result.image_url) {
        setSuccess(result.message || t("image_updated"));
        // Update the profile with new image URL
        if (profile) {
          setProfile({ ...profile, image: result.image_url });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t("upload_error"));
    } finally {
      setImageLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://127.0.0.1:8000";
    return `${baseUrl}${imagePath}`;
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    if (!token) return;

    try {
      setLocationLoading(true);

      // Limit coordinates to 6 decimal places as per backend validation

      const updatedLocation = {
        ...locationData,
        latitude: lat,
        longitude: lng,
      };
      setLocationData(updatedLocation);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t("location_error"));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSaveLocation = async (data: LocationData) => {
    if (!token) return;

    try {
      setLocationLoading(true);
      setError("");

      const sanitizedData = {
        ...data,
        latitude: parseFloat(Number(data.latitude).toFixed(6)),
        longitude: parseFloat(Number(data.longitude).toFixed(6)),
      };

      const result = await profileService.updateLocation(sanitizedData, token);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.message || t("location_updated"));
        setIsEditingLocation(false);
        // Refresh profile data
        await fetchProfile();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t("location_save_error"));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationDataChange = (newData: LocationData) => {
    setLocationData(newData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-error-600 dark:text-error-400 text-center">
          <FaTimesCircle className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-background rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t("profile")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("manage_your_profile")}
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-muted dark:bg-gray-700 rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                  {profile?.image ? (
                    <Image
                      src={getImageUrl(profile.image) || ""}
                      alt={profile.username}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 128px"
                    />
                  ) : (
                    <FaUser className="h-16 w-16 text-primary-600 dark:text-primary-400" />
                  )}
                </div>

                <label
                  htmlFor="profile-image"
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {imageLoading ? (
                    <FaSpinner className="animate-spin h-6 w-6 text-white" />
                  ) : (
                    <FaCamera className="h-6 w-6 text-white" />
                  )}
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageLoading}
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  {profile?.role === "seller" && (
                    <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <FaStore className="h-4 w-4" />
                      {t("seller")}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1 text-foreground">
                    <span className="font-medium">{profile?.email}</span>
                    <span className="text-sm text-muted-foreground">@{profile?.username}</span>
                  </div>

                  <div className="flex items-center gap-2 text-foreground">
                    <FaPhone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.phone_number}</span>
                  </div>

                  <div className="flex items-center gap-2 text-foreground">
                    <FaMapMarkerAlt className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.address}</span>
                  </div>

                  {profile?.role === "seller" && (
                    <>
                      <div className="flex items-center gap-2 text-foreground">
                        <FaAward className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {t("points")}: {profile?.points || 0}
                        </span>
                      </div>

                      {profile?.is_verified_seller && (
                        <div className="inline-flex items-center gap-2 bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200 px-3 py-1 rounded-full text-sm">
                          <FaCheckCircle className="h-4 w-4" />
                          {t("verified_seller")}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {profile?.bio && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t("bio")}
                </h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}
          </div>

          <div className="bg-muted dark:bg-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FaMapMarkerAlt className="h-5 w-5" />
                {t("location")}
              </h2>
              {!isEditingLocation && (
                <button
                  onClick={() => setIsEditingLocation(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                >
                  <FaEdit className="h-4 w-4" />
                  {t("edit_location")}
                </button>
              )}
            </div>

            {isEditingLocation ? (
              <div className="space-y-6">
                <LocationMap
                  initialPosition={[
                    locationData.latitude,
                    locationData.longitude,
                  ]}
                  onLocationSelect={handleLocationSelect}
                />

                <LocationForm
                  locationData={locationData}
                  onLocationDataChange={handleLocationDataChange}
                  onSave={handleSaveLocation}
                  onCancel={() => setIsEditingLocation(false)}
                  loading={locationLoading}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-foreground">
                  <strong>{t("address")}:</strong> {locationData.address_line}
                </p>
                <p className="text-foreground">
                  <strong>{t("city")}:</strong> {locationData.city}
                </p>
                <p className="text-foreground">
                  <strong>{t("region")}:</strong> {locationData.region}
                </p>
                <p className="text-foreground">
                  <strong>{t("country")}:</strong> {locationData.country}
                </p>
                <p className="text-foreground">
                  <strong>{t("postal_code")}:</strong>{" "}
                  {locationData.postal_code}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t("coordinates")}: {locationData.latitude},{" "}
                  {locationData.longitude}
                </p>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-error-100 dark:bg-error-900/30 border border-error-400 dark:border-error-700 text-error-700 dark:text-error-300 px-4 py-3 rounded mb-4 flex items-center gap-2">
              <FaTimesCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success-100 dark:bg-success-900/30 border border-success-400 dark:border-success-700 text-success-700 dark:text-success-300 px-4 py-3 rounded mb-4 flex items-center gap-2">
              <FaCheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
