"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Map, BarChart3, LogOut, User } from "lucide-react";
import { isAuthenticated, removeToken, getUser } from "@/lib/auth";
import { clearCurrentUser, getCurrentUser } from "@/lib/data-store";
import { NotificationsCenter } from "./notifications-center";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; id?: string } | null>(null);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    const authUser = getUser();
    const currentUser = getCurrentUser();
    setUser(authUser || currentUser || null);
  }, [pathname]);

  const handleLogout = () => {
    removeToken();
    clearCurrentUser();
    setAuthenticated(false);
    setUser(null);
    window.location.href = "/";
  };

  const navLinks = authenticated
    ? [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/report", label: "Report", icon: User },
        { href: "/map", label: "Map", icon: Map },
        { href: "/feed", label: "Feed", icon: User },
        { href: "/stats", label: "Stats", icon: BarChart3 },
      ]
    : [
        { href: "/", label: "Home", icon: Home },
        { href: "/about", label: "About", icon: User },
        { href: "/map", label: "Map", icon: Map },
        { href: "/feed", label: "Feed", icon: User },
        { href: "/stats", label: "Stats", icon: BarChart3 },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
              CV
            </div>
            <span className="text-2xl font-bold text-gradient">CivicVoice</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "gradient-primary text-white shadow-lg"
                      : "text-gray-700 hover:bg-white/60 hover:shadow-md"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}

            {authenticated ? (
              <div className="flex items-center space-x-4">
                <NotificationsCenter userId={user?.id || getCurrentUser()?.id || ""} />
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-3 py-2 glass rounded-lg hover:bg-white/60 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Hi, {user?.username}!</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-[#0f766e] font-medium hover:bg-white/60 rounded-xl transition-all hover:shadow-md"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 gradient-primary text-white rounded-xl hover:shadow-xl transition-all hover:scale-105 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg ${
                      isActive
                        ? "bg-[#2F5D62] text-white"
                        : "text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {authenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-[#2F5D62] text-center border border-[#2F5D62] rounded-lg hover:bg-white/50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 bg-[#2F5D62] text-white text-center rounded-lg hover:bg-[#1e4a4e]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

