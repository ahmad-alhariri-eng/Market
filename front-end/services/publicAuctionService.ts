// services/publicAuctionService.ts
import { api } from "@/lib/api";
import {
  PublicAuction,
  CategoryAuction,
  BidData,
  BidResponse,
  BidError,
} from "@/types/auctions";
import toast from "react-hot-toast";

export class PublicAuctionService {
  // Get all public auctions
  static async getPublicAuctions(
    locale: string = "en"
  ): Promise<PublicAuction[] | null> {
    try {
      const response = await api.get("/auctions/", {
        headers: {
          "Accept-Language": locale,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching public auctions:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch auctions";
      toast.error(errorMessage);
      return null;
    }
  }

  // Get auctions by subcategory
  static async getAuctionsBySubcategory(
    subcategoryId: number,
    locale: string = "en"
  ): Promise<CategoryAuction[] | null> {
    try {
      const response = await api.get(
        `/auctions/public/subcategory/${subcategoryId}/`,
        {
          headers: {
            "Accept-Language": locale,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching category auctions:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch category auctions";
      toast.error(errorMessage);
      return null;
    }
  }

  // Place a bid on an auction
  static async placeBid(
    auctionId: number,
    bidData: BidData,
    locale: string = "en",
    token?: string
  ): Promise<BidResponse | null> {
    try {
      const headers: Record<string, string> = {
        "Accept-Language": locale,
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await api.post(`/auctions/${auctionId}/bid/`, bidData, {
        headers,
      });

      toast.success("Bid placed successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error placing bid:", error);

      // Handle specific error cases
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((errorMsg: string) => {
          if (errorMsg.includes("Seller cannot bid on their own auction")) {
            toast.error("You cannot bid on your own auction");
          } else {
            toast.error(errorMsg);
          }
        });
      } else if (error.response?.data?.error) {
        if (error.response.data.error.includes("Seller cannot bid")) {
          toast.error("You cannot bid on your own auction");
        } else {
          toast.error(error.response.data.error);
        }
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to place bid";
        toast.error(errorMessage);
      }

      return null;
    }
  }

  // Get auction details
  static async getAuctionDetails(
    auctionId: number,
    locale: string = "en"
  ): Promise<PublicAuction | null> {
    try {
      const response = await api.get(`/auctions/${auctionId}/`, {
        headers: {
          "Accept-Language": locale,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching auction details:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch auction details";
      toast.error(errorMessage);
      return null;
    }
  }
}
