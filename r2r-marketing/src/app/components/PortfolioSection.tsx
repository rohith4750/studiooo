'use client';

import React from 'react';
import { Camera } from 'lucide-react';

const PORTFOLIO_ITEMS = [
  {
    title: 'The Royal Jaipur Wedding',
    category: 'Candid Photography',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    tag: 'Bridal Portrait',
  },
  {
    title: 'Ananya & Rohan Cinematic Trailer',
    category: 'Cinematography',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    tag: '4K Film',
  },
  {
    title: 'Sunset Beach Pre-wedding',
    category: 'Pre-wedding Shoot',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    tag: 'Goa',
  },
  {
    title: 'Haldi & Sangeet Celebrations',
    category: 'Traditional & Candid',
    image: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80',
    tag: 'Vibrant Colors',
  },
  {
    title: 'Aerial Fort Coverage',
    category: 'Drone Photography',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
    tag: 'Aerial View',
  },
  {
    title: 'Luxury Acrylic Flush Album',
    category: 'Print & Album',
    image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
    tag: 'HD Photobook',
  },
];

export default function MarketingPortfolio() {
  return (
    <section id="portfolio" className="py-20 bg-neutral-50/70 text-neutral-900 border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5 text-rose-500" />
            <span>Featured Gallery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900">
            R2R Portfolio Showcase
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            A glimpse into the heartfelt weddings, pre-wedding films, and artistic portraits captured by our studio.
          </p>
        </div>

        {/* Portfolio Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PORTFOLIO_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl bg-white border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-64 w-full overflow-hidden bg-neutral-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-amber-700 border border-amber-200 shadow-xs">
                  {item.tag}
                </div>
              </div>

              <div className="p-5 space-y-1 bg-white">
                <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-amber-600 transition-colors">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
