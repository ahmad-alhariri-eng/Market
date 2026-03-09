// app/[locale]/admin/layout.tsx
"use client";

import { useState, useEffect } from "react";
import AdminNavigation from "@/components/admin/AdminNavigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, isLoading, token } = useAuth();
    const router = useRouter();
    const locale = useLocale();

    useEffect(() => {
        if (!isLoading && (!user || !token)) {
            router.replace(`/${locale}/auth/login`);
        }
    }, [user, token, isLoading, router, locale]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>;
    }

    // Don't render admin layout content if not authenticated
    if (!user || !token) {
        return null;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Desktop Navigation */}
            <div className="hidden lg:block w-64 flex-shrink-0 z-20">
                <AdminNavigation onNavigate={() => setSidebarOpen(false)} />
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-colors"
                >
                    {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
                {sidebarOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <div className="fixed left-0 top-0 h-full w-64 z-50 transform transition-transform duration-300 shadow-2xl">
                            <AdminNavigation onNavigate={() => setSidebarOpen(false)} />
                        </div>
                    </>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-y-auto overflow-x-hidden focus:outline-none">
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
