// app/[locale]/auth/complete-registration/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FaUser,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaSpinner,
  FaArrowRight,
  FaExclamationTriangle,
  FaCheck,
  FaArrowLeft,
} from "react-icons/fa";
import { authService } from "@/services/authService";
import Link from "next/link";
import { translateBackendError } from "@/lib/error-mapping";

export default function CompleteRegistrationPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Client-side validation
  const validateForm = useCallback(() => {
    // Password match validation
    if (formData.password !== formData.confirm_password) {
      setPasswordError(t("password_mismatch"));
      return false;
    }

    // Password strength validation
    if (formData.password.length < 8) {
      setPasswordError(t("password_requirements"));
      return false;
    }

    setPasswordError("");
    return true;
  }, [formData, t]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("registration-token");
    if (!token) {
      router.push("/auth/email-verification");
      return;
    }

    try {
      const result = await authService.completeRegistration(formData, token);

      if (result.error) {
        // Handle duplicate email case specially
        if (result.error.includes("البريد الإلكتروني مستخدم مسبقًا")) {
          setError(t("already_have_account") || "هذا البريد مسجل مسبقاً، سيتم تحويلك لصفحة الدخول...");
          setTimeout(() => {
            localStorage.removeItem("registration-token");
            localStorage.removeItem("email-verification-token");
            router.push("/auth/login");
          }, 3000);
        } else {
          setError(translateBackendError(result.error, t)); // Map backend error to translated message
        }
      } else {
        // Clear storage and redirect
        localStorage.removeItem("registration-token");
        localStorage.removeItem("email-verification-token");
        localStorage.removeItem("email");
        router.push("/auth/login");
      }
    } catch {
      setError(t("registration_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <Link
            href="/auth/verify-code"
            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 mb-2"
          >
            <FaArrowLeft className="mr-1" /> {t("back_to_verification")}
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("complete_registration")}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t("fill_details_to_complete")}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative flex items-start">
            <FaExclamationTriangle className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("first_name")} *
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("last_name")} *
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("username")} *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2 border"
                placeholder={t("username_placeholder")}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("phone_number")} *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2 border"
                placeholder={t("phone_placeholder")}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("address")} *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="address"
                name="address"
                type="text"
                required
                value={formData.address}
                onChange={handleChange}
                className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2 border"
                placeholder={t("address_placeholder")}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("password")} *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2 border"
                placeholder={t("password_placeholder")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaCheck className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                ) : (
                  <FaLock className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                )}
              </button>
            </div>
            {formData.password.length > 0 && formData.password.length < 8 && (
              <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                {t("password_requirements")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("confirm_password")} *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirm_password"
                name="confirm_password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm p-2 border"
                placeholder={t("confirm_password_placeholder")}
              />
            </div>
            {passwordError && formData.password.length > 0 && (
              <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                <FaExclamationTriangle className="mr-1 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !!passwordError}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 ${loading || passwordError ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {loading ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                <>
                  {t("complete_registration")}
                  <FaArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t("already_have_account")}{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
          >
            {t("login_here")}
          </Link>
        </div>
      </div>
    </div>
  );
}
