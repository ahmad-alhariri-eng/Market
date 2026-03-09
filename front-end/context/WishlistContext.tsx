// context/WishlistContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Wishlist, WishlistItem } from "@/types/wishlist";
import { wishlistService } from "@/services/wishlistService";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "next-intl";

interface WishlistContextType {
  wishlist: Wishlist | null;
  setWishlist: (wishlist: Wishlist | null) => void;
  removeItem: (itemId: number) => void;
  addItem: (item: WishlistItem) => void;
  isLoading: boolean;
  error: string | null;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({
  children,
  initialWishlist,
}: {
  children: ReactNode;
  initialWishlist: Wishlist | null;
}) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(initialWishlist);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const locale = useLocale();

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (user && token && !wishlist) {
      fetchWishlist();
    }
  }, [user, token]);

  const fetchWishlist = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await wishlistService.getWishlist(token, locale);
      setWishlist(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch wishlist");
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = (itemId: number) => {
    if (!wishlist) return;

    setWishlist({
      ...wishlist,
      items: wishlist.items.filter((item) => item.id !== itemId),
    });
  };

  const addItem = (item: WishlistItem) => {
    if (!wishlist) {
      // Create a new wishlist if it doesn't exist
      setWishlist({
        id: Date.now(), // Temporary ID
        items: [item],
      });
      return;
    }

    // Check if item already exists to avoid duplicates
    if (
      !wishlist.items.some(
        (existingItem) => existingItem.product.id === item.product.id
      )
    ) {
      setWishlist({
        ...wishlist,
        items: [...wishlist.items, item],
      });
    }
  };

  const refreshWishlist = async () => {
    if (token) {
      await fetchWishlist();
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        setWishlist,
        removeItem,
        addItem,
        isLoading,
        error,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
