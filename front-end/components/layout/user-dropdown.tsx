// components/layout/user-dropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiUser,
  FiLogOut,
  FiList,
  FiCreditCard,
} from "react-icons/fi";
import { useAuth } from "@/providers/auth-provider";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UserDropdown() {
  const t = useTranslations("Navbar");
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-3 hover:bg-primary/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
          <FiUser className="w-4 h-4 text-primary" />
        </div>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background border overflow-hidden z-50">
          <div className="py-1">
            <Link
              href={`/profile`}
              className="flex items-center px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FiUser className="mr-3 h-4 w-4" />
              {t("profile")}
            </Link>
            <Link
              href="/wallet"
              className="flex items-center px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FiCreditCard className="mr-3 h-4 w-4" />
              {t("wallet")}
            </Link>
            <Link
              href="/orders"
              className="flex items-center px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FiList className="mr-3 h-4 w-4" />
              {t("orders")}
            </Link>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2 text-sm hover:bg-primary/10 transition-colors text-left"
            >
              <FiLogOut className="mr-3 h-4 w-4" />
              {t("logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
