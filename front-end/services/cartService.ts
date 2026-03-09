// lib/api/cart.ts
import { api } from "@/lib/api";
import { Cart, AddToCartPayload, UpdateCartItemPayload } from "@/types/cart";

export const cartService = {
  async getCart(token: string): Promise<Cart> {
    const response = await api.get("product/cart/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async addToCart(token: string, data: AddToCartPayload): Promise<Cart> {
    const response = await api.post("product/cart/add/", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async updateCartItem(
    token: string,
    itemId: number,
    data: UpdateCartItemPayload
  ): Promise<Cart> {
    const response = await api.patch(`product/cart/update/${itemId}/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async removeCartItem(token: string, itemId: number): Promise<Cart> {
    const response = await api.delete(`product/cart/remove/${itemId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
