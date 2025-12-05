import { ReportCategory, ReportStatus } from "@/types";

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status: ReportStatus): string => {
  const colors = {
    reported: "bg-orange-500",
    processing: "bg-yellow-500",
    action_taken: "bg-blue-500",
    resolved: "bg-green-500",
  };
  return colors[status];
};

export const getStatusLabel = (status: ReportStatus): string => {
  const labels = {
    reported: "Reported",
    processing: "In Review",
    action_taken: "Action Taken",
    resolved: "Resolved",
  };
  return labels[status];
};

export const getCategoryColor = (category: ReportCategory): string => {
  const colors = {
    roads: "#8B4513",
    safety: "#DC2626",
    environment: "#10B981",
    garbage: "#9333EA",
  };
  return colors[category];
};

export const getCategoryIcon = (category: ReportCategory): string => {
  const icons = {
    roads: "Road",
    safety: "AlertTriangle",
    environment: "Leaf",
    garbage: "Trash2",
  };
  return icons[category];
};

