'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldAlert, Mail, Lock, ArrowRight, Eye, EyeOff, Camera, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          router.push('/dashboard');
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-50 font-sans">
        <div className="text-center space-y-3 animate-pulse">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-xl shadow-xs border border-neutral-200">
            <Image src="/r2r-logo.png" alt="R2R Studio Logo" width={70} height={70} className="mx-auto object-contain" priority />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f7f6f2] font-sans select-none overflow-hidden">
      
      {/* LEFT COLUMN: Clean Animated Studio Showcase (60% Desktop) */}
      <div className="relative lg:w-3/5 min-h-[360px] lg:min-h-screen flex flex-col justify-between p-8 lg:p-14 overflow-hidden bg-gradient-to-br from-[#f2efe9] via-[#f7f6f2] to-[#ebe7de] border-b lg:border-b-0 lg:border-r border-neutral-200/80">
        
        {/* Subtle Watermark Canvas (Ultra-faint background) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          
          {/* Rotating Camera Lens Aperture Ring */}
          <div className="w-[450px] lg:w-[620px] h-[450px] lg:h-[620px] relative animate-spin-slow opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full text-amber-600 fill-none stroke-current stroke-[1]">
              <circle cx="100" cy="100" r="90" strokeDasharray="6 6" />
              <circle cx="100" cy="100" r="75" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="60" strokeDasharray="3 3" />
              <polygon points="100,10 120,40 80,40" />
              <polygon points="190,100 160,120 160,80" />
              <polygon points="100,190 80,160 120,160" />
              <polygon points="10,100 40,80 40,120" />
            </svg>
          </div>

          {/* Ultra-faint Faded Watermark R2R Logo */}
          <div className="w-[400px] lg:w-[580px] h-[400px] lg:h-[580px] absolute animate-float-glow opacity-[0.05] grayscale">
            <Image 
              src="/r2r-logo.png" 
              alt="R2R Faded Watermark" 
              fill 
              className="object-contain" 
              priority 
            />
          </div>
        </div>

        {/* Ambient Golden Glow */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="p-2 bg-white/90 backdrop-blur-md rounded-xl border border-neutral-200/80 shadow-xs">
            <Image src="/r2r-logo.png" alt="R2R Logo" width={38} height={38} className="object-contain" priority />
          </div>
          <div>
            <span className="font-extrabold text-sm text-neutral-900 tracking-wider uppercase block">R2R STORY ARCS</span>
            <span className="text-[10px] text-neutral-500 font-medium">Photography & Cinema ERP</span>
          </div>
        </div>

        {/* Center Studio Hero Info */}
        <div className="relative z-10 space-y-4 my-auto py-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-100/80 text-amber-900 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-amber-600" />
            <span>Studio Operations Command</span>
          </div>
          
          <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
            Capturing Timeless Moments <br />
            <span className="text-amber-600 font-normal">Streamlining Studio Workflows</span>
          </h2>
          
          <p className="text-xs text-neutral-500 max-w-md font-normal leading-relaxed">
            All-in-one studio management platform for client inquiries, shoot bookings, multi-event schedules, post-production editing, equipment tracking, and financial ledgers.
          </p>

          {/* Quick Feature Badges */}
          <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-medium text-neutral-600">
            <span className="px-2.5 py-1 bg-white/80 border border-neutral-200/80 rounded-md flex items-center space-x-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Live Shoot Roster</span>
            </span>
            <span className="px-2.5 py-1 bg-white/80 border border-neutral-200/80 rounded-md flex items-center space-x-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Billing & GST Invoices</span>
            </span>
            <span className="px-2.5 py-1 bg-white/80 border border-neutral-200/80 rounded-md flex items-center space-x-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Chain Status Tracking</span>
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[10px] text-neutral-400 font-medium">
          © {new Date().getFullYear()} R2R Story Arcs ERP. All rights reserved.
        </div>

      </div>

      {/* RIGHT COLUMN: Right-Aligned Sign-In Card Section (40% Desktop) */}
      <div className="lg:w-2/5 min-h-screen flex items-center justify-center p-6 lg:p-12 relative z-10 bg-white/40 backdrop-blur-xs">
        
        <div className="w-full max-w-[360px] animate-scaleIn">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-neutral-900/5 border border-neutral-200/80 p-6 sm:p-7 space-y-5">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                Sign In to R2R
              </h1>
              <p className="text-[11px] text-neutral-500 font-normal">
                Enter your credentials to access studio portal
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleLogin}>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-red-700 flex items-start space-x-2 text-xs animate-shake">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" />
                  <span className="font-medium text-[11px]">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-[11px] font-semibold text-neutral-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@r2r.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50/80 hover:bg-neutral-100/60 focus:bg-white text-neutral-900 text-xs rounded-lg border border-neutral-200 focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800/10 outline-none transition-all font-medium placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-[11px] font-semibold text-neutral-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-neutral-50/80 hover:bg-neutral-100/60 focus:bg-white text-neutral-900 text-xs rounded-lg border border-neutral-200 focus:border-neutral-800 focus:ring-1 focus:ring-neutral-800/10 outline-none transition-all font-medium placeholder:text-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 group"
                >
                  <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                  {!loading && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />}
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
}
