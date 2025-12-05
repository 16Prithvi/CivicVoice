"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Target, Building, Users, Lightbulb } from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: Building,
      title: "Infrastructure Monitoring",
      description: "Track and report infrastructure issues in real-time",
    },
    {
      icon: Users,
      title: "Community Engagement",
      description: "Connect citizens with local authorities",
    },
    {
      icon: Target,
      title: "SDG Alignment",
      description: "Contributing to Sustainable Development Goals 9 & 11",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Using technology for civic betterment",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-4">About CivicVoice</h1>
            <p className="text-xl text-gray-600">
              Empowering communities through smart civic engagement
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 md:p-12 mb-12 shadow-xl"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              CivicVoice is a smart civic engagement platform designed to bridge the gap between
              citizens and municipal authorities. We enable residents to report, track, and monitor
              local infrastructure and safety issues in real-time, fostering transparency and
              accountability in public service delivery.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our platform focuses on road hazards, public safety concerns, environmental issues,
              and waste management, providing a comprehensive solution for community betterment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#2F5D62] rounded-full mb-4">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 md:p-12 shadow-xl"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Sustainable Development Goals</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  SDG 9: Industry, Innovation & Infrastructure
                </h3>
                <p className="text-gray-700">
                  CivicVoice contributes to building resilient infrastructure by providing tools
                  for monitoring and reporting infrastructure issues. Our platform promotes
                  innovation in civic engagement and helps build sustainable infrastructure systems.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  SDG 11: Sustainable Cities and Communities
                </h3>
                <p className="text-gray-700">
                  By enabling citizens to actively participate in community improvement, we support
                  the goal of making cities and human settlements inclusive, safe, resilient, and
                  sustainable. Our platform facilitates transparent communication between residents
                  and local authorities.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 md:p-12 mt-12 shadow-xl"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-[#2F5D62] text-white rounded-full flex items-center justify-center font-bold">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Report</h3>
                  <p className="text-gray-600">
                    Citizens can report issues with photos, descriptions, and precise location
                    mapping.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-[#2F5D62] text-white rounded-full flex items-center justify-center font-bold">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Track</h3>
                  <p className="text-gray-600">
                    Real-time status tracking from "Reported" through "Processing", "Action Taken",
                    to "Resolved".
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-[#2F5D62] text-white rounded-full flex items-center justify-center font-bold">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Monitor</h3>
                  <p className="text-gray-600">
                    Interactive community map showing all reported issues with filtering options.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-[#2F5D62] text-white rounded-full flex items-center justify-center font-bold">
                  4
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Resolve</h3>
                  <p className="text-gray-600">
                    Municipal authorities can update status and citizens receive notifications
                    about progress.
                  </p>
                </div>
              </li>
            </ol>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}









