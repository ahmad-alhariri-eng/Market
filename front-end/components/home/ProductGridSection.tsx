// components/products/ProductGridSection.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Product } from "@/types/product";
import { FiArrowLeft } from "react-icons/fi";
import { Skeleton } from "../ui/skeleton";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { productService } from "@/lib/api/products";
import ProductCard from "./HomeProductCard";

interface ProductGridSectionProps {
  title: string;
  subtitle: string;
  viewAllHref: string;
}

export default function ProductGridSection({
  title,
  subtitle,
  viewAllHref,
}: ProductGridSectionProps) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations("Common");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use generic getProducts since we don't know the category ID 9
        const response = await productService.getProducts(
          { sort_by: "rating", sort_direction: "desc" },
          locale
        );
        setProducts(response.results);
      } catch (err) {
        setError(t("errors.loadingProducts"));
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [locale, t]);

  if (error) {
    return (
      <section className="container py-20">
        <div className="rounded-3xl border border-error/20 bg-error/5 p-12 text-center backdrop-blur-sm shadow-sm">
          <p className="text-error font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 font-semibold text-primary hover:text-primary/70 transition-colors inline-block"
          >
            {t("actions.tryAgain")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-20 relative">
      <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground relative inline-block">
            {title}
            <span className="absolute -bottom-3 left-0 h-1.5 w-16 bg-primary rounded-full" />
          </h2>
          <p className="text-lg text-muted-foreground mt-6 font-medium leading-relaxed max-w-xl">{subtitle}</p>
        </div>
        <Link
          href={viewAllHref}
          className="group flex items-center font-bold text-foreground hover:text-primary transition-colors py-2"
        >
          {t("actions.viewAll")}
          <FiArrowLeft className="ml-2 h-5 w-5 transition-transform group-hover:-translate-x-1.5 rtl:rotate-180 rtl:group-hover:translate-x-1.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.slice(0, 10).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.05, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed py-24 text-center bg-muted/20">
          <p className="text-lg text-muted-foreground font-medium">{t("products.noProducts")}</p>
        </div>
      )}
    </section>
  );
}
