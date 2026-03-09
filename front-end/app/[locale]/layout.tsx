// app/[locale]/layout.tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Navbar } from "@/components/layout/Navbar";
import { locales } from "@/config/site";
import "./globals.css";
import { ThemeScript } from "@/components/navbar/ThemeScript";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "react-hot-toast";
import AuthTokenInitializer from "@/components/auth-token-initializer";
import { checkTokenValidity } from "@/actions/token";
import TokenValidator from "@/components/token-validator";
import { MouseSpotlight } from "@/components/ui/mouse-spotlight";

export const metadata: Metadata = {
  title: {
    default: "QuickCart",
    template: "%s | QuickCart",
  },
  description: "Your one-stop e-commerce platform for the best products at unbeatable prices",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};



export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;
  // Validate locale
  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  // initialWishlist removed as it was unused (null was passed to provider)
  // validToken logic removed as it was only used for wishlist

  // Just check token validity to maybe handle side effects if needed, 
  // but looking at original code, it just assigned validToken.
  // We can keep checkTokenValidity if it has side effects, but it seems it just returned a value.
  // The warning said 'deleteAuthCookie', 'getAuthCookie', 'validateToken', 'logoutAction', 'validateAndCleanToken' were unused.
  // So I will remove them from imports.
  // 'checkTokenValidity' is used in line 55. 'initialWishlist' is unused.

  await checkTokenValidity();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthTokenInitializer>
            <ThemeProvider>
              <QueryProvider>
                <ThemeScript />
                <MouseSpotlight />
                <WishlistProvider initialWishlist={null}>
                  <TokenValidator />
                  <Navbar />
                  <div className="flex min-h-screen flex-col">
                    <main className="flex-1">{children}</main>
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: "#363636",
                          color: "#fff",
                        },
                        success: {
                          duration: 3000,
                          iconTheme: {
                            // Use iconTheme instead of theme
                            primary: "green",
                            secondary: "white",
                          },
                        },
                        error: {
                          duration: 5000,
                          iconTheme: {
                            // Use iconTheme instead of theme
                            primary: "red",
                            secondary: "white",
                          },
                        },
                      }}
                    />
                    <SiteFooter />
                  </div>
                </WishlistProvider>
              </QueryProvider>
            </ThemeProvider>
          </AuthTokenInitializer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
