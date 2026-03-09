// components/brands/BrandCardSkeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BrandCardSkeletonProps {
  variant?: "default" | "compact";
  className?: string;
}

export function BrandCardSkeleton({ 
  variant = "default", 
  className 
}: BrandCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 overflow-hidden rounded-xl border bg-card",
        variant === "default" ? "h-40 p-6" : "h-24 px-4 py-3",
        className
      )}
    >
      <Skeleton
        className={cn(
          "rounded-lg",
          variant === "default" ? "h-24 w-24" : "h-14 w-14"
        )}
      />

      <div className="flex-1 space-y-2">
        <Skeleton
          className={cn(
            variant === "default" ? "h-6 w-3/4" : "h-4 w-1/2"
          )}
        />
        
        {variant === "default" && (
          <>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-3 h-3 w-24" />
          </>
        )}
      </div>
    </div>
  );
}