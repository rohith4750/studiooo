'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: Brand Logo */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="relative w-14 h-12 flex items-center justify-center p-1 rounded-xl bg-neutral-800 border border-neutral-700">
                <Image
                  src="/r2r-logo.png"
                  alt="R2R Studio Logo"
                  width={120}
                  height={50}
                  className="object-contain max-h-10 w-auto"
                />
              </div>
              <span className="font-black text-base text-white tracking-wider">
                R2R STUDIO
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Capturing wedding emotions, candid stories, and cinematic films with passion and elegance.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#about" className="hover:text-amber-400 transition-colors">About Us</a></li>
              <li><a href="#packages" className="hover:text-amber-400 transition-colors">Photography Packages</a></li>
              <li><a href="#portfolio" className="hover:text-amber-400 transition-colors">Portfolio Showcase</a></li>
              <li><a href="#inquiry" className="hover:text-amber-400 transition-colors">Book Inquiry</a></li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Studio Office</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>info@r2rstudio.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>R2R Creative Studio, Main Street, India</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400">
          <p>© {new Date().getFullYear()} R2R Studio Films & Photography. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Connected with R2R Studio CRM Engine</p>
        </div>

      </div>
    </footer>
  );
}
