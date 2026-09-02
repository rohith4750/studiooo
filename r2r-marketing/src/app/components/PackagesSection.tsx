'use client';

import React from 'react';
import { Check, Sparkles } from 'lucide-react';

const PACKAGES = [
  {
    name: 'Candid & Traditional Classic',
    tagline: 'Ideal for 1-2 Day Family Celebrations & Intimate Weddings',
    price: '₹45,000',
    popular: false,
    features: [
      '1 Lead Traditional Photographer',
      '1 Traditional Videographer',
      'High-Resolution Digital Photos (Unlimited)',
      'Full Length Edited Event Film',
      'Pre-wedding Couple Portrait Shoot',
      'Standard Premium Photobook Album (40 Pages)',
    ],
  },
  {
    name: 'R2R Luxury Cinematic Special',
    tagline: 'Our Most Loved Complete Wedding Experience',
    price: '₹85,000',
    popular: true,
    features: [
      '1 Lead Candid Photographer',
      '1 Traditional Photographer',
      '1 Cinematographer (4K Camera)',
      '1 Drone Operator (Aerial 4K Coverage)',
      '3-5 Minute Cinematic Teaser / Trailer',
      'Full Event Documentary Film',
      'Exclusive Pre-wedding Concept Shoot',
      '2 Premium Flush-mount Acrylic Albums (80 Pages)',
    ],
  },
  {
    name: 'Royal Destination Grandeur',
    tagline: 'Comprehensive 3-4 Day Destination Wedding Package',
    price: '₹1,50,000',
    popular: false,
    features: [
      '2 Candid Photographers + 2 Traditional Photographers',
      '2 Senior Cinematographers',
      '2 4K Drone Operators (Day & Night)',
      'Same Day Edit Teaser for Reception Screening',
      'Live Streaming Setup for Youtube/Web',
      'LED Wall Visual Feed Integration',
      '3 Premium HD Acrylic Photobook Albums',
      'Raw Files on Portable SSD Included',
    ],
  },
];

export default function MarketingPackages() {
  return (
    <section id="packages" className="py-20 bg-white text-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Transparent Packages</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900">
            Curated R2R Photography Packages
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Tailored to fit your wedding celebration. Custom modifications and custom event quotes available upon request.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PACKAGES.map((pkg, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                pkg.popular
                  ? 'bg-gradient-to-b from-amber-50/90 via-white to-white border-2 border-amber-400 shadow-xl shadow-amber-500/10 scale-105 z-10'
                  : 'bg-white border border-neutral-200/90 hover:border-amber-300 shadow-sm hover:shadow-md'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white text-[10px] uppercase font-extrabold tracking-widest px-4 py-1.5 rounded-full shadow-md">
                  Most Popular Choice
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-neutral-900">{pkg.name}</h3>
                  <p className="text-[11px] text-neutral-500 font-medium mt-1">{pkg.tagline}</p>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-neutral-900">{pkg.price}</span>
                  <span className="text-xs text-neutral-500 font-normal"> / starting</span>
                </div>

                <div className="border-t border-neutral-100 pt-6 space-y-3">
                  {pkg.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-2 text-xs text-neutral-700 font-medium">
                      <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <a
                  href="#inquiry"
                  className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-600 hover:to-rose-600 text-white shadow-md'
                      : 'bg-neutral-900 hover:bg-black text-white'
                  }`}
                >
                  Select Package & Inquire
                </a>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
