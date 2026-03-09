// lib/api/order.ts
import { api } from "@/lib/api";
import { CancelOrderResponse, CreateOrderResponse, Order } from "@/types/order";

export const orderService = {
  async createOrder(token: string): Promise<CreateOrderResponse> {
    try {
      const response = await api.post(
        "orders/checkout/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the response contains a business logic error
      if (response.data && response.data.error) {
        // Return the error response directly (don't throw)
        return response.data;
      }

      return response.data;
    } catch (err: any) {
      console.log("Order service error:", err);

      // Handle axios error response (HTTP errors like 400, 500, etc.)
      if (err.error) {
        return { error: err.detail, detail: err.detail };
      }

      // Handle network errors or other exceptions
      return {
        error: "Network error",
        detail: "Please check your internet connection and try again.",
      };
    }
  },

  async getOrders(token: string): Promise<Order[]> {
    const response = await api.get("orders/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getOrder(token: string, orderId: number): Promise<Order | null> {
    try {
      const response = await api.get(`orders/${orderId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      return response.data;
    } catch (err) {
      console.log(err);
      return null;
    }
  },

  async cancelOrder(
    token: string,
    orderId: number
  ): Promise<CancelOrderResponse> {
    try {
      const response = await api.post(
        `orders/${orderId}/cancel/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err: any) {
      if (err.response?.data) {
        return err.response.data;
      }
      return {
        error: "Network error",
      };
    }
  },
};
