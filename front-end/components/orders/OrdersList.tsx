// components/orders/OrdersList.tsx
"use client";

import { useTranslations } from "next-intl";
import { Order, OrderStatus } from "@/types/order";
import { Button } from "@/components/ui/button";
import {
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useOrders } from "@/hooks/useOrder";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

interface OrdersListProps {
  initialOrders: Order[];
  locale: string;
}

export function OrdersList({ initialOrders, locale }: OrdersListProps) {
  const t = useTranslations("Orders");
  const [orders, setOrders] = useState(initialOrders);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(
    null
  );
  const { cancelOrder, isLoading } = useOrders();
  const { token } = useAuth();
  const router = useRouter();
  if (!token) router.push("/auth/login");
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "created":
        return <FiClock className="text-blue-500" />;
      case "processing":
        return <FiRefreshCw className="text-orange-500" />;
      case "completed":
        return <FiCheckCircle className="text-green-600" />;
      case "cancelled":
        return <FiXCircle className="text-red-500" />;
      case "underpaid":
        return <FiClock className="text-orange-500" />;
      case "expired":
        return <FiXCircle className="text-gray-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "created":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-200 text-green-900";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "underpaid":
        return "bg-orange-100 text-orange-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canCancelOrder = (status: OrderStatus) => {
    return ["created", "processing"].includes(status);
  };

  const handleCancelOrder = useCallback(
    async (orderId: number) => {
      setCancellingOrderId(orderId);
      try {
        const result = await cancelOrder(orderId);
        if (result.status === "cancelled") {
          toast.success(t("orderCancelled"));
          // Update the order status locally
          setOrders((prev) =>
            prev.map((order) =>
              order.id === orderId
                ? { ...order, status: "cancelled", status_display: "Cancelled" }
                : order
            )
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : t("cancelFailed");
        toast.error(message);
      } finally {
        setCancellingOrderId(null);
      }
    },
    [cancelOrder, t]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (orders.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">{t("yourOrders")}</h1>
        <div className="text-center py-12">
          <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-muted-foreground mb-4">{t("noOrders")}</p>
          <Link href={`/${locale}/products`}>
            <Button>{t("startShopping")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">{t("yourOrders")}</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  <Link href={`orders/${order.id}`}>
                    {t("order")} #{order.order_number}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("placedOn")} {formatDate(order.created_at)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    {order.status_display}
                  </div>
                </div>

                {canCancelOrder(order.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
                    isDisabled={isLoading || cancellingOrderId === order.id}
                  >
                    {cancellingOrderId === order.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        {t("cancelling")}
                      </div>
                    ) : (
                      t("cancelOrder")
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">{t("items")}</h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                      {/* Placeholder for product image */}
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="w-8 h-8 text-gray-400" />
                        <Image
                          src={item.product.images[0]}
                          alt={`product ${item.product.id} image`}
                          fill
                          className=" object-cover text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {locale === "ar"
                          ? item.product.name_ar
                          : item.product.name_en}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("quantity")}: {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("seller")}: {item.seller}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.total_price} {t("currency")}
                      </p>
                      <p className="text-sm text-muted-foreground line-through">
                        {(
                          parseFloat(item.product.price) * item.quantity
                        ).toFixed(2)}{" "}
                        {t("currency")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t("totalAmount")}:</span>
                <span className="text-lg font-bold">
                  {order.total_amount} {t("currency")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
