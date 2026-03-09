// hooks/useCart.ts
"use client";

import { useState } from "react";
import { getClientCookie } from "@/lib/client-cookies";
import { Cart, AddToCartPayload, UpdateCartItemPayload } from "@/types/cart";
import { cartService } from "@/services/cartService";
import { useAuth } from "@/providers/auth-provider";

export function useCart() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuth();

  const getToken = () => {
    if (!token) throw new Error("Authentication required");
    return token;
  };

  const getCart = async (): Promise<Cart> => {
    setIsLoading(true);
    setError(null);
    try {
      return await cartService.getCart(getToken());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch cart"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (data: AddToCartPayload): Promise<Cart> => {
    setIsLoading(true);
    setError(null);
    try {
      return await cartService.addToCart(getToken(), data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to add to cart"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (
    itemId: number,
    data: UpdateCartItemPayload
  ): Promise<Cart> => {
    setIsLoading(true);
    setError(null);
    try {
      return await cartService.updateCartItem(getToken(), itemId, data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update item"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCartItem = async (itemId: number): Promise<Cart> => {
    setIsLoading(true);
    setError(null);
    try {
      return await cartService.removeCartItem(getToken(), itemId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to remove item"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    isLoading,
    error,
  };
}
