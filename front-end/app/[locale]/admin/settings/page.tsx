// app/[locale]/admin/settings/page.tsx
"use client";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Settings</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
                        <span className="text-2xl text-indigo-600">⚙️</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Global Settings Configuration</h3>
                    <p className="text-gray-500 max-w-sm">
                        Manage system variables, payment gateways, shipping methods, and localization options from this panel.
                    </p>
                </div>
            </div>
        </div>
    );
}
