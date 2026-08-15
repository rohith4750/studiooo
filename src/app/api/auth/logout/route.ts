import { NextRequest, NextResponse } from 'next/server';
import { clearSession, getSession } from '@/lib/session';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const user = getSession(req);
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  clearSession(response);

  if (user) {
    await createAuditLog(user.id, 'LOGOUT', `User ${user.email} logged out.`);
  }

  return response;
}
