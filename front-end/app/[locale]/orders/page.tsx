// app/[locale]/orders/page.tsx
import { OrdersList } from "@/components/orders/OrdersList";
import { getAuthCookie } from "@/lib/server-cookies";
import { orderService } from "@/services/orderService";
import { notFound } from "next/navigation";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const token = await getAuthCookie();

  if (!token) {
    // Handle unauthorized case
    return <div>Please login to view your orders</div>;
  }

  try {
    const orders = await orderService.getOrders(token);
    return <OrdersList initialOrders={orders} locale={locale} />;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    notFound();
  }
}
