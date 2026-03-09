// app/[locale]/auctions/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { PublicAuctionService } from "@/services/publicAuctionService";
import { PublicAuction } from "@/types/auctions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  FiClock,
  FiCalendar,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function PublicAuctionsPage() {
  const locale = useLocale();
  const t = useTranslations("PublicAuctions");
  const router = useRouter();
  // fixed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user, token } = (useAuth as any)();
  const [auctions, setAuctions] = useState<PublicAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [bidAmounts, setBidAmounts] = useState<Record<number, string>>({});
  const [bidding, setBidding] = useState<number | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const isUserTheSeller = (auction: PublicAuction) => {
    return user && auction.seller_id && user.id === auction.seller_id;
  };

  const fetchAuctions = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (loadingMore) return;

      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const auctionsData = await PublicAuctionService.getPublicAuctions(
          locale
        );

        if (auctionsData) {
          if (append) {
            setAuctions((prev) => [...prev, ...auctionsData]);
          } else {
            setAuctions(auctionsData);
          }

          // For simplicity, we'll assume single page since API doesn't provide pagination info
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching auctions:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [locale, loadingMore]
  );

  useEffect(() => {
    fetchAuctions(1, false);
  }, [fetchAuctions]);

  // Infinite scroll setup
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore) {
        fetchAuctions(page + 1, true);
        setPage((prev) => prev + 1);
      }
    };

    if (loadMoreRef.current) {
      observer.current = new IntersectionObserver(observerCallback, {
        rootMargin: "100px",
        threshold: 0.1,
      });
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, page, fetchAuctions]);

  const handleBidChange = (auctionId: number, amount: string) => {
    setBidAmounts((prev) => ({
      ...prev,
      [auctionId]: amount,
    }));
  };

  const handlePlaceBid = async (auctionId: number) => {
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const amount = bidAmounts[auctionId];
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    setBidding(auctionId);
    try {
      const result = await PublicAuctionService.placeBid(
        auctionId,
        { amount },
        locale,
        token
      );

      if (result) {
        setBidAmounts((prev) => ({ ...prev, [auctionId]: "" }));
        // Refresh auctions to update current price and highest bid
        fetchAuctions(1, false);
      }
    } catch (error) {
      console.error("Error placing bid:", error);
    } finally {
      setBidding(null);
    }
  };

  const calculateMinNextBid = (auction: PublicAuction) => {
    const currentPrice = parseFloat(auction.current_price);
    const minIncrement = parseFloat(auction.min_increment);
    return (currentPrice + minIncrement).toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success";
      case "approved":
        return "bg-warning/10 text-warning";
      case "ended":
        return "bg-error/10 text-error";
      case "cancelled":
        return "bg-muted/10 text-muted-foreground";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return t("status.active");
      case "approved":
        return t("status.approved");
      case "ended":
        return t("status.ended");
      case "cancelled":
        return t("status.cancelled");
      default:
        return status;
    }
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

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return t("ended");

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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



      {auctions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("noAuctions")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                className="bg-background border border-muted rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Auction Image Placeholder */}
                <div className="h-48 bg-muted/30 flex items-center justify-center"></div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                      {auction.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        auction.status
                      )}`}
                    >
                      {getStatusText(auction.status)}
                    </span>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {auction.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("currentPrice")}:
                      </span>
                      <span className="font-semibold text-success">
                        ${auction.current_price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("startPrice")}:
                      </span>
                      <span className="line-through text-muted-foreground">
                        ${auction.start_price}
                      </span>
                    </div>

                    {auction.highest_bid && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t("highestBid")}:
                        </span>
                        <span className="font-semibold">
                          ${auction.highest_bid.amount}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("minIncrement")}:
                      </span>
                      <span>${auction.min_increment}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        <span>{t("endsIn")}:</span>
                      </div>
                      <span
                        className={
                          auction.status === "active"
                            ? "text-warning font-medium"
                            : ""
                        }
                      >
                        {getTimeRemaining(auction.end_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>{t("ends")}:</span>
                      </div>
                      <span>{formatDate(auction.end_at)}</span>
                    </div>
                  </div>

                  {auction.status === "active" && !isUserTheSeller(auction) && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={calculateMinNextBid(auction)}
                          step={auction.min_increment}
                          value={bidAmounts[auction.id] || ""}
                          onChange={(e) =>
                            handleBidChange(auction.id, e.target.value)
                          }
                          placeholder={`Min: $${calculateMinNextBid(auction)}`}
                          className="flex-1 px-3 py-2 border border-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={bidding === auction.id}
                        />
                        <button
                          onClick={() => handlePlaceBid(auction.id)}
                          disabled={
                            bidding === auction.id || !bidAmounts[auction.id]
                          }
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {bidding === auction.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            t("placeBid")
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("minBidHint")}: ${calculateMinNextBid(auction)}
                      </p>
                    </div>
                  )}

                  {auction.status === "active" && isUserTheSeller(auction) && (
                    <div className="text-center py-2">
                      <span className="text-sm text-muted-foreground">
                        {t("ownAuctionMessage")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="mt-8 text-center">
              {loadingMore && <LoadingSpinner size="md" />}
            </div>
          )}

          {!hasMore && auctions.length > 0 && (
            <div className="mt-8 text-center text-muted-foreground">
              {t("noMoreAuctions")}
            </div>
          )}
        </>
      )}
    </div>
  );
}
