// components/wishlist/WishlistContent.tsx
"use client";

import { FiHeart } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useWishlist } from "@/context/WishlistContext";
import WishlistItemCard from "@/components/wishlist/WishlistItemCard";
import { Wishlist } from "@/types/wishlist";

interface WishlistContentProps {
  initialWishlist: Wishlist | null;
}

export default function WishlistContent({
  initialWishlist,
}: WishlistContentProps) {
  const { wishlist } = useWishlist();
  const t = useTranslations("Wishlist");

  // Use the context wishlist if available, otherwise use the initial data
  const displayWishlist = wishlist || initialWishlist;

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center gap-3">
        <FiHeart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>

      {!displayWishlist || displayWishlist.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FiHeart className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            {t("emptyTitle")}
          </h2>
          <p className="text-muted-foreground max-w-md">
            {t("emptyDescription")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayWishlist.items.map((item) => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
