"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2F5D62] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">CivicVoice</h3>
            <p className="text-gray-300">
              Empowering citizens to report, track, and resolve local infrastructure
              and safety issues.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-gray-300 hover:text-white transition-colors">
                  Community Map
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-gray-300 hover:text-white transition-colors">
                  Statistics
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail size={18} />
                <span className="text-gray-300">prithviganiger@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} />
                <span className="text-gray-300">+91 7338538735</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={18} />
                <span className="text-gray-300">Hubli,Karnataka</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 CivicVoice. Aligned with SDG 11.</p>
        </div>
      </div>
    </footer>
  );
}









