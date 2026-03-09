// components/admin/AdminNavigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
    FiHome,
    FiPackage,
    FiShoppingCart,
    FiUsers,
    FiActivity,
    FiSettings,
} from "react-icons/fi";

interface AdminNavigationProps {
    onNavigate?: () => void;
}

export default function AdminNavigation({ onNavigate }: AdminNavigationProps) {
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations("Admin");

    const navigationItems = [
        { href: `/${locale}/admin/dashboard`, icon: FiHome, labelKey: "dashboard" },
        { href: `/${locale}/admin/products`, icon: FiPackage, labelKey: "products" },
        { href: `/${locale}/admin/orders`, icon: FiShoppingCart, labelKey: "orders" },
        { href: `/${locale}/admin/users`, icon: FiUsers, labelKey: "users" },
        { href: `/${locale}/admin/analytics`, icon: FiActivity, labelKey: "analytics" },
        { href: `/${locale}/admin/settings`, icon: FiSettings, labelKey: "settings" },
    ];

    const isActive = (href: string) => {
        // Handle exact match or matching sub-paths
        if (pathname === href) return true;
        // Avoid matching /admin/dashboard when checking /admin (if such a link exists)
        if (pathname?.startsWith(href + "/")) return true;
        return false;
    };

    const handleNavigation = () => {
        if (onNavigate) onNavigate();
    };

    return (
        <aside className="bg-[#111827] text-gray-300 h-full flex flex-col w-64 shadow-xl border-e border-[#1f2937]">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-[#1f2937] bg-[#111827]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                        A
                    </div>
                    <span className="text-lg font-bold text-white tracking-wide">
                        {t('admin_ui')}
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                    {t('menu')}
                </div>
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={handleNavigation}
                            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
                                ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                                : "hover:bg-[#1f2937] hover:text-white border border-transparent"
                                }`}
                        >
                            <Icon
                                className={`w-5 h-5 transition-transform duration-200 ${active
                                    ? "text-indigo-400 scale-110"
                                    : "text-gray-400 group-hover:text-white"
                                    }`}
                            />
                            <span
                                className={`font-medium text-sm transition-colors ${active ? "text-indigo-400" : "group-hover:text-white"
                                    }`}
                            >
                                {t(item.labelKey)}
                            </span>
                            {active && (
                                <div className="ms-auto w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-[#1f2937] bg-gradient-to-t from-[#0b0f19] to-transparent">
                <div className="bg-[#1f2937] rounded-xl p-4 flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mb-2">
                        <FiActivity className="text-indigo-400 w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{t('system_status_online')}</p>
                </div>
            </div>
        </aside>
    );
}
