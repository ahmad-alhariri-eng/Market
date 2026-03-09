// components/orders/OrderDetails.tsx
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiRefreshCw,
  FiArrowLeft,
} from "react-icons/fi";
import { useCallback, useState } from "react";
import Link from "next/link";
import { Order } from "@/types/order";

interface OrderDetailsProps {
  order: Order;
  locale: string;
}

export function OrderDetails({ order, locale }: OrderDetailsProps) {
  const t = useTranslations("Orders");
  const tReturns = useTranslations("Returns");
  const [isRefundingAll, setIsRefundingAll] = useState(false);
  // Removed useReturns hook as it relies on the returns infrastructure
  // The refund functionality needs to be adapted or removed if returns are fully purged
  const isLoading = false; // Stubbed for now

  const canRefundAll = order.status === "completed";

  const handleRefundAll = useCallback(async () => {
    setIsRefundingAll(true);
    try {
      // Stubbed refund request
    } catch {
      // const message = err instanceof Error ? err.message : "Refund request failed";
      // toast.error(message);
    } finally {
      setIsRefundingAll(false);
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "created":
        return <FiClock className="text-blue-500" />;
      case "processing":
        return <FiRefreshCw className="text-orange-500" />;
      case "shipped":
        return <FiTruck className="text-purple-500" />;
      case "delivered":
        return <FiPackage className="text-green-500" />;
      case "completed":
        return <FiCheckCircle className="text-green-600" />;
      case "cancelled":
        return <FiXCircle className="text-red-500" />;
      case "refunded":
        return <FiDollarSign className="text-gray-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-200 text-green-900";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container py-8">
      <Link
        href={`/${locale}/orders`}
        className="inline-flex items-center gap-2 mb-6 text-primary hover:underline"
      >
        <FiArrowLeft size={16} />
        {t("backToOrders")}
      </Link>

      <div className="border rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {t("order")} #{order.order_number}
            </h1>
            <p className="text-muted-foreground">
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

            {canRefundAll && (
              <Button
                variant="outline"
                onClick={handleRefundAll}
                isDisabled={isLoading || isRefundingAll}
              >
                {isRefundingAll ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    {tReturns("processingRefund")}
                  </div>
                ) : (
                  tReturns("refundAll")
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">{t("items")}</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <FiPackage className="w-8 h-8 text-gray-400" />
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
                  <p className="text-sm text-muted-foreground">
                    {tReturns("priceAtPurchase")}: {item.price_at_purchase}{" "}
                    {t("currency")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-medium">
                    {item.total_price} {t("currency")}
                  </p>

                  {/* Return request functionality removed to align with single-vendor mode */}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">{t("totalAmount")}:</span>
            <span className="text-xl font-bold">
              {order.total_amount} {t("currency")}
            </span>
          </div>
        </div>
      </div>

      {/* Return request modal removed */}
    </div>
  );
}
