// lib/api/discounts.ts
import { api } from "@/lib/api";
import { DiscountResponse, DiscountsResponse } from "@/types/discount";

export const discountService = {
  async getActiveDiscounts(locale: string = "en"): Promise<DiscountsResponse> {
    const response = await api.get("product/sales/active/", {
      headers: {
        "Accept-Language": locale,
      },
    });
    return response.data;
  },
  async getDiscount(locale: string = "en"): Promise<DiscountResponse | null> {
    try {
      // First fetch active discounts
      const activeDiscounts = await this.getActiveDiscounts(locale);

      if (activeDiscounts && activeDiscounts.length > 0) {
        // Use the first active discount
        const firstDiscountId = activeDiscounts[0].id;
        const response = await api.get(`product/sales/${firstDiscountId}/`, {
          headers: {
            "Accept-Language": locale,
          },
        });
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching discount:", error);
      return null;
    }
  },
};
