// components/products/ProductSellerInfo.tsx
"use client";

import { useTranslations } from "next-intl";
import { Seller } from "@/types/product";
import Image from "next/image";
import Link from "next/link";

interface ProductSellerInfoProps {
  seller: Seller;
  locale: string;
}

export function ProductSellerInfo({ seller }: ProductSellerInfoProps) {
  const t = useTranslations("ProductDetail");

  return (
    <div className="border-t border-b py-8 my-8">
      <h2 className="text-xl font-bold mb-6">{t("sellerInfo")}</h2>
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
          {seller.profile?.image ? (
            <Image
              src={seller.profile.image}
              alt={seller.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl bg-primary text-white">
              {seller.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${seller.id}`}
              className="text-lg font-semibold"
            >
              {seller.username}
            </Link>
            {seller.is_verified_seller && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {t("verifiedSeller")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
