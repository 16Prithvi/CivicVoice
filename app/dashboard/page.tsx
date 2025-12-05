"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ReportCardEnhanced } from "@/components/report-card-enhanced";
import { SearchBar } from "@/components/search-bar";
import { getUser, isAuthenticated, isAdmin } from "@/lib/auth";
import { getReportsByUser as getReportsByUserAPI, getAllReports as getAllReportsAPI } from "@/lib/api-data-store";
import { getReportsByUser, getCurrentUser } from "@/lib/data-store";
import { Report, ReportCategory } from "@/types";
import { Plus, FileText, CheckCircle2, Clock, Filter, X } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BackgroundOverlay } from "@/components/background-overlay";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "resolved">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Allow access without strict authentication for frontend-only mode
    const loadReports = async () => {
      const currentUser = getCurrentUser();
      const authUser = getUser();
      const username = currentUser?.username || authUser?.username || "Guest";
      let userId = currentUser?.id || authUser?.id || "sample_user";

      // Ensure demo user uses correct ID and is never treated as admin
      if (username === "demo" || username === "demo_user") {
        userId = "demo_user";
      }

      setUser({ username });

      // Admin sees all reports (but exclude demo user from being admin)
      // Regular users (including demo) see only their own reports
      const isAdminUser = isAdmin() && username !== "demo" && username !== "demo_user";
      const reports = isAdminUser ? await getAllReportsAPI() : await getReportsByUserAPI(userId);

      console.log(`Dashboard - User: ${username}, UserID: ${userId}, Reports: ${reports.length}`, reports);

      setAllReports(reports);
      setFilteredReports(reports);
    };

    // Load immediately on mount
    loadReports();

    // Refresh every 2 seconds to catch new reports quickly
    const interval = setInterval(() => {
      loadReports();
    }, 2000);

    return () => clearInterval(interval);
  }, [router]);

  const applyFilters = (
    reports: Report[],
    query: string,
    category: ReportCategory | "all",
    tab: "active" | "resolved"
  ) => {
    let filtered = reports;

    // Filter by tab
    if (tab === "active") {
      filtered = filtered.filter((r) => r.status !== "resolved");
    } else {
      filtered = filtered.filter((r) => r.status === "resolved");
    }

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter((r) => r.category === category);
    }

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerQuery) ||
          r.description.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredReports(filtered);
  };

  useEffect(() => {
    applyFilters(allReports, searchQuery, selectedCategory, activeTab);
  }, [searchQuery, selectedCategory, activeTab, allReports]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const activeReports = allReports.filter((r) => r.status !== "resolved");
  const resolvedReports = allReports.filter((r) => r.status === "resolved");

  const stats = {
    total: allReports.length,
    active: activeReports.length,
    resolved: resolvedReports.length,
    inProgress: allReports.filter((r) => r.status === "processing" || r.status === "action_taken").length,
  };

  const chartData = [
    { month: "Jan", reports: 4 },
    { month: "Feb", reports: 6 },
    { month: "Mar", reports: 3 },
    { month: "Apr", reports: 5 },
    { month: "May", reports: 8 },
    { month: "Jun", reports: 2 },
  ];

  const categories: { id: ReportCategory | "all"; name: string }[] = [
    { id: "all", name: "All" },
    { id: "roads", name: "Roads" },
    { id: "safety", name: "Safety" },
    { id: "environment", name: "Environment" },
    { id: "garbage", name: "Garbage" },
  ];

  if (!user) {
    return null;
  }

  return (
    <BackgroundOverlay>
      <Navbar />
      <div className="pt-28 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="text-gradient">{user.username}</span>! 👋
            </h1>
            <p className="text-gray-600 text-xl">Here's your city snapshot</p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Reports", value: stats.total, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-100", glowColor: "rgba(79, 70, 229, 0.3)" },
              { label: "Active", value: stats.active, icon: Clock, color: "text-rose-600", bg: "bg-rose-100", glowColor: "rgba(225, 29, 72, 0.3)" },
              { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-amber-600", bg: "bg-amber-100", glowColor: "rgba(217, 119, 6, 0.3)" },
              { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", glowColor: "rgba(5, 150, 105, 0.3)" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    boxShadow: `0 10px 30px ${stat.glowColor}`,
                  }}
                  className="card-gradient rounded-2xl p-6 cursor-pointer transition-all duration-300 border border-white/50 hover:border-white/80"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1 font-medium">{stat.label}</p>
                      <motion.p
                        className={`text-4xl font-bold ${stat.color}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 300 }}
                      >
                        {stat.value}
                      </motion.p>
                    </div>
                    <motion.div
                      className={`w-14 h-14 ${stat.bg} rounded-xl flex items-center justify-center relative overflow-hidden`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          delay: index * 0.2
                        }}
                        className="absolute inset-0 bg-white/20 rounded-xl"
                      />
                      <Icon className={`${stat.color} relative z-10`} size={28} />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <Link
              href="/report"
              className="inline-flex items-center gap-2 px-6 py-3 gradient-accent text-gray-900 font-bold rounded-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <Plus size={22} />
              Report New Issue
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 glass-strong rounded-xl hover:bg-white/80 transition-all"
              >
                <Filter size={18} />
                <span className="font-medium">Filters</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-strong rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Filter Reports</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setShowFilters(false);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${selectedCategory === cat.id
                        ? "gradient-primary text-white shadow-lg"
                        : "glass text-gray-700 hover:bg-white/70"
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar onSearch={handleSearch} placeholder="Search by title or description..." />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "active"
                  ? "gradient-primary text-white shadow-lg"
                  : "glass text-gray-700 hover:bg-white/70"
                }`}
            >
              Active Reports ({activeReports.length})
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "resolved"
                  ? "gradient-primary text-white shadow-lg"
                  : "glass text-gray-700 hover:bg-white/70"
                }`}
            >
              Resolved ({resolvedReports.length})
            </button>
          </div>

          {/* Reports Grid */}
          {filteredReports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 glass-strong rounded-2xl"
            >
              <FileText className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your filters"
                  : "Start by reporting your first issue"}
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <Link
                  href="/report"
                  className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  <Plus size={20} />
                  Report New Issue
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ReportCardEnhanced report={report} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Activity Chart */}
          {allReports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-gradient rounded-2xl p-8 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Monthly Activity</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar dataKey="reports" fill="url(#gradientBar)" radius={[8, 8, 0, 0]}>
                    <defs>
                      <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0f766e" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </BackgroundOverlay>
  );
}
