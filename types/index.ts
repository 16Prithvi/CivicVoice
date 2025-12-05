export interface User {
  id: string;
  username: string;
  email: string;
  role?: "USER" | "ADMIN";
  adminPost?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  subcategory?: string;
  area?: string;
  status: ReportStatus;
  imageUrl?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  userId: string;
  createdAt: string;
  updatedAt: string;
  urgent?: boolean;
}

export type ReportCategory = "roads" | "safety" | "environment" | "garbage";

export type ReportStatus = "reported" | "processing" | "action_taken" | "resolved";

export interface CategoryInfo {
  id: ReportCategory;
  name: string;
  icon: string;
  color: string;
  subcategories?: string[];
}

export interface Stats {
  totalReports: number;
  resolved: number;
  processing: number;
  avgResponseTime: number;
  byCategory: Record<ReportCategory, number>;
}

export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  upvotes: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: "report_resolved" | "nearby_issue" | "status_update" | "comment";
  title: string;
  message: string;
  reportId?: string;
  read: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  category: ReportCategory[];
}

export interface ReportHistory {
  status: ReportStatus;
  departmentId?: string;
  departmentName?: string;
  timestamp: string;
  notes?: string;
}

export interface UserProfile {
  userId: string;
  totalReports: number;
  resolvedReports: number;
  activeReports: number;
  badges: string[];
  impactStats: {
    issuesResolved: number;
    categoriesHelped: ReportCategory[];
    joinedDate: string;
  };
}

