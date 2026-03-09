// components/brands/BrandCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Brand } from "@/types/brands";
import { Skeleton } from "../ui/skeleton";
import { FiMoreVertical, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { brandService } from "@/services/brandService";

export function BrandCard({ brand }: { brand: Brand }) {
  const { user, token } = useAuth();
  const [isBlocking, setIsBlocking] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const canBlockBrand = user && token && user.id !== brand.owner_id;
  const isBrandOwner = user && user.id === brand.owner_id;

  const handleBlockBrand = async () => {
    if (!token || !canBlockBrand) return;

    setIsBlocking(true);
    try {
      const result = await brandService.blockBrand(brand.id, "en", token);
      toast.success(result.message || "Brand blocked successfully");
      setShowOptions(false);
      setShowOptions(false);
    } catch (error) {
      console.error("Error blocking brand:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to block brand";
      toast.error(errorMessage);
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <div className="group relative flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md">
      {/* Block/Options Button */}
      {canBlockBrand && (
        <div className="absolute right-1 top-1">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Brand options"
          >
            <FiMoreVertical className="w-4 h-4" />
          </button>

          {showOptions && (
            <div className="absolute right-0 top-8 bg-background border border-muted rounded-md shadow-lg z-10 min-w-32">
              <button
                onClick={handleBlockBrand}
                disabled={isBlocking}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <FiX className="w-4 h-4 text-error" />
                Block Brand
              </button>
              {/* Add unblock option if needed */}
              {/* <button
                onClick={handleUnblockBrand}
                disabled={isBlocking}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4 text-success" />
                Unblock Brand
              </button> */}
            </div>
          )}
        </div>
      )}

      {/* Owner badge */}
      {isBrandOwner && (
        <div className="absolute left-2 top-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
            Your Brand
          </span>
        </div>
      )}

      <Link
        href={`/products/?sort_by=created_at&sort_direction=desc&page=1&brand_name=${brand.name}&in_stock=false&has_discount=false`}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative h-20 w-20">
          {brand.logo ? (
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              className="object-contain transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 20vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {brand.name.charAt(0)}
            </div>
          )}
        </div>
        <h3 className="font-medium">{brand.name}</h3>
      </Link>

      {/* Loading overlay */}
      {isBlocking && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}

export function BrandCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-6 w-24" />
    </div>
  );
}
