import { Report, ReportStatus, ReportCategory, Comment } from "@/types";
import { reportsAPI, commentsAPI, notificationsAPI, statsAPI } from "./api-client";

// Define API response types to handle backend data shape
interface ApiReport extends Omit<Report, "location"> {
  locationLat?: number;
  locationLng?: number;
  address?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

interface ApiComment extends Omit<Comment, "username" | "user"> {
  user: {
    username: string;
  } | null;
  username?: string;
}

// --------------------
// Reports Management
// --------------------

export async function getAllReports(
  filters?: { category?: string; status?: string }
): Promise<Report[]> {
  try {
    const response = await reportsAPI.getAll(filters);

    return (response.reports as ApiReport[]).map((r) => {
      const normalizedLocation = r.location
        ? {
            lat: r.location.lat,
            lng: r.location.lng,
            address: r.location.address,
          }
        : {
            lat: r.locationLat ?? 0,
            lng: r.locationLng ?? 0,
            address: r.address,
          };

      return {
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category as ReportCategory,
        subcategory: r.subcategory,
        area: r.area,
        status: r.status as ReportStatus,
        imageUrl: r.imageUrl || undefined,
        location: normalizedLocation,
        userId: r.userId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        urgent: r.urgent || false,
      } as Report;
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return [];
  }
}

export async function getReportsByUser(userId: string): Promise<Report[]> {
  try {
    const response = await reportsAPI.getAll({ userId });

    return (response.reports as ApiReport[]).map((r) => {
      const normalizedLocation = r.location
        ? {
            lat: r.location.lat,
            lng: r.location.lng,
            address: r.location.address,
          }
        : {
            lat: r.locationLat ?? 0,
            lng: r.locationLng ?? 0,
            address: r.address,
          };

      return {
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category as ReportCategory,
        subcategory: r.subcategory,
        area: r.area,
        status: r.status as ReportStatus,
        imageUrl: r.imageUrl || undefined,
        location: normalizedLocation,
        userId: r.userId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        urgent: r.urgent || false,
      } as Report;
    });
  } catch (error) {
    console.error("Failed to fetch user reports:", error);
    return [];
  }
}

export async function getReportById(id: string): Promise<Report | null> {
  try {
    const response = await reportsAPI.getById(id);
    const r = response.report as ApiReport;

    const normalizedLocation = r.location
      ? {
          lat: r.location.lat,
          lng: r.location.lng,
          address: r.location.address,
        }
      : {
          lat: r.locationLat ?? 0,
          lng: r.locationLng ?? 0,
          address: r.address,
        };

    return {
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category as ReportCategory,
      subcategory: r.subcategory,
      status: r.status as ReportStatus,
      imageUrl: r.imageUrl || undefined,
      location: normalizedLocation,
      userId: r.userId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      urgent: r.urgent || false,
      area: r.area,
    } as Report;
  } catch (error) {
    console.error("Failed to fetch report:", error);
    return null;
  }
}

export async function createReport(
  report: Omit<Report, "id" | "createdAt" | "updatedAt">
): Promise<Report> {
  try {
    const response = await reportsAPI.create({
      title: report.title,
      description: report.description,
      category: report.category,
      subcategory: report.subcategory,
      area: report.area,
      imageUrl: report.imageUrl,
      location: report.location,
      userId: report.userId,
      status: report.status || "reported",
      urgent: report.urgent || false,
    });

    const r: ApiReport = response.report as ApiReport;

    const normalizedLocation = r.location
      ? {
          lat: r.location.lat,
          lng: r.location.lng,
          address: r.location.address,
        }
      : {
          lat: r.locationLat ?? 0,
          lng: r.locationLng ?? 0,
          address: r.address,
        };

    return {
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category as ReportCategory,
      subcategory: r.subcategory,
      area: r.area,
      status: r.status as ReportStatus,
      imageUrl: r.imageUrl || undefined,
      location: normalizedLocation,
      userId: r.userId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      urgent: r.urgent || false,
    } as Report;
  } catch (error) {
    console.error("Failed to create report:", error);
    throw error;
  }
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus
): Promise<Report | null> {
  try {
    const response = await reportsAPI.updateStatus(id, status);
    const r = response.report as ApiReport;

    const normalizedLocation = r.location
      ? {
          lat: r.location.lat,
          lng: r.location.lng,
          address: r.location.address,
        }
      : {
          lat: r.locationLat ?? 0,
          lng: r.locationLng ?? 0,
          address: r.address,
        };

    return {
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category as ReportCategory,
      subcategory: r.subcategory,
      status: r.status as ReportStatus,
      imageUrl: r.imageUrl || undefined,
      location: normalizedLocation,
      userId: r.userId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      urgent: r.urgent || false,
      area: r.area,
    } as Report;
  } catch (error) {
    console.error("Failed to update report status:", error);
    return null;
  }
}

export async function deleteReport(id: string): Promise<boolean> {
  try {
    await reportsAPI.delete(id);
    return true;
  } catch (error) {
    console.error("Failed to delete report:", error);
    return false;
  }
}

// --------------------
// Statistics
// --------------------

export async function getStats() {
  try {
    const stats = await statsAPI.get();
    return stats;
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return {
      totalReports: 0,
      resolved: 0,
      processing: 0,
      avgResponseTime: 0,
      byCategory: {
        roads: 0,
        safety: 0,
        environment: 0,
        garbage: 0,
      },
    };
  }
}

// --------------------
// Comments
// --------------------

export async function getComments(reportId: string) {
  try {
    const response = await commentsAPI.getByReport(reportId);

    return (response.comments as ApiComment[]).map((c: ApiComment) => ({
      ...c,
      username: c.username || c.user?.username || "Unknown",
    }));
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return [];
  }
}

export async function addComment(
  reportId: string,
  content: string,
  userId: string,
  username: string
) {
  try {
    const response = await commentsAPI.create(reportId, content);
    const commentUser = (response as any).comment?.user?.username;

    return {
      id: response.comment.id,
      reportId: response.comment.reportId,
      userId: response.comment.userId,
      username: commentUser || username,
      content: response.comment.content,
      createdAt: response.comment.createdAt,
      upvotes: response.comment.upvotes,
    };
  } catch (error) {
    console.error("Failed to add comment:", error);
    throw error;
  }
}

// --------------------
// Notifications
// --------------------

export async function getNotifications(userId: string) {
  try {
    const response = await notificationsAPI.getAll();
    return response.notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await notificationsAPI.markAsRead(notificationId);
    return true;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return false;
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await notificationsAPI.markAllAsRead();
    return true;
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return false;
  }
}
