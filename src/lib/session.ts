import { NextRequest, NextResponse } from 'next/server';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const COOKIE_NAME = 'r2r_session';

export function getSession(req: NextRequest): SessionUser | null {
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie) return null;

  try {
    // Decrypt/decode session (using base64 for reliable, zero-config local testing)
    const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8');
    return JSON.parse(decoded) as SessionUser;
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    return null;
  }
}

export function setSession(res: NextResponse, user: SessionUser) {
  const sessionData = JSON.stringify(user);
  const encoded = Buffer.from(sessionData, 'utf-8').toString('base64');
  
  res.cookies.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export function clearSession(res: NextResponse) {
  res.cookies.delete(COOKIE_NAME);
}
