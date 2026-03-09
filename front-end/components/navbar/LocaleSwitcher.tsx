// components/navbar/LocaleSwitcher.tsx
"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { FiGlobe } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const switchLocale = (newLocale: string) => {
    const path = window.location.pathname;
    const segments = path.split("/");

    if (segments.length > 1 && (segments[1] === "en" || segments[1] === "ar")) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    const newPath = segments.join("/");
    router.push(newPath);
    setIsOpen(false);
  };

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
  ];

  // Close dropdown when clicking outside
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors"
        aria-label="Switch language"
      >
        <FiGlobe className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 bg-background border border-muted rounded-md shadow-lg z-50 min-w-32">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => switchLocale(language.code)}
              className={`w-full text-left px-3 py-2 cursor-pointer transition-colors ${
                locale === language.code
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50 text-foreground"
              } first:rounded-t-md last:rounded-b-md`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {language.nativeName}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// For mobile version
export function MobileLocaleSwitcher({ onClose }: { onClose?: () => void }) {
  const locale = useLocale();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const path = window.location.pathname;
    const segments = path.split("/");

    if (segments.length > 1 && (segments[1] === "en" || segments[1] === "ar")) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    const newPath = segments.join("/");
    router.push(newPath);
    onClose?.();
  };

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
  ];

  return (
    <div className="border-t border-muted pt-2 mt-2">
      <div className="text-xs text-muted-foreground px-4 py-1">
        Language / اللغة
      </div>
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => switchLocale(language.code)}
          className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
            locale === language.code
              ? "bg-primary/10 text-primary"
              : "hover:bg-primary/10 text-foreground"
          }`}
        >
          {language.nativeName}
        </button>
      ))}
    </div>
  );
}
