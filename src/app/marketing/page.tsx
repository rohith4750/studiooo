import React from 'react';
import MarketingNavbar from './components/Navbar';
import MarketingHero from './components/HeroSection';
import MarketingPackages from './components/PackagesSection';
import MarketingPortfolio from './components/PortfolioSection';
import MarketingLeadInquiryForm from './components/LeadInquiryForm';
import MarketingFooter from './components/Footer';

export const metadata = {
  title: 'R2R Studio | Luxury Wedding Photography & Cinematic Films',
  description: 'Book R2R Studio for wedding cinematography, candid photography, pre-wedding films, drone coverage, and high-end photo albums.',
};

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-amber-500 selection:text-white">
      {/* Navigation Header */}
      <MarketingNavbar />

      {/* Hero Section */}
      <MarketingHero />

      {/* Photography Packages */}
      <MarketingPackages />

      {/* Portfolio Showcase */}
      <MarketingPortfolio />

      {/* Lead Inquiry & Direct CRM Booking Form */}
      <MarketingLeadInquiryForm />

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
