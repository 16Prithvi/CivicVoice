"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { isAuthenticated, getUser } from "@/lib/auth";
import { getCurrentUser, getReportsByUser } from "@/lib/data-store";
import { Report, ReportCategory } from "@/types";
import { getCategoryColor } from "@/lib/utils";
import { 
  User, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Award, 
  TrendingUp,
  MapPin,
  Calendar
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    active: 0,
    byCategory: { roads: 0, safety: 0, environment: 0, garbage: 0 },
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const currentUser = getCurrentUser() || getUser();
    if (currentUser) {
      setUser(currentUser);
      const userReports = getReportsByUser(currentUser.id);
      setReports(userReports);

      setStats({
        total: userReports.length,
        resolved: userReports.filter((r) => r.status === "resolved").length,
        active: userReports.filter((r) => r.status !== "resolved").length,
        byCategory: {
          roads: userReports.filter((r) => r.category === "roads").length,
          safety: userReports.filter((r) => r.category === "safety").length,
          environment: userReports.filter((r) => r.category === "environment").length,
          garbage: userReports.filter((r) => r.category === "garbage").length,
        },
      });
    }
  }, [router]);

  if (!user) return null;

  const badges = [];
  if (stats.resolved >= 10) badges.push("City Champion");
  if (stats.total >= 5) badges.push("Active Citizen");
  if (stats.resolved >= 5) badges.push("Problem Solver");
  if (stats.total >= 20) badges.push("Community Hero");

  const categoryData = [
    { name: "Roads", value: stats.byCategory.roads, color: getCategoryColor("roads") },
    { name: "Safety", value: stats.byCategory.safety, color: getCategoryColor("safety") },
    { name: "Environment", value: stats.byCategory.environment, color: getCategoryColor("environment") },
    { name: "Garbage", value: stats.byCategory.garbage, color: getCategoryColor("garbage") },
  ].filter((cat) => cat.value > 0);

  const impactMessage = stats.resolved > 0
    ? `${stats.resolved} reports resolved – contributing to a cleaner city`
    : "Start reporting issues to make an impact!";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Profile</h1>
            <p className="text-gray-600 text-lg">Your civic engagement journey</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white text-3xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-gray-600">Total Reports</span>
                  <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-gray-600">Resolved</span>
                  <span className="text-2xl font-bold text-green-600">{stats.resolved}</span>
                </div>
                <div className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-gray-600">Active</span>
                  <span className="text-2xl font-bold text-orange-600">{stats.active}</span>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 glass rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Impact</h3>
              <p className="text-gray-600 mb-6">{impactMessage}</p>

              {categoryData.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Reports by Category</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-6 shadow-lg mb-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="text-yellow-500" />
                Your Badges
              </h3>
              <div className="flex flex-wrap gap-3">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold shadow-lg"
                  >
                    {badge}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Recent Reports</h3>
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="p-4 glass rounded-lg hover:bg-white/60 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{report.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span
                          className="px-2 py-1 rounded capitalize"
                          style={{
                            backgroundColor: `${getCategoryColor(report.category)}20`,
                            color: getCategoryColor(report.category),
                          }}
                        >
                          {report.category}
                        </span>
                        <span
                          className={`px-2 py-1 rounded ${
                            report.status === "resolved"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}








