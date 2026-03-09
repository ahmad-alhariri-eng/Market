// components/location-form.tsx
"use client";

import { useTranslations } from "next-intl";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";
import { LocationData } from "@/types/location";

interface LocationFormProps {
  locationData: LocationData;
  onLocationDataChange: (data: LocationData) => void;
  onSave: (data: LocationData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function LocationForm({
  locationData,
  onLocationDataChange,
  onSave,
  onCancel,
  loading,
}: LocationFormProps) {
  const t = useTranslations("Profile");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(locationData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const finalValue =
      name === "latitude" || name === "longitude" ? parseFloat(value) : value;
    onLocationDataChange({ ...locationData, [name]: finalValue });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("latitude")}
          </label>
          <input
            type="number"
            step="any"
            name="latitude"
            value={locationData.latitude}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("longitude")}
          </label>
          <input
            type="number"
            step="any"
            name="longitude"
            value={locationData.longitude}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {t("address_line")}
        </label>
        <input
          type="text"
          name="address_line"
          value={locationData.address_line}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("city")}
          </label>
          <input
            type="text"
            name="city"
            value={locationData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("region")}
          </label>
          <input
            type="text"
            name="region"
            value={locationData.region}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("country")}
          </label>
          <input
            type="text"
            name="country"
            value={locationData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {t("postal_code")}
        </label>
        <input
          type="text"
          name="postal_code"
          value={locationData.postal_code}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="flex gap-4 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-border text-foreground rounded-md hover:bg-muted transition-colors"
          disabled={loading}
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          {loading ? (
            <FaSpinner className="animate-spin h-4 w-4" />
          ) : (
            <FaCheckCircle className="h-4 w-4" />
          )}
          {t("save_location")}
        </button>
      </div>
    </form>
  );
}
