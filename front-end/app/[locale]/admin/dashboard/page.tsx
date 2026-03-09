// app/[locale]/admin/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import {
    AdminService,
    AdminSummary,
    TopProduct,
    TopBuyer,
    LowStockItem,
    SalesOverTimeItem,
} from "@/services/adminService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
    FiDollarSign,
    FiShoppingCart,
    FiUsers,
    FiPackage,
    FiTrendingUp,
    FiAlertTriangle,
    FiArrowUpRight,
    FiArrowDownRight,
    FiClock,
    FiChevronRight,
} from "react-icons/fi";

// Register ChartJS Components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function KPICard({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    colorClass,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend: number; // positive or negative percentage
    trendLabel: string;
    colorClass: string;
}) {
    const isPositive = trend >= 0;
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Background decoration */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 duration-500 ease-out ${colorClass}`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-full ${isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                    {isPositive ? <FiArrowUpRight className="w-4 h-4" /> : <FiArrowDownRight className="w-4 h-4" />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h2>
                <p className="text-xs text-gray-400 mt-2">{trendLabel}</p>
            </div>
        </div>
    );
}

function DataTable({
    title,
    headers,
    rows,
    actionLabel,
}: {
    title: string;
    headers: string[];
    rows: (string | number | React.ReactNode)[][];
    actionLabel?: string;
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                {actionLabel && (
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center transition-colors">
                        {actionLabel} <FiChevronRight className="ml-1 w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-x-auto p-4 custom-scrollbar">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="pb-3 px-4 font-semibold text-gray-500 tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                {row.map((cell, j) => (
                                    <td key={j} className="py-4 px-4 text-gray-900 font-medium">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const locale = useLocale();
    const t = useTranslations("Admin");
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);

    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [salesOverTime, setSalesOverTime] = useState<SalesOverTimeItem[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
    const [lowStock, setLowStock] = useState<LowStockItem[]>([]);

    useEffect(() => {
        if (!token) {
            router.push(`/${locale}/auth/login`);
        }
    }, [token, router, locale]);

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [
                summaryData,
                salesData,
                productsData,
                buyersData,
                stockData,
            ] = await Promise.all([
                AdminService.getDashboardSummary(token, locale),
                AdminService.getSalesOverTime(token, locale), // default is last 30 days
                AdminService.getTopProducts(token, locale, "revenue", 5),
                AdminService.getTopBuyers(token, locale, "spend", 5),
                AdminService.getLowStock(token, locale, 10),
            ]);

            if (summaryData) setSummary(summaryData);
            if (salesData) setSalesOverTime(salesData);
            setTopProducts(productsData || []);
            setTopBuyers(buyersData || []);
            setLowStock(stockData || []);
        } catch (error) {
            console.error("Admin dashboard error:", error);
        } finally {
            setLoading(false);
        }
    }, [locale, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (!token) return null;

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading dashboard metrics...</p>
            </div>
        );
    }

    const kpis = summary?.kpis;

    // Chart Data Preparation
    const chartData = {
        labels: salesOverTime.map(item => new Date(item.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Gross Merchandise Value (GMV)',
                data: salesOverTime.map(item => item.gmv),
                borderColor: '#4f46e5', // indigo-600
                backgroundColor: 'rgba(79, 70, 229, 0.1)', // indigo-600 with opacity
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#4f46e5',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1f2937',
                padding: 12,
                titleFont: { size: 14, family: 'Inter' },
                bodyFont: { size: 14, family: 'Inter' },
                displayColors: false,
                callbacks: {
                    label: (context: { parsed: { y: number | null } }) => {
                        if (context.parsed.y !== null) {
                            return `$${context.parsed.y.toLocaleString()}`;
                        }
                        return '';
                    },
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6', drawBorder: false },
                ticks: {
                    callback: (value: string | number) => '$' + value,
                    font: { family: 'Inter', size: 12 },
                    color: '#9ca3af'
                },
                border: { display: false }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: {
                    font: { family: 'Inter', size: 12 },
                    color: '#9ca3af',
                    maxTicksLimit: 10
                },
                border: { display: false }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('overview')}</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        {t('performance_30_days')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                        {t('download_report')}
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200">
                        {t('create_campaign')}
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            {kpis && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title={t('total_revenue')}
                        value={`$${Number(kpis.gmv).toLocaleString()}`}
                        icon={FiDollarSign}
                        trend={12.5}
                        trendLabel="vs previous 30 days"
                        colorClass="bg-indigo-600"
                    />
                    <KPICard
                        title={t('total_orders')}
                        value={kpis.completed_orders.toLocaleString()}
                        icon={FiShoppingCart}
                        trend={8.2}
                        trendLabel="vs previous 30 days"
                        colorClass="bg-emerald-500"
                    />
                    <KPICard
                        title={t('total_users')}
                        value={kpis.active_buyers.toLocaleString()}
                        icon={FiUsers}
                        trend={24.1}
                        trendLabel="vs previous 30 days"
                        colorClass="bg-blue-500"
                    />
                    <KPICard
                        title="Average Order Value"
                        value={`$${Number(kpis.avg_order_value).toFixed(2)}`}
                        icon={FiTrendingUp}
                        trend={-2.4}
                        trendLabel="vs previous 30 days"
                        colorClass="bg-rose-500"
                    />
                </div>
            )}

            {/* Main Chart Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{t('revenue_analytics')}</h3>
                        <p className="text-sm text-gray-500 mt-1">{t('gross_value_breakdown')}</p>
                    </div>
                    <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none cursor-pointer">
                        <option>{t('last_30_days')}</option>
                        <option>{t('this_year')}</option>
                        <option>All Time</option>
                    </select>
                </div>
                {salesOverTime.length > 0 ? (
                    <div className="h-[350px] w-full">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    <div className="h-[350px] w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">{t('no_sales_data')}</p>
                    </div>
                )}
            </div>

            {/* Data Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products */}
                <DataTable
                    title={t('top_selling_products')}
                    actionLabel="View All"
                    headers={["Product Name", t('sold'), t('revenue')]}
                    rows={topProducts.map((p) => [
                        <div key={p.product_id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <FiPackage className="w-5 h-5 text-gray-500" />
                            </div>
                            <span className="truncate max-w-[150px] sm:max-w-[200px]" title={locale === "ar" ? p.name_ar : p.name_en}>
                                {locale === "ar" ? p.name_ar : p.name_en}
                            </span>
                        </div>,
                        <span key={`qty-${p.product_id}`} className="text-gray-600">{p.quantity.toLocaleString()}</span>,
                        <span key={`rev-${p.product_id}`} className="font-semibold text-gray-900">${p.revenue.toLocaleString()}</span>
                    ])}
                />

                {/* Top Buyers */}
                <DataTable
                    title={t('top_loyal_buyers')}
                    actionLabel="View All"
                    headers={["Customer", t('orders_count'), t('spent')]}
                    rows={topBuyers.map((b) => [
                        <div key={b.buyer_id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-indigo-200">
                                {b.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{b.username}</span>
                                <span className="text-xs text-gray-500 truncate max-w-[120px]">{b.email}</span>
                            </div>
                        </div>,
                        <span key={`ord-${b.buyer_id}`} className="text-gray-600">{b.orders}</span>,
                        <span key={`spnd-${b.buyer_id}`} className="font-semibold text-gray-900">${b.spend.toLocaleString()}</span>
                    ])}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Low Stock Alerts */}
                {lowStock.length > 0 && (
                    <DataTable
                        title={t('low_stock_alerts')}
                        actionLabel="Manage Inventory"
                        headers={["Product Name", t('remaining'), "Status"]}
                        rows={lowStock.map((item) => [
                            <span key={`name-${item.id}`} className="truncate max-w-[200px] block" title={locale === "ar" ? item.name_ar : item.name_en}>
                                {locale === "ar" ? item.name_ar : item.name_en}
                            </span>,
                            <span key={`qty-${item.id}`} className="font-bold text-gray-900">{item.quantity}</span>,
                            <span key={`stat-${item.id}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                <FiAlertTriangle className="w-3.5 h-3.5" />
                                {t('restock')}
                            </span>
                        ])}
                    />
                )}
            </div>
        </div>
    );
}
