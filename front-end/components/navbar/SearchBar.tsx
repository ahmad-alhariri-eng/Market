// components/SearchBar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

export function SearchBar({ open }: { open?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize search query from URL
  useEffect(() => {
    const searchQuery = searchParams.get("q");
    if (searchQuery) {
      setQuery(searchQuery);
      setIsExpanded(true);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (isExpanded) setIsExpanded(false);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`relative transition-all duration-300 ${
        isExpanded || open ? "w-full md:w-80" : "w-10"
      }`}
    >
      {/* Search Icon (always visible) */}
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className={`absolute left-3 top-1/2 z-[10] -translate-y-1/2 ${
          isExpanded || open ? "hidden" : "block"
        }`}
        aria-label="Open search"
      >
        <FiSearch className="text-gray-500" />
      </button>

      {/* Input Field */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className={`w-full pl-10 pr-8 py-2 text-primary border rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
          isExpanded || open
            ? "opacity-100"
            : "opacity-0 w-0 absolute h-0 z-[-1]"
        }`}
        onBlur={() => !query && setIsExpanded(false)}
        autoFocus={isExpanded}
      />

      {/* Clear Button (visible when expanded and has text) */}
      {isExpanded && query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label="Clear search"
        >
          <FiX className="text-gray-500" />
        </button>
      )}
    </form>
  );
}
