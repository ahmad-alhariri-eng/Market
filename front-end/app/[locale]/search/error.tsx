// app/[locale]/search/error.tsx
"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations("Search");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">{t("errorTitle")}</h1>
      <div className="text-center py-12">
        <p className="text-error mb-4">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
}
