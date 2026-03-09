// components/layout/navbar.tsx (updated)
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FiMenu, FiX, FiShoppingCart, FiHeart, FiShoppingBag, FiSearch } from "react-icons/fi";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserDropdown } from "./user-dropdown";
import { MobileUserDropdown } from "./mobile-user-dropdown";
import { SearchBar } from "../navbar/SearchBar";
import { MobileSearch } from "./MobileSearch";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "../navbar/ThemeSwitcher";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { LocaleSwitcher, MobileLocaleSwitcher } from "../navbar/LocaleSwitcher";

export function Navbar() {
  const t = useTranslations("Navbar");
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoading, token } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  if (pathname?.includes("/admin")) {
    return null;
  }

  if (!isMounted) {
    return (
      <>
        <div className="pb-[10%] md:pb-[7%] lg:pb-[5%]" aria-hidden="true" />
        <header
          className={cn(
            "fixed w-full z-50 transition-all duration-500 h-16 px-[2%]",
            "bg-background/50 backdrop-blur-sm border-b border-transparent"
          )}
        >
          <div className="container flex items-center justify-between h-full">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
                  <FiShoppingBag className="w-4 h-4 text-white" />
                </span>
                <span className="text-xl font-bold text-foreground">{t("logo")}</span>
              </Link>
              <ThemeSwitcher />
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/products"
                  className="hover:text-primary transition-colors hover:underline underline-offset-4"
                >
                  {t("products")}
                </Link>
                <Link
                  href="/brands"
                  className="hover:text-primary transition-colors hover:underline underline-offset-4"
                >
                  {t("brands")}
                </Link>
                <Link
                  href="/sales"
                  className="hover:text-primary transition-colors hover:underline underline-offset-4"
                >
                  {t("sales")}
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center justify-center">
                <SearchBar />
              </div>

              <button
                className="md:hidden p-2 rounded-full hover:bg-primary/10"
                onClick={() => setIsMobileSearchOpen(true)}
                aria-label="Search"
              >
                <FiSearch />
              </button>

              {/* Locale Switcher */}
              <div className="hidden md:block">
                <LocaleSwitcher />
              </div>

              <button
                className="md:hidden p-2 rounded-md hover:bg-primary/10 transition-colors"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <FiMenu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>
      </>
    );
  }

  const isAuthenticated = !!user && !!token;

  return (
    <>
      <div className="pb-[10%] md:pb-[7%] lg:pb-[5%]" aria-hidden="true" />
      <header
        className={cn(
          "fixed w-full z-50 transition-all duration-500 h-16 px-[2%]",
          isScrolled
            ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-border/40"
            : "bg-background/50 backdrop-blur-sm border-b border-transparent"
        )}
      >
        <div className="container flex items-center justify-between h-full">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
                <FiShoppingBag className="w-4 h-4 text-white" />
              </span>
              <span className="text-xl font-bold text-foreground">{t("logo")}</span>
            </Link>
            <ThemeSwitcher />
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/products"
                className="hover:text-primary transition-colors hover:underline underline-offset-4"
              >
                {t("products")}
              </Link>
              <Link
                href="/brands"
                className="hover:text-primary transition-colors hover:underline underline-offset-4"
              >
                {t("brands")}
              </Link>
              <Link
                href="/sales"
                className="hover:text-primary transition-colors hover:underline underline-offset-4"
              >
                {t("sales")}
              </Link>
              <Link
                href="/auctions"
                className="hover:text-primary transition-colors hover:underline underline-offset-4"
              >
                {t("auctions")}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center justify-center">
              <SearchBar />
            </div>

            {/* Show notifications only when authenticated */}
            {isAuthenticated && <NotificationsDropdown />}

            {/* Locale Switcher */}
            <LocaleSwitcher />
            <button
              className="md:hidden p-2 rounded-full hover:bg-primary/10"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Search"
            >
              <FiSearch />
            </button>

            {/* Show cart only when authenticated */}
            {isAuthenticated && (
              <Link
                href="/cart"
                aria-label="Cart"
                className="hidden md:flex p-2 rounded-full hover:bg-primary/10 transition-colors relative"
              >
                <FiShoppingCart className="w-5 h-5" />
              </Link>
            )}

            {/* Show wishlist only when authenticated */}
            {isAuthenticated && (
              <Link
                href="/wishlist"
                aria-label="wishlist"
                className="hidden md:flex p-2 rounded-full hover:bg-primary/10 transition-colors relative"
              >
                <FiHeart className="w-5 h-5" />
              </Link>
            )}

            {!isLoading &&
              (isAuthenticated ? (
                <UserDropdown />
              ) : (
                <div className="hidden md:flex gap-2">
                  <Button
                    variant="outline"
                    asChild
                    className="hover:bg-primary/10"
                  >
                    <Link href="/auth/login">{t("login")}</Link>
                  </Button>
                  <Button asChild className="hover:bg-primary/90">
                    <Link href="/auth/email-verification">{t("register")}</Link>
                  </Button>
                </div>
              ))}

            <button
              className="md:hidden p-2 rounded-md hover:bg-primary/10 transition-colors"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-background border-t">
            <div className="container py-4 flex flex-col gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-10 pr-4 py-2 rounded-md border hover:border-primary/50 focus:border-primary transition-colors"
                />
                <FiSearch className="absolute left-3 top-3 text-muted-foreground" />
              </div>

              <nav className="flex flex-col gap-1">
                <Link
                  href="/products"
                  onClick={toggleMenu}
                  className="px-4 py-2 rounded-md hover:bg-primary/10 transition-colors"
                >
                  {t("products")}
                </Link>

              </nav>

              <div className="flex flex-col gap-1 pt-2 border-t">
                {/* Show cart only when authenticated */}
                {isAuthenticated && (
                  <Link
                    href="/cart"
                    onClick={toggleMenu}
                    className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-primary/10 transition-colors"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    {t("cart")}
                  </Link>
                )}

                {isAuthenticated ? (
                  <MobileUserDropdown onSelect={toggleMenu} />
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="justify-center hover:bg-primary/10"
                    >
                      <Link href="/auth/login" onClick={toggleMenu}>
                        {t("login")}
                      </Link>
                    </Button>
                    <Button asChild className="hover:bg-primary/90">
                      <Link href="/auth/email-verification">{t("register")}</Link>
                    </Button>
                  </>
                )}

                {/* Mobile Locale Switcher */}
                <MobileLocaleSwitcher onClose={toggleMenu} />
              </div>
            </div>
          </div>
        )}
      </header>
      <MobileSearch
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />
    </>
  );
}
