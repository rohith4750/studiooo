'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles, Film, Star, CheckCircle2, ArrowRight, Heart, Megaphone } from 'lucide-react';

export default function MarketingHero() {
  const [content, setContent] = useState<any>({
    heroBadge: 'Premium Wedding & Event Cinematography',
    heroTitle: 'Preserving Your Most Precious Love Stories',
    heroSubtitle: 'Welcome to R2R Studio. We craft timeless wedding films, candid portraits, pre-wedding concept shoots, and aerial drone cinematography with unmatched artistry.',
    promoBannerText: '✨ Special Season Offer: Book Your Wedding Cinematography Package & Get Complimentary Pre-Wedding Shoot!',
    promoBannerActive: true,
    ctaText: 'Request Custom Quote',
  });

  useEffect(() => {
    const contentUrl = process.env.NEXT_PUBLIC_CRM_API_URL
      ? process.env.NEXT_PUBLIC_CRM_API_URL.replace('/api/marketing/leads', '/api/marketing/content')
      : 'http://localhost:3000/api/marketing/content';

    fetch(contentUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setContent((prev: any) => ({
            ...prev,
            ...data,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="about" className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-rose-50/30 to-white text-neutral-900 py-16 lg:py-24">
      
      {/* Decorative Glow Orbs */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Dynamic Receptionist Promotional Ticker Banner */}
        {content.promoBannerActive && content.promoBannerText && (
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-between space-x-3 text-xs font-extrabold animate-fadeIn">
            <div className="flex items-center space-x-2">
              <Megaphone className="w-4 h-4 flex-shrink-0 animate-bounce" />
              <span>{content.promoBannerText}</span>
            </div>
            <a href="#inquiry" className="underline whitespace-nowrap hover:text-amber-100 transition">
              Claim Offer &rarr;
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 border border-amber-200/80 text-amber-800 text-xs font-extrabold shadow-xs backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{content.heroBadge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-neutral-900">
              {content.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 font-normal leading-relaxed max-w-xl">
              {content.heroSubtitle}
            </p>

            {/* Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
              {[
                '4K Cinematic Films',
                'Candid & Emotional Moments',
                'Aerial 4K Drone Coverage',
                'Luxury Flush-Mount Albums',
                'Tailored Custom Packages',
                'Prompt Album Delivery',
              ].map((text, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs font-semibold text-neutral-700 bg-white/80 backdrop-blur-md px-3 py-2 rounded-xl border border-amber-100/90 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#inquiry"
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <span>{content.ctaText || 'Request Custom Quote'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#packages"
                className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-bold text-xs transition-colors shadow-2xs"
              >
                <Film className="w-4 h-4 text-amber-600" />
                <span>Explore Packages</span>
              </a>
            </div>

          </div>

          {/* Right Column: Luxury Card Visual with Prominent R2R Logo */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-white/90 backdrop-blur-xl border border-amber-200/80 p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative w-28 sm:w-36 h-14 flex items-center justify-center p-1.5 rounded-2xl bg-gradient-to-tr from-amber-50 to-rose-50 border border-amber-200/60 shadow-xs">
                    <Image
                      src="/r2r-logo.png"
                      alt="R2R Logo"
                      width={180}
                      height={70}
                      className="object-contain max-h-12 w-auto"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-neutral-900">R2R Experience</h3>
                    <p className="text-[11px] text-neutral-500 font-semibold">Over 500+ Happy Couples</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0</span>
                </div>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <div className="text-xl font-black text-amber-600">500+</div>
                  <div className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Weddings</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
                  <div className="text-xl font-black text-rose-600">100%</div>
                  <div className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Candid</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <div className="text-xl font-black text-amber-600">15+</div>
                  <div className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Awards</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/60 text-xs text-neutral-700 flex items-center space-x-3">
                <Heart className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <p className="leading-snug">
                  "R2R turned our wedding memories into a mesmerizing movie. Truly magical experience!" <br />
                  <span className="text-[10px] text-neutral-500 font-extrabold">— Priya & Dev</span>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
