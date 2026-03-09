// components/ui/skeleton.tsx
"use client";

import { motion } from "framer-motion";

export function Skeleton({
  className = "",
  rounded = "rounded-md",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 0.8 }}
      transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
      className={`bg-muted ${rounded} ${className}`}
    />
  );
}
