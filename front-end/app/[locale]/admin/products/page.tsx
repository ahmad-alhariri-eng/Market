"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import { AdminService, LowStockItem } from "@/services/adminService";
import { productService } from "@/lib/api/products";
import { Product } from "@/types/product";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiFilter } from "react-icons/fi";
import { toast } from "react-hot-toast";
import ProductFormModal from "@/components/admin/ProductFormModal";
import Image from "next/image";

export default function AdminProductsPage() {
    const locale = useLocale();
    const t = useTranslations("Admin");
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const fetchData = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [productsData, stockData] = await Promise.all([
                productService.getProducts({}, locale, token),
                AdminService.getLowStock(token, locale, 10),
            ]);
            setProducts(productsData.results || []);
            setLowStock(stockData || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [token, locale]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id: number) => {
        if (!token) return;
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                await productService.deleteProduct(id, token, locale);
                toast.success("Product deleted successfully");
                setProducts(products.filter((p) => p.id !== id));
            } catch (error) {
                console.error("Failed to delete product:", error);
                toast.error("Failed to delete product");
            }
        }
    };

    const isLowStock = (id: number) => lowStock.some(item => item.id === id);

    const filteredProducts = products.filter(p => {
        const nameEn = p.name_en?.toLowerCase() || "";
        const nameAr = p.name_ar?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return nameEn.includes(search) || nameAr.includes(search) || p.id.toString().includes(search);
    });

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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('products')}</h1>
                    <p className="text-gray-500 mt-1">Manage your catalog, inventory, and pricing.</p>
                </div>
                <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
                >
                    <FiPlus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <FiSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full ps-10 pe-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                        <FiFilter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-start whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl tracking-wider text-start">Product Info</th>
                                <th className="px-6 py-4 tracking-wider text-start">Quantity</th>
                                <th className="px-6 py-4 tracking-wider text-start">Price</th>
                                <th className="px-6 py-4 tracking-wider text-start">Status</th>
                                <th className="px-6 py-4 text-end rounded-tr-xl tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map((p) => {
                                const low = isLowStock(p.id);
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                                    {p.images && p.images.length > 0 ? (
                                                        <Image src={p.images[0]} alt="product" fill sizes="48px" className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-200 font-bold">
                                                            P
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-gray-900 font-medium truncate max-w-[200px]" title={locale === 'ar' ? p.name_ar : p.name_en}>
                                                        {locale === 'ar' ? p.name_ar : p.name_en}
                                                    </h4>
                                                    <p className="text-xs text-gray-400 mt-0.5">ID: #{p.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-start">
                                            <span className="font-medium text-gray-900">{p.quantity.toLocaleString()}</span>
                                            <span className="text-xs text-gray-500 mx-1">{p.quantity <= 0 ? t('out_of_stock') : t('in_stock')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-start">
                                            <span className="font-semibold text-gray-900 flex items-center gap-1">
                                                <span className="text-xs text-gray-400 font-normal">SAR</span>
                                                {Number(p.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-start">
                                            {low ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                    {t('low_stock_alerts')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    {t('in_stock')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-end">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                <button
                                                    onClick={() => handleEditProduct(p)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <FiSearch className="text-gray-400 w-6 h-6" />
                                            </div>
                                            <h3 className="text-gray-900 font-medium">No products found</h3>
                                            <p className="text-gray-500 text-sm mt-1">Try adjusting your search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                product={editingProduct}
                token={token}
            />
        </div>
    );
}
