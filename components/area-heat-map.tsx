"use client";

import { useMemo } from "react";
import { Report, ReportCategory } from "@/types";
import { MapPin, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AreaHeatMapProps {
  reports: Report[];
}

const HUBLI_AREAS = [
  "Keshwapur",
  "Vidyanagar",
  "Deshpande Nagar",
  "Unkal",
  "Gokul Road",
  "Old Hubli",
  "Navanagar",
  "Bengeri",
  "Ashok Nagar",
  "Hosur",
];

// Category colors as specified
const CATEGORY_COLORS: Record<ReportCategory, string> = {
  roads: "#b45309",      // 🟤 Brown/Orange
  safety: "#dc2626",     // 🔴 Red
  environment: "#059669", // 🟢 Green
  garbage: "#9333ea",    // 🟣 Purple
};

const CATEGORY_NAMES: Record<ReportCategory, string> = {
  roads: "Roads",
  safety: "Safety",
  environment: "Environment",
  garbage: "Garbage",
};

export function AreaHeatMap({ reports }: AreaHeatMapProps) {
  const router = useRouter();

  // Group reports by area and category
  const chartData = useMemo(() => {
    const areaStats: Record<string, {
      total: number;
      roads: number;
      safety: number;
      environment: number;
      garbage: number;
      reports: Report[];
    }> = {};

    // Initialize all areas with 0
    HUBLI_AREAS.forEach((area) => {
      areaStats[area] = {
        total: 0,
        roads: 0,
        safety: 0,
        environment: 0,
        garbage: 0,
        reports: [],
      };
    });

    // Count reports by area and category
    reports.forEach((report) => {
      const area = report.area || report.location?.address || "Unknown";
      const category = report.category;
      
      if (areaStats[area]) {
        areaStats[area].total++;
        areaStats[area][category]++;
        areaStats[area].reports.push(report);
      } else {
        // Handle "Other" areas
        if (!areaStats["Other"]) {
          areaStats["Other"] = {
            total: 0,
            roads: 0,
            safety: 0,
            environment: 0,
            garbage: 0,
            reports: [],
          };
        }
        areaStats["Other"].total++;
        areaStats["Other"][category]++;
        areaStats["Other"].reports.push(report);
      }
    });

    // Convert to chart data format and sort by total (descending)
    return Object.entries(areaStats)
      .filter(([_, stats]) => stats.total > 0)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([area, stats]) => ({
        area,
        total: stats.total,
        roads: stats.roads,
        safety: stats.safety,
        environment: stats.environment,
        garbage: stats.garbage,
        reports: stats.reports,
      }));
  }, [reports]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const categories = [
        { name: "Roads", value: data.roads, color: CATEGORY_COLORS.roads },
        { name: "Safety", value: data.safety, color: CATEGORY_COLORS.safety },
        { name: "Environment", value: data.environment, color: CATEGORY_COLORS.environment },
        { name: "Garbage", value: data.garbage, color: CATEGORY_COLORS.garbage },
      ].filter(cat => cat.value > 0);

      return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="font-semibold text-gray-900 mb-2">{data.area}</div>
          <div className="text-sm text-gray-600 mb-2">Total: {data.total} reports</div>
          <div className="space-y-1">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-gray-700">
                  {cat.name}: {cat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle bar click - navigate to feed with area filter
  const handleBarClick = (data: any) => {
    if (data && data.area) {
      router.push(`/feed?area=${encodeURIComponent(data.area)}`);
    }
  };

  return (
    <div className="glass rounded-xl p-6 shadow-lg h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MapPin className="text-teal-600" size={20} />
          <h2 className="text-2xl font-bold text-gray-900">Area-wise Report Distribution</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp size={16} />
          <span className="font-semibold">Total: {reports.length} reports</span>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="mb-4" style={{ height: "350px" }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 100, bottom: 5 }}
              onClick={(data) => {
                if (data && data.activePayload && data.activePayload[0]) {
                  handleBarClick(data.activePayload[0].payload);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="area"
                width={90}
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="roads"
                stackId="a"
                fill={CATEGORY_COLORS.roads}
                style={{ cursor: "pointer" }}
              />
              <Bar
                dataKey="safety"
                stackId="a"
                fill={CATEGORY_COLORS.safety}
                style={{ cursor: "pointer" }}
              />
              <Bar
                dataKey="environment"
                stackId="a"
                fill={CATEGORY_COLORS.environment}
                style={{ cursor: "pointer" }}
              />
              <Bar
                dataKey="garbage"
                stackId="a"
                fill={CATEGORY_COLORS.garbage}
                style={{ cursor: "pointer" }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No reports available
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-sm">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-700 font-medium">{CATEGORY_NAMES[category as ReportCategory]}</span>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-gray-500 mt-3">
          Click on bars to filter by area
        </div>
      </div>
    </div>
  );
}

