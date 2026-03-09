// services/auctionService.ts
import { api } from "@/lib/api";
import { Auction, CreateAuctionData, SellerProduct } from "@/types/auctions";
import { Product } from "@/types/product";
import toast from "react-hot-toast";

export class AuctionService {
  // Get seller's approved products for auction creation
  static async getSellerApprovedProducts(
    locale: string = "en",
    token: string
  ): Promise<Product[] | null> {
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
      return response.data.products;
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

  // Create new auction
  static async createAuction(
    data: CreateAuctionData,
    locale: string = "en",
    token: string
  ): Promise<Auction | null> {
    try {
      const response = await api.post("/auctions/create/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": locale,
          "Content-Type": "application/json",
        },
      });

      toast.success("Auction created successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error creating auction:", error);

      // Handle validation errors
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === "object") {
          Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((message: string) => {
                toast.error(`${field}: ${message}`);
              });
            }
          });
        } else {
          const errorMessage =
            errors.message || errors.error || "Failed to create auction";
          toast.error(errorMessage);
        }
      } else {
        toast.error("Failed to create auction");
      }

      return null;
    }
  }

  // Get seller's auctions
  static async getSellerAuctions(
    locale: string = "en",
    token: string
  ): Promise<Auction[] | null> {
    try {
      const response = await api.get("/auctions/seller/mine/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": locale,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching seller auctions:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch auctions";
      toast.error(errorMessage);
      return null;
    }
  }

  // Cancel auction
  static async cancelAuction(
    auctionId: number,
    locale: string = "en",
    token: string
  ): Promise<{ message: string } | null> {
    try {
      const response = await api.post(
        `/auctions/${auctionId}/cancel/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": locale,
          },
        }
      );

      toast.success("Auction cancelled successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error cancelling auction:", error);

      // Handle specific error messages
      if (error.response?.data) {
        if (Array.isArray(error.response.data)) {
          error.response.data.forEach((message: string) => {
            toast.error(message);
          });
        } else {
          const errorMessage =
            error.response.data.message ||
            error.response.data.error ||
            "Failed to cancel auction";
          toast.error(errorMessage);
        }
      } else {
        toast.error("Failed to cancel auction");
      }

      return null;
    }
  }
}
