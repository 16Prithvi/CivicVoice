"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Wrench, AlertCircle } from "lucide-react";
import { ReportStatus } from "@/types";
import { getStatusLabel } from "@/lib/utils";

interface StatusChainProps {
  status: ReportStatus;
  showLabels?: boolean;
}

const statusSteps: ReportStatus[] = ["reported", "processing", "action_taken", "resolved"];

const statusIcons = {
  reported: AlertCircle,
  processing: Clock,
  action_taken: Wrench,
  resolved: CheckCircle2,
};

const statusColors = {
  reported: "#f97316", // orange-500
  processing: "#eab308", // yellow-500
  action_taken: "#3b82f6", // blue-500
  resolved: "#10b981", // green-500
};

export function StatusChain({ status, showLabels = true }: StatusChainProps) {
  const currentIndex = statusSteps.indexOf(status);

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 py-4">
      {statusSteps.map((step, index) => {
        const Icon = statusIcons[step];
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? [1, 1.2, 1] : 1,
                  backgroundColor: isCompleted ? statusColors[step] : "#e5e7eb",
                }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white"
                style={{
                  backgroundColor: isCompleted ? statusColors[step] : "#e5e7eb",
                }}
              >
                <Icon size={isCurrent ? 24 : 20} />
              </motion.div>
              {showLabels && (
                <span className="mt-2 text-xs md:text-sm font-medium text-gray-700">
                  {getStatusLabel(step)}
                </span>
              )}
            </div>
            {index < statusSteps.length - 1 && (
              <div
                className="w-8 md:w-16 h-0.5 mx-1 md:mx-2"
                style={{
                  backgroundColor: index < currentIndex ? statusColors[statusSteps[index + 1]] : "#e5e7eb",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

