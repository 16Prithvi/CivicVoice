import { Notification } from "@/types";

const NOTIFICATIONS_KEY = "civicvoice_notifications";

export function getNotifications(userId: string): Notification[] {
  if (typeof window === "undefined") return [];
  const notificationsJson = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!notificationsJson) return [];
  
  const allNotifications: Notification[] = JSON.parse(notificationsJson);
  return allNotifications.filter((n) => n.userId === userId);
}

export function createNotification(notification: Omit<Notification, "id" | "read" | "createdAt">): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const allNotifications = getAllNotifications();
  allNotifications.push(newNotification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifications));
  
  return newNotification;
}

export function markAsRead(notificationId: string): void {
  const allNotifications = getAllNotifications();
  const index = allNotifications.findIndex((n) => n.id === notificationId);
  if (index !== -1) {
    allNotifications[index].read = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifications));
  }
}

export function markAllAsRead(userId: string): void {
  const allNotifications = getAllNotifications();
  allNotifications.forEach((n) => {
    if (n.userId === userId && !n.read) {
      n.read = true;
    }
  });
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(allNotifications));
}

export function deleteNotification(notificationId: string): void {
  const allNotifications = getAllNotifications();
  const filtered = allNotifications.filter((n) => n.id !== notificationId);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
}

function getAllNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const notificationsJson = localStorage.getItem(NOTIFICATIONS_KEY);
  return notificationsJson ? JSON.parse(notificationsJson) : [];
}

export function getUnreadCount(userId: string): number {
  return getNotifications(userId).filter((n) => !n.read).length;
}








