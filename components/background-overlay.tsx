"use client";

import { ReactNode } from "react";

interface BackgroundOverlayProps {
  children: ReactNode;
  className?: string;
}

export function BackgroundOverlay({ children, className = "" }: BackgroundOverlayProps) {
  return (
    <div className={`min-h-screen relative ${className}`}>
      {/* Background Image with Parallax */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1955134/pexels-photo-1955134.jpeg?cs=srgb&dl=pexels-sebastian-palomino-933481-1955134.jpg&fm=jpg&w=1920&h=1080&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#94a3b8',
        }}
      />
      
      {/* Teal Overlay (20-35% opacity) */}
      <div 
        className="fixed inset-0 z-0" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.25) 0%, rgba(20, 184, 166, 0.30) 50%, rgba(15, 118, 110, 0.25) 100%)'
        }} 
      />
      
      {/* SVG Road Pattern Overlay (subtle) */}
      <div 
        className="fixed inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

