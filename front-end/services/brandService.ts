// lib/api/brands.ts

import { api } from "@/lib/api";
import { Brand, BrandProduct, BrandsResponse } from "@/types/brands";

export const brandService = {
  async getTopBrands(locale: string = "en"): Promise<BrandsResponse> {
    const response = await api.get("product/brands/top-by-products/", {
      headers: {
        "Accept-Language": locale,
      },
    });
    return response.data;
  },

  async getBrands(locale: string = "en", token?: string): Promise<Brand[]> {
    const response =
      token != null
        ? await api.get("product/brands/", {
          headers: {
            "Accept-Language": locale,
            Authorization: `Bearer ${token}`,
          },
        })
        : await api.get("product/brands/", {
          headers: {
            "Accept-Language": locale,
          },
        });
    return response.data;
  },

  async getBrandById(id: number, locale: string = "en"): Promise<Brand> {
    const response = await api.get(`product/brands/${id}/`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    return response.data;
  },

  async getBrandBySlug(slug: string, locale: string = "en"): Promise<Brand> {
    const response = await api.get(`product/brands/slug/${slug}/`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    return response.data;
  },

  async getBrandProducts(
    brandId: number,
    page: number = 1,
    locale: string = "en"
  ): Promise<{ results: BrandProduct[]; count: number }> {
    const response = await api.get(`product/brands/${brandId}/products/`, {
      params: { page },
      headers: {
        "Accept-Language": locale,
      },
    });
    return response.data;
  },

  async createBrand(
    data: { name: string; description?: string; logo?: File },
    locale: string = "en"
  ): Promise<Brand> {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.logo) formData.append("logo", data.logo);

    const response = await api.post("product/brands/", formData, {
      headers: {
        "Accept-Language": locale,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async blockBrand(
    brandId: number,
    locale: string = "en",
    token: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `product/brands/${brandId}/block/`,
      {},
      {
        headers: {
          "Accept-Language": locale,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
  async getBlockedBrands(
    locale: string = "en",
    token: string
  ): Promise<Brand[]> {
    const response = await api.get("product/brands/blocked/", {
      headers: {
        "Accept-Language": locale,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async unblockBrand(
    brandId: number,
    locale: string = "en",
    token: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `product/brands/${brandId}/unblock/`,
      {},
      {
        headers: {
          "Accept-Language": locale,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
