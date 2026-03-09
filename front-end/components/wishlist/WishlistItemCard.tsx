// components/products/WishlistItemCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { FiTrash2 } from "react-icons/fi";
import { WishlistItem } from "@/types/wishlist";
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";
import { wishlistService } from "@/services/wishlistService";
import toast from "react-hot-toast";
import { useWishlist } from "@/context/WishlistContext";

const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

interface WishlistItemCardProps {
  item: WishlistItem;
}

export default function WishlistItemCard({ item }: WishlistItemCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const locale = useLocale();
  const { token } = useAuth();
  const { removeItem } = useWishlist();

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await wishlistService.removeFromWishlist(item.id, token!, locale);
      removeItem(item.id); // Update the UI state
      toast.success("Item has been removed from your wishlist");
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      toast.error("Failed to remove item from wishlist");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="group relative flex gap-4 rounded-lg border p-4 transition-all hover:shadow-md">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={
            (baseUrl && item.product.images[0]) ? `${baseUrl}${item.product.images[0]}` : "/images/placeholder-product.jpg"
          }
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/${locale}/products/${item.product.id}`}
            className="text-lg font-medium hover:text-primary transition-colors"
          >
            {item.product.name}
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {item.has_discount && item.discount_percentage ? (
              <>
                <span className="text-lg font-bold text-foreground">
                  ${item.current_price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${parseFloat(item.product.price).toFixed(2)}
                </span>
                <span className="rounded-full bg-error/10 px-2 py-1 text-xs text-error">
                  -{item.discount_percentage}%
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-foreground">
                ${item.current_price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="rounded-full p-2 text-error hover:bg-error/10 transition-colors disabled:opacity-50"
            >
              {isRemoving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <FiTrash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
