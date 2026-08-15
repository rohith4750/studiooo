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

    // Generate secure 6-digit numeric OTP valid for 15 minutes
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update OTP & expiry
    await prisma.$executeRawUnsafe(
      `UPDATE "public"."User" SET "resetToken" = $1, "resetTokenExpiry" = $2, "updatedAt" = NOW() WHERE "id" = $3`,
      otp,
      expiry,
      user.id
    );

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
          .header { text-align: center; margin-bottom: 24px; }
          .title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 10px; }
          .content { font-size: 14px; line-height: 1.6; color: #475569; text-align: center; }
          .otp-box { background-color: #fffbeb; border: 2px dashed #f59e0b; border-radius: 10px; padding: 18px; margin: 24px 0; text-align: center; }
          .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #b45309; }
          .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-weight: 800; font-size: 20px; color: #b45309; letter-spacing: -0.5px;">R2R STUDIO ERP</div>
            <div class="title">Password Reset Verification Code</div>
          </div>
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Use the following 6-digit OTP code to verify your identity and set a new password on the login screen:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p style="font-size: 12px; color: #64748b;">This OTP is valid for <strong>15 minutes</strong>. Do not share this code with anyone.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} R2R Studio ERP. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Your R2R Studio Password Reset OTP: ${otp}`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit OTP verification code has been sent to ${user.email}.`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process forgot password request' },
      { status: 500 }
    );
  }
}
