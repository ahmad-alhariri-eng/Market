// lib/api/wishlist.ts
import { api } from "@/lib/api";
import { Wishlist } from "@/types/wishlist";

export const wishlistService = {
  async getWishlist(token: string, locale: string = "en"): Promise<Wishlist> {
    const response = await api.get(`product/wishlist/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": locale,
      },
    });
    return response.data;
  },

  async addToWishlist(
    productId: string | number,
    token: string,
    locale: string = "en"
  ): Promise<Wishlist> {
    const response = await api.post(
      `product/wishlist/add/`,
      { product_id: productId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": locale,
        },
      }
    );
    return response.data;
  },

  async removeFromWishlist(
    itemId: number,
    token: string,
    locale: string = "en"
  ): Promise<void> {
    await api.delete(`product/wishlist/remove/${itemId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Language": locale,
      },
    });
  },
};
