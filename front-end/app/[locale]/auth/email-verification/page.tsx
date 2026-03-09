// app/[locale]/auth/email-verification/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FaEnvelope, FaSpinner, FaArrowRight } from "react-icons/fa";
import { authService } from "@/services/authService";
import Link from "next/link";
import { translateBackendError } from "@/lib/error-mapping";

export default function EmailVerificationPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await authService.sendVerificationEmail(
      email,
      "user",
      window.location.pathname.split("/")[1]
    );

    if (result.error) {
      if (result.verified && result.has_user) {
        setError(t("email_exists"));
      } else {
        setError(translateBackendError(result.error, t));
      }
    } else if (result.token) {
      setSuccess(result.message || t("verification_sent"));
      localStorage.setItem("email-verification-token", result.token);
      localStorage.setItem("email", email);
      router.push(`/auth/verify-code`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {t("verify_email")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("already_have_code")}{" "}
            <Link
              href="/auth/verify-code"
              className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
            >
              {t("verify_here")}
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



        {success && (
          <div
            className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{success}</span>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 border bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                  placeholder={t("email_placeholder")}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-70 transition-colors"
            >
              {loading ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                <>
                  {t("send_verification")}
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
