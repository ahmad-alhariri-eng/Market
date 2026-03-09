// components/products/CategoryTree.tsx
"use client";

import Link from "next/link";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useState } from "react";
import { Category } from "@/types/category";

export function CategoryTree({
  categories,
  locale,
  activeCategory,
}: {
  categories: Category[];
  locale: string;
  activeCategory?: string;
}) {
  return (
    <div className="bg-background rounded-lg border border-muted p-4">
      <h2 className="font-bold text-lg text-foreground mb-4">Categories</h2>
      <ul className="space-y-1">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            locale={locale}
            activeCategory={activeCategory}
            level={0}
          />
        ))}
      </ul>
    </div>
  );
}

function CategoryItem({
  category,
  locale,
  activeCategory,
  level,
}: {
  category: Category;
  locale: string;
  activeCategory?: string;
  level: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children.length > 0;

  return (
    <li>
      <div className="flex items-center">
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 mr-1 text-muted-foreground"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <FiChevronDown size={16} />
            ) : (
              <FiChevronRight size={16} />
            )}
          </button>
        )}
        <Link
          href={`/${locale}/products?category_id=${category.id}`}
          className={`flex-1 p-2 rounded-md hover:bg-accent transition-colors ${
            activeCategory === String(category.id)
              ? "bg-primary/10 text-primary font-medium"
              : "text-foreground"
          }`}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          {category.name}
        </Link>
      </div>
      {hasChildren && expanded && (
        <ul className="ml-4 mt-1 space-y-1">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              locale={locale}
              activeCategory={activeCategory}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
