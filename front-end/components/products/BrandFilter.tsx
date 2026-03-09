// components/products/BrandFilter.tsx
"use client";

import { Brand } from "@/types/brands";
import Link from "next/link";
import { FiCheck } from "react-icons/fi";

export function BrandFilter({
  brands,
  selectedBrand,
}: {
  brands: Brand[];
  selectedBrand?: string;
}) {
  return (
    <div className="bg-background rounded-lg border border-muted p-4">
      <h2 className="font-bold text-lg text-foreground mb-4">Brands</h2>
      <ul className="space-y-2 max-h-96 overflow-y-auto">
        {brands.map((brand) => (
          <li key={brand.id}>
            <Link
              href={`?brand_id=${brand.id}`}
              className={`flex items-center p-2 rounded-md hover:bg-accent transition-colors ${
                selectedBrand === String(brand.id)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground"
              }`}
            >
              {selectedBrand === String(brand.id) && (
                <FiCheck className="mr-2" />
              )}
              <span className="truncate">{brand.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
