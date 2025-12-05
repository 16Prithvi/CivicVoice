"use client";

import { motion } from "framer-motion";
import { Report } from "@/types";
import { formatDate, getCategoryColor } from "@/lib/utils";
import { StatusChain } from "./status-chain";
import { MapPin, Calendar } from "lucide-react";
import Image from "next/image";

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
}

export function ReportCard({ report, onClick }: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass rounded-xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
        </div>
        {report.urgent && (
          <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">URGENT</span>
        )}
      </div>

      {report.imageUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-200">
          <Image
            src={report.imageUrl}
            alt={report.title}
            fill
            className="object-cover"
            unoptimized
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <MapPin size={16} />
          <span className="capitalize">{report.category}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={16} />
          <span>{formatDate(report.createdAt)}</span>
        </div>
      </div>

      <div className="border-t pt-4">
        <StatusChain status={report.status} showLabels={false} />
      </div>
    </motion.div>
  );
}

