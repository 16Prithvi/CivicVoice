"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Report, ReportCategory } from "@/types";
import { getAllReports as getAllReportsAPI } from "@/lib/api-data-store";
import { getAllReports } from "@/lib/data-store";
import { getCategoryColor } from "@/lib/utils";
import { isAdmin } from "@/lib/auth";
import { Filter, X } from "lucide-react";
import { BackgroundOverlay } from "@/components/background-overlay";

const CommunityMapEnhanced = dynamic(() => import("@/components/community-map-enhanced"), { ssr: false });

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Load all reports from local storage
    const loadReports = async () => {
      const allReports = await getAllReportsAPI();
      setReports(allReports);
    };

    loadReports();

    // Set up interval to refresh reports periodically (every 5 seconds)
    const interval = setInterval(() => {
      loadReports();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredReports =
    selectedCategory === "all"
      ? reports
      : reports.filter((r) => r.category === selectedCategory);

  const categories: { id: ReportCategory | "all"; name: string }[] = [
    { id: "all", name: "All" },
    { id: "roads", name: "Roads" },
    { id: "safety", name: "Safety" },
    { id: "environment", name: "Environment" },
    { id: "garbage", name: "Garbage" },
  ];

  const adminUser = isAdmin();

  return (
    <BackgroundOverlay>
      <Navbar />
      <div className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Map</h1>
            <p className="text-gray-600">View all reported issues in your area</p>
          </motion.div>

          {/* Filters */}
          <div className="mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/60 transition-colors"
            >
              <Filter size={20} />
              <span>Filter by Category</span>
            </button>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 glass rounded-lg p-4"
              >
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setShowFilters(false);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedCategory === cat.id
                          ? "bg-[#2F5D62] text-white"
                          : "bg-white/50 text-gray-700 hover:bg-white/70"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Map */}
          <div className="glass rounded-xl overflow-hidden shadow-xl" style={{ height: "700px" }}>
            <CommunityMapEnhanced reports={filteredReports} isAdmin={adminUser} />
          </div>

          {/* Legend */}
          <div className="mt-6 glass rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCategoryColor("roads") }}
                />
                <span className="text-sm text-gray-700">Roads</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCategoryColor("safety") }}
                />
                <span className="text-sm text-gray-700">Safety</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCategoryColor("environment") }}
                />
                <span className="text-sm text-gray-700">Environment</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCategoryColor("garbage") }}
                />
                <span className="text-sm text-gray-700">Garbage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </BackgroundOverlay>
  );
}

