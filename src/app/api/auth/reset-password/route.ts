import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Reset token is required or invalid' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Find user with matching token that hasn't expired
    const users: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "public"."User" WHERE "resetToken" = $1 AND "resetTokenExpiry" > NOW() LIMIT 1`,
      token
    );

    const user = users && users.length > 0 ? users[0] : null;

    if (!user) {
      return NextResponse.json(
        { error: 'Password reset link is invalid or has expired. Please request a new one.' },
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
    await createAuditLog({
      action: 'UPDATE',
      model: 'User',
      recordId: user.id,
      userId: user.id,
      userName: user.name,
      details: `Password reset successfully via SMTP email token for ${user.email}`,
    });

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
