// app/[locale]/page.tsx
import { getTranslations } from "next-intl/server";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import DiscountBanner from "@/components/home/DiscountBanner";
import ProductGridSection from "@/components/home/ProductGridSection";
import FeaturedBrands from "@/components/home/FeaturedBrands";

export default async function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // params is not used here as getTranslations handles locale implicitly in server components
  const t = await getTranslations("home");

  return (
    <main className="flex flex-col gap-12 md:gap-16">
      <HeroSection
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        ctaText={t("hero.cta")}
      />

      <CategoriesSection
        title={t("categories.title")}
        seeAllText={t("categories.seeAll")}
      />

      <DiscountBanner />

      <ProductGridSection
        title={t("featured.title")}
        subtitle={t("featured.subtitle")}
        viewAllHref="/products?filter=featured"
      />

      <FeaturedBrands />

      <ProductGridSection
        title={t("trending.title")}
        subtitle={t("trending.subtitle")}
        viewAllHref="/products?filter=trending"
      />
    </main>
  );
}
