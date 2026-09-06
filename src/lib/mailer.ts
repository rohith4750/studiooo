import { getSmtpTransporter, getFromEmail } from '@/lib/email';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export function getSmtpConfig(): SmtpConfig {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'R2R Studio',
    fromEmail: process.env.SMTP_FROM_EMAIL || (process.env.SMTP_USER || 'support@r2rstudio.com'),
  };
}

/**
 * Unified robust SMTP email dispatcher powered by Nodemailer.
 * Prevents tls.connect port 587 SSL wrong version number crashes.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!to || !to.includes('@')) {
    console.log(`[SMTP Mailer] Skipped sending email - invalid recipient: ${to}`);
    return { success: false, error: 'Invalid recipient email' };
  }

  try {
    const transporter = getSmtpTransporter();
    const from = getFromEmail();

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`[SMTP Mailer] Email sent to ${to}. MessageId: ${info.messageId || 'OK'}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[SMTP Mailer] Error sending email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
