// components/home/CategoriesSection.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Category } from "@/types/category";
import { FiChevronLeft } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { useLocale, useTranslations } from "next-intl";
import { categoryService } from "@/services/categoryService";
import Image from "next/image";

interface CategoriesSectionProps {
  title: string;
  seeAllText: string;
}

export default function CategoriesSection({
  title,
  seeAllText,
}: CategoriesSectionProps) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations("Common");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.getCategories(locale);
        setCategories(data);
      } catch (err) {
        setError(t("errors.loadingCategories"));
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [locale, t]);

  if (error) {
    return (
      <section className="container py-16">
        <div className="rounded-3xl border border-error/20 bg-error/5 p-10 text-center backdrop-blur-sm">
          <p className="text-error font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {t("actions.tryAgain")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container py-20 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

      <div className="mb-12 flex items-end justify-between">
        {loading ? (
          <Skeleton className="h-10 w-64 rounded-xl" />
        ) : (
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {title}
            <span className="block mt-2 h-1.5 w-12 bg-primary rounded-full" />
          </h2>
        )}
        <Link
          href="/categories"
          className="group flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          {seeAllText}
          <FiChevronLeft className="ml-1 h-4 w-4 rtl:rotate-180 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-full w-full">
                <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl bg-card p-6 border shadow-sm">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
              </div>
            ))
        ) : categories.length > 0 ? (
          categories.slice(0, 6).map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="h-full w-full"
            >
              <Link
                href={`/categories/${category.id}`}
                className="group flex h-full flex-col items-center justify-center gap-4 rounded-3xl bg-background/50 backdrop-blur-md p-6 text-center transition-all duration-500 hover:bg-card hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5 hover:-translate-y-2 ring-1 ring-border/50 hover:ring-primary/30"
              >
                {/* Logo Container */}
                <div className="relative h-20 w-20 flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
                  {category.logo ? (
                    <Image
                      src={category.logo}
                      alt={category.name}
                      fill
                      className="rounded-full object-cover shadow-sm ring-4 ring-background"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/images/category-fallback.svg";
                        target.classList.add("p-3", "bg-muted");
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-3xl font-extrabold text-primary shadow-inner">
                      {category.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="line-clamp-2 font-bold text-foreground group-hover:text-primary transition-colors text-lg tracking-tight">
                    {category.name}
                  </h3>
                  {category.children.length > 0 && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                      {t("category.subcategoriesCount", {
                        count: category.children.length,
                      })}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full rounded-3xl border border-dashed py-20 text-center text-muted-foreground bg-muted/20">
            {t("products.noCategories")}
          </div>
        )}
      </div>
    </section>
  );
}
