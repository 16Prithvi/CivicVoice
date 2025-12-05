"use client";

import { motion } from "framer-motion";
import { Report } from "@/types";
import { formatDate, getCategoryColor } from "@/lib/utils";
import { StatusChain } from "./status-chain";
import { MapPin, Calendar, Clock, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ReportCardEnhancedProps {
  report: Report;
  onClick?: () => void;
}

const categoryGradients: Record<Report["category"], string> = {
  roads: "gradient-roads",
  safety: "gradient-safety",
  environment: "gradient-environment",
  garbage: "gradient-garbage",
};

export function ReportCardEnhanced({ report, onClick }: ReportCardEnhancedProps) {
  const gradient = categoryGradients[report.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -8, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="card-gradient rounded-2xl overflow-hidden cursor-pointer group hover-lift"
      onClick={onClick}
    >
      {/* Category Header */}
      <div className={`${gradient} h-2 w-full`} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
              {report.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{report.description}</p>
          </div>
          {report.urgent && (
            <motion.span
              animate={{ scale: [1, 1.15, 1], opacity: [1, 0.9, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="ml-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1 animate-pulse-ring"
            >
              <AlertCircle size={14} />
              URGENT
            </motion.span>
          )}
        </div>

        {report.imageUrl && (
          <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 bg-gray-200 group-hover:rounded-2xl transition-all">
            <Image
              src={report.imageUrl}
              alt={report.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin size={16} className="text-teal-600" />
            <span 
              className="px-2 py-1 rounded-full font-medium text-xs"
              style={{
                backgroundColor: `${getCategoryColor(report.category)}20`,
                color: getCategoryColor(report.category),
              }}
            >
              {report.category}
            </span>
          </div>
          {report.area && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">{report.area}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{formatDate(report.createdAt)}</span>
          </div>
        </div>

        <div className="border-t pt-4 mb-4">
          <StatusChain status={report.status} showLabels={true} />
        </div>

        <Link
          href={`/map?reportId=${report.id}`}
          className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-medium group"
        >
          View on Map
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="ml-1"
          >
            &rarr;
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
}
