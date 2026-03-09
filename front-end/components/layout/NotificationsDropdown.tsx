// components/layout/NotificationsDropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiBell, FiCheck, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh,
    isLoading,
  } = useNotifications();
  const t = useTranslations("Notifications");
  const locale = useLocale();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!isOpen) {
      refresh(); // Refresh notifications when opening
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (
    notificationId: number,
    isRead: boolean
  ) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) {
        return t("justNow");
      } else if (diffInHours < 24) {
        return t("hoursAgo", { hours: diffInHours });
      } else {
        return date.toLocaleDateString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      console.error("Failed to mark notification as read");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-primary/10 transition-colors"
        aria-label={t("notifications")}
        disabled={isLoading}
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {isLoading && (
          <FiRefreshCw className="w-3 h-3 absolute -bottom-1 -right-1 text-primary animate-spin" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">{t("notifications")}</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refresh()}
                className={` ${isLoading ? "disabled" : ""
                  } text-xs hover:bg-primary/10 p-1`}
              >
                <FiRefreshCw
                  className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs hover:bg-primary/10"
                >
                  <FiCheckCircle className="w-4 h-4 mr-1" />
                  {t("markAllRead")}
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <FiRefreshCw className="w-5 h-5 mx-auto animate-spin mb-2" />
                <p>{t("loading")}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {t("noNotifications")}
              </div>
            ) : (
              notifications?.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-b hover:bg-muted transition-colors cursor-pointer",
                    !notification.is_read && "bg-primary/5"
                  )}
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.is_read
                    )
                  }
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium">
                      {locale === "ar"
                        ? notification.message_ar
                        : notification.message_en}
                    </p>
                    {!notification.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{formatDate(notification.created_at)}</span>
                    {notification.is_read && (
                      <FiCheck className="w-3 h-3 text-success" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t">
              <Link
                href="/notifications"
                className="block text-center text-sm text-primary hover:underline p-2"
                onClick={() => setIsOpen(false)}
              >
                {t("viewAll")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
