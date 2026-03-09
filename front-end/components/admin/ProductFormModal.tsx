"use client";

import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiUploadCloud } from "react-icons/fi";
import { useLocale } from "next-intl";
import { productService } from "@/lib/api/products";
import { api } from "@/lib/api/index";
import { Product } from "@/types/product";
import { toast } from "react-hot-toast";

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product?: Product | null;
    token: string | null | undefined;
}

export default function ProductFormModal({
    isOpen,
    onClose,
    onSuccess,
    product,
    token,
}: ProductFormModalProps) {
    const locale = useLocale();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<{ id: number; name_en: string; name_ar: string }[]>([]);

    const [formData, setFormData] = useState({
        name_en: "",
        name_ar: "",
        description_en: "",
        description_ar: "",
        price: "",
        quantity: "",
        category_id: "",
    });
    const [images, setImages] = useState<File[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/product/categories/localized/', {
                    headers: { "Accept-Language": locale }
                });
                setCategories(res.data);
            } catch (e) {
                console.error(e);
            }
        };

        if (isOpen) {
            fetchCategories();
            if (product) {
                setFormData({
                    name_en: product.name_en || "",
                    name_ar: product.name_ar || "",
                    description_en: product.description_en || "",
                    description_ar: product.description_ar || "",
                    price: product.price ? product.price.toString() : "",
                    quantity: product.quantity !== undefined ? product.quantity.toString() : "",
                    category_id: product.category_id ? product.category_id.toString() : "",
                });
                setImages([]); // Hard to repopulate safely, assume re-upload or keep old
            } else {
                setFormData({
                    name_en: "",
                    name_ar: "",
                    description_en: "",
                    description_ar: "",
                    price: "",
                    quantity: "",
                    category_id: "",
                });
                setImages([]);
            }
        }
    }, [isOpen, product, locale]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return toast.error("Not authenticated");

        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString());
            });

            images.forEach((file) => {
                data.append("images", file);
            });

            if (product) {
                await productService.updateProduct(product.id, data, token, locale);
                toast.success("Product updated successfully");
            } else {
                await productService.createProduct(data, token, locale);
                toast.success("Product created successfully");
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error((error as { message?: string })?.message || "Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-start align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-5">
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-white">
                                        {product ? "Edit Product" : "Add Product"}
                                    </Dialog.Title>
                                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
                                        <FiX className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (EN)</label>
                                            <input type="text" name="name_en" required value={formData.name_en} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (AR)</label>
                                            <input type="text" name="name_ar" required value={formData.name_ar} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (EN)</label>
                                            <textarea name="description_en" required value={formData.description_en} onChange={handleInputChange} rows={3} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (AR)</label>
                                            <textarea name="description_ar" required value={formData.description_ar} onChange={handleInputChange} rows={3} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                                            <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                                            <input type="number" name="quantity" required value={formData.quantity} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                            <select name="category_id" required value={formData.category_id} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none">
                                                <option value="">Select Category</option>
                                                {categories.map((c) => (
                                                    <option key={c.id} value={c.id}>{locale === 'ar' ? c.name_ar : c.name_en}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-700 hover:border-indigo-500 transition-colors">
                                            <div className="space-y-1 text-center">
                                                <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center mt-2">
                                                    <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                        <span>Upload files</span>
                                                        <input type="file" multiple className="sr-only" onChange={handleFileChange} />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">{images.length} file(s) selected.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-5">
                                        <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={loading} className="px-5 py-2.5 shadow-md shadow-indigo-500/20 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition">
                                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                            {product ? "Update Product" : "Create Product"}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
