"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FaLock, FaSpinner, FaCheck, FaArrowLeft } from "react-icons/fa";
import { authService } from "@/services/authService";
import Link from "next/link";
import { translateBackendError } from "@/lib/error-mapping";

export default function ResetPasswordPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    const storedToken = localStorage.getItem("reset-token");
    if (!storedToken) {
      router.push("/auth/forgot-password");
      return;
    }
    setToken(storedToken);
  }, [router]);

  const validatePasswords = (
    new_password: string,
    confirm_password: string
  ) => {
    // Only validate if both fields have values
    if (new_password && confirm_password) {
      if (new_password !== confirm_password) {
        setPasswordError(t("password_mismatch"));
        return false;
      }
      if (new_password.length < 8) {
        setPasswordError(t("password_requirements"));
        return false;
      }
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Perform full validation on submit
    if (formData.new_password !== formData.confirm_password) {
      setPasswordError(t("password_mismatch"));
      setLoading(false);
      return;
    }
    if (formData.new_password.length < 8) {
      setPasswordError(t("password_requirements"));
      setLoading(false);
      return;
    }

    const result = await authService.resetPassword(
      formData.new_password,
      formData.confirm_password,
      token
    );

    if (result.error) {
      setError(translateBackendError(result.error, t));
    } else {
      setSuccess(result.detail || t("password_reset_successfully"));

      // Clear storage and wait 2 seconds before navigating
      localStorage.removeItem("reset-token");
      localStorage.removeItem("reset-email");

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Only validate after both fields have some content
    if (formData.new_password && formData.confirm_password) {
      if (name === "confirm_password")
        validatePasswords(formData.new_password, value);
      else validatePasswords(value, formData.confirm_password);
    } else {
      setPasswordError("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <Link
            href="/auth/verify-reset-code"
            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 mb-4"
          >
            <FaArrowLeft className="mr-1" /> {t("back_to_verification")}
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {t("reset_password")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("enter_new_password")}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded relative">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("new_password")}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="new_password"
                  name="new_password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.new_password}
                  onChange={handleChange}
                  className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 border dark:bg-gray-700 dark:text-white"
                  placeholder={t("new_password_placeholder")}
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
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("confirm_new_password")}
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
                  className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 border dark:bg-gray-700 dark:text-white"
                  placeholder={t("confirm_password_placeholder")}
                />
              </div>
              {passwordError && (
                <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
                  <span>{passwordError}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!passwordError}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 ${loading || passwordError ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {loading ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                <>
                  {t("reset_password")}
                  <FaCheck className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
