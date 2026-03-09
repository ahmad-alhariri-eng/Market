// app/[locale]/search/page.tsx
import { ProductGrid } from "@/components/products/ProductGrid";
import { SearchFilters } from "@/components/products/SearchFilters";
import { searchService } from "@/lib/api/search";
import { SearchProductsParams } from "@/types/product";
import { Pagination } from "@/components/ui/pagination";
import { getTranslations } from "next-intl/server";

export default async function SearchPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ locale: string }>;
}) {
  const searchParams = await props.searchParams;
  const { locale } = await props.params;
  // First await the translations
  const t = await getTranslations("Search");

  // Helper function to safely get single string value from searchParams
  const getParam = (key: string): string | undefined => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  // Convert URL params to our typed params
  const searchParamsTyped: SearchProductsParams = {
    q: getParam("q") || "",
    page: getParam("page") ? Number(getParam("page")) : 1,
    category_id: getParam("category_id")
      ? Number(getParam("category_id"))
      : undefined,
    parent_category_id: getParam("parent_category_id")
      ? Number(getParam("parent_category_id"))
      : undefined,
    min_price: getParam("min_price")
      ? Number(getParam("min_price"))
      : undefined,
    max_price: getParam("max_price")
      ? Number(getParam("max_price"))
      : undefined,
    min_rating: getParam("min_rating")
      ? Number(getParam("min_rating"))
      : undefined,
    max_rating: getParam("max_rating")
      ? Number(getParam("max_rating"))
      : undefined,
    min_quantity: getParam("min_quantity")
      ? Number(getParam("min_quantity"))
      : undefined,
    max_quantity: getParam("max_quantity")
      ? Number(getParam("max_quantity"))
      : undefined,
    has_discount: getParam("has_discount") === "true",
    in_stock: getParam("in_stock") === "true",
    sort_by:
      (getParam("sort_by") as
        | "price"
        | "rating"
        | "created_at"
        | "relevance") || "relevance",
    sort_direction: (getParam("sort_direction") as "asc" | "desc") || "desc",
    brand_id: getParam("brand_id") ? Number(getParam("brand_id")) : undefined,
    brand_slug: getParam("brand_slug") || undefined,
    brand_name: getParam("brand_name") || undefined,
  };

  // Validate required query
  if (!searchParamsTyped.q) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">{t("title", { query: "" })}</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("noResults")}</p>
        </div>
      </div>
    );
  }

  const results = await searchService.searchProducts(searchParamsTyped, locale);

  // Create params object for pagination that includes ALL filters
  const paginationParams = {
    q: searchParamsTyped.q,
    ...(searchParamsTyped.category_id && {
      category_id: searchParamsTyped.category_id.toString(),
    }),
    ...(searchParamsTyped.parent_category_id && {
      parent_category_id: searchParamsTyped.parent_category_id.toString(),
    }),
    ...(searchParamsTyped.min_price && {
      min_price: searchParamsTyped.min_price.toString(),
    }),
    ...(searchParamsTyped.max_price && {
      max_price: searchParamsTyped.max_price.toString(),
    }),
    ...(searchParamsTyped.min_rating && {
      min_rating: searchParamsTyped.min_rating.toString(),
    }),
    ...(searchParamsTyped.max_rating && {
      max_rating: searchParamsTyped.max_rating.toString(),
    }),
    ...(searchParamsTyped.min_quantity && {
      min_quantity: searchParamsTyped.min_quantity.toString(),
    }),
    ...(searchParamsTyped.max_quantity && {
      max_quantity: searchParamsTyped.max_quantity.toString(),
    }),
    ...(searchParamsTyped.has_discount && { has_discount: "true" }),
    ...(searchParamsTyped.in_stock && { in_stock: "true" }),
    ...(searchParamsTyped.brand_id && {
      brand_id: searchParamsTyped.brand_id.toString(),
    }),
    ...(searchParamsTyped.brand_slug && {
      brand_slug: searchParamsTyped.brand_slug,
    }),
    ...(searchParamsTyped.brand_name && {
      brand_name: searchParamsTyped.brand_name,
    }),
    sort_by: searchParamsTyped.sort_by,
    sort_direction: searchParamsTyped.sort_direction,
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">
        {t("title", { query: searchParamsTyped.q })}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SearchFilters
            page="search"
            currentParams={Object.fromEntries(
              Object.entries(searchParamsTyped).map(([key, value]) => [
                key,
                value?.toString(),
              ])
            )}
            resultCount={results.count}
          />
        </div>
        <div className="md:col-span-3 space-y-6">
          <ProductGrid products={results.results} />

          {results.count > 0 && (
            <Pagination
              currentPage={searchParamsTyped.page || 1}
              totalPages={results.total_pages}
              totalItems={results.count}
              itemsPerPage={results.results.length}
              baseUrl="/search"
              params={paginationParams}
            />
          )}
        </div>
      </div>
    </div>
  );
}
