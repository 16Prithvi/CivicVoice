"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Route,
  AlertTriangle,
  Leaf,
  Trash2,
  MapPin,
  Upload,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  FileText,
  Search,
  Settings,
  CheckCircle,
  Users,
  Shield,
  Leaf as LeafIcon,
} from "lucide-react";

// Particle component for hero section
function Particle({ delay = 0 }: { delay?: number }) {
  const [position, setPosition] = useState({ x: Math.random() * 100, y: Math.random() * 100 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * 100,
        y: Math.random() * 100,
      });
    }, 3000 + delay * 1000);

    return () => clearInterval(interval);
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        x: `${position.x}%`,
        y: `${position.y}%`,
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      className="absolute w-2 h-2 bg-yellow-400 rounded-full blur-sm"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    />
  );
}

export default function HomePage() {
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const categories = [
    { id: "roads", name: "Roads", icon: Route, gradient: "gradient-roads", color: "#b45309" },
    { id: "safety", name: "Safety", icon: AlertTriangle, gradient: "gradient-safety", color: "#dc2626" },
    { id: "environment", name: "Environment", icon: Leaf, gradient: "gradient-environment", color: "#059669" },
    { id: "garbage", name: "Garbage", icon: Trash2, gradient: "gradient-garbage", color: "#9333ea" },
  ];

  const steps = [
    { icon: FileText, title: "Report", description: "Upload photos and location details", color: "text-blue-600" },
    { icon: Search, title: "Review", description: "Authorities review your report", color: "text-yellow-600" },
    { icon: Settings, title: "Action", description: "See action being taken", color: "text-green-600" },
    { icon: CheckCircle, title: "Resolved", description: "Issue gets fixed and verified", color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay - Traffic/Construction Theme */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://media.istockphoto.com/id/1454313615/photo/mountain-road-in-autumn.jpg?s=1920x1080&w=0&k=20&c=b2_3bc6fO02p4bCiK4O1-wam8E6D3xJzdoIu6oU-BVU=)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#94a3b8', // Fallback color
        }}
      />
      {/* Overlay to ensure content readability - reduced opacity to show background */}
      <div 
        className="fixed inset-0 z-0" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.50) 0%, rgba(240, 253, 250, 0.35) 50%, rgba(239, 246, 255, 0.35) 100%)'
        }} 
      />
      <div className="relative z-10">
        <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background with City Street */}
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/85 via-teal-700/75 to-blue-900/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.4),transparent_60%)]" />
          {/* City skyline illustration effect */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-900/50 to-transparent" />
        </motion.div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0 z-[5]">
          {[...Array(8)].map((_, i) => (
            <Particle key={i} delay={i * 0.3} />
          ))}
        </div>
        
        {/* Floating Icon Elements */}
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl flex items-center justify-center"
        >
          <Users className="text-white/30" size={24} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-32 h-32 bg-teal-400/20 rounded-full blur-xl flex items-center justify-center"
        >
          <Shield className="text-teal-300/40" size={32} />
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 right-20 w-16 h-16 bg-green-400/15 rounded-full blur-lg flex items-center justify-center"
        >
          <LeafIcon className="text-green-300/30" size={20} />
        </motion.div>
        
        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6 text-sm font-medium text-white"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <Sparkles size={16} className="text-yellow-400" />
            </motion.div>
            <span>Smart City Platform</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
          >
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="block"
            >
              Report.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="block text-teal-300"
            >
              Track.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="block"
            >
              Resolve.
            </motion.span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="text-xl md:text-2xl text-teal-100 mb-10 font-light"
          >
            Together for safer, cleaner, and better communities
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/report"
              className="group relative px-8 py-4 gradient-accent text-gray-900 font-bold rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-lg shadow-xl hover:shadow-2xl"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
              <span className="relative z-10 flex items-center gap-2">
                Report an Issue
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
            </Link>
            <Link
              href="/map"
              className="group relative px-8 py-4 glass-strong text-white font-semibold rounded-2xl hover:bg-white/40 transition-all duration-300 border-2 border-white/30 flex items-center gap-2 text-lg backdrop-blur-md hover:shadow-xl hover:scale-105"
            >
              <MapPin size={20} className="group-hover:scale-110 transition-transform" />
              View Community Map
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2 backdrop-blur-sm">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-3 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Simple steps to make your community better. Join thousands of active citizens.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="card-gradient rounded-2xl p-8 text-center h-full hover:scale-105 transition-transform duration-300">
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <div className={`absolute inset-0 ${step.color.replace('text-', 'bg-')} opacity-20 rounded-full blur-2xl group-hover:opacity-30 transition-opacity`} />
                      <div className={`relative w-20 h-20 rounded-2xl ${step.color.replace('text-', 'bg-')} flex items-center justify-center text-white shadow-xl`}>
                        <Icon size={32} />
                      </div>
                      {index < steps.length - 1 && (
                        <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-gray-300">
                          <ArrowRight size={24} />
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-50 to-teal-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Report <span className="text-gradient">Categories</span>
            </h2>
            <p className="text-gray-600 text-xl">
              Track different types of community issues
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="card-gradient rounded-2xl p-8 cursor-pointer group"
                >
                  <div className={`relative w-20 h-20 ${category.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-all`}>
                    <Icon className="text-white" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm">Report issues related to {category.name.toLowerCase()}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 px-4 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Making a Real Impact
            </h2>
            <p className="text-xl text-teal-100 mb-12 max-w-3xl mx-auto">
              Join thousands of citizens working together to build safer, cleaner communities.
              Aligned with <strong>SDG 9</strong> (Industry, Innovation & Infrastructure) and <strong>SDG 11</strong> (Sustainable Cities).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                { number: "10K+", label: "Issues Reported", icon: Upload },
                { number: "8.5K", label: "Issues Resolved", icon: CheckCircle2 },
                { number: "85%", label: "Resolution Rate", icon: TrendingUp },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-strong rounded-2xl p-8"
                  >
                    <Icon className="text-yellow-400 mx-auto mb-4" size={40} />
                    <div className="text-5xl font-bold text-yellow-400 mb-2">{stat.number}</div>
                    <div className="text-white/90 text-lg">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
}
