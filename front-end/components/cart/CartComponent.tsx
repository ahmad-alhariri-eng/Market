// components/cart/CartComponent.tsx
"use client";

import { useTranslations } from "next-intl";
import { Cart as CartType } from "@/types/cart";
import { Button } from "@/components/ui/button";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from "react-icons/fi";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-hot-toast";
import { useOrder } from "@/hooks/useOrder";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

interface CartProps {
  initialCart: CartType;
  locale: string;
}

export function Cart({ initialCart, locale }: CartProps) {
  const t = useTranslations("Cart");
  const tOrder = useTranslations("Order");
  const [cart, setCart] = useState(initialCart);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const { token } = useAuth();
  const router = useRouter();
  if (!token) {
    router.push("/auth/login");
  }
  const {
    updateCartItem,
    removeCartItem,
    isLoading: cartLoading,
    error: cartError,
  } = useCart();

  const { createOrder, isLoading: orderLoading } = useOrder();

  useEffect(() => {
    setCart(initialCart);
  }, [initialCart]);

  useEffect(() => {
    if (cartError) {
      toast.error(t("errorMessage"));
    }
  }, [cartError, t]);

  const handleUpdateQuantity = useCallback(
    async (itemId: number, newQuantity: number) => {
      if (newQuantity < 1) return;

      try {
        const updatedCart = await updateCartItem(itemId, {
          quantity: newQuantity,
        });
        setCart(updatedCart);
        toast.success(t("quantityUpdated"));
      } catch (err) {
        console.error("Failed to update cart item:", err);
      }
    },
    [updateCartItem, t]
  );

  const handleRemoveItem = useCallback(
    async (itemId: number) => {
      try {
        await removeCartItem(itemId);
        const updatedCart = cart.items.filter((item) => {
          return item.id !== itemId;
        });
        setCart((p) => ({ ...p, items: updatedCart }));
        toast.success(t("itemRemoved"));
      } catch (err) {
        console.error("Failed to remove cart item:", err);
      }
    },
    [removeCartItem, t, cart.items]
  );

  const handleCheckout = useCallback(async () => {
    if (cart?.items?.length === 0) {
      toast.error(tOrder("emptyCart"));
      return;
    }

    setIsCreatingOrder(true);
    try {
      const orderResponse = await createOrder();

      if (orderResponse.order_number) {
        toast.success(
          tOrder("orderCreated", { orderNumber: orderResponse.order_number })
        );

        // Clear cart after successful order creation
        setCart({
          id: 0,
          items: [],
          total_items: 0,
          total_price: 0,
          total_discount: 0,
        });

        // Redirect to the new async Crypto Payment Status / Polling UI
        if (orderResponse.order_id) {
          router.push(`/${locale}/orders/${orderResponse.order_id}/status`);
        } else {
          // Fallback if no order_id returned
          router.push(`/${locale}/orders`);
        }
      } else if (orderResponse.error) {
        // Handle business logic errors returned in the response
        console.log("Business logic error:", orderResponse);
        if (orderResponse.error === "Checkout error" && orderResponse.detail) {
          toast.error(orderResponse.detail);
        } else if (orderResponse.error === "Cart is empty") {
          toast.error(tOrder("emptyCart"));
        } else {
          toast.error(
            orderResponse.detail ||
            orderResponse.error ||
            tOrder("creationFailed")
          );
        }
      }
    } catch (err) {
      // Handle thrown errors (HTTP/network errors)
      console.log("Thrown error:", err);
      if (err instanceof Error && err.message.includes("Network Error")) {
        toast.error(tOrder("networkError"));
      } else {
        const message = err instanceof Error ? err.message : tOrder("creationFailed");
        toast.error(message);
      }
    } finally {
      setIsCreatingOrder(false);
    }
  }, [cart, createOrder, tOrder, locale, router]);

  const isItemLoading = useCallback(
    (itemId: number) =>
      cartLoading && cart.items.some((item) => item.id === itemId),
    [cartLoading, cart.items]
  );

  const isLoading = cartLoading || orderLoading || isCreatingOrder;

  // Format price function to handle number formatting
  const formatPrice = (price: number) => {
    return price;
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">{t("yourCart")}</h1>

      {cart?.items?.length === 0 || !cart.items ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t("emptyCart")}</p>
          <Link href={`/${locale}/products`}>
            <Button>{t("continueShopping")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b pb-6">
                <div className="relative w-24 h-24 rounded-md overflow-hidden">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.product.images[0]}`}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/${locale}/products/${item.product.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-muted-foreground text-sm mt-1">
                    {formatPrice(item.current_price)} {t("currency")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      isDisabled={
                        isItemLoading(item.id) ||
                        item.quantity <= 1 ||
                        isLoading
                      }
                    >
                      <FiMinus size={16} />
                    </Button>
                    <span className="px-4">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      isDisabled={
                        isItemLoading(item.id) ||
                        item.quantity >= item.max_available ||
                        isLoading
                      }
                    >
                      <FiPlus size={16} />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    isDisabled={isItemLoading(item.id) || isLoading}
                  >
                    <FiTrash2 size={18} className="text-red-500" />
                  </Button>
                  <div className="mt-auto text-right">
                    <p className="font-medium">
                      {formatPrice(item.current_price * item.quantity)}{" "}
                      {t("currency")}
                    </p>
                    {item.product.has_active_discount && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatPrice(
                          parseFloat(item.product.price) * item.quantity
                        )}{" "}
                        {t("currency")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">{t("orderSummary")}</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>{t("subtotal")}</span>
                  <span>
                    {formatPrice(cart.total_price)} {t("currency")}
                  </span>
                </div>
                {cart.total_discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t("discount")}</span>
                    <span>
                      -{formatPrice(cart.total_discount)} {t("currency")}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>{t("total")}</span>
                  <span>
                    {formatPrice(cart.total_price)} {t("currency")}
                  </span>
                </div>
              </div>
              <Button
                className="w-full mt-6"
                onClick={handleCheckout}
                isDisabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {tOrder("creatingOrder")}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FiShoppingBag size={18} />
                    {t("checkout")}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
