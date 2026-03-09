// components/products/SearchFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { FiFilter, FiX, FiChevronDown, FiCheck } from "react-icons/fi";

export function SearchFilters({
  currentParams,
  resultCount,
  page,
}: {
  currentParams: Record<string, string | undefined>;
  resultCount: number;
  page: string;
}) {
  const t = useTranslations("SearchFilters");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Initialize sort state from URL params
  const [sortState, setSortState] = useState({
    by: searchParams.get("sort_by") || "created_at",
    direction: searchParams.get("sort_direction") || "desc", // Keep this as is for now
  });

  // Update sort state when URL params change
  useEffect(() => {
    setSortState({
      by: searchParams.get("sort_by") || "created_at",
      direction: searchParams.get("sort_direction") || "desc", // Still using 'sort_direction'
    });
  }, [searchParams]);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const sortOptions = [
    { value: "created_at", label: t("newest"), direction: "desc" },
    { value: "created_at", label: t("oldest"), direction: "asc" },
    { value: "price", label: t("priceLowToHigh"), direction: "asc" },
    { value: "price", label: t("priceHighToLow"), direction: "desc" },
    { value: "rating", label: t("ratingHighToLow"), direction: "desc" },
    { value: "rating", label: t("ratingLowToHigh"), direction: "asc" },
  ];

  const getCurrentSortLabel = () => {
    const currentSort = sortOptions.find(
      (opt) =>
        opt.value === sortState.by && opt.direction === sortState.direction
    );
    return currentSort?.label || t("sortBy");
  };

  const handleSortSelect = (value: string, direction: string) => {
    setSortState({ by: value, direction });
    setOpenDropdown(null);
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const params = new URLSearchParams(searchParams.toString());

      // Always include the search query
      if (page == "search") params.set("q", searchParams.get("q") || "");

      // Set sort parameters from state (not from form)
      params.set("sort_by", sortState.by);
      params.set("sort_direction", sortState.direction);
      params.set("page", "1"); // Reset to first page

      // Price filters
      const updateParam = (key: string, value: string | null) => {
        if (value) params.set(key, value);
        else params.delete(key);
      };

      updateParam("min_price", formData.get("min_price") as string);
      updateParam("max_price", formData.get("max_price") as string);
      updateParam("min_rating", formData.get("min_rating") as string);
      updateParam("max_rating", formData.get("max_rating") as string);
      updateParam("min_quantity", formData.get("min_quantity") as string);
      updateParam("max_quantity", formData.get("max_quantity") as string);
      updateParam("brand_id", formData.get("brand_id") as string);
      updateParam("brand_slug", formData.get("brand_slug") as string);
      updateParam("brand_name", formData.get("brand_name") as string);
      updateParam("category_id", formData.get("category_id") as string);
      updateParam(
        "parent_category_id",
        formData.get("parent_category_id") as string
      );

      // Checkbox filters
      params.set("in_stock", formData.get("in_stock") ? "true" : "false");
      params.set(
        "has_discount",
        formData.get("has_discount") ? "true" : "false"
      );

      router.push(`/${page}?${params.toString()}`);
      setIsMobileFiltersOpen(false);
    },
    [router, searchParams, sortState, page]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (page == "search") params.set("q", searchParams.get("q") || "");
    router.push(`/${page}?${params.toString()}`);
  }, [router, searchParams, page]);

  return (
    <>
      {/* Mobile filter button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <FiFilter />
          {t("filters")}
        </button>
      </div>

      {/* Filters panel */}
      <div
        className={`${isMobileFiltersOpen ? "fixed inset-0 z-50 bg-black/50" : "hidden"
          } md:block`}
      >
        <div
          className={`bg-background dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 h-full md:h-auto overflow-y-auto ${isMobileFiltersOpen
            ? "absolute top-0 left-0 w-4/5 max-w-md h-screen"
            : ""
            }`}
        >
          {isMobileFiltersOpen && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{t("filters")}</h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FiX size={24} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <h3 className="font-bold mb-2">{t("filters")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("resultsCount", { count: resultCount })}
              </p>
            </div>

            {/* Sorting Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("sort")}
                className="w-full flex justify-between items-center px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <span>{getCurrentSortLabel()}</span>
                <FiChevronDown
                  className={`transition-transform ${openDropdown === "sort" ? "rotate-180" : ""
                    }`}
                />
              </button>
              {openDropdown === "sort" && (
                <div className="absolute z-10 mt-1 w-full bg-background  border border-gray-200  rounded-lg shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={`${option.value}-${option.direction}`}
                      type="button"
                      onClick={() =>
                        handleSortSelect(option.value, option.direction)
                      }
                      className={`w-full text-left px-4 py-2 hover:bg-accent  flex items-center ${sortState.by === option.value &&
                        sortState.direction === option.direction
                        ? "bg-accent  font-medium"
                        : ""
                        }`}
                    >
                      {sortState.by === option.value &&
                        sortState.direction === option.direction ? (
                        <FiCheck className="mr-2" />
                      ) : (
                        <span className="w-5 mr-2"></span>
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <h4 className="font-medium">{t("priceRange")}</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="min_price"
                  placeholder={t("minPrice")}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
                  defaultValue={currentParams.min_price}
                  min="0"
                />
                <input
                  type="number"
                  name="max_price"
                  placeholder={t("maxPrice")}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
                  defaultValue={currentParams.max_price}
                  min="0"
                />
              </div>
            </div>

            {/* Rating Range */}
            <div className="space-y-2">
              <h4 className="font-medium">{t("ratingRange")}</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="min_rating"
                  placeholder={t("minRating")}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
                  defaultValue={currentParams.min_rating}
                  min="0"
                  max="5"
                  step="0.1"
                />
                <input
                  type="number"
                  name="max_rating"
                  placeholder={t("maxRating")}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
                  defaultValue={currentParams.max_rating}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>

            {/* Stock Quantity */}
            <div className="space-y-2">
              <h4 className="font-medium">{t("stockQuantity")}</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="min_quantity"
                  placeholder={t("minQuantity")}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
                  defaultValue={currentParams.min_quantity}
                  min="0"
                />
                <input
                  type="number"
                  name="max_quantity"
                  placeholder={t("maxQuantity")}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
                  defaultValue={currentParams.max_quantity}
                  min="0"
                />
              </div>
            </div>

            {/* Brand Filters */}
            <div className="space-y-2">
              <h4 className="font-medium">{t("brand")}</h4>
              <input
                type="text"
                name="brand_name"
                placeholder={t("brandNamePlaceholder")}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent"
                defaultValue={currentParams.brand_name}
              />
            </div>

            {/* Checkbox Filters */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="in_stock"
                  defaultChecked={currentParams.in_stock === 'true'}
                  className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:focus:ring-primary-dark"
                />
                {t("inStockOnly")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="has_discount"
                  defaultChecked={currentParams.has_discount === 'true'}
                  className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary dark:focus:ring-primary-dark"
                />
                {t("discountedItems")}
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                {t("applyFilters")}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t("clearFilters")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
