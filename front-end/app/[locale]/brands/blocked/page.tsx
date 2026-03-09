// app/[locale]/brands/blocked/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import { Brand } from "@/types/brands";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FiArrowLeft, FiRefreshCw, FiX, FiCheck } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { brandService } from "@/services/brandService";

const url = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

export default function BlockedBrandsPage() {
  const locale = useLocale();
  const t = useTranslations("BlockedBrands");
  const { user, token, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unblocking, setUnblocking] = useState<number | null>(null);
  const [blockedBrands, setBlockedBrands] = useState<Brand[]>([]);

  const fetchBlockedBrands = useCallback(async (isRefreshing = false) => {
    if (!token) return;

    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const brands = await brandService.getBlockedBrands(locale, token);
      setBlockedBrands(brands);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error fetching blocked brands:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to fetch blocked brands";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, locale]);

  const handleUnblockBrand = async (brandId: number) => {
    if (!token) return;

    setUnblocking(brandId);
    try {
      const result = await brandService.unblockBrand(brandId, locale, token);
      toast.success(result.message || "Brand unblocked successfully");

      // Remove the unblocked brand from the list
      setBlockedBrands((prev) => prev.filter((brand) => brand.id !== brandId));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error unblocking brand:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to unblock brand";
      toast.error(errorMessage);
    } finally {
      setUnblocking(null);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBlockedBrands();
    }
  }, [token, fetchBlockedBrands]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FiX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("authenticationRequired")}
          </h2>
          <p className="text-muted-foreground mb-6">{t("pleaseLogin")}</p>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            {t("login")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/brands"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          {t("backToBrands")}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
          </div>

          <button
            onClick={() => fetchBlockedBrands(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </button>
        </div>
      </div>

      {/* Blocked Brands List */}
      {blockedBrands.length === 0 ? (
        <div className="text-center py-12">
          <FiX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("noBlockedBrands")}
          </h2>
          <p className="text-muted-foreground">
            {t("noBlockedBrandsDescription")}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-muted-foreground">
              {t("blockedCount", { count: blockedBrands.length })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {blockedBrands.map((brand) => (
              <div
                key={brand.id}
                className="relative group bg-background border border-muted rounded-lg p-6 text-center transition-all hover:shadow-md"
              >
                {/* Brand Logo/Initial */}
                <div className="relative h-20 w-20 mx-auto mb-4">
                  {brand.logo ? (
                    <Image
                      src={`${url}${brand.logo}`}
                      alt={brand.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full itemws-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                      {brand.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Brand Name */}
                <h3 className="font-medium mb-4">{brand.name}</h3>

                {/* Blocked Badge */}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-error/10 text-error">
                    <FiX className="w-3 h-3 mr-1" />
                    {t("blocked")}
                  </span>
                </div>

                {/* Unblock Button */}
                <button
                  onClick={() => handleUnblockBrand(brand.id)}
                  disabled={unblocking === brand.id}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-success text-white rounded-md hover:bg-success/90 transition-colors disabled:opacity-50"
                >
                  {unblocking === brand.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      {t("unblock")}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
