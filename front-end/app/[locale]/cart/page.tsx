// app/[locale]/cart/page.tsx
import { Cart } from "@/components/cart/CartComponent";
import { getAuthCookie } from "@/lib/server-cookies";
import { cartService } from "@/services/cartService";
import { notFound } from "next/navigation";
export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // const t = await getTranslations("Cart");
  const token = await getAuthCookie();

  if (!token) {
    // Handle unauthorized case
    return <div>Please login to view your cart</div>;
  }

  try {
    const initialCart = await cartService.getCart(token);
    return <Cart initialCart={initialCart} locale={locale} />;
  } catch (error) {
    console.error(error); // Log error to use it, or just ignore if that's the intention
    notFound();
  }
}
