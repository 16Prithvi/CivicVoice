"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { isAuthenticated, isAdmin as checkIsAdmin, getUser } from "@/lib/auth";
import { getAllReports as getAllReportsAPI, updateReportStatus as updateReportStatusAPI, getStats as getStatsAPI } from "@/lib/api-data-store";
import { getAllReports, updateReportStatus, getStats } from "@/lib/data-store";
import { Report, ReportStatus, ReportCategory } from "@/types";
import { StatusChain } from "@/components/status-chain";
import { formatDate, getCategoryColor } from "@/lib/utils";
import { showToastMessage } from "@/components/toast-provider";
import {
  CheckCircle2,
  X,
  Eye,
  Filter,
  TrendingUp,
  Clock,
  FileText,
  AlertCircle,
  BarChart3,
  Search
} from "lucide-react";
import Image from "next/image";
import { BackgroundOverlay } from "@/components/background-overlay";
import { AreaHeatMap } from "@/components/area-heat-map";

export default function AdminPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalReports: 0,
    resolved: 0,
    processing: 0,
    avgResponseTime: 0,
    byCategory: { roads: 0, safety: 0, environment: 0, garbage: 0 },
  });
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Allow access without strict authentication for frontend-only mode
    // Load all reports from local storage
    const loadData = async () => {
      const allReports = await getAllReportsAPI();
      const statsData = await getStatsAPI();
      setReports(allReports);
      setFilteredReports(allReports);
      setStats(statsData);
    };

    loadData();

    // Set up interval to refresh reports periodically
    const interval = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    let filtered = [...reports];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
      );
    }

    setFilteredReports(filtered);
  }, [reports, statusFilter, categoryFilter, searchQuery]);

  const updateStatus = async (reportId: string, newStatus: ReportStatus) => {
    setLoading(true);
    try {
      const updatedReport = await updateReportStatusAPI(reportId, newStatus);
      if (!updatedReport) {
        showToastMessage("Failed to update status", "error");
        return;
      }

      setReports(reports.map((r) => (r.id === reportId ? updatedReport : r)));
      if (selectedReport?.id === reportId) {
        setSelectedReport(updatedReport);
      }

      // Refresh stats
      const statsData = await getStatsAPI();
      setStats(statsData);

      showToastMessage(`Status updated to ${newStatus.replace("_", " ")}`, "success");
    } catch (error) {
      showToastMessage("Failed to update status", "error");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions: { value: ReportStatus; label: string }[] = [
    { value: "reported", label: "Reported" },
    { value: "processing", label: "In Review" },
    { value: "action_taken", label: "Action Taken" },
    { value: "resolved", label: "Resolved" },
  ];

  const categories: { id: ReportCategory | "all"; name: string }[] = [
    { id: "all", name: "All Categories" },
    { id: "roads", name: "Roads" },
    { id: "safety", name: "Safety" },
    { id: "environment", name: "Environment" },
    { id: "garbage", name: "Garbage" },
  ];

  const statusFilters: { id: ReportStatus | "all"; name: string }[] = [
    { id: "all", name: "All Status" },
    { id: "reported", name: "Reported" },
    { id: "processing", name: "In Review" },
    { id: "action_taken", name: "Action Taken" },
    { id: "resolved", name: "Resolved" },
  ];

  return (
    <BackgroundOverlay>
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Manage and update issue reports</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg">
                <AlertCircle size={20} />
                <span className="font-semibold">Admin Mode</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <FileText className="text-indigo-600" size={32} />
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="text-emerald-600" size={32} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Resolved</p>
              <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-amber-600" size={32} />
              </div>
              <p className="text-gray-600 text-sm mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats.processing}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="text-rose-600" size={32} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Resolution Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalReports > 0
                  ? Math.round((stats.resolved / stats.totalReports) * 100)
                  : 0}%
              </p>
            </motion.div>
          </div>

          {/* Area-wise Heat Map */}
          <div className="mb-8">
            <AreaHeatMap reports={reports} />
          </div>

          {/* Filters */}
          <div className="glass rounded-xl p-6 shadow-lg mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reports..."
                    className="w-full pl-10 pr-4 py-2 glass rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "all")}
                className="px-4 py-2 glass rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {statusFilters.map((filter) => (
                  <option key={filter.id} value={filter.id}>
                    {filter.name}
                  </option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ReportCategory | "all")}
                className="px-4 py-2 glass rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reports List */}
            <div className="lg:col-span-2 space-y-4 max-h-[800px] overflow-y-auto">
              {filteredReports.length === 0 ? (
                <div className="glass rounded-xl p-12 text-center">
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">No reports found</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`glass rounded-xl p-6 shadow-lg cursor-pointer transition-all ${selectedReport?.id === report.id ? "ring-2 ring-teal-500" : ""
                      }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                      </div>
                      {report.urgent && (
                        <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">
                          URGENT
                        </span>
                      )}
                    </div>

                    {report.imageUrl && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden mb-4">
                        <Image
                          src={report.imageUrl}
                          alt={report.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span
                          className="px-2 py-1 rounded capitalize"
                          style={{
                            backgroundColor: `${getCategoryColor(report.category)}20`,
                            color: getCategoryColor(report.category),
                          }}
                        >
                          {report.category}
                        </span>
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${report.status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : report.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : report.status === "action_taken"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Status Update Panel */}
            <div className="lg:col-span-1">
              {selectedReport ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-xl p-6 shadow-lg sticky top-24"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Update Status</h2>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedReport.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{selectedReport.description}</p>
                    <StatusChain status={selectedReport.status} />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 mb-2">Change Status To:</p>
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateStatus(selectedReport.id, option.value)}
                        disabled={loading || selectedReport.status === option.value}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedReport.status === option.value
                          ? "bg-teal-600 text-white"
                          : "bg-white/50 hover:bg-white/70 text-gray-700"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-xl p-12 text-center shadow-lg"
                >
                  <Eye className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">Select a report to update its status</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </BackgroundOverlay>
  );
}