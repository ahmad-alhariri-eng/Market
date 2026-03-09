// hooks/useOrder.ts (final version)
"use client";

import { useState } from "react";
import { getClientCookie } from "@/lib/client-cookies";
import { CancelOrderResponse, CreateOrderResponse, Order } from "@/types/order";
import { orderService } from "@/services/orderService";
import { useAuth } from "@/providers/auth-provider";

export function useOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const getToken = () => {
    return token;
  };

  const createOrder = async (): Promise<CreateOrderResponse> => {
    setIsLoading(true);
    try {
      const result = await orderService.createOrder(getToken()!);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const getOrder = async (orderId: number): Promise<Order | null> => {
    setIsLoading(true);
    try {
      return await orderService.getOrder(getToken()!, orderId);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createOrder,
    getOrder,
    isLoading,
  };
}

export function useOrders() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const getToken = () => {
    return token;
  };

  const getOrders = async (): Promise<Order[]> => {
    setIsLoading(true);
    setError(null);
    try {
      return await orderService.getOrders(getToken()!);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to fetch orders";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrder = async (orderId: number): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await orderService.getOrder(getToken()!, orderId);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to fetch order";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: number): Promise<CancelOrderResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await orderService.cancelOrder(getToken()!, orderId);
      if (result.error) {
        setError(result.error);
        throw new Error(result.error);
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to cancel order";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getOrders,
    getOrder,
    cancelOrder,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
