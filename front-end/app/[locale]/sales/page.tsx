// app/[locale]/sales/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SaleService } from "@/services/saleService";
import { Sale, SaleProduct } from "@/types/sale";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FiCalendar, FiArrowRight, FiPercent } from "react-icons/fi";

const url = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

export default function SalesPage() {
  const locale = useLocale();
  const t = useTranslations("Sales");
  const router = useRouter();
  const [activeSales, setActiveSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch active sales
  useEffect(() => {
    const fetchActiveSales = async () => {
      setLoading(true);
      try {
        const sales = await SaleService.getActiveSales(locale);
        if (sales && sales.length > 0) {
          setActiveSales(sales);
          setSelectedSale(sales[0]);
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSales();
  }, [locale]);

  // Fetch products for selected sale
  const fetchProducts = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!selectedSale || loadingProducts) return;

      setLoadingProducts(true);
      try {
        const response = await SaleService.getSaleProducts(
          selectedSale.id,
          page,
          locale
        );
        if (response) {
          setTotalPages(response.total_pages);
          setCurrentPage(page);

          if (append) {
            setProducts((prev) => [...prev, ...response.results]);
          } else {
            setProducts(response.results);
          }
          console.log(response.results);
          setHasMore(page < response.total_pages && !!response.next);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setHasMore(false);
      } finally {
        setLoadingProducts(false);
      }
    },
    [selectedSale, locale, loadingProducts]
  );

  // Reset products and fetch when sale changes
  useEffect(() => {
    if (selectedSale) {
      setProducts([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchProducts(1, false);
    }
  }, [selectedSale, fetchProducts]);

  // Infinite scroll setup
  useEffect(() => {
    if (!hasMore || loadingProducts) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingProducts) {
        fetchProducts(currentPage + 1, true);
      }
    };

    const currentObserver = observer.current;
    const currentLoadMoreRef = loadMoreRef.current;

    if (currentLoadMoreRef) {
      observer.current = new IntersectionObserver(observerCallback, {
        rootMargin: "100px",
        threshold: 0.1,
      });
      observer.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [hasMore, loadingProducts, currentPage, fetchProducts]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const handleProductClick = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  const handleSaleSelect = (sale: Sale) => {
    if (selectedSale?.id !== sale.id) {
      setSelectedSale(sale);
    }
  };

  useEffect(() => {
    console.log("Total pages:", totalPages);
  }, [totalPages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
      </div>

      {/* Sales List */}
      {activeSales.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {t("activeSales")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => handleSaleSelect(sale)}
                className={`bg-background border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${selectedSale?.id === sale.id
                  ? "border-primary shadow-md"
                  : "border-muted"
                  }`}
              >
                {sale.image && (
                  <div className="mb-4">
                    <Image
                      src={sale.image}
                      alt={sale.name}
                      width={300}
                      height={200}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {sale.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {sale.description}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    <span>{formatDate(sale.start_date)}</span>
                  </div>
                  <FiArrowRight className="w-4 h-4" />
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    <span>{formatDate(sale.end_date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Sale Products */}
      {selectedSale && (
        <div className="mt-12">
          <div className="mb-8 bg-muted/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {selectedSale.name}
            </h2>
            <p className="text-muted-foreground mb-4">
              {selectedSale.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(selectedSale.start_date)}</span>
              </div>
              <FiArrowRight className="w-4 h-4" />
              <div className="flex items-center gap-1">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(selectedSale.end_date)}</span>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-6">
            {t("saleProducts")}
          </h3>

          {products.length === 0 && !loadingProducts ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("noProducts")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((saleProduct) => (
                  <div
                    key={`${saleProduct.id}-${saleProduct.product.id}`}
                    className="bg-background border border-muted rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleProductClick(saleProduct.product.id)}
                  >
                    {saleProduct.product.images.length > 0 && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={`${url}${saleProduct.product.images[0]}`}
                          alt={saleProduct.product.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-error text-white px-2 py-1 rounded-md text-sm font-medium">
                          <FiPercent className="inline w-3 h-3 mr-1" />
                          {saleProduct.discount_percentage}%
                        </div>
                      </div>
                    )}

                    <div className="p-4">
                      <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {saleProduct.product.name}
                      </h4>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">
                            {t("originalPrice")}:
                          </span>
                          <span className="line-through text-muted-foreground">
                            ${saleProduct.product.price}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-success font-semibold">
                            {t("salePrice")}:
                          </span>
                          <span className="text-success font-bold">
                            ${saleProduct.discounted_price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="text-success text-sm">
                        {t("youSave")}: $
                        {(
                          parseFloat(saleProduct.product.price) -
                          saleProduct.discounted_price
                        ).toFixed(2)}
                      </div>

                      {saleProduct.product.rating && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          ⭐ {saleProduct.product.rating} (
                          {saleProduct.product.ratings_count} {t("reviews")})
                        </div>
                      )}

                      <div className="mt-2 text-sm text-muted-foreground">
                        {t("inStock")}: {saleProduct.product.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite scroll trigger */}
              {hasMore && (
                <div ref={loadMoreRef} className="mt-8 text-center">
                  {loadingProducts && <LoadingSpinner size="md" />}
                </div>
              )}

              {!hasMore && products.length > 0 && (
                <div className="mt-8 text-center text-muted-foreground">
                  {t("noMoreProducts")}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeSales.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("noActiveSales")}</p>
        </div>
      )}
    </div>
  );
}
