// components/home/DiscountBanner.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { FiArrowRight } from "react-icons/fi";
import { Skeleton } from "../ui/skeleton";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DiscountResponse } from "@/types/discount";
import Image from "next/image";
import { discountService } from "@/services/discountService";

export default function DiscountBanner() {
  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState<DiscountResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations("Common");

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        setLoading(true);
        const data = await discountService.getDiscount(locale);

        if (data && data.is_active) {
          setDiscount(data);
        }
      } catch (err) {
        setError(t("errors.loadingDiscounts"));
        console.error("Error fetching discount:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [locale, t]);

  if (error) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container my-12"
      >
        <div className="rounded-lg border border-error bg-error/10 p-8 text-center">
          <p className="text-error">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-primary hover:underline"
          >
            {t("actions.tryAgain")}
          </button>
        </div>
      </motion.section>
    );
  }

  if (loading) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container my-12"
      >
        <Skeleton className="h-64 w-full rounded-xl" />
      </motion.section>
    );
  }

  if (!discount) {
    return null;
  }

  // Handle image URL - ensure it's absolute
  const getImageUrl = () => {
    if (!discount.image) return "/images/discount-fallback.jpg";

    // Check if the URL is already absolute
    if (discount.image.startsWith("http")) {
      return discount.image;
    }

    // Handle relative paths from API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://127.0.0.1:8000";
    return `${baseUrl}${discount.image}`;
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="container my-12 overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-2xl font-bold md:text-3xl"
          >
            {locale === "ar" ? discount.name_ar : discount.name_en}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-muted-foreground"
          >
            {locale === "ar"
              ? discount.description_ar
              : discount.description_en}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Button size="lg" className="group w-fit">
              {t("actions.shopNow")}
              <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
        <div className="relative aspect-square">
          <Image
            src={getImageUrl()}
            alt={locale === "ar" ? discount.name_ar : discount.name_en}
            fill
            className="object-cover"
            priority
            unoptimized={process.env.NODE_ENV === "development"}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/images/discount-fallback.jpg";
            }}
          />
        </div>
      </div>
    </motion.section>
  );
}
