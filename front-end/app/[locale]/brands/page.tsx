// app/[locale]/brands/page.tsx
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { brandService } from "@/services/brandService";
import { BrandCard, BrandCardSkeleton } from "@/components/brands/BrandCard";
import { getAuthCookie } from "@/lib/server-cookies";
import Link from "next/link";
import { FiStopCircle } from "react-icons/fi";

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Brand");
  const token = await getAuthCookie();
  const brands = await brandService.getBrands(locale, token);

  return (
    <div className="container py-12">
      {/* Header with Blocked Brands Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">{t("allBrands")}</h1>

        {token && (
          <Link
            href="/brands/blocked"
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
          >
            <FiStopCircle className="w-4 h-4" />
            {t("viewBlockedBrands")}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <Suspense
          fallback={Array(10)
            .fill(0)
            .map((_, i) => (
              <BrandCardSkeleton key={i} />
            ))}
        >
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </Suspense>
      </div>
    </div>
  );
}
