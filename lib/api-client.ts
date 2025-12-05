// Import localStorage-based functions
import { getAllReports, getReportById, createReport, updateReportStatus, deleteReport as deleteReportLocal, getReportsByUser, getStats as getStatsLocal } from './data-store';
import { getComments as getCommentsLocal, addComment as addCommentLocal, upvoteComment as upvoteCommentLocal } from './comments';
import { getNotifications as getNotificationsLocal, markAsRead as markNotificationAsReadLocal, markAllAsRead as markAllNotificationsAsReadLocal } from './notifications';
import { getUser } from './auth';
import { Report, ReportStatus } from '@/types';

// ⚠️ BACKEND IS NOT CONNECTED - Frontend uses localStorage only
// The backend server runs on port 3001 but is intentionally disconnected
// const BACKEND_URL = 'http://localhost:3001'; // Not used - frontend is standalone

// Auth APIs - Using local storage instead of backend
export const authAPI = {
  register: async (username: string, email: string, password: string, isAdmin?: boolean, adminPost?: string): Promise<{ token: string; user: any }> => {
    // Check if user already exists in local storage
    if (typeof window === "undefined") {
      throw new Error("Not available on server");
    }

    // Ensure data store is initialized
    const { initializeDataStore } = await import('./data-store');
    initializeDataStore();

    const USERS_KEY = "civicvoice_users";
    const usersJson = localStorage.getItem(USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];

    // Check if user exists (case-insensitive)
    const existingUser = users.find((u: any) => 
      u.email.toLowerCase() === email.toLowerCase() || 
      u.username.toLowerCase() === username.toLowerCase()
    );
    if (existingUser) {
      throw new Error("Username or email already exists");
    }

    // Create new user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      password, // In real app, this would be hashed, but for frontend-only we store it as-is
      role: isAdmin ? "admin" : "citizen",
      adminPost: isAdmin ? adminPost : undefined,
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Create a simple token (just base64 encoded user info)
    const tokenData = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      adminPost: newUser.adminPost,
    };
    const token = btoa(JSON.stringify(tokenData));

    return {
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        adminPost: newUser.adminPost,
      },
    };
  },

  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    if (typeof window === "undefined") {
      throw new Error("Not available on server");
    }

    // Ensure data store is initialized
    const { initializeDataStore } = await import('./data-store');
    initializeDataStore();

    const USERS_KEY = "civicvoice_users";
    let usersJson = localStorage.getItem(USERS_KEY);
    
    // If no users exist or invalid data, reinitialize
    if (!usersJson || usersJson === "null" || usersJson === "[]") {
      initializeDataStore();
      usersJson = localStorage.getItem(USERS_KEY);
    }
    
    let users = usersJson ? JSON.parse(usersJson) : [];
    
    // Ensure we have at least demo users
    if (!Array.isArray(users) || users.length === 0) {
      initializeDataStore();
      const freshJson = localStorage.getItem(USERS_KEY);
      users = freshJson ? JSON.parse(freshJson) : [];
      if (!Array.isArray(users) || users.length === 0) {
        throw new Error("Unable to initialize users. Please refresh the page.");
      }
    }

    // Find user by email (case-insensitive)
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error("User not found. Please register first or use demo@example.com / admin@example.com");
    }
    
    if (user.password !== password) {
      throw new Error("Invalid password. Try: demo123 (for demo@example.com) or admin123 (for admin@example.com)");
    }

    // Create a simple token (just base64 encoded user info)
    const tokenData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const token = btoa(JSON.stringify(tokenData));

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  },

  me: async (): Promise<{ user: any }> => {
    // Get user from token
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      const decoded = JSON.parse(atob(token));
      return { user: decoded };
    } catch {
      throw new Error("Invalid token");
    }
  },
};

// Reports APIs - Using localStorage
export const reportsAPI = {
  getAll: async (filters?: { category?: string; status?: string; userId?: string }) => {
    let reports = getAllReports();
    
    // Apply filters
    if (filters?.userId) {
      reports = getReportsByUser(filters.userId);
    }
    if (filters?.category && filters.category !== "all") {
      reports = reports.filter((r) => r.category === filters.category);
    }
    if (filters?.status && filters.status !== "all") {
      reports = reports.filter((r) => r.status === filters.status);
    }
    
    return { reports };
  },

  getById: async (id: string) => {
    const report = getReportById(id);
    if (!report) {
      throw new Error('Report not found');
    }
    return { report };
  },

  create: async (data: any) => {
    const report = createReport(data);
    return { report };
  },

  update: async (id: string, data: any) => {
    const existingReport = getReportById(id);
    if (!existingReport) {
      throw new Error('Report not found');
    }
    
    // Update report (we'll create a new one with updated data)
    const updatedReport = {
      ...existingReport,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    // Delete old and create new
    deleteReportLocal(id);
    const reports = getAllReports();
    reports.push(updatedReport);
    if (typeof window !== 'undefined') {
      localStorage.setItem('civicvoice_reports', JSON.stringify(reports));
    }
    
    return { report: updatedReport };
  },

  delete: async (id: string) => {
    const success = deleteReportLocal(id);
    return { success };
  },

  updateStatus: async (id: string, status: string) => {
    const report = updateReportStatus(id, status as ReportStatus);
    if (!report) {
      throw new Error('Report not found');
    }
    return { report };
  },
};

// Comments APIs - Using localStorage
export const commentsAPI = {
  getByReport: async (reportId: string) => {
    const comments = getCommentsLocal(reportId);
    return { comments };
  },

  create: async (reportId: string, content: string) => {
    const user = getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const comment = addCommentLocal({
      reportId,
      userId: user.id,
      username: user.username,
      content,
    });
    
    return { comment };
  },

  upvote: async (id: string) => {
    const user = getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    const comment = upvoteCommentLocal(id, user.id);
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    return { comment };
  },
};

// Notifications APIs - Using localStorage
export const notificationsAPI = {
  getAll: async () => {
    const user = getUser();
    if (!user) {
      return { notifications: [] };
    }
    
    const notifications = getNotificationsLocal(user.id);
    return { notifications };
  },

  markAsRead: async (id: string) => {
    markNotificationAsReadLocal(id);
    return { success: true };
  },

  markAllAsRead: async () => {
    const user = getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    markAllNotificationsAsReadLocal(user.id);
    return { success: true };
  },
};

// Stats APIs - Using localStorage
export const statsAPI = {
  get: async () => {
    const stats = getStatsLocal();
    return stats;
  },
};
