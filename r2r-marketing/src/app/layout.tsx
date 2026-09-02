import React from 'react';
import './globals.css';

export const metadata = {
  title: 'R2R Studio | Luxury Wedding Photography & Films',
  description: 'Official portfolio and booking website for R2R Studio Films & Photography.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
