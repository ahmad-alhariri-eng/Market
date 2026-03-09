"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import { orderService } from "@/services/orderService";
import { Order } from "@/types/order";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FiSearch, FiEye, FiFilter, FiDownload } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function AdminOrdersPage() {
    const locale = useLocale();
    const t = useTranslations("Admin");
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchOrders = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await orderService.getOrders(token);
            setOrders(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = orders.filter(o => {
        const search = searchTerm.toLowerCase();
        return o.id.toString().includes(search) || o.status.toLowerCase().includes(search);
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'processing': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('orders')}</h1>
                    <p className="text-gray-500 mt-1">View and manage all customer orders.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toast.success("Export functionality coming soon")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm"
                    >
                        <FiDownload className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <FiSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search order ID..."
                        className="w-full ps-10 pe-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                        <FiFilter className="w-4 h-4" />
                        Status: All
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-start whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl tracking-wider text-start">Order ID</th>
                                <th className="px-6 py-4 tracking-wider text-start">Date</th>
                                <th className="px-6 py-4 tracking-wider text-start">Total Amount</th>
                                <th className="px-6 py-4 tracking-wider text-start">Status</th>
                                <th className="px-6 py-4 text-end rounded-tr-xl tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.map((o) => {
                                return (
                                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-900">#{o.id}</span>
                                        </td>
                                        <td className="px-6 py-4 text-start">
                                            <span className="text-gray-600">
                                                {new Date(o.created_at).toLocaleDateString(locale, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-start">
                                            <span className="font-semibold text-gray-900 flex items-center gap-1">
                                                <span className="text-xs text-gray-400 font-normal">SAR</span>
                                                {Number(o.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-start">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(o.status)}`}>
                                                {o.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-end">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                <Link
                                                    href={`/${locale}/admin/orders/${o.id}`}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <FiSearch className="text-gray-400 w-6 h-6" />
                                            </div>
                                            <h3 className="text-gray-900 font-medium">No orders found</h3>
                                            <p className="text-gray-500 text-sm mt-1">Try adjusting your search filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
