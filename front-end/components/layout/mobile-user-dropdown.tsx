// components/layout/mobile-user-dropdown.tsx
"use client";

import { useTranslations } from "next-intl";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { useRouter } from "next/navigation";

export function MobileUserDropdown({ onSelect }: { onSelect?: () => void }) {
  const t = useTranslations("Navigation");
  const { logout } = useAuth();

  return (
    <div className="flex flex-col gap-1">
      <Link
        href="/profile"
        onClick={onSelect}
        className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-primary/10 transition-colors"
      >
        <FiUser className="w-5 h-5" />
        {t("profile")}
      </Link>

      <Button
        variant="ghost"
        className="justify-start gap-3 px-4 py-2 h-auto hover:bg-primary/10 transition-colors"
        onClick={() => {
          logout();
          onSelect?.();
        }}
      >
        <FiLogOut className="w-5 h-5" />
        {t("logout")}
      </Button>
    </div>
  );
}
