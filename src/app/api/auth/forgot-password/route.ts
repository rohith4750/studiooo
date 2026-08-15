import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // For security, do not leak whether an account exists, but return success message
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.',
      });
    }

    // Generate secure 32-byte hex token valid for 1 hour
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update reset token & expiry
    await prisma.$executeRawUnsafe(
      `UPDATE "public"."User" SET "resetToken" = $1, "resetTokenExpiry" = $2, "updatedAt" = NOW() WHERE "id" = $3`,
      token,
      expiry,
      user.id
    );

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const resetUrl = `${protocol}://${host}/reset-password?token=${token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
          .header { text-align: center; margin-bottom: 24px; }
          .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 12px; }
          .content { font-size: 14px; line-height: 1.6; color: #475569; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background-color: #d97706; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; }
          .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
          .link-fallback { word-break: break-all; font-size: 12px; color: #64748b; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-weight: 800; font-size: 22px; color: #b45309; letter-spacing: -0.5px;">R2R STUDIO ERP</div>
            <div class="title">Password Reset Request</div>
          </div>
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>We received a request to reset your password for your R2R Studio account (<strong>${user.email}</strong>).</p>
            <p>Click the button below to choose a new password. This reset link will expire in <strong>60 minutes</strong>.</p>
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">Reset My Password</a>
            </div>
            <p class="link-fallback">
              Or copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #d97706;">${resetUrl}</a>
            </p>
            <p style="margin-top: 20px;">If you did not request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} R2R Studio ERP Platform. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Reset your R2R Studio Password',
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been dispatched to your email address.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process forgot password request' },
      { status: 500 }
    );
  }
}
