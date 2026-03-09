// lib/api/search.ts
import { api } from "./index";
import { SearchProductsResponse, SearchProductsParams } from "@/types/product";

export const searchService = {
  async searchProducts(
    params: SearchProductsParams,
    locale: string = "en"
  ): Promise<SearchProductsResponse> {
    const queryParams = new URLSearchParams();

    if (!params.q) {
      throw new Error("Search query is required");
    }

    // Explicitly include all possible parameters
    const allowedParams: (keyof SearchProductsParams)[] = [
      "q",
      "page",
      "category_id",
      "parent_category_id",
      "min_price",
      "max_price",
      "min_rating",
      "max_rating",
      "min_quantity",
      "max_quantity",
      "has_discount",
      "in_stock",
      "sort_by",
      "sort_direction",
      "brand_id",
      "brand_slug",
      "brand_name",
    ];

    allowedParams.forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    console.log(`product/search/?${queryParams.toString()}`);
    const response = await api.get(
      `product/search/?${queryParams.toString()}`,
      {
        headers: {
          "Accept-Language": locale,
        },
      }
    );

    return response.data;
  },
};
