// services/adminService.ts
import { api } from "@/lib/api";

export interface AdminKPIs {
    gmv: string;
    wallet_revenue: string;
    completed_orders: number;
    items_sold: number;
    avg_order_value: string;
    refund_rate: number;
    new_users: number;
    active_buyers: number;
    total_products: number;
    low_stock_count: number;
    pending: {
        returns: number;
    };
    reviews: {
        avg_rating: number;
        count_window: number;
    };
}

export interface AdminSummary {
    kpis: AdminKPIs;
    wallet: {
        total_platform_revenue: string;
        total_fees_collected: string;
    };
}

export interface SalesOverTimeItem {
    date: string;
    gmv: number;
    orders: number;
    items: number;
}

export interface TopSeller {
    id: number;
    email: string;
    username: string;
    points: number;
    is_verified_seller: boolean;
}

export interface TopProduct {
    product_id: number;
    name_en: string;
    name_ar: string;
    revenue: number;
    quantity: number;
    seller_email?: string;
}

export interface TopBuyer {
    buyer_id: number;
    email: string;
    username: string;
    spend: number;
    orders: number;
}

export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    role?: string;
}

export interface ReturnsBreakdown {
    total_returned_qty: number;
    by_reason: { reason: string; qty: number }[];
}

export interface RatingsDistribution {
    avg: number;
    buckets: Record<string, number>;
}

export interface LowStockItem {
    id: number;
    name_en: string;
    name_ar: string;
    quantity: number;
    seller_email?: string;
}

export interface BrandStats {
    id: number;
    name_en: string;
    name_ar: string;
    product_count: number;
    total_revenue: number;
}

export interface AuctionStats {
    total: number;
    by_status: Record<string, number>;
}

export class AdminService {
    private static headers(token: string, locale: string = "en") {
        return {
            Authorization: `Bearer ${token}`,
            "Accept-Language": locale,
        };
    }

    static async getDashboardSummary(
        token: string,
        locale: string = "en"
    ): Promise<AdminSummary | null> {
        try {
            const res = await api.get("/analytics/admin/summary/", {
                headers: this.headers(token, locale),
            });
            return res.data;
        } catch (err) {
            console.error("Admin summary error:", err);
            return null;
        }
    }

    static async getSalesOverTime(
        token: string,
        locale: string = "en",
        from?: string,
        to?: string
    ): Promise<SalesOverTimeItem[]> {
        try {
            const params: Record<string, string> = {};
            if (from) params.from = from;
            if (to) params.to = to;
            const res = await api.get("/analytics/admin/sales-over-time/", {
                headers: this.headers(token, locale),
                params,
            });
            return res.data;
        } catch (err) {
            console.error("Sales over time error:", err);
            return [];
        }
    }



    static async getTopProducts(
        token: string,
        locale: string = "en",
        metric: "revenue" | "quantity" = "revenue",
        limit: number = 10
    ): Promise<TopProduct[]> {
        try {
            const res = await api.get("/analytics/admin/top-products/", {
                headers: this.headers(token, locale),
                params: { metric, limit },
            });
            return res.data;
        } catch (err) {
            console.error("Top products error:", err);
            return [];
        }
    }

    static async getTopBuyers(
        token: string,
        locale: string = "en",
        metric: "spend" | "orders" = "spend",
        limit: number = 10
    ): Promise<TopBuyer[]> {
        try {
            const res = await api.get("/analytics/admin/top-buyers/", {
                headers: this.headers(token, locale),
                params: { metric, limit },
            });
            return res.data;
        } catch (err) {
            console.error("Top buyers error:", err);
            return [];
        }
    }

    static async getUsers(
        token: string,
        locale: string = "en"
    ): Promise<User[]> {
        try {
            const res = await api.get("/users/", {
                headers: this.headers(token, locale),
            });
            return res.data;
        } catch (err) {
            console.error("Users error:", err);
            return [];
        }
    }

    static async getRatingsDistribution(
        token: string,
        locale: string = "en"
    ): Promise<RatingsDistribution | null> {
        try {
            const res = await api.get("/analytics/admin/ratings/", {
                headers: this.headers(token, locale),
            });
            return res.data;
        } catch (err) {
            console.error("Ratings error:", err);
            return null;
        }
    }

    static async getLowStock(
        token: string,
        locale: string = "en",
        threshold: number = 5
    ): Promise<LowStockItem[]> {
        try {
            const res = await api.get("/analytics/admin/low-stock/", {
                headers: this.headers(token, locale),
                params: { threshold },
            });
            return res.data;
        } catch (err) {
            console.error("Low stock error:", err);
            return [];
        }
    }

    static async getBrandsStats(
        token: string,
        locale: string = "en"
    ): Promise<BrandStats[]> {
        try {
            const res = await api.get("/analytics/admin/brands-stats/", {
                headers: this.headers(token, locale),
            });
            return res.data;
        } catch (err) {
            console.error("Brands stats error:", err);
            return [];
        }
    }

    static async getAuctionsStats(
        token: string,
        locale: string = "en"
    ): Promise<AuctionStats | null> {
        try {
            const res = await api.get("/analytics/admin/auctions-stats/", {
                headers: this.headers(token, locale),
            });
            return res.data;
        } catch (err) {
            console.error("Auctions stats error:", err);
            return null;
        }
    }
}
