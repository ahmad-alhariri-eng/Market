"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import { AdminService, User } from "@/services/adminService";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiFilter, FiMail } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function AdminUsersPage() {
    const locale = useLocale();
    const t = useTranslations("Admin");
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await AdminService.getUsers(token, locale);
            setUsers(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [token, locale]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = users.filter(u => {
        const search = searchTerm.toLowerCase();
        return u.username.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('users')}</h1>
                    <p className="text-gray-500 mt-1">Manage customer accounts and access levels.</p>
                </div>
                <button
                    onClick={() => toast.success("Create User functionality coming soon")}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
                >
                    <FiUserPlus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <FiSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full ps-10 pe-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                        <FiFilter className="w-4 h-4" />
                        Role: All
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-start whitespace-nowrap">
                        <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl tracking-wider text-start">User</th>
                                <th className="px-6 py-4 tracking-wider text-start">Role</th>
                                <th className="px-6 py-4 tracking-wider text-start">Status</th>
                                <th className="px-6 py-4 text-end rounded-tr-xl tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((u) => {
                                return (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold flex-shrink-0 border border-indigo-200">
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-gray-900 font-medium">{u.username}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-start">
                                            <span className="font-medium text-gray-600 capitalize">{u.role || 'User'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-start">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-end">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                <a
                                                    href={`mailto:${u.email}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Email User"
                                                >
                                                    <FiMail className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => toast.success("Edit User functionality coming soon")}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toast.success("Delete User functionality coming soon")}
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

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <FiSearch className="text-gray-400 w-6 h-6" />
                                            </div>
                                            <h3 className="text-gray-900 font-medium">No users found</h3>
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
