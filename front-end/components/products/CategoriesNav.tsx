"use client";

import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useRef, useEffect, useState } from "react";
import { Category } from "@/types/category";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function CategoriesNav({
  categories,
  locale,
  activeCategory,
}: {
  categories: Category[];
  locale: string;
  activeCategory?: string;
}) {
  const t = useTranslations("Products.categories");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const parentRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [showChildCategories, setShowChildCategories] = useState(false);
  const [hasScrollableParents, setHasScrollableParents] = useState(false);
  const [hasScrollableChildren, setHasScrollableChildren] = useState(false);

  // Initialize selected parent based on active category
  useEffect(() => {
    if (activeCategory) {
      let parent = categories.find((c) =>
        c.children.some((child) => child.id.toString() === activeCategory)
      );
      if (!parent)
        parent = categories.find((c) => c.id.toString() === activeCategory);
      console.log(parent);
      setSelectedParent(parent?.id.toString() || null);
      setShowChildCategories(!!parent);
    }
  }, [activeCategory, categories]);

  // Check if categories are scrollable
  useEffect(() => {
    if (parentRef.current) {
      setHasScrollableParents(
        parentRef.current.scrollWidth > parentRef.current.clientWidth
      );
    }
    if (childRef.current && showChildCategories) {
      setHasScrollableChildren(
        childRef.current.scrollWidth > childRef.current.clientWidth
      );
    }
  }, [categories, showChildCategories]);

  const scroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleParentClick = (categoryId: string) => {
    const isSameCategory = selectedParent === categoryId;
    const clickedCategory = categories.find(
      (c) => c.id.toString() === categoryId
    );

    // Create new search params
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category_id");

    if (isSameCategory) {
      params.delete("category_id");
      params.delete("parent_category_id");
    } else {
      params.set("parent_category_id", categoryId);
    }

    // Remove page parameter when changing category
    params.delete("page");

    // Update the URL
    router.push(`${pathname}?${params.toString()}`);

    // Update UI state
    setSelectedParent(isSameCategory ? null : categoryId);
    setShowChildCategories(
      !isSameCategory && !!clickedCategory?.children.length
    );
  };

  const selectedParentData = selectedParent
    ? categories.find((c) => c.id.toString() === selectedParent)
    : null;

  return (
    <div className="mb-8">
      {/* Parent Categories */}
      <div className="relative">
        {hasScrollableParents && (
          <button
            onClick={() => scroll(parentRef, "left")}
            className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center bg-background z-10"
            aria-label={t("scrollLeft")}
          >
            <FiChevronLeft className="text-primary" size={24} />
          </button>
        )}

        <div
          ref={parentRef}
          className="flex space-x-2 overflow-x-auto py-2 px-4 scrollbar-hide"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleParentClick(category.id.toString())}
              className={`flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border min-w-max ${selectedParent === category.id.toString()
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted hover:bg-accent"
                } transition-colors`}
            >
              {category.logo && (
                <div className="w-6 h-6 relative">
                  <Image
                    src={category.logo}
                    alt={category.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              {category.name}
            </button>
          ))}
        </div>

        {hasScrollableParents && (
          <button
            onClick={() => scroll(parentRef, "right")}
            className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center bg-background z-10"
            aria-label={t("scrollRight")}
          >
            <FiChevronRight className="text-primary" size={24} />
          </button>
        )}
      </div>

      {/* Child Categories - Only show if parent is selected AND has children */}
      {showChildCategories && selectedParentData?.children.length && (
        <div className="mt-4 relative">
          {hasScrollableChildren && (
            <button
              onClick={() => scroll(childRef, "left")}
              className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center bg-background z-10"
              aria-label={t("scrollLeft")}
            >
              <FiChevronLeft className="text-primary" size={24} />
            </button>
          )}

          <div
            ref={childRef}
            className="flex space-x-2 overflow-x-auto py-2 px-4 scrollbar-hide"
          >
            {selectedParentData.children.map((child) => (
              <Link
                key={child.id}
                href={`/${locale}/products?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  category_id: child.id.toString(),
                  page: "1", // Reset to first page
                }).toString()}`}
                className={`flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border min-w-max ${activeCategory === child.id.toString()
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted hover:bg-accent"
                  } transition-colors`}
              >
                {child.logo && (
                  <div className="w-6 h-6 relative">
                    <Image
                      src={child.logo}
                      alt={child.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                {child.name}
              </Link>
            ))}
          </div>

          {hasScrollableChildren && (
            <button
              onClick={() => scroll(childRef, "right")}
              className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center bg-background z-10"
              aria-label={t("scrollRight")}
            >
              <FiChevronRight className="text-primary" size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
