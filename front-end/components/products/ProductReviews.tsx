// components/products/ProductReviews.tsx
"use client";

import { useTranslations } from "next-intl";
import { ProductReview } from "@/types/product";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";

interface ProductReviewsProps {
  productId: number;
  locale: string;
  rating: string | number | null;
  ratingsCount: number;
  initialReviews: ProductReview[];
}

export function ProductReviews({ locale, rating, ratingsCount, initialReviews }: ProductReviewsProps) {
  const t = useTranslations("Product");
  const [reviews] = useState<ProductReview[]>(initialReviews);
  // Removed unused isLoading, isWritingReview, handleSubmitReview
  // const [newReview, setNewReview] = useState({
  //   rating: 0,
  //   title: "",
  //   comment: "",
  // });

  // const handleSubmitReview = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // setIsLoading(true); // Removed
  //   try {
  //     const createdReview = await reviewService.createProductReview(
  //       productId,
  //       {
  //         rating: newReview.rating,
  //         title: newReview.title,
  //         comment: newReview.comment,
  //       },
  //       locale
  //     );
  //     setReviews([createdReview, ...reviews]);
  //     setNewReview({ rating: 0, title: "", comment: "" });
  //     router.refresh(); // Refresh to update the average rating
  //   } catch (error) {
  //     console.error("Failed to submit review:", error);
  //   } finally {
  //   }
  // };

  return (
    <div className="border-t border-b py-8 my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{t("productReviews")}</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xl ${star <= Math.floor(Number(rating || 0))
                  ? "text-yellow-400"
                  : "text-gray-300"
                  }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({ratingsCount} {t("reviews")})
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">{t("noReviews")}</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`${star <= review.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                          }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {review.is_edited && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <FiEdit size={12} />
                      {t("edited")}
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("order")} #{review.order}
                </span>
              </div>
              {review.title && (
                <h3 className="font-medium mb-1">{review.title}</h3>
              )}
              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
