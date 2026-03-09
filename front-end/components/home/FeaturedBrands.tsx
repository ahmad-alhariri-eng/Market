// components/home/FeaturedBrands.tsx
"use client";

import { motion } from "framer-motion";
import { BrandCard, BrandCardSkeleton } from "@/components/brands/BrandCard";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { Brand } from "@/types/brands";
import { brandService } from "@/services/brandService";

export default function FeaturedBrands() {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations("Common");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const data = await brandService.getTopBrands(locale);
        setBrands(data.results);
      } catch (err) {
        setError(t("errors.loadingBrands"));
        console.error("Error fetching brands:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [locale, t]);

  if (error) {
    return (
      <section className="container py-12">
        <div className="rounded-lg border border-error bg-error/10 p-8 text-center">
          <p className="text-error">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-primary hover:underline"
          >
            {t("actions.tryAgain")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("brands.title")}</h2>
          <p className="text-muted-foreground">{t("brands.subtitle")}</p>
        </div>
        <Link
          href="/brands"
          className="flex items-center text-sm font-medium text-primary hover:underline"
        >
          {t("brands.viewAll")}
          <FiChevronRight className="ml-1 h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => <BrandCardSkeleton key={i} />)
        ) : brands.length > 0 ? (
          brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <BrandCard brand={brand} />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full rounded-lg border py-12 text-center text-muted-foreground">
            {t("products.noBrands")}
          </div>
        )}
      </div>
    </section>
  );
}
