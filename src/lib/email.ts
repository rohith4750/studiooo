import nodemailer from 'nodemailer';
import { generateInvoicePdfBuffer, generateQuotationPdfBuffer, QuotationTheme } from './pdfGenerator';

// Resolve SMTP Transport options from env vars or defaults
export function getSmtpTransporter() {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = (process.env.SMTP_USER || '').replace(/["']/g, '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/["'\s]/g, '').trim();
  
  // IMPORTANT FIX:
  // Port 465 requires secure: true (SSL).
  // Port 587 / 25 requires secure: false (STARTTLS upgrade).
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;

  if (!user || !pass) {
    // Return a dummy jsonTransport if SMTP credentials are missing
    return nodemailer.createTransport({
      jsonTransport: true
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export function getFromEmail() {
  return process.env.SMTP_FROM || `"R2R Studio Photography" <${process.env.SMTP_USER || 'notifications@r2rstudio.com'}>`;
}

const UNIFIED_EMAIL_THEME = {
  headerBg: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%)',
  headerSubtext: '#fde68a',
  badgeBg: '#fffbeb',
  badgeBorder: '#f59e0b',
  badgeText: '#92400e',
  eventBg: '#fffbeb',
  eventBorder: '#fef3c7',
  eventTitleText: '#78350f',
  totalBannerBg: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
  totalBannerText: '#fde68a',
  accentBtnBg: '#f59e0b',
  accentBtnText: '#0f172a',
  themeTitle: 'Official R2R Studio Edition'
};

const EMAIL_THEME_MAP: Record<QuotationTheme, typeof UNIFIED_EMAIL_THEME> = {
  ROYAL_GOLD: UNIFIED_EMAIL_THEME,
  ELEGANT_IVORY: UNIFIED_EMAIL_THEME,
  MINIMAL_EDITORIAL: UNIFIED_EMAIL_THEME,
  ROSE_ROMANCE: UNIFIED_EMAIL_THEME
};

/**
 * 1. Send Official Booking Confirmation Email to Client
 */
export async function sendBookingConfirmationEmail({
  to,
  clientName,
  bookingNumber,
  grandTotal,
  paidAmount = 0,
  balance = 0,
  status = 'CONFIRMED',
  events = [],
  pdfBase64,
  theme = 'ROYAL_GOLD'
}: {
  to: string;
  clientName: string;
  bookingNumber: string;
  grandTotal: number;
  paidAmount?: number;
  balance?: number;
  status?: string;
  events?: any[];
  pdfBase64?: string;
  theme?: QuotationTheme;
}) {
  if (!to || !to.includes('@')) {
    console.log(`[SMTP Mailer] Skipped sending booking confirmation email - invalid recipient: ${to}`);
    return { success: false, reason: 'Invalid email address' };
  }

  try {
    const transporter = getSmtpTransporter();
    const from = getFromEmail();
    const tm = EMAIL_THEME_MAP[theme] || EMAIL_THEME_MAP.ROYAL_GOLD;

    const formattedTotal = (grandTotal || 0).toLocaleString('en-IN');
    const formattedPaid = (paidAmount || 0).toLocaleString('en-IN');
    const formattedBalance = (balance || (grandTotal - paidAmount)).toLocaleString('en-IN');

    const eventsHtml = events.length > 0 ? events.map((be: any) => `
      <div style="background-color: ${tm.eventBg}; border: 1px solid ${tm.eventBorder}; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${tm.badgeBorder}; padding-bottom: 4px; margin-bottom: 6px;">
          <strong style="color: ${tm.eventTitleText}; font-size: 13px;">${be.event?.name || 'Shoot Session'}</strong>
          <span style="font-weight: bold; color: ${tm.badgeText}; font-size: 12px;">${be.category || 'EVENT'}</span>
        </div>
        <p style="margin: 0; font-size: 12px; color: #475569;">📅 Date: <strong>${be.eventDate}</strong> ${be.eventTime ? `at ${be.eventTime}` : ''}</p>
        ${be.venue ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">📍 Venue: ${be.venue}</p>` : ''}
      </div>
    `).join('') : '<p style="font-size: 12px; color: #64748b;">Shoot dates & sessions as per studio agreement schedule.</p>';

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Booking Confirmation - R2R Studio</title></head>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          
          <div style="background: ${tm.headerBg}; padding: 24px; text-align: center; color: #ffffff;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://studiooo.vercel.app'}/r2r-logo.png" alt="R2R Studio Logo" style="height: 55px; width: auto; max-width: 200px; margin: 0 auto 10px auto; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            <p style="margin: 4px 0 0 0; font-size: 12px; color: ${tm.headerSubtext}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Official Booking Confirmation • ${tm.themeTitle}</p>
          </div>

          <div style="padding: 24px;">
            <div style="background-color: ${tm.badgeBg}; border-left: 4px solid ${tm.badgeBorder}; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 13px; font-weight: bold; color: ${tm.badgeText};">BOOKING CONFIRMED & RESERVED!</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: ${tm.badgeText};">Booking #: ${bookingNumber} | Status: ${status}</p>
            </div>

            <p style="font-size: 15px; margin-top: 0;">Dear <strong>${clientName}</strong>,</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.5;">We are delighted to confirm your photography & cinematic video booking with <strong>R2R Studio Photography</strong>! Our creative crew is locked in for your upcoming events.</p>

            <h3 style="font-size: 13px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">Your Event Shoot Schedule</h3>
            ${eventsHtml}

            <div style="background: ${tm.totalBannerBg}; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-top: 20px; display: flex; justify-space-between; align-items: center;">
              <div>
                <p style="margin: 0; font-size: 11px; color: ${tm.totalBannerText}; font-weight: bold; text-transform: uppercase;">Total Booking Package Value</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #e2e8f0;">Advance Paid: ₹${formattedPaid} | Due: ₹${formattedBalance}</p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 22px; font-weight: 800; color: ${tm.totalBannerText};">₹${formattedTotal}/-</span>
              </div>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <a href="http://localhost:3000/dashboard/quotations?bookingId=${bookingNumber}" style="display: inline-block; background-color: ${tm.accentBtnBg}; color: ${tm.accentBtnText}; font-weight: bold; font-size: 13px; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 8px;">
                View Quotation PDF
              </a>
              <a href="http://localhost:3000/dashboard/billing" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: bold; font-size: 13px; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View Tax Invoice
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
              R2R Studio Photography • Office: Road No 3A, Tarnaka, Hyderabad • Phone: +91 9398534380
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments: any[] = [];
    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '').replace(/^data:image\/\w+;base64,/, '');
      attachments.push({
        filename: `Official_Booking_Summary_${(clientName || 'Client').replace(/\s+/g, '_')}_${bookingNumber}.pdf`,
        content: Buffer.from(cleanBase64, 'base64'),
        contentType: 'application/pdf'
      });
    } else {
      try {
        const subtotal = Math.round(grandTotal / 1.18);
        const gstAmount = grandTotal - subtotal;
        const pdfBuf = generateInvoicePdfBuffer({
          clientName,
          invoiceNumber: `INV-${bookingNumber}`,
          bookingNumber,
          subtotal,
          gstAmount,
          grandTotal,
          paidAmount,
          balance,
          events,
          theme
        });
        attachments.push({
          filename: `Official_Booking_Invoice_${(clientName || 'Client').replace(/\s+/g, '_')}_${bookingNumber}.pdf`,
          content: pdfBuf,
          contentType: 'application/pdf'
        });
      } catch (pdfErr) {
        console.error('[SMTP Mailer] Failed auto-generating booking confirmation invoice PDF:', pdfErr);
      }
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject: `Booking Confirmed! R2R Studio Photography [Ref: #${bookingNumber}]`,
      html: htmlBody,
      attachments
    });
    console.log(`[SMTP Mailer] Booking confirmation email sent to ${to} (Attachment: ${attachments.length > 0 ? 'YES' : 'NO'}). MessageId: ${info.messageId || 'OK'}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[SMTP Mailer] Error sending booking confirmation email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Send Official Quotation Email to Client
 */
export async function sendQuotationEmail({
  to,
  clientName,
  bookingNumber,
  grandTotal,
  events = [],
  quotationId,
  pdfBase64,
  theme = 'ROYAL_GOLD'
}: {
  to: string;
  clientName: string;
  bookingNumber: string;
  grandTotal: number;
  events?: any[];
  quotationId?: string;
  pdfBase64?: string;
  theme?: QuotationTheme;
}) {
  if (!to || !to.includes('@')) {
    console.log(`[SMTP Mailer] Skipped sending quotation email - invalid recipient: ${to}`);
    return { success: false, reason: 'Invalid email address' };
  }

  try {
    const transporter = getSmtpTransporter();
    const from = getFromEmail();
    const tm = EMAIL_THEME_MAP[theme] || EMAIL_THEME_MAP.ROYAL_GOLD;

    const formattedTotal = (grandTotal || 0).toLocaleString('en-IN');
    const quoteRef = quotationId ? (quotationId.startsWith('R2R-QT-') ? quotationId : `R2R-QT-${quotationId.substring(0, 6).toUpperCase()}`) : `R2R-QT-${bookingNumber}`;

    const eventsHtml = events.map((be: any) => `
      <div style="background-color: ${tm.eventBg}; border: 1px solid ${tm.eventBorder}; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${tm.badgeBorder}; padding-bottom: 6px; margin-bottom: 8px;">
          <strong style="color: ${tm.eventTitleText}; font-size: 14px;">${be.event?.name || be.name || 'Shoot Session'}</strong>
          <span style="font-weight: bold; color: ${tm.badgeText};">₹${(be.price || 0).toLocaleString('en-IN')}</span>
        </div>
        <p style="margin: 0; font-size: 12px; color: #4b5563;">Date: <strong>${be.eventDate || 'Scheduled'}</strong> ${be.eventTime ? `at ${be.eventTime}` : ''}</p>
        ${be.venue ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Venue: ${be.venue}</p>` : ''}
        ${be.deliverables && be.deliverables.length > 0 ? `
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed ${tm.badgeBorder};">
            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: bold; color: ${tm.badgeText}; text-transform: uppercase;">Included Deliverables:</p>
            <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569; line-height: 1.5;">
              ${be.deliverables.map((d: string) => `<li>${d}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `).join('');

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quotation - R2R Studio Photography</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          
          <div style="background: ${tm.headerBg}; padding: 24px; text-align: center; color: #ffffff;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://studiooo.vercel.app'}/r2r-logo.png" alt="R2R Studio Logo" style="height: 55px; width: auto; max-width: 200px; margin: 0 auto 10px auto; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            <p style="margin: 4px 0 0 0; font-size: 12px; color: ${tm.headerSubtext}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Creative Photography & Cinematic Films • ${tm.themeTitle}</p>
          </div>

          <div style="padding: 24px;">
            <div style="background-color: ${tm.badgeBg}; border-left: 4px solid ${tm.badgeBorder}; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 13px; font-weight: bold; color: ${tm.badgeText};">OFFICIAL QUOTATION ESTIMATE</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: ${tm.badgeText};">Ref: ${quoteRef} | Booking #: ${bookingNumber}</p>
            </div>

            <p style="font-size: 15px; margin-top: 0;">Dear <strong>${clientName}</strong>,</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.5;">Thank you for considering <strong>R2R Studio Photography</strong> for your special occasions! Here is your custom package quotation breakdown for your upcoming shoot events.</p>

            <h3 style="font-size: 14px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">Covered Events Breakdown</h3>
            ${eventsHtml || '<p style="font-size: 12px; color: #64748b;">Package details as per studio agreement.</p>'}

            <div style="background: ${tm.totalBannerBg}; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-top: 20px; display: flex; justify-space-between; align-items: center;">
              <div>
                <p style="margin: 0; font-size: 11px; color: ${tm.totalBannerText}; font-weight: bold; text-transform: uppercase;">Total Estimated Investment</p>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #e2e8f0;">All-Inclusive Package Estimate</p>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 22px; font-weight: 800; color: ${tm.totalBannerText};">₹${formattedTotal}/-</span>
              </div>
            </div>

            <div style="margin-top: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
              <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #334155; text-transform: uppercase;">Payment Milestone Schedule:</h4>
              <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #475569; line-height: 1.6;">
                <li><strong>30%</strong> Advance Booking Confirmation</li>
                <li><strong>50%</strong> On Main Event Shoot Date</li>
                <li><strong>20%</strong> Upon Final Album & Film Delivery</li>
              </ul>
            </div>

            <div style="margin-top: 24px; text-align: center;">
              <a href="http://localhost:3000/dashboard/quotations?bookingId=${bookingNumber}" style="display: inline-block; background-color: ${tm.accentBtnBg}; color: ${tm.accentBtnText}; font-weight: bold; font-size: 13px; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View & Print Official Quotation PDF
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
              R2R Studio Photography • Office: Road No 3A, Tarnaka, Hyderabad • Phone: +91 9398534380
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments: any[] = [];
    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '').replace(/^data:image\/\w+;base64,/, '');
      attachments.push({
        filename: `Official_Quotation_${(clientName || 'Client').replace(/\s+/g, '_')}_${quoteRef}.pdf`,
        content: Buffer.from(cleanBase64, 'base64'),
        contentType: 'application/pdf'
      });
    } else {
      try {
        const pdfBuf = generateQuotationPdfBuffer({
          clientName,
          bookingNumber,
          quotationId: quoteRef,
          grandTotal,
          events,
          theme
        });
        attachments.push({
          filename: `Official_Quotation_${(clientName || 'Client').replace(/\s+/g, '_')}_${quoteRef}.pdf`,
          content: pdfBuf,
          contentType: 'application/pdf'
        });
      } catch (pdfErr) {
        console.error('[SMTP Mailer] Failed auto-generating quotation PDF buffer:', pdfErr);
      }
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject: `Official Quotation - R2R Studio Photography [Ref: #${quoteRef}]`,
      html: htmlBody,
      attachments
    });
    console.log(`[SMTP Mailer] Quotation email sent to ${to} (Theme: ${theme}, Attachment: ${attachments.length > 0 ? 'YES' : 'NO'}). MessageId: ${info.messageId || 'OK'}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[SMTP Mailer] Error sending quotation email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Send Official Invoice / Tax Bill Email to Client
 */
export async function sendInvoiceEmail({
  to,
  clientName,
  invoiceNumber,
  bookingNumber,
  subtotal,
  gstAmount,
  grandTotal,
  paidAmount,
  balance,
  events = [],
  pdfBase64,
  theme = 'ROYAL_GOLD'
}: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  bookingNumber: string;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  paidAmount: number;
  balance: number;
  events?: any[];
  pdfBase64?: string;
  theme?: QuotationTheme;
}) {
  if (!to || !to.includes('@')) {
    console.log(`[SMTP Mailer] Skipped sending invoice email - invalid recipient: ${to}`);
    return { success: false, reason: 'Invalid email address' };
  }

  try {
    const transporter = getSmtpTransporter();
    const from = getFromEmail();
    const tm = EMAIL_THEME_MAP[theme] || EMAIL_THEME_MAP.ROYAL_GOLD;

    const eventsHtml = events.length > 0 ? events.map((be: any) => `
      <div style="background-color: ${tm.eventBg}; border: 1px solid ${tm.eventBorder}; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: ${tm.eventTitleText}; font-size: 13px;">${be.event?.name || be.name || 'Shoot Session'}</strong>
          <span style="font-size: 11px; font-weight: bold; color: ${tm.badgeText};">${be.category || 'EVENT'}</span>
        </div>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">📅 Date: <strong>${be.eventDate || 'Scheduled'}</strong> ${be.eventTime ? `at ${be.eventTime}` : ''}</p>
        ${be.venue ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">📍 Venue: ${be.venue}</p>` : ''}
      </div>
    `).join('') : '';

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Tax Invoice & Bill Summary - R2R Studio</title></head>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          
          <div style="background: ${tm.headerBg}; padding: 24px; text-align: center; color: #ffffff;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://studiooo.vercel.app'}/r2r-logo.png" alt="R2R Studio Logo" style="height: 55px; width: auto; max-width: 200px; margin: 0 auto 10px auto; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            <p style="margin: 4px 0 0 0; font-size: 12px; color: ${tm.headerSubtext}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Invoice #: ${invoiceNumber} | Booking #: ${bookingNumber} • ${tm.themeTitle}</p>
          </div>

          <div style="padding: 24px;">
            <p style="font-size: 15px; margin-top: 0;">Dear <strong>${clientName}</strong>,</p>
            <p style="font-size: 13px; color: #475569;">Please find your official tax invoice, bill summary, and covered event shoot schedule from R2R Studio Photography attached as a PDF and detailed below:</p>

            ${eventsHtml ? `
              <h3 style="font-size: 13px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">Covered Event Shoot Schedule</h3>
              ${eventsHtml}
            ` : ''}

            <h3 style="font-size: 13px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">Financial Bill Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Subtotal:</td><td style="text-align: right; font-weight: bold;">₹${(subtotal || 0).toLocaleString('en-IN')}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">GST Amount (18%):</td><td style="text-align: right; font-weight: bold;">₹${(gstAmount || 0).toLocaleString('en-IN')}</td></tr>
              <tr style="border-bottom: 2px solid #0f172a;"><td style="padding: 10px 0; font-weight: bold; color: #0f172a;">Grand Total:</td><td style="text-align: right; font-weight: 800; font-size: 15px; color: #0f172a;">₹${(grandTotal || 0).toLocaleString('en-IN')}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #059669; font-weight: bold;">Amount Paid to Date:</td><td style="text-align: right; color: #059669; font-weight: bold;">₹${(paidAmount || 0).toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 10px 0; font-weight: bold; color: #dc2626;">Outstanding Balance:</td><td style="text-align: right; font-weight: 800; font-size: 15px; color: #dc2626;">₹${(balance || 0).toLocaleString('en-IN')}</td></tr>
            </table>

            <div style="margin-top: 24px; text-align: center;">
              <a href="http://localhost:3000/dashboard/billing" style="display: inline-block; background-color: ${tm.accentBtnBg}; color: ${tm.accentBtnText}; font-weight: bold; font-size: 13px; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View & Print Official Bill PDF
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
              R2R Studio Photography • Office: Road No 3A, Tarnaka, Hyderabad • Phone: +91 9398534380
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments: any[] = [];
    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '').replace(/^data:image\/\w+;base64,/, '');
      attachments.push({
        filename: `Official_Bill_${(clientName || 'Client').replace(/\s+/g, '_')}_${invoiceNumber}.pdf`,
        content: Buffer.from(cleanBase64, 'base64'),
        contentType: 'application/pdf'
      });
    } else {
      try {
        const pdfBuf = generateInvoicePdfBuffer({
          clientName,
          invoiceNumber,
          bookingNumber,
          subtotal,
          gstAmount,
          grandTotal,
          paidAmount,
          balance,
          events,
          theme
        });
        attachments.push({
          filename: `Official_Bill_${(clientName || 'Client').replace(/\s+/g, '_')}_${invoiceNumber}.pdf`,
          content: pdfBuf,
          contentType: 'application/pdf'
        });
      } catch (pdfErr) {
        console.error('[SMTP Mailer] Failed auto-generating invoice PDF buffer:', pdfErr);
      }
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject: `Official Tax Invoice & Bill - R2R Studio [#${invoiceNumber}]`,
      html: htmlBody,
      attachments
    });
    console.log(`[SMTP Mailer] Invoice email sent to ${to} (Theme: ${theme}, Attachment: ${attachments.length > 0 ? 'YES' : 'NO'}). MessageId: ${info.messageId || 'OK'}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[SMTP Mailer] Error sending invoice email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Send 1-Day Pre-Shoot Reminder to Client (With Assigned Crew List)
 */
export async function sendClientPreShootReminder({
  to,
  clientName,
  eventName,
  eventDate,
  eventTime,
  venue,
  crew = []
}: {
  to: string;
  clientName: string;
  eventName: string;
  eventDate: string;
  eventTime?: string;
  venue?: string;
  crew: Array<{ name: string; role: string; phone?: string; employmentType?: string }>;
}) {
  if (!to || !to.includes('@')) {
    console.log(`[SMTP Mailer] Skipped sending client reminder email - invalid email: ${to}`);
    return { success: false, reason: 'Invalid email address' };
  }

  try {
    const transporter = getSmtpTransporter();
    const from = getFromEmail();

    const crewHtml = crew.map((c) => `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #0f172a; font-size: 13px;">${c.name}</strong>
          <span style="font-size: 10px; font-weight: bold; background-color: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px;">${(c.role || 'CREW').replace('_', ' ')}</span>
        </div>
        ${c.phone ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">📞 Phone: <strong>${c.phone}</strong></p>` : ''}
      </div>
    `).join('');

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Tomorrow Shoot Reminder - R2R Studio</title></head>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; text-align: center; color: #ffffff;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://studiooo.vercel.app'}/r2r-logo.png" alt="R2R Studio Logo" style="height: 50px; width: auto; max-width: 180px; margin: 0 auto 8px auto; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #a7f3d0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Shoot Reminder & Crew Assignment Alert</p>
          </div>

          <div style="padding: 24px;">
            <p style="font-size: 15px; margin-top: 0;">Dear <strong>${clientName}</strong>,</p>
            <p style="font-size: 13px; color: #475569;">This is a friendly reminder that your shoot event <strong>${eventName}</strong> is scheduled for tomorrow!</p>

            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0; font-size: 13px; font-weight: bold; color: #065f46;">EVENT SHOOT SCHEDULE</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #047857;">📅 Date: <strong>${eventDate}</strong> | ⏰ Time: <strong>${eventTime || '09:00 AM'}</strong></p>
              ${venue ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #047857;">📍 Location: <strong>${venue}</strong></p>` : ''}
            </div>

            <h3 style="font-size: 13px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">Your Assigned Studio Crew Members:</h3>
            ${crewHtml || '<p style="font-size: 12px; color: #64748b;">Studio lead crew will arrive on location ahead of schedule.</p>'}

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
              R2R Studio Photography • Office: Road No 3A, Tarnaka, Hyderabad • Phone: +91 9398534380
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from,
      to,
      subject: `Reminder: Your R2R Studio Shoot (${eventName}) is Tomorrow! 📸`,
      html: htmlBody,
    });
    console.log(`[SMTP Mailer] Pre-shoot client reminder sent to ${to}. MessageId: ${info.messageId || 'OK'}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[SMTP Mailer] Error sending client reminder to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 5. Send 1-Day Pre-Shoot Call Sheet Reminder to Crew Member
 */
export async function sendCrewPreShootReminder({
  to,
  crewName,
  dutyRole,
  eventName,
  eventDate,
  eventTime,
  venue,
  clientName,
  clientPhone
}: {
  to: string;
  crewName: string;
  dutyRole: string;
  eventName: string;
  eventDate: string;
  eventTime?: string;
  venue?: string;
  clientName?: string;
  clientPhone?: string;
}) {
  if (!to || !to.includes('@')) {
    console.log(`[SMTP Mailer] Skipped sending crew reminder - invalid email: ${to}`);
    return { success: false, reason: 'Invalid email' };
  }

  try {
    const transporter = getSmtpTransporter();
    const from = getFromEmail();

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Tomorrow Call Sheet - R2R Studio</title></head>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
          
          <div style="background-color: #1e1b4b; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 18px; font-weight: 800; color: #818cf8;">CALL SHEET REMINDER: TOMORROW SHOOT 🎬</h1>
          </div>

          <div style="padding: 24px;">
            <p style="font-size: 14px; margin-top: 0;">Hi <strong>${crewName}</strong>,</p>
            <p style="font-size: 13px; color: #475569;">You are assigned as <strong>${dutyRole.replace('_', ' ')}</strong> for an upcoming shoot scheduled tomorrow.</p>

            <div style="background-color: #e0e7ff; border-left: 4px solid #4f46e5; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0; font-size: 13px; font-weight: bold; color: #312e81;">${eventName}</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #3730a3;">📅 Date: <strong>${eventDate}</strong> | ⏰ Time: <strong>${eventTime || '09:00 AM'}</strong></p>
              ${venue ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #3730a3;">📍 Location: <strong>${venue}</strong></p>` : ''}
              ${clientName ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #3730a3;">👤 Client: <strong>${clientName}</strong> ${clientPhone ? `(${clientPhone})` : ''}</p>` : ''}
            </div>

            <p style="font-size: 12px; color: #64748b;">Please arrive on location at least 15 minutes before the reporting time with charged batteries & formatted SD cards.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from,
      to,
      subject: `Call Sheet Reminder: Tomorrow Shoot (${eventName}) 🎬`,
      html: htmlBody,
    });
    console.log(`[SMTP Mailer] Pre-shoot crew reminder sent to ${to}. MessageId: ${info.messageId || 'OK'}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[SMTP Mailer] Error sending crew reminder to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
