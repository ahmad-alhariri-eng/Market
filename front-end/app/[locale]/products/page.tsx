// app/[locale]/products/page.tsx
import { ProductGrid } from "@/components/products/ProductGrid";
import { SearchFilters } from "@/components/products/SearchFilters";
import { productService } from "@/lib/api";
import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/ui/pagination";
import { categoryService } from "@/services/categoryService";
import { ProductQueryParams } from "@/types/product";
import { CategoriesNav } from "@/components/products/CategoriesNav";
import { getAuthCookie } from "@/lib/server-cookies";

export default async function ProductsBrowsePage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const t = await getTranslations("Products");
  const token = await getAuthCookie();
  // Helper function to handle string | string[] | undefined
  const getSingleParam = (
    param: string | string[] | undefined
  ): string | undefined => {
    if (Array.isArray(param)) return param[0];
    return param;
  };

  // Convert searchParams to typed params
  const currentParams = getQueryParams(searchParams);

  const [products, categories] = await Promise.all([
    productService.getProducts(currentParams, locale, token),
    categoryService.getCategories(locale),
    // Removed topBrands since we're using SearchFilters now
  ]);

  return (
    <div className="container py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {t("browseProducts")}
        </h1>
      </header>
      <CategoriesNav
        categories={categories}
        locale={locale}
        activeCategory={getSingleParam(searchParams.category_id)}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-6">
          <SearchFilters
            page="products"
            currentParams={{
              ...Object.fromEntries(
                Object.entries(currentParams).map(([key, value]) => [
                  key,
                  value?.toString(),
                ])
              ),
              // Ensure all values are present even if undefined
              min_price: currentParams.min_price?.toString(),
              max_price: currentParams.max_price?.toString(),
              min_rating: currentParams.min_rating?.toString(),
              max_rating: currentParams.max_rating?.toString(),
              min_quantity: currentParams.min_quantity?.toString(),
              max_quantity: currentParams.max_quantity?.toString(),
              brand_id: currentParams.brand_id?.toString(),
              category_id: currentParams.category_id?.toString(),
              parent_category_id: currentParams.parent_category_id?.toString(),
              // Convert booleans to strings for the form inputs
              has_discount: currentParams.has_discount ? "true" : undefined,
              in_stock: currentParams.in_stock ? "true" : undefined,
            }}
            resultCount={products.count}
          />
        </aside>

        <main className="lg:col-span-9">
          <ProductGrid products={products.results} />

          {products.count > 0 && (
            <Pagination
              currentPage={currentParams.page || 1}
              totalPages={Math.ceil(products.count / 20)}
              totalItems={products.count}
              itemsPerPage={20}
              baseUrl="/products"
              params={getPaginationParams(searchParams)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function getQueryParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): ProductQueryParams {
  const getSingle = (
    param: string | string[] | undefined
  ): string | undefined => {
    if (Array.isArray(param)) return param[0];
    return param;
  };

  const getNumber = (
    param: string | string[] | undefined
  ): number | undefined => {
    const value = getSingle(param);
    return value ? Number(value) : undefined;
  };

  return {
    page: getNumber(searchParams.page) || 1,
    category_id: getNumber(searchParams.category_id),
    parent_category_id: getNumber(searchParams.parent_category_id),
    brand_id: getNumber(searchParams.brand_id),
    min_price: getNumber(searchParams.min_price),
    max_price: getNumber(searchParams.max_price),
    min_rating: getNumber(searchParams.min_rating),
    max_rating: getNumber(searchParams.max_rating),
    min_quantity: getNumber(searchParams.min_quantity),
    max_quantity: getNumber(searchParams.max_quantity),
    has_discount: getSingle(searchParams.has_discount) === "true",
    in_stock: getSingle(searchParams.in_stock) === "true",
    sort_by: getSingle(searchParams.sort_by) as
      | "price"
      | "rating"
      | "created_at"
      | undefined,
    sort_direction: getSingle(searchParams.sort_direction) as
      | "asc"
      | "desc"
      | undefined,
    brand_slug: getSingle(searchParams.brand_slug),
    brand_name: getSingle(searchParams.brand_name),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPaginationParams(searchParams: any) {
  const params: Record<string, string> = {};
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && !["page"].includes(key)) {
      params[key] = Array.isArray(value) ? value[0] : value;
    }
  });
  return params;
}
