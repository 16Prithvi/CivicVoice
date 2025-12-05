import { Report, ReportStatus, ReportCategory } from "@/types";

const STORAGE_KEY = "civicvoice_reports";
const USERS_KEY = "civicvoice_users";
const CURRENT_USER_KEY = "civicvoice_current_user";

// Initialize with sample data if storage is empty
export function initializeDataStore() {
  if (typeof window === "undefined") return;

  try {
    // Initialize demo user if no users exist
    const usersJson = localStorage.getItem(USERS_KEY);
    let shouldInitialize = false;
    
    if (!usersJson || usersJson === "null" || usersJson === "[]") {
      shouldInitialize = true;
    } else {
      try {
        const parsed = JSON.parse(usersJson);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          shouldInitialize = true;
        }
      } catch {
        // Invalid JSON, reinitialize
        shouldInitialize = true;
      }
    }
    
    if (shouldInitialize) {
      const demoUsers = [
        {
          id: "demo_user",
          username: "demo",
          email: "demo@example.com",
          password: "demo123",
          role: "citizen",
        },
        {
          id: "admin_user",
          username: "admin",
          email: "admin@example.com",
          password: "admin123",
          role: "admin",
        },
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
      console.log("Demo users initialized:", demoUsers.map(u => u.email));
    }
  } catch (error) {
    console.error("Error initializing data store:", error);
  }

  const existingReports = localStorage.getItem(STORAGE_KEY);
  if (!existingReports) {
    const sampleReports: Report[] = [
      {
        id: "1",
        title: "Pothole on Main Street",
        description: "Large pothole near the intersection causing traffic issues",
        category: "roads",
        status: "processing",
        location: { lat: 40.7128, lng: -74.006, address: "Main Street, NYC" },
        userId: "sample_user",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        urgent: false,
      },
      {
        id: "2",
        title: "Broken Streetlight",
        description: "Streetlight not working on Oak Avenue",
        category: "safety",
        status: "action_taken",
        location: { lat: 40.715, lng: -74.008, address: "Oak Avenue, NYC" },
        userId: "sample_user",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        urgent: true,
      },
      {
        id: "3",
        title: "Illegal Dumping Site",
        description: "Garbage illegally dumped in the park",
        category: "garbage",
        status: "resolved",
        location: { lat: 40.710, lng: -74.005, address: "Central Park, NYC" },
        userId: "sample_user",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        urgent: true,
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleReports));
  }
}

// Reports Management
export function getAllReports(): Report[] {
  if (typeof window === "undefined") return [];
  const reportsJson = localStorage.getItem(STORAGE_KEY);
  const reports = reportsJson ? JSON.parse(reportsJson) : [];
  
  // Ensure all reports have a location object (for backward compatibility with old reports)
  return reports.map((report: Report) => ({
    ...report,
    location: report.location || {
      lat: 0,
      lng: 0,
      address: report.area || undefined,
    },
  }));
}

export function getReportsByUser(userId: string): Report[] {
  const allReports = getAllReports();
  return allReports.filter((r) => r.userId === userId);
}

export function getReportById(id: string): Report | null {
  const allReports = getAllReports();
  return allReports.find((r) => r.id === id) || null;
}

export function createReport(report: Omit<Report, "id" | "createdAt" | "updatedAt">): Report {
  const allReports = getAllReports();
  const newReport: Report = {
    ...report,
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  allReports.push(newReport);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allReports));
  return newReport;
}

export function updateReportStatus(id: string, status: ReportStatus): Report | null {
  const allReports = getAllReports();
  const reportIndex = allReports.findIndex((r) => r.id === id);
  if (reportIndex === -1) return null;

  allReports[reportIndex] = {
    ...allReports[reportIndex],
    status,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allReports));
  return allReports[reportIndex];
}

export function deleteReport(id: string): boolean {
  const allReports = getAllReports();
  const filteredReports = allReports.filter((r) => r.id !== id);
  if (filteredReports.length === allReports.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredReports));
  return true;
}

// User Management
export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

export function setCurrentUser(user: { id: string; username: string; email: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Statistics
export function getStats() {
  const allReports = getAllReports();
  const totalReports = allReports.length;
  const resolved = allReports.filter((r) => r.status === "resolved").length;
  const processing = allReports.filter((r) => r.status === "processing" || r.status === "action_taken").length;

  // Calculate average response time (days from creation to resolution)
  const resolvedReports = allReports.filter((r) => r.status === "resolved");
  const avgResponseTime =
    resolvedReports.length > 0
      ? resolvedReports.reduce((sum, r) => {
          const created = new Date(r.createdAt).getTime();
          const updated = new Date(r.updatedAt).getTime();
          const days = (updated - created) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / resolvedReports.length
      : 0;

  const byCategory: Record<ReportCategory, number> = {
    roads: allReports.filter((r) => r.category === "roads").length,
    safety: allReports.filter((r) => r.category === "safety").length,
    environment: allReports.filter((r) => r.category === "environment").length,
    garbage: allReports.filter((r) => r.category === "garbage").length,
  };

  return {
    totalReports,
    resolved,
    processing,
    avgResponseTime: Math.round(avgResponseTime * 10) / 10,
    byCategory,
  };
}

// Get monthly trends from real data
export function getMonthlyTrends() {
  const allReports = getAllReports();
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  
  const monthlyData: Record<string, { reported: number; resolved: number }> = {};
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    monthlyData[key] = { reported: 0, resolved: 0 };
  }
  
  allReports.forEach((report) => {
    const reportDate = new Date(report.createdAt);
    if (reportDate >= sixMonthsAgo) {
      const monthKey = reportDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].reported++;
        if (report.status === "resolved") {
          monthlyData[monthKey].resolved++;
        }
      }
    }
  });
  
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    reported: data.reported,
    resolved: data.resolved,
  }));
}

// Get category trends over time
export function getCategoryTrends() {
  const allReports = getAllReports();
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  
  const categoryData: Record<string, Record<ReportCategory, number>> = {};
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    categoryData[key] = { roads: 0, safety: 0, environment: 0, garbage: 0 };
  }
  
  allReports.forEach((report) => {
    const reportDate = new Date(report.createdAt);
    if (reportDate >= sixMonthsAgo) {
      const monthKey = reportDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      if (categoryData[monthKey]) {
        categoryData[monthKey][report.category]++;
      }
    }
  });
  
  return Object.entries(categoryData).map(([month, data]) => ({
    month,
    ...data,
  }));
}

// Get status breakdown by category
export function getStatusByCategory() {
  const allReports = getAllReports();
  const breakdown: Record<ReportCategory, Record<ReportStatus, number>> = {
    roads: { reported: 0, processing: 0, action_taken: 0, resolved: 0 },
    safety: { reported: 0, processing: 0, action_taken: 0, resolved: 0 },
    environment: { reported: 0, processing: 0, action_taken: 0, resolved: 0 },
    garbage: { reported: 0, processing: 0, action_taken: 0, resolved: 0 },
  };
  
  allReports.forEach((report) => {
    breakdown[report.category][report.status]++;
  });
  
  return breakdown;
}

// Get reports filtered by date range
export function getReportsByDateRange(startDate: Date, endDate: Date) {
  const allReports = getAllReports();
  return allReports.filter((report) => {
    const reportDate = new Date(report.createdAt);
    return reportDate >= startDate && reportDate <= endDate;
  });
}

