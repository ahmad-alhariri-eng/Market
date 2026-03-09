// components/products/ProductGrid.tsx
"use client";

import { Product } from "@/types/product";
import { useTranslations } from "next-intl";
import { ProductCard } from "./ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useEffect, useState } from "react";
import { ProductGridSkeleton } from "./ProductGridSkeleton";

export function ProductGrid({ products }: { products: Product[] }) {
  const t = useTranslations("Search");
  const { isLoading: isWishlistLoading } = useWishlist();
  const [mounted, setMounted] = useState(false);

  // Ensure we only render after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isWishlistLoading) {
    return <ProductGridSkeleton count={products.length} />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("noResults")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
