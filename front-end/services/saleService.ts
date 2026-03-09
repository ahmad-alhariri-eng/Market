// services/saleService.ts
import { api } from "@/lib/api";
import {
  Sale,
  SaleDetail,
  SaleProductsResponse,
  AddProductToSaleData,
  AddProductToSaleResponse,
  SalesResponse,
  SalesParticipationResponse,
} from "@/types/sale";
import toast from "react-hot-toast";

export class SaleService {
  // Get upcoming and active sales
  static async getSales(
    locale: string = "en",
    token?: string
  ): Promise<SalesResponse | null> {
    try {
      const headers: Record<string, string> = {
        "Accept-Language": locale,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await api.get("/product/sales/upcoming/", { headers });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching sales:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch sales";
      toast.error(errorMessage);
      return null;
    }
  }

  // Get sale details
  static async getSaleDetail(
    saleId: number,
    locale: string = "en",
    token?: string
  ): Promise<SaleDetail | null> {
    try {
      const headers: Record<string, string> = {
        "Accept-Language": locale,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await api.get(`/product/sales/${saleId}/`, { headers });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching sale details:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch sale details";
      toast.error(errorMessage);
      return null;
    }
  }

  // Get seller's approved products (minimal version)
  static async getSellerApprovedProducts(
    locale: string = "en",
    token: string
  ): Promise<SaleProductsResponse | null> {
    try {
      const response = await api.get(
        "/product/seller/products/approved-minimal/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": locale,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching approved products:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch approved products";
      toast.error(errorMessage);
      return null;
    }
  }

  // Add product to sale
  static async addProductToSale(
    data: AddProductToSaleData,
    locale: string = "en",
    token: string
  ): Promise<AddProductToSaleResponse | null> {
    try {
      const response = await api.post("/product/seller/sales/add/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": locale,
          "Content-Type": "application/json",
        },
      });

      toast.success("Product added to sale successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error adding product to sale:", error);

      // Handle specific error cases
      if (error.response?.data?.error) {
        const errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]
          : error.response.data.error;
        toast.error(errorMessage);
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to add product to sale";
        toast.error(errorMessage);
      }

      return null;
    }
  }

  static async getSalesParticipation(
    locale: string = "en",
    token: string
  ): Promise<SalesParticipationResponse | null> {
    try {
      const response = await api.get("/product/seller/sales-participation/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": locale,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching sales participation:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch sales participation";
      toast.error(errorMessage);
      return null;
    }
  }

  static async updateProductDiscount(
    productId: number,
    saleId: number, // Added saleId parameter
    discountPercentage: number,
    locale: string = "en",
    token: string
  ): Promise<{ message: string } | null> {
    try {
      const response = await api.patch(
        `product/seller/sales/update/`, // Updated endpoint
        {
          product_id: productId,
          sale_id: saleId,
          discount_percentage: discountPercentage.toFixed(2),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": locale,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Discount percentage updated successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error updating discount:", error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update discount percentage";

      toast.error(errorMessage);
      return null;
    }
  }

  static async removeProductFromSale(
    productId: number,
    saleId: number, // Added saleId parameter
    locale: string = "en",
    token: string
  ): Promise<{ message: string } | null> {
    try {
      const response = await api.delete(
        `product/seller/sales/delete/`, // Updated endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": locale,
            "Content-Type": "application/json",
          },
          data: {
            // Send data in request body for DELETE
            product_id: productId,
            sale_id: saleId,
          },
        }
      );

      toast.success("Product removed from sale successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error removing product from sale:", error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to remove product from sale";

      toast.error(errorMessage);
      return null;
    }
  }

  static async getActiveSales(locale: string = "en"): Promise<Sale[] | null> {
    try {
      const response = await api.get("/product/sales/active/", {
        headers: {
          "Accept-Language": locale,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching active sales:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch active sales";
      toast.error(errorMessage);
      return null;
    }
  }

  static async getSaleProducts(
    saleId: number,
    page: number = 1,
    locale: string = "en"
  ): Promise<SaleProductsResponse | null> {
    try {
      const response = await api.get(`/product/sales/${saleId}/products/`, {
        headers: {
          "Accept-Language": locale,
        },
        params: {
          page: page,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching sale products:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch sale products";
      toast.error(errorMessage);
      return null;
    }
  }
}
