// app/[locale]/orders/[id]/page.tsx
import { OrderDetails } from "@/components/orders/OrderDetails";
import { getAuthCookie } from "@/lib/server-cookies";
import { orderService } from "@/services/orderService";
import { notFound } from "next/navigation";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  const token = await getAuthCookie();

  if (!token) {
    return <div>Please login to view order details</div>;
  }

  try {
    const order = await orderService.getOrder(token, parseInt(id));

    if (!order) {
      notFound();
    }

    return <OrderDetails order={order} locale={locale} />;
  } catch (error) {
    console.error("Failed to fetch order:", error);
    notFound();
  }
}
