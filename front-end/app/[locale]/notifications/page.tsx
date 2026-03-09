// app/[locale]/notifications/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/providers/auth-provider";
import {
  FiCheckCircle,
  FiBellOff,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";


export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    refresh,
    isLoading,
    totalCount,
  } = useNotifications();
  // Removed unused 'user' and 'token' from useAuth()
  // If no other properties from useAuth are used, this line can be removed entirely.
  // For now, keeping it as an empty destructuring if nothing else is needed.
  useAuth();
  const t = useTranslations("Notifications");
  const locale = useLocale();
  const dateLocale = locale === "ar" ? ar : enUS;
  const [expandedNotifications, setExpandedNotifications] = useState<Set<number>>(new Set());

  useEffect(() => {
    refresh(); // Load notifications on page mount
  }, [refresh]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPpp", { locale: dateLocale });
    } catch {
      return dateString;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const toggleExpand = (notificationId: number) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  interface NotificationExtraData {
    delivery_token?: string;
    expires_at?: string;
    [key: string]: unknown;
  }

  // Seller functionality removed
  // const isReturnApprovalNotification = ...
  // const renderReturnApprovalActions = ...

  const renderExtraData = (extraData: NotificationExtraData) => {
    if (!extraData) return null;

    return (
      <div className="mt-3 p-3 bg-muted/20 rounded-md text-sm">
        {extraData.delivery_token && (
          <div className="mb-2">
            <strong>{t("deliveryToken")}:</strong> {extraData.delivery_token}
          </div>
        )}

        {extraData.expires_at && (
          <div className="mb-2">
            <strong>{t("expiresAt")}:</strong> {formatDate(extraData.expires_at)}
          </div>
        )}

        {/* Render other extra data fields */}
        {Object.entries(extraData).map(([key, value]) => {
          if (['delivery_token', 'expires_at'].includes(key)) return null;
          return (
            <div key={key} className="mb-1">
              <strong>{key}:</strong> {String(value)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t("notifications")}</h1>
            <p className="text-sm text-muted-foreground">
              {totalCount} {t("totalNotifications")}, {unreadCount}{" "}
              {t("unread")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              isDisabled={isLoading}
            >
              <FiRefreshCw
                className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              {t("refresh")}
            </Button>
            {notifications.length > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                variant="outline"
                isDisabled={isLoading}
              >
                <FiCheckCircle className="w-4 h-4 mr-2" />
                {t("markAllRead")}
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <FiRefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">{t("loading")}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <FiBellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t("noNotifications")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {notifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${!notification.is_read
                  ? "bg-primary/5 border-primary/20"
                  : "bg-background"
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium">
                    {locale === "ar"
                      ? notification.message_ar
                      : notification.message_en}
                  </p>
                  {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {formatDate(notification.created_at)}
                </p>

                {notification.related_object && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("relatedTo")}: {notification.related_object.type}{" "}
                    {notification.related_object.order_number &&
                      `#${notification.related_object.order_number}`}
                    {notification.related_object.id &&
                      ` (ID: ${notification.related_object.id})`}
                  </p>
                )}

                {/* Return Approval Actions removed (Seller role removed) */}
                {/* {renderReturnApprovalActions(notification)} */}

                {/* Extra Data Toggle */}
                {notification.extra_data && (
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(notification.id)}
                      className="text-xs"
                    >
                      {expandedNotifications.has(notification.id) ? (
                        <>
                          <FiEyeOff className="w-3 h-3 mr-1" />
                          {t("hideDetails")}
                        </>
                      ) : (
                        <>
                          <FiEye className="w-3 h-3 mr-1" />
                          {t("showDetails")}
                        </>
                      )}
                    </Button>

                    {expandedNotifications.has(notification.id) &&
                      renderExtraData(notification.extra_data)
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}