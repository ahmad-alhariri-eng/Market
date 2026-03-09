// components/products/ProductCard.tsx
"use client";

import { Product } from "@/types/product";
import Link from "next/link";
import { FiStar, FiHeart, FiCheck } from "react-icons/fi";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { wishlistService } from "@/services/wishlistService";
import { useWishlist } from "@/context/WishlistContext";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { user, token } = useAuth();
  const {
    wishlist,
    addItem,
    removeItem,
    isLoading: isWishlistLoadingGlobal,
  } = useWishlist();

  const router = useRouter();
  const locale = useLocale();

  // Update isInWishlist state when wishlist changes
  useEffect(() => {
    if (wishlist && !isWishlistLoadingGlobal) {
      const inWishlist = wishlist.items.some(
        (item) => item.product.id === product.id
      );
      setIsInWishlist(inWishlist);
    } else {
      setIsInWishlist(false);
    }
  }, [wishlist, product.id, isWishlistLoadingGlobal]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !token) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setIsWishlistLoading(true);
    try {
      if (isInWishlist) {
        // Find the wishlist item to remove
        const wishlistItem = wishlist?.items.find(
          (item) => item.product.id === product.id
        );
        if (wishlistItem) {
          await wishlistService.removeFromWishlist(
            wishlistItem.id,
            token,
            locale
          );
          removeItem(wishlistItem.id);
          toast.success("Removed from wishlist");
        }
      } else {
        const response = await wishlistService.addToWishlist(
          product.id,
          token,
          locale
        );
        // Find the newly added item
        const newItem = response.items.find(
          (item) => item.product.id === product.id
        );
        if (newItem) {
          addItem(newItem);
          toast.success("Added to wishlist");
        }
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
      const message = error instanceof Error ? error.message : "Operation failed";
      toast.error(message);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Show loading state while wishlist is being fetched globally
  if (isWishlistLoadingGlobal) {
    return (
      <div className="border rounded-lg overflow-hidden bg-card animate-pulse h-full">
        <div className="aspect-square bg-muted relative">
          <div className="absolute top-2 right-2 p-2 rounded-full bg-muted"></div>
        </div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative block h-full overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 hover:-translate-y-1 ring-1 ring-transparent hover:ring-border/50">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        disabled={isWishlistLoading || isWishlistLoadingGlobal}
        className={cn(
          "absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-200",
          "bg-background/80 backdrop-blur-sm hover:bg-background",
          isInWishlist
            ? "text-error hover:text-error/80"
            : "text-muted-foreground hover:text-error",
          (isWishlistLoading || isWishlistLoadingGlobal) &&
          "opacity-50 cursor-not-allowed"
        )}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isWishlistLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        ) : isInWishlist ? (
          <FiCheck className="h-4 w-4" />
        ) : (
          <FiHeart className="h-4 w-4" />
        )}
      </button>

      <Link href={`/products/${product.id}`} className="block h-full">
        {/* Product Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/30">
          <Image
            src={product.images[0] || "/images/product-fallback.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/images/product-fallback.jpg";
            }}
          />

          {/* Discount Badge */}
          {product.has_active_discount && (
            <div className="absolute top-3 left-3 bg-error/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
              -{product.discount_percentage}%
            </div>
          )}

          {/* Out of Stock Overlay */}
          {product.quantity === 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-error font-bold bg-background px-3 py-1 rounded-md">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5">
          <h3 className="font-semibold text-foreground line-clamp-2 min-h-[3rem] tracking-tight mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold tracking-tight text-foreground">
              ${product.current_price.toFixed(2)}
            </span>
            {product.has_active_discount &&
              product.price !== product.current_price.toString() && (
                <span className="text-sm text-muted-foreground/70 line-through font-medium">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
              )}
          </div>

          {/* Rating */}
          {product.rating && product.ratings_count > 0 && (
            <div className="flex items-center text-sm mb-2">
              <FiStar className="text-yellow-500 mr-1 fill-yellow-500" />
              <span>{parseFloat(product.rating).toFixed(1)}</span>
              <span className="text-muted-foreground ml-1">
                ({product.ratings_count})
              </span>
            </div>
          )}

          {/* Category and Stock */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{product.category_name}</span>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full font-medium tracking-wide",
                product.quantity > 10
                  ? "text-success-foreground bg-success/15"
                  : product.quantity > 0
                    ? "text-warning-foreground bg-warning/15"
                    : "text-error-foreground bg-error/15"
              )}
            >
              {product.quantity > 10
                ? "In Stock"
                : `Only ${product.quantity} left`}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
