"use client";

import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTranslations } from "next-intl";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  baseUrl: string;
  params: { [key: string]: string | string[] | undefined };
  onPageChange?: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  baseUrl,
  params,
  onPageChange,
}: PaginationProps) {
  const t = useTranslations("Pagination");

  const getPageUrl = (page: number) => {
    const newParams = new URLSearchParams();

    // Copy all existing params
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => newParams.append(key, v));
      } else if (value) {
        newParams.append(key, value as string);
      }
    });

    newParams.set("page", page.toString());
    return `${baseUrl}?${newParams.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <div className="text-sm text-muted-foreground">
        {t("showing", {
          from: (currentPage - 1) * itemsPerPage + 1,
          to: Math.min(currentPage * itemsPerPage, totalItems),
          total: totalItems,
        })}
      </div>

      <div className="flex gap-1">
        <Link
          href={getPageUrl(Math.max(1, currentPage - 1))}
          className={`px-3 py-1 border rounded ${currentPage === 1
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-accent"
            }`}
          aria-disabled={currentPage === 1}
          tabIndex={currentPage === 1 ? -1 : undefined}
          onClick={(e) => {
            if (currentPage === 1) e.preventDefault();
            else onPageChange?.(Math.max(1, currentPage - 1));
          }}
        >
          <FiChevronLeft className="h-4 w-4" />
        </Link>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <Link
              key={pageNum}
              href={getPageUrl(pageNum)}
              className={`px-3 py-1 border rounded ${currentPage === pageNum
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
                }`}
              onClick={() => onPageChange?.(pageNum)}
            >
              {pageNum}
            </Link>
          );
        })}

        <Link
          href={getPageUrl(Math.min(totalPages, currentPage + 1))}
          className={`px-3 py-1 border rounded ${currentPage === totalPages
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-accent"
            }`}
          aria-disabled={currentPage === totalPages}
          tabIndex={currentPage === totalPages ? -1 : undefined}
          onClick={(e) => {
            if (currentPage === totalPages) e.preventDefault();
            else onPageChange?.(Math.min(totalPages, currentPage + 1));
          }}
        >
          <FiChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
