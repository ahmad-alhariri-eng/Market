// lib/api/reviews.ts
import { api } from "@/lib/api";
import { ProductReview } from "@/types/product";

export const reviewService = {
  async getProductReviews(
    productId: number,
    locale: string = "en"
  ): Promise<ProductReview[]> {
    const response = await api.get(`reviews/product/${productId}/`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    return response.data;
  },

  async createProductReview(
    productId: number,
    data: {
      rating: number;
      title?: string;
      comment?: string;
    },
    locale: string = "en"
  ) {
    const response = await api.post(`reviews/product/${productId}/`, data, {
      headers: {
        "Accept-Language": locale,
      },
    });
    return response.data;
  },
};
