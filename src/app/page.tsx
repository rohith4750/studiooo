'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ShieldAlert, Mail, Lock, ArrowRight, Eye, EyeOff, Camera, Sparkles,
  CheckCircle2, Film, Star, MapPin, Layers, KeyRound, Globe, ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

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
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request OTP');
      }

      setForgotStep(2);
      setForgotSuccess(data.message || 'OTP verification code sent to your email!');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to dispatch OTP email');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (forgotNewPass.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError('Passwords do not match. Please verify.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: forgotOtp, newPassword: forgotNewPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setForgotSuccess('Password updated successfully! You can now log in.');
      setPassword(forgotNewPass);
      setEmail(forgotEmail);
      setTimeout(() => {
        setForgotOpen(false);
        setForgotStep(1);
      }, 1800);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#faf9f6] text-neutral-800 font-sans overflow-hidden">
        <div className="text-center space-y-3 animate-pulse">
          <div className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl border border-[#e5dfd3] shadow-lg">
            <Image src="/r2r-logo.png" alt="R2R Studio Logo" width={80} height={80} className="mx-auto object-contain" priority />
          </div>
          <p className="text-[11px] font-bold tracking-widest text-[#a9792a] uppercase">Loading Studio Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-gradient-to-br from-[#faf8f4] via-[#f7f3ea] to-[#f1ebd9] text-neutral-800 font-sans select-none relative">

      {/* Ambient Soft Gold Background Lighting */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-200/30 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-amber-300/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#dfc272]/15 rounded-full blur-[150px] pointer-events-none" />

      {/* LEFT COLUMN: Fixed Viewport Luxury Showcase (60% Desktop) */}
      <div className="relative lg:w-3/5 h-auto lg:h-screen flex flex-col justify-between p-6 lg:p-10 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#e5dfd3]">

        {/* Animated Lens Aperture Ring & Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-[450px] lg:w-[580px] h-[450px] lg:h-[580px] relative animate-spin-slow opacity-15">
            <svg viewBox="0 0 200 200" className="w-full h-full text-[#c5963b] fill-none stroke-current stroke-[0.8]">
              <circle cx="100" cy="100" r="92" strokeDasharray="4 4" />
              <circle cx="100" cy="100" r="78" strokeWidth="0.6" />
              <circle cx="100" cy="100" r="62" strokeDasharray="2 2" />
              <polygon points="100,8 118,36 82,36" />
              <polygon points="192,100 164,118 164,82" />
              <polygon points="100,192 82,164 118,164" />
              <polygon points="8,100 36,82 36,118" />
            </svg>
          </div>

          <div className="w-[380px] lg:w-[520px] h-[380px] lg:h-[520px] absolute animate-float-glow opacity-[0.06] grayscale contrast-125">
            <Image
              src="/r2r-logo.png"
              alt="R2R Watermark"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Top Header Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="p-2 bg-white/90 backdrop-blur-md rounded-xl border border-[#e5dfd3] shadow-xs">
            <Image
              src="/r2r-logo.png"
              alt="R2R Story Arcs Logo"
              width={160}
              height={50}
              className="object-contain"
              priority
            />
          </div>

          <a
            href="/marketing"
            className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-50 border border-[#e5dfd3] text-xs font-semibold text-[#8c4e1e] shadow-xs transition-all hover:scale-105"
          >
            <Globe className="h-3.5 w-3.5 text-[#c5963b]" />
            <span>Public Website</span>
          </a>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 space-y-4 my-auto max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 text-[#8c4e1e] border border-[#eddba6] rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#c5963b]" />
            <span>Luxury Cinematography & Studio ERP</span>
          </div>

          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 leading-snug font-serif">
            Capturing Timeless Stories <br />
            <span className="bg-gradient-to-r from-[#a9792a] via-[#c5963b] to-[#8c4e1e] bg-clip-text text-transparent">
              Streamlining Studio Workflows
            </span>
          </h1>

          <p className="text-xs text-neutral-600 font-normal leading-relaxed">
            All-in-one studio management platform controlling client inquiries, shoot bookings, multi-event schedules, editing pipelines, and financial ledgers.
          </p>

          {/* Key ERP Highlights Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 bg-white/85 backdrop-blur-md rounded-xl border border-[#e5dfd3] shadow-xs flex items-center space-x-2">
              <Camera className="h-3.5 w-3.5 text-[#c5963b] flex-shrink-0" />
              <span className="text-xs font-semibold text-neutral-800">Live Shoot Roster</span>
            </div>
            <div className="p-2.5 bg-white/85 backdrop-blur-md rounded-xl border border-[#e5dfd3] shadow-xs flex items-center space-x-2">
              <Film className="h-3.5 w-3.5 text-[#c5963b] flex-shrink-0" />
              <span className="text-xs font-semibold text-neutral-800">Post-Production Suite</span>
            </div>
            <div className="p-2.5 bg-white/85 backdrop-blur-md rounded-xl border border-[#e5dfd3] shadow-xs flex items-center space-x-2">
              <Layers className="h-3.5 w-3.5 text-[#c5963b] flex-shrink-0" />
              <span className="text-xs font-semibold text-neutral-800">Billing & GST Quotes</span>
            </div>
            <div className="p-2.5 bg-white/85 backdrop-blur-md rounded-xl border border-[#e5dfd3] shadow-xs flex items-center space-x-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#c5963b] flex-shrink-0" />
              <span className="text-xs font-semibold text-neutral-800">Dynamic Roles Access</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="pt-3 border-t border-[#e5dfd3] flex items-center justify-between text-center">
            <div>
              <p className="text-lg font-extrabold text-[#8c4e1e]">450+</p>
              <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">Weddings Captured</p>
            </div>
            <div className="h-6 w-px bg-[#e5dfd3]" />
            <div>
              <p className="text-lg font-extrabold text-[#8c4e1e]">35+</p>
              <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">Destination Cities</p>
            </div>
            <div className="h-6 w-px bg-[#e5dfd3]" />
            <div>
              <p className="text-lg font-extrabold text-[#8c4e1e]">4.9★</p>
              <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">Couple Rating</p>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[10px] text-neutral-400 font-medium">
          © {new Date().getFullYear()} R2R Story Arcs ERP System. All rights reserved.
        </div>

      </div>

      {/* RIGHT COLUMN: Fixed Sign-In Container (40% Desktop) */}
      <div className="lg:w-2/5 h-full lg:h-screen flex items-center justify-center p-6 lg:p-8 relative z-20">

        <div className="w-full max-w-[380px] animate-scaleIn">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-neutral-900/5 border border-[#e5dfd3] p-6 sm:p-7 space-y-5 relative overflow-hidden">
            
            {/* Ambient Card Glow */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="text-center space-y-1.5 relative z-10">
              <div className="inline-flex justify-center p-2 bg-[#faf9f6] rounded-xl border border-[#e5dfd3] mb-1">
                <Image
                  src="/r2r-logo.png"
                  alt="R2R Story Arcs"
                  width={130}
                  height={42}
                  className="object-contain"
                  priority
                />
              </div>
              <h2 className="text-lg font-extrabold text-neutral-900 tracking-tight font-serif">
                Sign In to Studio Portal
              </h2>
              <p className="text-[11px] text-neutral-500 font-normal">
                Enter your authorized credentials to access workspace
              </p>
            </div>

            {/* Form */}
            <form className="space-y-3.5 relative z-10" onSubmit={handleLogin}>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-red-700 flex items-start space-x-2 text-xs animate-shake">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" />
                  <span className="font-medium text-[11px] leading-relaxed">{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-[11px] font-semibold text-neutral-700">
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#c5963b]">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@r2r.com"
                    className="w-full pl-9 pr-3.5 py-2 bg-[#faf9f6] text-neutral-900 text-xs rounded-lg border border-[#e3ddce] focus:bg-white focus:border-[#c5963b] focus:ring-2 focus:ring-[#c5963b]/15 outline-none transition-all font-medium placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-[11px] font-semibold text-neutral-700">
                    Account Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setForgotOpen(true); setForgotSuccess(''); setForgotError(''); }}
                    className="text-[10px] text-[#8c4e1e] hover:text-[#c5963b] font-semibold transition-colors cursor-pointer hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#c5963b]">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 bg-[#faf9f6] text-neutral-900 text-xs rounded-lg border border-[#e3ddce] focus:bg-white focus:border-[#c5963b] focus:ring-2 focus:ring-[#c5963b]/15 outline-none transition-all font-medium placeholder:text-neutral-400"
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
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-[#c5963b] via-[#d3ab48] to-[#a9792a] hover:from-[#d3ab48] hover:to-[#c5963b] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-md shadow-amber-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 group hover:scale-[1.01]"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                  {!loading && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />}
                </button>
              </div>
            </form>

            {/* Public site link */}
            <div className="text-center pt-3 border-t border-neutral-100">
              <a
                href="/marketing"
                className="text-[11px] text-neutral-500 hover:text-[#8c4e1e] font-medium inline-flex items-center space-x-1.5 transition-colors"
              >
                <span>Looking for R2R Photography Website?</span>
                <span className="font-bold underline text-[#8c4e1e]">Visit Site →</span>
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* Forgot Password Modal (OTP Verification & Reset) */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-sm p-5 space-y-4 animate-scaleIn text-neutral-800">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-amber-50 text-[#c5963b] rounded-xl flex items-center justify-center mx-auto mb-1 border border-amber-200">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">
                {forgotStep === 1 ? 'Reset Password via OTP' : 'Verify OTP & Set Password'}
              </h3>
              <p className="text-[11px] text-neutral-500 font-normal leading-relaxed">
                {forgotStep === 1
                  ? 'Enter your registered work email to receive a 6-digit verification code.'
                  : `Enter the 6-digit OTP code dispatched to ${forgotEmail} and choose a new password.`}
              </p>
            </div>

            {forgotError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium">
                {forgotSuccess}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label htmlFor="forgot-email" className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Registered Work Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. admin@r2r.com"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:bg-white focus:border-[#c5963b] outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setForgotOpen(false); setForgotStep(1); }}
                    className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 bg-gradient-to-r from-[#c5963b] to-[#a9792a] text-white text-xs font-extrabold uppercase rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetWithOtp} className="space-y-3">
                <div>
                  <label htmlFor="forgot-otp" className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    6-Digit OTP Code *
                  </label>
                  <input
                    id="forgot-otp"
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-center tracking-widest font-bold text-neutral-900 focus:bg-white focus:border-[#c5963b] outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="forgot-new-pass" className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    New Password *
                  </label>
                  <input
                    id="forgot-new-pass"
                    type="password"
                    required
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:bg-white focus:border-[#c5963b] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="forgot-confirm-pass" className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    id="forgot-confirm-pass"
                    type="password"
                    required
                    value={forgotConfirmPass}
                    onChange={(e) => setForgotConfirmPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:bg-[#c5963b] outline-none"
                  />
                </div>

                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setForgotError(''); setForgotSuccess(''); }}
                    className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 bg-gradient-to-r from-[#c5963b] to-[#a9792a] text-white text-xs font-extrabold uppercase rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    {forgotLoading ? 'Updating...' : 'Save & Log In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
