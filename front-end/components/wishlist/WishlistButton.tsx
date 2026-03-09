// components/products/WishlistButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { FiHeart, FiCheck } from "react-icons/fi";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { wishlistService } from "@/services/wishlistService";
import { useWishlist } from "@/context/WishlistContext";
import toast from "react-hot-toast";

interface WishlistButtonProps {
  productId: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function WishlistButton({
  productId,
  className,
  size = "md",
  showText = false,
}: WishlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const { user, token } = useAuth();
  const { wishlist, removeItem, addItem } = useWishlist();
  // Check if product is already in wishlist
  const isAdded = wishlist?.items.some((item) => item.product.id === productId);

  const handleWishlistToggle = async () => {
    if (!user || !token) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setIsLoading(true);
    try {
      if (isAdded) {
        // Find the item to remove
        const itemToRemove = wishlist!.items.find(
          (item) => item.product.id === productId
        );
        if (itemToRemove) {
          await wishlistService.removeFromWishlist(
            itemToRemove.id,
            token,
            locale
          );
          removeItem(itemToRemove.id);
          toast.success("Removed from wishlist");
        }
      } else {
        const response = await wishlistService.addToWishlist(
          productId,
          token,
          locale
        );
        // The response should contain the updated wishlist with the new item
        if (response.items) {
          const newItem = response.items.find(
            (item) => item.product.id === productId
          );
          if (newItem) {
            addItem(newItem);
            toast.success("Added to wishlist");
          }
        }
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
      const message = error instanceof Error ? error.message : "Operation failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "p-1.5 text-sm",
    md: "p-2 text-base",
    lg: "p-3 text-lg",
  };

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 rounded-full border transition-colors disabled:opacity-50",
        isAdded
          ? "border-error bg-error/10 text-error"
          : "border-foreground/20 bg-background text-foreground/60 hover:border-error hover:text-error",
        sizeClasses[size],
        className
      )}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : isAdded ? (
        <FiCheck className="shrink-0" />
      ) : (
        <FiHeart className="shrink-0" />
      )}
      {showText && (
        <span className="text-sm">
          {isAdded ? "Added to Wishlist" : "Add to Wishlist"}
        </span>
      )}
    </button>
  );
}
