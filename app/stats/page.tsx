"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Stats, ReportCategory } from "@/types";
import { 
  getAllReports as getAllReportsAPI,
  getReportsByUser as getReportsByUserAPI,
} from "@/lib/api-data-store";
import { getUser, isAdmin } from "@/lib/auth";
import { getCurrentUser } from "@/lib/data-store";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Calendar,
  Download,
  RefreshCw 
} from "lucide-react";
import { getCategoryColor } from "@/lib/utils";
import { BackgroundOverlay } from "@/components/background-overlay";
import { exportStatsToPDF } from "@/lib/pdf-export";
import { AreaHeatMap } from "@/components/area-heat-map";

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    totalReports: 0,
    resolved: 0,
    processing: 0,
    avgResponseTime: 0,
    byCategory: { roads: 0, safety: 0, environment: 0, garbage: 0 },
  });
  const [animatedStats, setAnimatedStats] = useState(stats);
  const [dateRange, setDateRange] = useState<"6m" | "1y" | "all">("6m");
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryTrends, setCategoryTrends] = useState<any[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<any>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [userReports, setUserReports] = useState<any[]>([]);

  // Helper functions to calculate trends from filtered reports
  const getMonthlyTrendsFromReports = (reports: any[]) => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const monthlyData: Record<string, { reported: number; resolved: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[monthKey] = { reported: 0, resolved: 0 };
    }
    
    reports.forEach((report) => {
      const reportDate = new Date(report.createdAt);
      if (reportDate >= sixMonthsAgo) {
        const monthKey = `${monthNames[reportDate.getMonth()]} ${reportDate.getFullYear()}`;
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
  };

  const getCategoryTrendsFromReports = (reports: any[]) => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const trends: Record<string, Record<string, number>> = {};
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      trends[monthKey] = { roads: 0, safety: 0, environment: 0, garbage: 0 };
    }
    
    reports.forEach((report) => {
      const reportDate = new Date(report.createdAt);
      if (reportDate >= sixMonthsAgo) {
        const monthKey = `${monthNames[reportDate.getMonth()]} ${reportDate.getFullYear()}`;
        if (trends[monthKey] && report.category in trends[monthKey]) {
          trends[monthKey][report.category as keyof typeof trends[string]]++;
        }
      }
    });
    
    return Object.entries(trends).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  const getStatusByCategoryFromReports = (reports: any[]) => {
    const breakdown: Record<string, Record<string, number>> = {
      roads: { reported: 0, processing: 0, action_taken: 0, resolved: 0 },
      safety: { reported: 0, processing: 0, action_taken: 0, resolved: 0 },
      environment: { reported: 0, processing: 0, action_taken: 0, resolved: 0 },
      garbage: { reported: 0, processing: 0, action_taken: 0, resolved: 0 },
    };
    
    reports.forEach((report) => {
      if (report.category in breakdown) {
        const status = report.status === "reported" ? "reported" : 
                      report.status === "processing" ? "processing" :
                      report.status === "action_taken" ? "action_taken" : "resolved";
        breakdown[report.category][status]++;
      }
    });
    
    return breakdown;
  };

  useEffect(() => {
    const updateStats = async () => {
      try {
        // Get current user and filter reports
        const currentUser = getCurrentUser();
        const authUser = getUser();
        const username = currentUser?.username || authUser?.username || "Guest";
        let userId = currentUser?.id || authUser?.id || "sample_user";
        
        // Ensure demo user uses correct ID
        if (username === "demo" || username === "demo_user") {
          userId = "demo_user";
        }
        
        // Admin sees all reports, regular users see only their own
        const isAdminUser = isAdmin() && username !== "demo" && username !== "demo_user";
        const filteredReports = isAdminUser ? await getAllReportsAPI() : await getReportsByUserAPI(userId);
        
        // Store reports for date range filtering
        setUserReports(filteredReports);
        
        // Calculate stats from filtered reports only
        const totalReports = filteredReports.length;
        const resolved = filteredReports.filter((r) => r.status === "resolved").length;
        const processing = filteredReports.filter((r) => r.status === "processing" || r.status === "action_taken").length;
        
        // Calculate average response time
        const resolvedReports = filteredReports.filter((r) => r.status === "resolved");
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
          roads: filteredReports.filter((r) => r.category === "roads").length,
          safety: filteredReports.filter((r) => r.category === "safety").length,
          environment: filteredReports.filter((r) => r.category === "environment").length,
          garbage: filteredReports.filter((r) => r.category === "garbage").length,
        };
        
        const currentStats = {
          totalReports,
          resolved,
          processing,
          avgResponseTime: Math.round(avgResponseTime * 10) / 10,
          byCategory,
        };
        
        setStats(currentStats);
      
        // Calculate trends from filtered reports
        const trends = getMonthlyTrendsFromReports(filteredReports);
        setMonthlyData(trends);
        
        const catTrends = getCategoryTrendsFromReports(filteredReports);
        setCategoryTrends(catTrends);
        
        const breakdown = getStatusByCategoryFromReports(filteredReports);
        setStatusBreakdown(breakdown);

        // Clear any existing animation timer
        if (animationTimerRef.current) {
          clearInterval(animationTimerRef.current);
          animationTimerRef.current = null;
        }

        // Animate count-up effect
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        let currentStep = 0;
        animationTimerRef.current = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;

          setAnimatedStats({
            totalReports: Math.floor(currentStats.totalReports * progress),
            resolved: Math.floor(currentStats.resolved * progress),
            processing: Math.floor(currentStats.processing * progress),
            avgResponseTime: Number((currentStats.avgResponseTime * progress).toFixed(1)),
            byCategory: {
              roads: Math.floor(currentStats.byCategory.roads * progress),
              safety: Math.floor(currentStats.byCategory.safety * progress),
              environment: Math.floor(currentStats.byCategory.environment * progress),
              garbage: Math.floor(currentStats.byCategory.garbage * progress),
            },
          });

          if (currentStep >= steps) {
            if (animationTimerRef.current) {
              clearInterval(animationTimerRef.current);
              animationTimerRef.current = null;
            }
            setAnimatedStats(currentStats);
          }
        }, interval);
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    };

    // Initial load
    updateStats();
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(updateStats, 30000);

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    // Filter data based on date range using userReports state
    if (userReports.length === 0) return;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case "6m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case "1y":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredReports = userReports.filter((r) => {
      const reportDate = new Date(r.createdAt);
      return reportDate >= startDate;
    });

    const trends = getMonthlyTrendsFromReports(filteredReports);
    setMonthlyData(trends);

    const catTrends = getCategoryTrendsFromReports(filteredReports);
    setCategoryTrends(catTrends);
  }, [dateRange, userReports]);

  const categoryData = [
    { name: "Roads", value: animatedStats.byCategory.roads, color: getCategoryColor("roads") },
    { name: "Safety", value: animatedStats.byCategory.safety, color: getCategoryColor("safety") },
    { name: "Environment", value: animatedStats.byCategory.environment, color: getCategoryColor("environment") },
    { name: "Garbage", value: animatedStats.byCategory.garbage, color: getCategoryColor("garbage") },
  ].filter((item) => item.value > 0); // Filter out zero values

  const resolutionRate = animatedStats.totalReports > 0
    ? Math.round((animatedStats.resolved / animatedStats.totalReports) * 100)
    : 0;

  const handleExport = async () => {
    const currentUser = getCurrentUser();
    const authUser = getUser();
    const username = currentUser?.username || authUser?.username || "Guest";
    const adminUser = isAdmin() && username !== "demo" && username !== "demo_user";
    
    await exportStatsToPDF(
      animatedStats,
      monthlyData,
      categoryData,
      statusData,
      userReports,
      adminUser
    );
  };

  const getStatusBreakdownData = () => {
    if (!statusBreakdown) return [];
    
    return Object.entries(statusBreakdown).map(([category, statusData]: [string, any]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      reported: statusData.reported || 0,
      processing: statusData.processing || 0,
      action_taken: statusData.action_taken || 0,
      resolved: statusData.resolved || 0,
    }));
  };

  const statusData = getStatusBreakdownData();

  return (
    <BackgroundOverlay>
      <div ref={chartRef}>
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Public Dashboard</h1>
              <p className="text-gray-600 text-lg">Overall statistics and analytics</p>
            </div>
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as "6m" | "1y" | "all")}
                className="px-4 py-2 glass rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={handleExport}
                className="px-4 py-2 glass rounded-lg hover:bg-white/60 transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Export
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 glass rounded-lg hover:bg-white/60 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </motion.div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <FileText className="text-[#2F5D62]" size={32} />
                <TrendingUp className="text-green-500" size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">{animatedStats.totalReports}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="text-green-500" size={32} />
                <span className="text-2xl font-bold text-green-500">{resolutionRate}%</span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Resolved</p>
              <p className="text-3xl font-bold text-gray-900">{animatedStats.resolved}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-yellow-500" size={32} />
              </div>
              <p className="text-gray-600 text-sm mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{animatedStats.processing}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-blue-500" size={32} />
              </div>
              <p className="text-gray-600 text-sm mb-1">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900">{animatedStats.avgResponseTime} days</p>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Area-wise Heat Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1 flex"
            >
              <AreaHeatMap reports={userReports} />
            </motion.div>

            {/* Category Distribution - Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 glass rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports by Category</h2>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    labelLine={true}
                    label={(props: any) => {
                      const { cx, cy, midAngle, innerRadius, outerRadius, name, percent, value } = props;
                      
                      // Only show label if percentage is significant (>= 5%)
                      if (percent < 0.05) return null;
                      
                      const RADIAN = Math.PI / 180;
                      // Position label outside the pie
                      const radius = outerRadius + 30;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="#1f2937" 
                          textAnchor={x > cx ? "start" : "end"} 
                          dominantBaseline="central"
                          fontSize={14}
                          fontWeight="600"
                          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
                        >
                          {`${name}: ${(percent * 100).toFixed(0)}% (${value})`}
                        </text>
                      );
                    }}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string, props: any) => {
                      const total = categoryData.reduce((sum, item) => sum + item.value, 0);
                      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                      return [`${value} (${percent}%)`, props.payload.name];
                    }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry: any) => {
                      const total = categoryData.reduce((sum, item) => sum + item.value, 0);
                      const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
                      return `${value}: ${entry.payload.value} (${percent}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Category Trends - Area Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Trends Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={categoryTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="roads" 
                    stackId="1" 
                    stroke={getCategoryColor("roads")} 
                    fill={getCategoryColor("roads")} 
                    name="Roads"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="safety" 
                    stackId="1" 
                    stroke={getCategoryColor("safety")} 
                    fill={getCategoryColor("safety")} 
                    name="Safety"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="environment" 
                    stackId="1" 
                    stroke={getCategoryColor("environment")} 
                    fill={getCategoryColor("environment")} 
                    name="Environment"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="garbage" 
                    stackId="1" 
                    stroke={getCategoryColor("garbage")} 
                    fill={getCategoryColor("garbage")} 
                    name="Garbage"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Status Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Status Breakdown by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reported" stackId="a" fill="#f59e0b" name="Reported" />
                  <Bar dataKey="processing" stackId="a" fill="#eab308" name="Processing" />
                  <Bar dataKey="action_taken" stackId="a" fill="#3b82f6" name="Action Taken" />
                  <Bar dataKey="resolved" stackId="a" fill="#10b981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Category Breakdown Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {categoryData.map((cat) => (
                <div key={cat.name} className="text-center">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.value}
                  </div>
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-sm text-gray-600">
                    {animatedStats.totalReports > 0
                      ? `${Math.round((cat.value / animatedStats.totalReports) * 100)}% of total`
                      : "0%"}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
      </div>
    </BackgroundOverlay>
  );
}