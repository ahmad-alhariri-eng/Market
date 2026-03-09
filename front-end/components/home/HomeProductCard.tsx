// components/products/ProductCard.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import { Skeleton } from "../ui/skeleton";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
    >
      {product.has_active_discount && (
        <div className="absolute left-2 top-2 z-10 rounded-full bg-error px-2 py-1 text-xs font-bold text-white">
          -{product.discount_percentage}%
        </div>
      )}

      <div className="relative aspect-square w-full overflow-hidden">
        {imageLoading && (
          <Skeleton className="absolute inset-0 h-full w-full" />
        )}
        <Image
          src={
            imageError || !product.images?.length
              ? "/images/product-fallback.jpg"
              : product.images[0]
          }
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${imageLoading ? "opacity-0" : "opacity-100"
            }`}
          onLoadingComplete={() => setImageLoading(false)}
          onError={() => setImageError(true)}
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {product.category_name}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1">
              <FiStar className="text-yellow-500" />
              <span className="text-sm font-medium">
                {parseFloat(product.rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <h3 className="mt-1 truncate font-medium">
          <Link href={`/products/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">
              ${product.current_price.toFixed(2)}
            </span>
            {product.has_active_discount && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.price}
              </span>
            )}
          </div>

          <button className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-primary">
            <FiShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
