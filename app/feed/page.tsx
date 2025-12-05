"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getAllReports } from "@/lib/data-store";
import { Report, ReportCategory } from "@/types";
import { formatDate, getCategoryColor } from "@/lib/utils";
import { Filter, TrendingUp, Clock, CheckCircle2, ThumbsUp, MessageSquare, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BackgroundOverlay } from "@/components/background-overlay";

export default function FeedPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<"recent" | "top" | "active">("recent");
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | "all">("all");

  useEffect(() => {
    const loadReports = () => {
      const allReports = getAllReports();
      setReports(allReports);
    };

    loadReports();
    const interval = setInterval(loadReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const getFilteredReports = () => {
    let filtered = [...reports];

    if (selectedCategory !== "all") {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }

    switch (filter) {
      case "recent":
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "top":
        return filtered.filter((r) => r.status === "resolved").sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      case "active":
        return filtered.filter((r) => r.status !== "resolved").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return filtered;
    }
  };

  const filteredReports = getFilteredReports();

  return (
    <BackgroundOverlay>
      <Navbar />
        <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Feed</h1>
            <p className="text-gray-600 text-lg">Stay updated with recent reports and resolved cases</p>
          </motion.div>

          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 glass rounded-xl p-4"
          >
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2">
                {[
                  { key: "recent", label: "Recent Reports" },
                  { key: "top", label: "Top Resolved" },
                  { key: "active", label: "Active Issues" },
                ].map((f) => (
                  <motion.button
                    key={f.key}
                    onClick={() => setFilter(f.key as "recent" | "top" | "active")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      filter === f.key
                        ? "gradient-primary text-white shadow-lg"
                        : "bg-white/70 text-gray-700 hover:bg-white/90"
                    }`}
                  >
                    {f.label}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-2 items-center">
                <Filter size={18} className="text-gray-600" />
                {["all", "roads", "safety", "environment", "garbage"].map((cat) => (
                  <motion.button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as ReportCategory | "all")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? "gradient-primary text-white shadow-lg"
                        : "bg-white/70 text-gray-700 hover:bg-white/90"
                    }`}
                  >
                    {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Feed */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <p className="text-gray-500">No reports found</p>
              </div>
            ) : (
              filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="glass rounded-2xl p-6 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    {report.imageUrl && (
                      <motion.div 
                        className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 group-hover:rounded-2xl transition-all"
                        whileHover={{ scale: 1.1 }}
                      >
                        <img
                          src={report.imageUrl}
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{report.title}</h3>
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.1 }}
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            report.status === "resolved"
                              ? "bg-green-100 text-green-800"
                              : report.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : report.status === "action_taken"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {report.status}
                        </motion.span>
                      </div>
                      <p className="text-gray-600 mb-3">{report.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                          className="px-3 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: `${getCategoryColor(report.category)}20`,
                            color: getCategoryColor(report.category),
                          }}
                        >
                          {report.category}
                        </motion.span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDate(report.createdAt)}
                        </span>
                        {report.location?.address && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-teal-600" />
                            {report.location?.address}
                          </span>
                        )}
                        {report.area && !report.location?.address && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-teal-600" />
                            {report.area}
                          </span>
                        )}
                      </div>
                      <motion.div 
                        className="flex items-center gap-4"
                        whileHover={{ x: 5 }}
                      >
                        <Link
                          href={`/map`}
                          className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                        >
                          <MapPin size={16} className="group-hover:animate-pulse" />
                          View on Map
                          <ArrowRight size={14} className="inline group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </BackgroundOverlay>
  );
}
