// hooks/useProducts.ts
"use client";

import { useState, useEffect } from "react";
import { productService } from "@/lib/api/products";
import { ProductsResponse, ProductQueryParams } from "@/types/product";

export function useProducts(
  params: ProductQueryParams = {},
  locale: string = "en"
) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await productService.getProducts(params, locale);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, locale]);

  return { data, loading, error };
}
