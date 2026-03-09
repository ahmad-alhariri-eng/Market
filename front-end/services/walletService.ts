// services/walletService.ts
import { api } from "@/lib/api";
import { Wallet, WalletTransaction, WalletResponse } from "@/types/wallet";
import toast from "react-hot-toast";

export class WalletService {
  // Get wallet balance and information
  static async getWallet(
    locale: string = "en",
    token: string
  ): Promise<Wallet | null> {
    try {
      const response = await api.get("/wallet/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": locale,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching wallet:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch wallet information";
      toast.error(errorMessage);
      return null;
    }
  }

  // Get wallet transactions
  static async getWalletTransactions(
    locale: string = "en",
    token: string
  ): Promise<WalletTransaction[] | null> {
    try {
      const response = await api.get("/wallet/transactions/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": locale,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching wallet transactions:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch wallet transactions";
      toast.error(errorMessage);
      return null;
    }
  }

  // Get complete wallet data (balance + transactions)
  static async getCompleteWalletData(
    locale: string = "en",
    token: string
  ): Promise<WalletResponse | null> {
    try {
      const [walletData, transactionsData] = await Promise.all([
        this.getWallet(locale, token),
        this.getWalletTransactions(locale, token),
      ]);

      if (walletData && transactionsData) {
        return {
          wallet: walletData,
          transactions: transactionsData,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching complete wallet data:", error);
      return null;
    }
  }
}
