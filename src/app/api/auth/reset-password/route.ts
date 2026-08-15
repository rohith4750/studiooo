import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { token, otp, newPassword } = await req.json();
    const verificationCode = (otp || token || '').trim();

    if (!verificationCode) {
      return NextResponse.json({ error: '6-digit OTP verification code is required' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Find user with matching OTP that hasn't expired
    const users: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "public"."User" WHERE "resetToken" = $1 AND "resetTokenExpiry" > NOW() LIMIT 1`,
      verificationCode
    );

    const user = users && users.length > 0 ? users[0] : null;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP verification code. Please check your email or request a new OTP.' },
        { status: 400 }
      );
    }

    // Update user password and clear token
    await prisma.$executeRawUnsafe(
      `UPDATE "public"."User" SET "password" = $1, "resetToken" = NULL, "resetTokenExpiry" = NULL, "updatedAt" = NOW() WHERE "id" = $2`,
      newPassword,
      user.id
    );

    // Create security audit log
    await createAuditLog(
      user.id,
      'PASSWORD_RESET',
      `Password reset successfully via SMTP OTP verification for ${user.email}`
    );

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully! You can now log in with your new credentials.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
