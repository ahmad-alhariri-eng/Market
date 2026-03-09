// components/products/ProductDetails.tsx
"use client";

import { useTranslations } from "next-intl";
import { Product, Brand } from "@/types/product";
import { Button } from "@/components/ui/button";
import { FiCheck, FiHeart, FiShare2, FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useWishlist } from "@/context/WishlistContext";
import { wishlistService } from "@/services/wishlistService";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ProductDetailsProps {
  product: Product;
  brand: Brand | null;
  locale: string;
}

export function ProductDetails({
  product,
  brand,
  locale,
}: ProductDetailsProps) {
  const t = useTranslations("ProductDetail");
  const { addToCart, getCart } = useCart();
  const { user, token } = useAuth();
  const {
    wishlist,
    addItem,
    removeItem,
    isLoading: isWishlistLoadingGlobal,
  } = useWishlist();
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [isInCart, setIsInCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [isWishlistOperation, setIsWishlistOperation] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Check if product is in cart
  useEffect(() => {
    const checkCart = async () => {
      if (!token) {
        setCartLoading(false);
        return;
      }

      try {
        const cart = await getCart();
        setIsInCart(cart.items.some((item) => item.product.id === product.id));
      } catch (error) {
        console.error("Failed to check cart:", error);
      } finally {
        setCartLoading(false);
      }
    };

    checkCart();
  }, [token, product.id, getCart]);

  // Check if product is in wishlist
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

  const handleAddToCart = async () => {
    if (!user || !token) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setIsAddingToCart(true);
    setCartError(null);
    try {
      await addToCart({
        product_id: product.id,
        quantity: 1,
      });
      setIsInCart(true);
      toast.success(t("addToCartSuccess"));
    } catch {
      toast.error(t("errorAddingToWishlist"));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user || !token) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setIsWishlistOperation(true);
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
          toast.success(t("removeFromWishlistSuccess"));
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
          toast.success(t("addToWishlistSuccess"));
        }
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
      const message = error instanceof Error ? error.message : t("wishlistOperationFailed");
      toast.error(message);
    } finally {
      setIsWishlistOperation(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
        toast.success(t("shareSuccess"));
      } catch {
        // User cancelled the share
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("linkCopied"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand (if exists) */}
      {brand && (
        <div className="text-sm text-muted-foreground">
          {t("brand")}: {brand.name}
        </div>
      )}

      {/* Product Name */}
      <h1 className="text-3xl font-bold">{product.name}</h1>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-xl ${star <= Math.floor(Number(product.rating || 0))
                ? "text-yellow-400"
                : "text-gray-300"
                }`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          ({product.ratings_count} {t("reviews")})
        </span>
      </div>

      {/* Price */}
      <div className="space-y-1">
        {product.has_active_discount && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              {product.current_price.toFixed(2)} {t("currency")}
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              -{product.discount_percentage}%
            </span>
          </div>
        )}
        <div
          className={`${product.has_active_discount
            ? "line-through text-muted-foreground"
            : "text-2xl font-bold"
            }`}
        >
          {product.price} {t("currency")}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t("description")}</h2>
        <p className="text-muted-foreground">{product.description}</p>
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t("quantity")}</h2>
        <p className="text-muted-foreground">
          {product.quantity > 0
            ? `${product.quantity} ${t("available")}`
            : t("outOfStock")}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 pt-4">
        {isInCart ? (
          <Link href={`/${locale}/cart`} className="flex-1 min-w-[200px]">
            <Button className="w-full" variant="secondary">
              <FiCheck className="mr-2" />
              {t("itemInCart")} - {t("viewCart")}
            </Button>
          </Link>
        ) : (
          <Button
            className="flex-1 min-w-[200px]"
            onClick={handleAddToCart}
            isDisabled={isAddingToCart || product.quantity <= 0 || cartLoading}
          >
            {isAddingToCart ? (
              t("addingToCart")
            ) : (
              <>
                <FiShoppingCart className="mr-2" />
                {t("addToCart")}
              </>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleWishlistToggle}
          isDisabled={isWishlistOperation || isWishlistLoadingGlobal}
          className={cn(
            "flex items-center gap-2",
            isInWishlist && "bg-error/10 text-error border-error/20"
          )}
        >
          {isWishlistOperation ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : isInWishlist ? (
            <FiCheck className="h-4 w-4" />
          ) : (
            <FiHeart className="h-4 w-4" />
          )}
          {isInWishlist ? t("inWishlist") : t("addToWishlist")}
        </Button>

        <Button variant="outline" onClick={handleShare}>
          <FiShare2 className="h-4 w-4" />
          {t("share")}
        </Button>
      </div>

      {cartError && <p className="text-red-500 text-sm">{cartError}</p>}
    </div>
  );
}
