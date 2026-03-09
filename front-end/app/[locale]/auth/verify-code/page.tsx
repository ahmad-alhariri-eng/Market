// app/[locale]/auth/verify-code/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FaCheck,
  FaSpinner,
  FaRedo,
  FaInfoCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { authService } from "@/services/authService";
import Link from "next/link";
import { translateBackendError } from "@/lib/error-mapping";

export default function VerifyCodePage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendStatus, setResendStatus] = useState<null | "success" | "error">(
    null
  );
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds cooldown

  useEffect(() => {
    const storedToken = localStorage.getItem("email-verification-token");
    const storedEmail = localStorage.getItem("email");

    if (!storedToken || !storedEmail) {
      router.push("/auth/email-verification");
      return;
    }

    setToken(storedToken);
    setEmail(storedEmail);

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResendStatus(null);

    const result = await authService.verifyCode(code, token);

    if (result.error) {
      setError(
        result.error.includes("expired") ? t("code_expired") : translateBackendError(result.error, t)
      );
    } else if (result.verified) {
      localStorage.setItem("registration-token", token);
      router.push("/auth/complete-registration");
    } else {
      setError(t("verification_failed"));
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError("");
    setResendStatus(null);

    const result = await authService.resendVerificationCode(email, token);

    if (result.error) {
      setError(translateBackendError(result.error, t));
      setResendStatus("error");
    } else if (result.token) {
      setToken(result.token);
      localStorage.setItem("email-verification-token", result.token);
      setResendStatus("success");
      setCountdown(60); // Reset cooldown
      setTimeout(() => setResendStatus(null), 3000);
    }

    setResendLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <Link
            href="/auth/email-verification"
            className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 mb-4"
          >
            <FaArrowLeft className="mr-1" /> {t("back_to_email")}
          </Link>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
            {t("verify_code")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("code_sent_to")} <span className="font-medium">{email}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Resend Status Message */}
        {resendStatus === "success" && (
          <div
            className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded relative"
            role="alert"
          >
            <div className="flex items-center">
              <FaInfoCircle className="mr-2" />
              <span>{t("resend_success")}</span>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("verification_code")}
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                } // Only numbers, max 6 digits
                className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 border bg-white text-gray-900 dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest"
                placeholder="------"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || countdown > 0}
                className={`text-sm font-medium flex items-center ${countdown > 0
                  ? "text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  }`}
              >
                {resendLoading ? (
                  <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <FaRedo className="h-4 w-4 mr-2" />
                )}
                {countdown > 0
                  ? `${t("resend_in")} ${countdown}s`
                  : t("resend_code")}
              </button>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className={`group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 ${loading || code.length !== 6 ? "opacity-70" : ""
                  }`}
              >
                {loading ? (
                  <FaSpinner className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    {t("verify")}
                    <FaCheck className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {t("didnt_receive_code")}{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || countdown > 0}
                className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
              >
                {t("click_to_resend")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
