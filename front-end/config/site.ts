// config/site.ts
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number]; // This creates a union type: 'en' | 'ar'

export const defaultLocale: Locale = "en";

export const siteConfig = {
  name: "StoreName",
  description: "Your one-stop ecommerce solution",
  links: {
    github: "https://github.com/yourusername/your-repo",
    twitter: "https://twitter.com/yourhandle",
  },
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Products",
      href: "/products",
    },
    {
      title: "Categories",
      href: "/categories",
    },
    {
      title: "Admin Panel",
      href: "/admin/dashboard",
      adminOnly: true,
    },
  ],
  authNav: [
    {
      title: "Login",
      href: "/auth/login",
    },
    {
      title: "Register",
      href: "/register",
    },
  ],
};
