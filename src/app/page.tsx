'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldAlert, Mail, Lock, ArrowRight } from 'lucide-react';
import { TextField, Button, InputAdornment } from '@mui/material';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

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
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-50">
        <div className="text-center space-y-4 animate-pulse">
          <Image src="/r2r-logo.png" alt="R2R Story Arcs Logo" width={160} height={160} className="mx-auto drop-shadow-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex font-sans bg-white">
      
      {/* Left side: Login/Signup Form */}
      <div className="flex-1 flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-20 xl:px-24 bg-neutral-50/50 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-block p-2 bg-white rounded shadow-md shadow-primary-500/10 border border-neutral-100 mb-2">
              <Image 
                src="/r2r-logo.png" 
                alt="R2R Story Arcs Logo" 
                width={60} 
                height={60} 
              />
            </div>
          </div>

          <div className="text-left mb-8">
            <h2 className="text-3xl font-extrabold text-neutral-800 tracking-tight">
              Sign In to R2R
            </h2>
            <p className="mt-2 text-sm text-neutral-500 font-medium">
              Enter your credentials to access the studio portal.
            </p>
          </div>

          <div className="glass-card py-8 px-8 sm:rounded shadow-lg shadow-primary-500/5 border border-neutral-200/60 bg-white">
            <form className="space-y-5" onSubmit={handleLogin}>
              {error && (
                <div className="rounded bg-red-50 p-3 border border-red-100 text-red-700 flex items-start space-x-2 text-xs animate-shake">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <TextField
                  fullWidth
                  id="email"
                  type="email"
                  label="Email Address"
                  variant="outlined"
                  size="small"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@r2r.com"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail className="h-5 w-5 text-neutral-400" />
                        </InputAdornment>
                      )
                    }
                  }}
                  sx={{ 
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                    }
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  id="password"
                  type="password"
                  label="Password"
                  variant="outlined"
                  size="small"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock className="h-5 w-5 text-neutral-400" />
                        </InputAdornment>
                      )
                    }
                  }}
                  sx={{ 
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={<ArrowRight className="h-5 w-5" />}
                sx={{
                  py: 1.5,
                  mt: 2,
                  bgcolor: '#0ea5e9',
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  borderRadius: '4px',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#0284c7',
                    boxShadow: 'none',
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>
          
          <p className="mt-6 text-left text-[10px] text-neutral-400 font-medium">
            &copy; {new Date().getFullYear()} R2R Story Arcs. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side: Premium Image Banner & Logo */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900 items-center justify-center shadow-[inset_20px_0_40px_rgba(0,0,0,0.1)] h-screen overflow-hidden">
        {/* Soft elegant gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 z-0" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-40 -translate-x-1/3 translate-y-1/3" />

        {/* Floating Logo Container */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center w-full max-w-lg p-12">
          
          <div className="mb-6 p-8 sm:p-10 bg-white rounded-[24px] shadow-2xl shadow-neutral-200/50 border border-white/50 backdrop-blur-xl animate-float">
            <Image 
              src="/r2r-logo.png" 
              alt="R2R Story Arcs Logo" 
              width={260} 
              height={260} 
              priority
              className="drop-shadow-sm w-48 h-48 sm:w-64 sm:h-64 object-contain" 
            />
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-800 mb-2">
            Studio Management, <span className="text-primary-600">Elevated.</span>
          </h1>
          <p className="text-neutral-500 text-xs max-w-md leading-relaxed font-medium">
            Your centralized command center for photography bookings, client deliveries, and studio operations.
          </p>
          
        </div>
      </div>
    </div>
  );
}
