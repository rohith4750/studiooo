import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the presence of the authentication session cookie
  const sessionCookie = request.cookies.get('r2r_session');
  
  // 1. Protect the Dashboard
  // If a user tries to access any /dashboard route without a session, boot them to login
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 2. Prevent Logged-in Users from seeing the Login Page
  // If they are already authenticated and try to go to the root "/", auto-forward to dashboard
  if (request.nextUrl.pathname === '/') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configure the paths where this strict middleware should run
export const config = {
  matcher: ['/dashboard/:path*', '/'],
};
