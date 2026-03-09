// lib/api/category-products.ts
import { api } from "./index";
import {
  CategoryProductsResponse,
  CategoryProductsParams,
} from "@/types/product";

export const categoryProductsService = {
  async getByCategory(
    categoryId: number | string,
    params: CategoryProductsParams = {},
    locale: string = "en"
  ): Promise<CategoryProductsResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(
      `product/category/${categoryId}/products/?${queryParams.toString()}`,
      {
        headers: {
          "Accept-Language": locale,
        },
      }
    );

    return response.data;
  },
};
