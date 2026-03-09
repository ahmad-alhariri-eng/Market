// components/ui/LoadingSpinner.tsx
"use client";

import { useMemo } from "react";
import { FiLoader } from "react-icons/fi";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = useMemo(() => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "md":
        return "w-6 h-6";
      case "lg":
        return "w-8 h-8";
      case "xl":
        return "w-12 h-12";
      default:
        return "w-6 h-6";
    }
  }, [size]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <FiLoader className={`animate-spin text-primary ${sizeClasses}`} />
    </div>
  );
}
