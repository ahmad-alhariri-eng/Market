export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  authOnly?: boolean;
  sellerOnly?: boolean;
};

export type MainNavItem = NavItem;

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  links: {
    twitter: string;
    github: string;
  };
  mainNav: MainNavItem[];
};
