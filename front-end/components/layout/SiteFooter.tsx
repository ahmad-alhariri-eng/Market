// components/layout/site-footer.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiShoppingBag,
  FiGithub,
  FiTwitter,
  FiInstagram,
} from "react-icons/fi";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const pathname = usePathname();

  if (pathname?.includes("/admin")) {
    return null;
  }

  const quickLinks = [
    { href: "/products", label: t("allProducts") },
    { href: "/sales", label: t("salesAndDeals") },
    { href: "/auctions", label: t("auctions") },
    { href: "/brands", label: t("brands") },
  ];

  const serviceLinks = [
    { href: "/orders", label: t("trackOrder") },
    { href: "/wallet", label: t("myWallet") },
    { href: "/profile", label: t("myAccount") },
  ];

  return (
    <footer className="border-t border-border/20 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center ring-1 ring-primary/20">
                <FiShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">
                QuickCart
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("brandTagline")}
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary ring-1 ring-transparent hover:ring-primary/20 transition-all duration-300"
              >
                <FiTwitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary ring-1 ring-transparent hover:ring-primary/20 transition-all duration-300"
              >
                <FiInstagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary ring-1 ring-transparent hover:ring-primary/20 transition-all duration-300"
              >
                <FiGithub className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              {t("customerService")}
            </h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              {t("contactUs")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiMail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>support@quickcart.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiPhone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+966 50 000 0000</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <FiMapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{t("location")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("termsOfService")}
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("privacyPolicy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}