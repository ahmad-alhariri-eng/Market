// components/admin/AdminHeader.tsx
"use client";

import { useAuth } from "@/providers/auth-provider";
import { FiSearch, FiLogOut, FiSettings } from "react-icons/fi";
import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { NotificationsDropdown } from "../layout/NotificationsDropdown";

export default function AdminHeader() {
    const { user, logout } = useAuth();
    const locale = useLocale();
    const t = useTranslations("Admin");

    return (
        <header className="bg-white dark:bg-gray-900 h-16 border-b border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between px-6 z-10 sticky top-0">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl hidden sm:flex items-center">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('search_dashboard')}
                        className="block w-full ps-10 pe-3 py-2 border border-gray-200 text-gray-900 dark:text-white rounded-lg leading-5 bg-gray-50 dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                    />
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-6 ms-auto">
                {/* Notifications */}
                <div className="relative pt-1">
                    <NotificationsDropdown />
                </div>

                {/* Profile Dropdown */}
                <Popover className="relative">
                    {() => (
                        <>
                            <Popover.Button className="flex items-center gap-3 focus:outline-none group">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                        {user?.email?.split('@')[0] || "Admin User"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Super Admin
                                    </span>
                                </div>
                                <div className="h-9 w-9 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                    {user?.email?.[0]?.toUpperCase() || "A"}
                                </div>
                            </Popover.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition ease-in duration-150"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-1"
                            >
                                <Popover.Panel className="absolute end-0 mt-3 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 focus:outline-none z-50">
                                    <div className="px-4 py-3">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {user?.email || "admin@example.com"}
                                        </p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href={`/${locale}/admin/settings`}
                                            className="group flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            <FiSettings
                                                className="me-3 h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                                aria-hidden="true"
                                            />
                                            {t('settings')}
                                        </Link>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={logout}
                                            className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                        >
                                            <FiLogOut
                                                className="me-3 h-4 w-4 text-red-500 group-hover:text-red-600"
                                                aria-hidden="true"
                                            />
                                            {t('logout')}
                                        </button>
                                    </div>
                                </Popover.Panel>
                            </Transition>
                        </>
                    )}
                </Popover>
            </div>
        </header>
    );
}
