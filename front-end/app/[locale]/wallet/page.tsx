// app/[locale]/wallet/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import { WalletService } from "@/services/walletService";
import { Wallet, WalletTransaction } from "@/types/wallet";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  FiDollarSign,
  FiCreditCard,
  FiClock,
  FiCheck,
  FiX,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiInfo
} from "react-icons/fi";

export default function WalletPage() {
  const locale = useLocale();
  const t = useTranslations("Wallet");
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions">("overview");

  const fetchWalletData = useCallback(async (isRefreshing = false) => {
    if (!token) return;

    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [walletData, transactionsData] = await Promise.all([
        WalletService.getWallet(locale, token),
        WalletService.getWalletTransactions(locale, token),
      ]);

      if (walletData) setWallet(walletData);
      if (transactionsData) setTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [locale, token]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(numAmount));
  };

  const getAmountColor = (amount: string) => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) return "text-success";
    if (numAmount < 0) return "text-error";
    return "text-muted-foreground";
  };

  const getTransactionIcon = (transactionType: string) => {
    switch (transactionType) {
      case "deposit":
      case "refund":
      case "escrow_release":
        return <FiTrendingUp className="text-success" />;
      case "withdrawal":
      case "payment":
      case "escrow_hold":
        return <FiTrendingDown className="text-error" />;
      case "transfer":
        return <FiCreditCard className="text-warning" />;
      default:
        return <FiInfo className="text-muted-foreground" />;
    }
  };

  const getTransactionTypeText = (transactionType: string) => {
    const typeMap: Record<string, string> = {
      deposit: t("transactionTypes.deposit"),
      withdrawal: t("transactionTypes.withdrawal"),
      payment: t("transactionTypes.payment"),
      refund: t("transactionTypes.refund"),
      transfer: t("transactionTypes.transfer"),
      escrow_hold: t("transactionTypes.escrowHold"),
      escrow_release: t("transactionTypes.escrowRelease"),
    };
    return typeMap[transactionType] || transactionType;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
      </div>

      {/* Refresh Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => fetchWalletData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {t("refresh")}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-muted">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "overview"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("tabs.overview")}
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "transactions"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("tabs.transactions")}
          </button>
        </div>
      </div>

      {activeTab === "overview" && wallet && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Available Balance */}
          <div className="bg-background border border-muted rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t("availableBalance")}
              </h3>
              <FiDollarSign className="w-6 h-6 text-success" />
            </div>
            <p className="text-3xl font-bold text-success">
              {formatAmount(wallet.balance)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("availableBalanceDescription")}
            </p>
          </div>

          {/* Held Balance */}
          <div className="bg-background border border-muted rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t("heldBalance")}
              </h3>
              <FiClock className="w-6 h-6 text-warning" />
            </div>
            <p className="text-3xl font-bold text-warning">
              {formatAmount(wallet.held_balance)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("heldBalanceDescription")}
            </p>
          </div>

          {/* Total Balance */}
          <div className="bg-background border border-muted rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t("totalBalance")}
              </h3>
              <FiCreditCard className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">
              {formatAmount(
                (parseFloat(wallet.balance) + parseFloat(wallet.held_balance)).toString()
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("totalBalanceDescription")}
            </p>
          </div>

          {/* Wallet Status */}
          <div className="bg-background border border-muted rounded-lg p-6 md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t("walletStatus")}
                </h3>
                <p className="text-muted-foreground">
                  {wallet.is_active ? t("statusActive") : t("statusInactive")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {wallet.is_active ? (
                  <FiCheck className="w-6 h-6 text-success" />
                ) : (
                  <FiX className="w-6 h-6 text-error" />
                )}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    wallet.is_active
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}
                >
                  {wallet.is_active ? t("active") : t("inactive")}
                </span>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>{t("walletCreated")}: {formatDate(wallet.created_at)}</p>
              <p>{t("lastUpdated")}: {formatDate(wallet.updated_at)}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {t("transactionHistory")}
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <FiCreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noTransactions")}</p>
            </div>
          ) : (
            <div className="bg-background border border-muted rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t("table.date")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t("table.description")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t("table.type")}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t("table.amount")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t("table.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-muted/10">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground">
                            {transaction.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.reference}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.transaction_type)}
                            <span className="text-sm text-foreground">
                              {getTransactionTypeText(transaction.transaction_type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-medium ${getAmountColor(transaction.amount)}`}>
                            {formatAmount(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.is_successful
                                ? "bg-success/10 text-success"
                                : "bg-error/10 text-error"
                            }`}
                          >
                            {transaction.is_successful ? (
                              <>
                                <FiCheck className="w-3 h-3 mr-1" />
                                {t("statusSuccess")}
                              </>
                            ) : (
                              <>
                                <FiX className="w-3 h-3 mr-1" />
                                {t("statusFailed")}
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}