import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: true, // Allow base64 data URLs
    domains: ['images.unsplash.com'],
  },
};

export default nextConfig;
