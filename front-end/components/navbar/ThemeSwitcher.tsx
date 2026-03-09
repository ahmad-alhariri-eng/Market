// components/ThemeSwitcher.tsx
"use client";

import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="p-2 rounded-full hover:bg-primary/10 dark:hover:bg-primary-light/10 transition-colors"
    >
      {theme === "light" ? (
        <FiMoon className="w-5 h-5" />
      ) : (
        <FiSun className="w-5 h-5" />
      )}
    </button>
  );
}
