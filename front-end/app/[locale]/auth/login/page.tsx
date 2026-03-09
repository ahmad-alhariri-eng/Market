// app/[locale]/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FaEnvelope, FaLock, FaSpinner, FaSignInAlt } from "react-icons/fa";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { translateBackendError } from "@/lib/error-mapping";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginAction(formData);

      if (result.error) {
        setError(translateBackendError(result.error, t));
      } else if (result.user) {
        // Update auth context with user data and the new token
        setUser(result.user, result.token);

        // Redirect based on role
        if (result.user.role === 'admin' || result.user.role === 'superadmin') {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setError(t("login_error"));
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-background p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {t("login")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("no_account")}{" "}
            <Link
              href="/auth/email-verification"
              className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
            >
              {t("register_here")}
            </Link>
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("email")}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 border dark:bg-gray-700 dark:text-white"
                  placeholder={t("email_placeholder")}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("password")}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 border dark:bg-gray-700 dark:text-white"
                  placeholder={t("password_placeholder")}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
              >
                {t("forgot_password")}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 ${loading ? "opacity-70" : ""
                }`}
            >
              {loading ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                <>
                  {t("login")}
                  <FaSignInAlt className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
