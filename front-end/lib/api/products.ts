// lib/api/products.ts
import { api } from "./index";
import {
  ProductsResponse,
  ProductQueryParams,
  TopProductsResponse,
  ProductDetailResponse,
  Product,
} from "@/types/product";

export const productService = {
  async getProducts(
    params: ProductQueryParams = {},
    locale: string = "en",
    token?: string
  ): Promise<ProductsResponse> {
    // Convert params to URLSearchParams to handle undefined values
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response =
      token != null
        ? await api.get(`product/?${queryParams.toString()}`, {
          headers: {
            "Accept-Language": locale,
            Authorization: `Bearer ${token}`,
          },
        })
        : await api.get(`product/?${queryParams.toString()}`, {
          headers: {
            "Accept-Language": locale,
          },
        });

    return response.data;
  },

  async getProductById(
    id: number,
    locale: string = "en"
  ): Promise<ProductDetailResponse> {
    const response = await api.get(`product/${id}/`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    return response.data;
  },

  async getTopProducts(
    categoryId: number | string,
    locale: string = "en"
  ): Promise<TopProductsResponse> {
    const response = await api.get(
      `product/category/${categoryId}/top_products/`,
      {
        headers: {
          "Accept-Language": locale,
        },
      }
    );
    return response.data;
  },

  async deleteProduct(id: number, token: string, locale: string = "en"): Promise<void> {
    await api.delete(`product/${id}/`, {
      headers: {
        "Accept-Language": locale,
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async createProduct(data: FormData, token: string, locale: string = "en"): Promise<Product> {
    const response = await api.post('product/', data, {
      headers: {
        "Accept-Language": locale,
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async updateProduct(id: number, data: FormData, token: string, locale: string = "en"): Promise<Product> {
    const response = await api.put(`product/${id}/`, data, {
      headers: {
        "Accept-Language": locale,
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
