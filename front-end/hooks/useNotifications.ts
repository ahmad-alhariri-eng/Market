// hooks/useNotifications.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { useCallback } from "react";
import { notificationService } from "@/services/NotificationsService";

export function useNotifications() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  // Smart polling based on user activity
  const getPollingInterval = useCallback(() => {
    if (!user) return false; // No polling when logged out
    return 15000; // 15 seconds polling
  }, [user]);

  // Fetch notifications with pagination support
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getNotifications(token!),
    enabled: !!token,
    refetchInterval: getPollingInterval,
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  // Fetch unread count separately
  const { data: unreadCountData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getUnreadCount(token!),
    enabled: !!token,
    refetchInterval: 10000, // Refresh count every 10 seconds
  });

  // Mark single notification as read
  const markAsRead = useMutation({
    mutationFn: (notificationId: number) =>
      notificationService.markAsRead(notificationId, token!),
    onSuccess: () => {
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
    onError: (error) => {
      console.error("Failed to mark notification as read:", error);
    },
  });

  // Mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(token!),
    onSuccess: () => {
      // Invalidate both queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
    onError: (error) => {
      console.error("Failed to mark all notifications as read:", error);
    },
  });

  return {
    notifications: notificationsData?.results || [],
    unreadCount: unreadCountData?.unread_count || 0,
    isLoading,
    error,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    refresh: refetch,
    hasMore: !!notificationsData?.next,
    totalCount: notificationsData?.count || 0,
  };
}
