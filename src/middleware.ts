import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the presence of the authentication session cookie
  const sessionCookie = request.cookies.get('r2r_session');
  const hasSession = Boolean(sessionCookie?.value && sessionCookie.value.trim() !== '');

  // 1. Protect the Dashboard
  // If a user tries to access any /dashboard route without a session, boot them to login
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!hasSession) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }
  }

  // 2. Prevent Logged-in Users from seeing the Login Page
  // If they are already authenticated and try to go to the root "/", auto-forward to dashboard
  if (request.nextUrl.pathname === '/') {
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configure the paths where this strict middleware should run
export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/'],
};
