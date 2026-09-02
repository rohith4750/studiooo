'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Sparkles, UserCheck, PhoneCall } from 'lucide-react';

export default function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-amber-100 text-neutral-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/marketing" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-amber-700 via-rose-700 to-amber-600 bg-clip-text text-transparent">
              R2R STUDIO
            </span>
            <span className="block text-[10px] text-amber-600 font-bold tracking-widest uppercase">
              Luxury Photography & Films
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-neutral-600">
          <a href="#about" className="hover:text-amber-600 transition-colors">About R2R</a>
          <a href="#packages" className="hover:text-amber-600 transition-colors">Packages & Pricing</a>
          <a href="#portfolio" className="hover:text-amber-600 transition-colors">Portfolio</a>
          <a href="#inquiry" className="hover:text-amber-600 transition-colors">Contact Us</a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center space-x-3">
          <a
            href="#inquiry"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Book Inquiry</span>
          </a>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 text-amber-800 text-xs font-semibold border border-amber-200/60 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Staff Portal</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
