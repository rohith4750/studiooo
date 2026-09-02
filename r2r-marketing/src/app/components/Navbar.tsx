'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

export default function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-amber-100/80 text-neutral-800 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between">
        
        {/* Prominent Official R2R Logo Image */}
        <Link href="/" className="flex items-center space-x-4 group">
          <div className="relative w-32 sm:w-44 h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/r2r-logo.png"
              alt="R2R Studio Logo"
              width={240}
              height={90}
              className="object-contain max-h-14 w-auto drop-shadow-sm"
              priority
            />
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-neutral-700">
          <a href="#about" className="hover:text-amber-600 transition-colors">About R2R</a>
          <a href="#packages" className="hover:text-amber-600 transition-colors">Packages & Pricing</a>
          <a href="#portfolio" className="hover:text-amber-600 transition-colors">Portfolio Showcase</a>
          <a href="#inquiry" className="hover:text-amber-600 transition-colors">Contact Us</a>
        </nav>

        {/* CTA Button */}
        <div className="flex items-center space-x-3">
          <a
            href="#inquiry"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.03] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Book Inquiry</span>
          </a>
        </div>

      </div>
    </header>
  );
}
