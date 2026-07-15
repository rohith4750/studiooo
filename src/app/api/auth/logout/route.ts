import { NextRequest, NextResponse } from 'next/server';
import { clearSession, getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const user = getSession(req);
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  clearSession(response);

  if (user) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGOUT',
          details: `User ${user.email} logged out.`,
        },
      });
    } catch (e) {
      console.error('Audit log failed:', e);
    }
  }

  return response;
}
