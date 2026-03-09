// app/[locale]/products/[id]/page.tsx
import { ProductDetails } from "@/components/products/ProductDetails";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { productService } from "@/lib/api";
import { ProductDetailResponse } from "@/types/product";
import { getTranslations } from "next-intl/server";
import toast from "react-hot-toast";
import Link from "next/link";
import { ProductReviews } from "@/components/products/ProductReviews";
import { reviewService } from "@/services/reviewsService";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const t = await getTranslations("ProductDetail");

  try {
    const productData: ProductDetailResponse =
      await productService.getProductById(Number(id), locale);

    const reviews = await reviewService.getProductReviews(
      Number(id),
      locale
    );

    return (
      <div className="container py-8">
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-muted-foreground">
          <Link href={`/${locale}/products`}>{t("allProducts")}</Link>
          <span className="mx-2">/</span>
          <Link
            href={`/${locale}/products?parent_category_id=${productData.product.parent_category_id}`}
          >
            {productData.product.parent_category_name}
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/${locale}/products?category_id=${productData.product.category_id}`}
          >
            {productData.product.category_name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{productData.product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <ProductImageGallery images={productData.product.images} />

          {/* Product Details */}
          <ProductDetails
            product={productData.product}
            brand={productData.brand}
            locale={locale}
          />
        </div>



        <ProductReviews
          productId={productData.product.id}
          initialReviews={reviews}
          rating={productData.product.rating}
          ratingsCount={productData.product.ratings_count}
          locale={locale}
        />

        {/* Reviews Section */}
        {/* <ProductReviews
          productId={productData.product.id}
          rating={productData.product.rating}
          ratingsCount={productData.product.ratings_count}
          locale={params.locale}
        /> */}

        {/* Related Products */}
        {/* <RelatedProducts
          categoryId={productData.product.category_id}
          currentProductId={productData.product.id}
          locale={params.locale}
        /> */}
      </div>
    );
  } catch {
    toast.error(t("errorAddingToCart"));
  } finally {
  }
}
