"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, Copy, ExternalLink } from "lucide-react";
import { showToastMessage } from "./toast-provider";

interface HotlineContact {
  name: string;
  number: string;
  type: "phone" | "emergency";
}

const defaultHotlines: HotlineContact[] = [
  { name: "HDMC Control Room", number: "+91-836-222-0100", type: "phone" },
  { name: "Police", number: "100", type: "emergency" },
  { name: "Fire", number: "101", type: "emergency" },
  { name: "Ambulance", number: "108", type: "emergency" },
  { name: "Traffic Police", number: "+91-836-222-0200", type: "phone" },
  { name: "Water Supply Helpline", number: "+91-836-222-0300", type: "phone" },
];

interface HotlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HotlineModal({ isOpen, onClose }: HotlineModalProps) {
  const [hotlines] = useState<HotlineContact[]>(defaultHotlines);

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleCopy = (number: string, name: string) => {
    navigator.clipboard.writeText(number);
    showToastMessage(`${name} number copied!`, "success");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-strong rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Emergency Hotlines</h2>
                  <p className="text-gray-600">Quick access to local emergency services</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              {/* Hotlines List */}
              <div className="space-y-3">
                {hotlines.map((hotline, index) => (
                  <motion.div
                    key={hotline.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-xl p-4 hover:bg-white/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            hotline.type === "emergency"
                              ? "bg-red-100 text-red-600"
                              : "bg-teal-100 text-teal-600"
                          }`}
                        >
                          <Phone size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{hotline.name}</h3>
                          <p className="text-sm text-gray-600">{hotline.number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(hotline.number, hotline.name)}
                          className="p-2 hover:bg-white/70 rounded-lg transition-colors"
                          title="Copy number"
                        >
                          <Copy size={18} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleCall(hotline.number)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                            hotline.type === "emergency"
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "gradient-primary text-white hover:shadow-lg"
                          }`}
                        >
                          <Phone size={16} />
                          Call
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer Note */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> These are placeholder numbers. Update with actual local contact information.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

