// lib/api/notifications.ts
import { api } from "@/lib/api";
import {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  ExtraData,
} from "@/types/notification";

export const notificationService = {
  getNotifications: async (token: string): Promise<NotificationsResponse> => {
    try {
      const response = await api.get(`/notifications/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure proper structure for each notification
      const rawData = response.data;
      const dataList = Array.isArray(rawData) ? rawData : (rawData.results || []);

      // Ensure proper structure for each notification
      const notifications = dataList.map((notification: any) => ({
        ...notification,
        related_object: notification.related_object || null,
        extra_data: notification.extra_data || null,
      }));

      return {
        count: notifications.length,
        next: null,
        previous: null,
        results: notifications,
      };
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      // Return empty response structure
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    }
  },

  markAsRead: async (
    notificationId: number,
    token: string
  ): Promise<MarkAsReadResponse> => {
    try {
      const response = await api.post(
        `/notifications/${notificationId}/read/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      throw new Error("Failed to mark notification as read");
    }
  },

  markAllAsRead: async (token: string): Promise<void> => {
    try {
      await api.post(
        "/notifications/mark-all-read/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      throw new Error("Failed to mark all notifications as read");
    }
  },

  getUnreadCount: async (token: string): Promise<UnreadCountResponse> => {
    try {
      const response = await api.get("/notifications/unread-count/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
      return { unread_count: 0 };
    }
  },
};
