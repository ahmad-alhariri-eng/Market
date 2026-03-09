// components/layout/MobileSearch.tsx
"use client";

import { FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { SearchBar } from "../navbar/SearchBar";

export function MobileSearch({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("Navbar");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 p-4 md:hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{t("search")}</h2>
        <button
          onClick={onClose}
          aria-label={t("closeSearch")}
          className="p-1 rounded-full hover:bg-muted transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>
      <SearchBar open={true} />
    </div>
  );
}
