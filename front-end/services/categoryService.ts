// lib/api/categories.ts
import { api } from "@/lib/api";
import { CategoriesResponse, Category } from "@/types/category";

export const categoryService = {
  async getCategories(locale: string = "en"): Promise<CategoriesResponse> {
    const response = await api.get("product/categories/localized/", {
      headers: {
        "Accept-Language": locale,
      },
    });
    return response.data;
  },

  async getCategoryById(id: number, locale: string = "en"): Promise<Category> {
    const response = await api.get(`product/categories/localized/${id}/`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    return response.data;
  },
};
