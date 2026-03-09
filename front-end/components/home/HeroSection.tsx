// components/home/HeroSection.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield } from "react-icons/fi";
import Link from "next/link";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
}

export default function HeroSection({
  title,
  subtitle,
  ctaText,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] max-h-[1000px] w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Refined Subtle Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-[0.02] dark:opacity-[0.05]" />

      <div className="container relative z-10 flex flex-col items-center justify-center gap-10 text-center px-4 max-w-5xl">
        {/* Sleek New Arrivals Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-3 backdrop-blur-md bg-foreground/5 
                     text-foreground px-5 py-2.5 rounded-full text-sm font-semibold 
                     ring-1 ring-inset ring-foreground/10 hover:ring-foreground/20 transition-all cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          New collection just dropped
          <FiArrowRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>

        {/* Dramatic Heading Box */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="space-y-6"
        >
          <h1 className="text-5xl tracking-tighter sm:text-7xl md:text-8xl lg:text-[7rem] font-bold text-foreground mx-auto leading-[1.05]">
            {title}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mx-auto max-w-2xl text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Ultra-Premium CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-5 mt-4"
        >
          <Link href="/products">
            <Button
              size="lg"
              className="group relative overflow-hidden rounded-full text-base px-10 py-7 bg-foreground text-background hover:bg-foreground/90 transition-all shadow-2xl hover:shadow-primary/20 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2 font-bold tracking-wide">
                {ctaText}
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
          <Link href="/sales">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full text-base px-10 py-7 border-border hover:bg-muted font-bold tracking-wide transition-all hover:-translate-y-1"
            >
              Explore Deals
            </Button>
          </Link>
        </motion.div>

        {/* Refined Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex flex-wrap justify-center gap-10 mt-10"
        >
          {[
            { icon: FiShoppingBag, label: "Premium Catalog" },
            { icon: FiTruck, label: "Express Delivery" },
            { icon: FiShield, label: "Secure Payments" },
          ].map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-sm font-medium tracking-wide text-muted-foreground"
            >
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                <badge.icon className="w-4 h-4 text-foreground" />
              </div>
              <span>{badge.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
