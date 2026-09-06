import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export type QuotationTheme = 'ROYAL_GOLD' | 'ELEGANT_IVORY' | 'MINIMAL_EDITORIAL' | 'ROSE_ROMANCE';

export interface PdfEventItem {
  name?: string;
  category?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  price?: number;
  event?: { name: string };
  deliverables?: string[];
}

export interface DynamicSectionItem {
  title?: string;
  content: string;
}

export interface DynamicSection {
  id?: string;
  title: string;
  badge?: string;
  items: DynamicSectionItem[];
}

const DEFAULT_DYNAMIC_SECTIONS: DynamicSection[] = [
  {
    title: 'Detailed Album Printing & Physical Specifications',
    badge: 'Handcrafted Quality',
    items: [
      { title: '📖 Primary Royal Photobook Album', content: '1 Master Royal Photobook (40-50 Sheets / 100 Pages) in Premium Non-Tearable Velvet Matte / Silk Finish with Handcrafted Leatherette Case.' },
      { title: '🖼️ Family Albums & Wall Canvas Prints', content: '2 Mini Replica Parent Albums (20 Sheets each) + 1 Luxury 24" x 36" Enlarged Acrylic Wall Frame.' },
      { title: '🎬 Cinematic Video & Teasers', content: '4K Ultra HD Cinematic Teaser + Full Length HD Edited Film (60-90 min).' },
      { title: '💾 Data Drive & Cloud Gallery', content: '1 Custom Engraved 128GB USB 3.2 Flash Drive + 1 Year Cloud Gallery Access.' }
    ]
  },
  {
    title: 'Studio Data Security, Backup & Privacy Safeguards',
    badge: '100% Data Safety',
    items: [
      { title: '📷 Dual Card Slot Redundant Recording', content: 'Every camera shot with real-time dual card recording to eliminate memory card failure risks.' },
      { title: '💾 Triple RAID NAS & Cloud Vault', content: 'Raw data backed up across dual RAID local NAS servers + offsite encrypted cloud storage.' },
      { title: '⚡ On-Site Equipment Redundancy', content: 'Backup camera bodies, prime lenses & wireless microphones brought standby to every event.' }
    ]
  }
];

const DEFAULT_TERMS: string[] = [
  'Travel & luxury accommodation for outstation events to be provided by the client.',
  'Includes 1 master premium flush-mount album (40 sheets). Additional sheets charged at ₹650/sheet.',
  'High-resolution edited RAW photos delivered via private Cloud Gallery link.',
  'Deliverable timeline: 30-45 business days post client photo selection.',
  '50% advance non-refundable deposit required to lock studio booking dates.'
];

interface ThemeHtmlConfig {
  headerBg: string;
  headerSubtext: string;
  pageBg: string;
  cardBg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  totalBannerBg: string;
  totalBannerText: string;
  accentBtnBg: string;
  accentBtnText: string;
  badgeName: string;
}

const STUDIO_UNIFIED_THEME: ThemeHtmlConfig = {
  headerBg: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%)',
  headerSubtext: '#fde68a',
  pageBg: '#ffffff',
  cardBg: '#ffffff',
  badgeBg: '#fffbeb',
  badgeBorder: '#f59e0b',
  badgeText: '#92400e',
  totalBannerBg: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
  totalBannerText: '#fde68a',
  accentBtnBg: '#f59e0b',
  accentBtnText: '#0f172a',
  badgeName: 'R2R STUDIO LUXURY EDITION'
};

const THEME_HTML_MAP: Record<QuotationTheme, ThemeHtmlConfig> = {
  ROYAL_GOLD: STUDIO_UNIFIED_THEME,
  ELEGANT_IVORY: STUDIO_UNIFIED_THEME,
  MINIMAL_EDITORIAL: STUDIO_UNIFIED_THEME,
  ROSE_ROMANCE: STUDIO_UNIFIED_THEME
};

/**
 * Load r2r-logo.png as base64 Data URL for Chrome PDF rendering
 */
function getR2RLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'r2r-logo.png');
    if (fs.existsSync(logoPath)) {
      const buf = fs.readFileSync(logoPath);
      return 'data:image/png;base64,' + buf.toString('base64');
    }
  } catch (e) {}
  return '';
}

/**
 * Locate Chrome or Edge executable on host system
 */
function getBrowserExecutablePath(): string | null {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

/**
 * Render complete HTML string to PDF buffer using Chrome/Edge headless
 */
function renderHtmlToPdfBuffer(htmlContent: string): Buffer {
  const browserPath = getBrowserExecutablePath();
  if (!browserPath) {
    throw new Error('Chrome/Edge browser executable not found on host machine.');
  }

  const tmpDir = os.tmpdir();
  const randomId = Math.floor(Math.random() * 1000000);
  const htmlPath = path.join(tmpDir, `r2r_doc_${randomId}.html`);
  const pdfPath = path.join(tmpDir, `r2r_doc_${randomId}.pdf`);

  try {
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');

    execFileSync(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--no-pdf-header-footer',
      '--print-to-pdf=' + pdfPath,
      'file:///' + htmlPath.replace(/\\/g, '/')
    ]);

    if (fs.existsSync(pdfPath)) {
      const pdfBuffer = fs.readFileSync(pdfPath);
      try { fs.unlinkSync(htmlPath); } catch (e) {}
      try { fs.unlinkSync(pdfPath); } catch (e) {}
      return pdfBuffer;
    } else {
      throw new Error('Chrome did not output PDF file.');
    }
  } catch (err: any) {
    try { if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath); } catch (e) {}
    try { if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath); } catch (e) {}
    throw err;
  }
}

/**
 * Generates an Official Quotation PDF Buffer matching the exact QuotationTemplate UI Editor layout!
 */
export function generateQuotationPdfBuffer(params: {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  bookingNumber: string;
  quotationId?: string;
  grandTotal: number;
  events?: PdfEventItem[];
  createdAt?: string;
  theme?: QuotationTheme;
  terms?: string[];
  dynamicSections?: DynamicSection[];
}): Buffer {
  const {
    clientName,
    clientEmail = '',
    clientPhone = '',
    clientAddress = '',
    bookingNumber,
    quotationId = 'QT-2026',
    grandTotal,
    events = [],
    createdAt = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    theme = 'ROYAL_GOLD',
    terms = DEFAULT_TERMS,
    dynamicSections = DEFAULT_DYNAMIC_SECTIONS
  } = params;

  const quoteRef = quotationId.startsWith('R2R-QT-') ? quotationId : `R2R-QT-${quotationId.substring(0, 6).toUpperCase()}`;
  const tm = THEME_HTML_MAP[theme] || THEME_HTML_MAP.ROYAL_GOLD;
  const logoBase64 = getR2RLogoBase64();

  const eventList = events.length > 0 ? events : [
    {
      name: 'Pre-Wedding Shoot Session',
      category: 'PRE_SHOOT',
      eventDate: '2026-10-15',
      eventTime: '06:30 AM',
      venue: 'Ramoji Film City, Hyderabad',
      price: 50000,
      deliverables: ['1 Candid Photographer', '1 Cinematic Videographer', '20 Sheets Luxury Album', 'Cinematic Teaser Trailer']
    },
    {
      name: 'Wedding & Reception Ceremony',
      category: 'CINEMATIC',
      eventDate: '2026-10-20',
      eventTime: '09:00 AM',
      venue: 'Novotel Convention Center, Hyderabad',
      price: 300000,
      deliverables: ['1 Candid Photographer', '1 Cinematic Videographer', '1 Traditional Photographer', '1 Traditional Videographer', '50 Sheets Royal Album', '4K Teaser & Film', '2 Instagram Reels']
    }
  ];

  const eventsHtml = eventList.map((item) => {
    const eventTitle = item.event?.name || item.name || 'Shoot Session';
    const cat = item.category || 'EVENT';
    const dateStr = `${item.eventDate || ''} ${item.eventTime ? `@ ${item.eventTime}` : ''}`.trim() || 'Scheduled';
    const priceVal = item.price ? `₹${item.price.toLocaleString('en-IN')}` : '-';
    const deliverables = item.deliverables || ['1 Candid Photographer', '1 Cinematic Videographer', 'Edited HD Album & Film'];

    const delivItemsHtml = deliverables.map(d => `<li style="margin-bottom: 4px;">✔ ${d}</li>`).join('');

    return `
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-left: 5px solid ${tm.borderLeftColor}; border-radius: 5px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px;">
          <div>
            <span style="font-size: 16px; font-weight: 800; color: #0f172a;">${eventTitle}</span>
            <span style="margin-left: 10px; font-size: 11px; font-weight: bold; background-color: ${tm.badgeBg}; color: ${tm.badgeText}; border: 1px solid ${tm.badgeBorder}; padding: 3px 8px; border-radius: 5px; text-transform: uppercase;">${cat}</span>
          </div>
          <div style="font-size: 18px; font-weight: 800; color: ${tm.borderLeftColor};">
            ${priceVal}
          </div>
        </div>

        <div style="display: flex; gap: 20px; font-size: 12px; color: #475569; margin-bottom: 12px;">
          <div>📅 Date: <strong>${dateStr}</strong></div>
          ${item.venue ? `<div>📍 Venue: <strong>${item.venue}</strong></div>` : ''}
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 12px;">
          <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">Session Deliverables Included:</p>
          <ul style="margin: 0; padding-left: 0; list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px; color: #334155;">
            ${delivItemsHtml}
          </ul>
        </div>
      </div>
    `;
  }).join('');

  const dynamicSectionsHtml = dynamicSections.map((sec) => {
    const itemsHtml = sec.items.map(item => `
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 5px; padding: 10px 14px; margin-bottom: 8px;">
        ${item.title ? `<p style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #0f172a;">• ${item.title}</p>` : ''}
        <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">${item.content}</p>
      </div>
    `).join('');

    return `
      <div style="margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${tm.badgeBorder}; padding-bottom: 6px; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">${sec.title}</h3>
          ${sec.badge ? `<span style="font-size: 11px; font-weight: bold; background-color: ${tm.badgeBg}; color: ${tm.badgeText}; border: 1px solid ${tm.badgeBorder}; padding: 3px 10px; border-radius: 5px;">${sec.badge}</span>` : ''}
        </div>
        ${itemsHtml}
      </div>
    `;
  }).join('');

  const termsHtml = terms.map((term, idx) => `
    <li style="margin-bottom: 6px; font-size: 12px; color: #475569; line-height: 1.5;">${term}</li>
  `).join('');

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quotation - R2R Studio Photography</title>
      <style>
        @page { size: A4; margin: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${tm.pageBg}; margin: 0; padding: 0; color: #1e293b; webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page { width: 210mm; min-height: 297mm; padding: 18mm; box-sizing: border-box; background-color: ${tm.pageBg}; margin: 0 auto; position: relative; }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header Banner WITH LOGO IMAGE -->
        <div style="background: ${tm.headerBg}; padding: 22px 28px; border-radius: 5px; color: #ffffff; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">R2R STUDIO PHOTOGRAPHY</h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: ${tm.headerSubtext}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Creative Photography & Cinematic Films • ${tm.badgeName}</p>
            </div>
            <div style="text-align: right;">
              ${logoBase64 
                ? `<img src="${logoBase64}" style="height: 75px; width: auto; max-width: 250px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" alt="R2R Studio Logo" />`
                : `<div style="background: rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.25); font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">OFFICIAL QUOTATION</div>`
              }
            </div>
          </div>
        </div>

        <!-- Document Title Box (Side border removed) -->
        <div style="background-color: ${tm.badgeBg}; border: 1px solid ${tm.badgeBorder}; padding: 14px 20px; border-radius: 5px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: ${tm.badgeText}; text-transform: uppercase; letter-spacing: 0.5px;">OFFICIAL PHOTOGRAPHY QUOTATION</h2>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: ${tm.badgeText};">Ref: ${quoteRef} | Booking #: ${bookingNumber}</p>
          </div>
          <div style="text-align: right; font-size: 12px; font-weight: bold; color: ${tm.badgeText};">
            Date: ${createdAt}
          </div>
        </div>

        <!-- Client & Quotation Info Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 5px; padding: 16px;">
            <p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">PREPARED FOR CLIENT:</p>
            <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #0f172a;">${clientName}</h3>
            ${clientPhone ? `<p style="margin: 0 0 2px 0; font-size: 12px; color: #475569;">📞 Phone: ${clientPhone}</p>` : ''}
            ${clientEmail ? `<p style="margin: 0 0 2px 0; font-size: 12px; color: #475569;">✉ Email: ${clientEmail}</p>` : ''}
            ${clientAddress ? `<p style="margin: 0; font-size: 12px; color: #475569;">📍 Location: ${clientAddress}</p>` : ''}
          </div>
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 5px; padding: 16px;">
            <p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">QUOTATION DETAILS:</p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569;">Booking Reference: <strong>${bookingNumber}</strong></p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569;">Quotation Date: <strong>${createdAt}</strong></p>
            <p style="margin: 0; font-size: 12px; color: ${tm.borderLeftColor}; font-weight: bold;">Validity: 30 Days Lock Period</p>
          </div>
        </div>

        <!-- Events Breakdown & Deliverables -->
        <h3 style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 24px 0 16px 0;">Covered Events Package Breakdown</h3>
        ${eventsHtml}

        <!-- Total Investment Banner & Payment Milestones -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; margin-top: 24px;">
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 5px; padding: 16px;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase;">Payment Milestone Schedule:</h4>
            <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #475569; line-height: 1.6;">
              <li><strong>30%</strong> Advance Deposit to Lock Booking Date</li>
              <li><strong>50%</strong> Payable on Main Event Shoot Date</li>
              <li><strong>20%</strong> Upon Final Album & Film Delivery</li>
            </ul>
          </div>
          <div style="background: ${tm.totalBannerBg}; border-radius: 5px; padding: 20px; color: #ffffff; display: flex; flex-direction: column; justify-content: center; text-align: right; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="margin: 0; font-size: 11px; color: ${tm.totalBannerText}; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL ESTIMATED INVESTMENT</p>
            <p style="margin: 6px 0 0 0; font-size: 26px; font-weight: 900; color: ${tm.totalBannerText};">₹${grandTotal.toLocaleString('en-IN')}/-</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #f1f5f9;">All Taxes & Travel Included</p>
          </div>
        </div>

        <!-- Dynamic Custom Sections (Album Specs & Security Safeguards) -->
        ${dynamicSectionsHtml}

        <!-- Terms & Conditions -->
        <div style="margin-top: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 5px; padding: 16px;">
          <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">Terms & Conditions Agreement</h3>
          <ol style="margin: 0; padding-left: 20px;">
            ${termsHtml}
          </ol>
        </div>

        <!-- Footer Sign-off -->
        <div style="margin-top: 36px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">Official R2R Studio Photography quotation document.</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8;">Looking forward to capturing your cherished memories!</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #0f172a;">R2R Studio Photography Team</p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return renderHtmlToPdfBuffer(fullHtml);
}

/**
 * Generates an Official Tax Invoice / Bill PDF Buffer matching the exact QuotationTemplate UI Editor layout!
 */
export function generateInvoicePdfBuffer(params: {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  invoiceNumber: string;
  bookingNumber: string;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  paidAmount: number;
  balance: number;
  events?: PdfEventItem[];
  createdAt?: string;
  theme?: QuotationTheme;
}): Buffer {
  const {
    clientName,
    clientEmail = '',
    clientPhone = '',
    clientAddress = '',
    invoiceNumber,
    bookingNumber,
    subtotal,
    gstAmount,
    grandTotal,
    paidAmount,
    balance,
    events = [],
    createdAt = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    theme = 'ROYAL_GOLD'
  } = params;

  const tm = THEME_HTML_MAP[theme] || THEME_HTML_MAP.ROYAL_GOLD;
  const logoBase64 = getR2RLogoBase64();

  const eventList = events.length > 0 ? events : [
    { name: 'Photography & Cinematic Video Services', category: 'WEDDING', eventDate: 'As Agreed', price: subtotal }
  ];

  const eventsHtml = eventList.map((item) => {
    const eventTitle = item.event?.name || item.name || 'Shoot Session';
    const cat = item.category || 'EVENT';
    const dateStr = `${item.eventDate || ''} ${item.eventTime ? `@ ${item.eventTime}` : ''}`.trim() || 'Scheduled';
    const priceVal = item.price ? `₹${item.price.toLocaleString('en-IN')}` : '-';

    return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px; font-weight: bold; color: #0f172a;">${eventTitle}</td>
        <td style="padding: 12px; color: #475569;"><span style="background-color: ${tm.badgeBg}; color: ${tm.badgeText}; border: 1px solid ${tm.badgeBorder}; padding: 2px 8px; border-radius: 5px; font-size: 11px; font-weight: bold;">${cat}</span></td>
        <td style="padding: 12px; color: #475569; font-size: 12px;">${dateStr}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; color: #0f172a;">${priceVal}</td>
      </tr>
    `;
  }).join('');

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tax Invoice - R2R Studio Photography</title>
      <style>
        @page { size: A4; margin: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${tm.pageBg}; margin: 0; padding: 0; color: #1e293b; webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page { width: 210mm; min-height: 297mm; padding: 18mm; box-sizing: border-box; background-color: ${tm.pageBg}; margin: 0 auto; position: relative; }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header Banner WITH LOGO IMAGE -->
        <div style="background: ${tm.headerBg}; padding: 22px 28px; border-radius: 5px; color: #ffffff; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">R2R STUDIO PHOTOGRAPHY</h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: ${tm.headerSubtext}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Official Tax Invoice & Bill Statement • ${tm.badgeName}</p>
            </div>
            <div style="text-align: right;">
              ${logoBase64 
                ? `<img src="${logoBase64}" style="height: 75px; width: auto; max-width: 250px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" alt="R2R Studio Logo" />`
                : `<div style="background: rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.25); font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">TAX INVOICE & BILL</div>`
              }
            </div>
          </div>
        </div>

        <!-- Document Title Box (Side border removed) -->
        <div style="background-color: ${tm.badgeBg}; border: 1px solid ${tm.badgeBorder}; padding: 14px 20px; border-radius: 5px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: ${tm.badgeText}; text-transform: uppercase; letter-spacing: 0.5px;">TAX INVOICE & BILL SUMMARY</h2>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: ${tm.badgeText};">Invoice #: ${invoiceNumber} | Booking #: ${bookingNumber}</p>
          </div>
          <div style="text-align: right; font-size: 12px; font-weight: bold; color: ${tm.badgeText};">
            Invoice Date: ${createdAt}
          </div>
        </div>

        <!-- Client & Invoice Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 5px; padding: 16px;">
            <p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">BILLED TO CLIENT:</p>
            <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #0f172a;">${clientName}</h3>
            ${clientPhone ? `<p style="margin: 0 0 2px 0; font-size: 12px; color: #475569;">📞 Phone: ${clientPhone}</p>` : ''}
            ${clientEmail ? `<p style="margin: 0 0 2px 0; font-size: 12px; color: #475569;">✉ Email: ${clientEmail}</p>` : ''}
            ${clientAddress ? `<p style="margin: 0; font-size: 12px; color: #475569;">📍 Address: ${clientAddress}</p>` : ''}
          </div>
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 5px; padding: 16px;">
            <p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">INVOICE DETAILS:</p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569;">Booking Reference: <strong>${bookingNumber}</strong></p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569;">HSN/SAC Code: <strong>998381 (Photography Services)</strong></p>
            <p style="margin: 0; font-size: 12px; color: ${balance <= 0 ? '#059669' : '#b45309'}; font-weight: bold;">Status: ${balance <= 0 ? 'FULLY PAID' : (paidAmount > 0 ? 'PARTIALLY PAID' : 'UNPAID')}</p>
          </div>
        </div>

        <!-- Events Table -->
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 5px; overflow: hidden; margin-bottom: 24px; font-size: 13px;">
          <thead>
            <tr style="background: ${tm.headerBg}; color: #ffffff; text-align: left;">
              <th style="padding: 12px;">Shoot Session</th>
              <th style="padding: 12px;">Category</th>
              <th style="padding: 12px;">Date</th>
              <th style="padding: 12px; text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${eventsHtml}
          </tbody>
        </table>

        <!-- Totals & Bank Details Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 16px; margin-top: 24px;">
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 5px; padding: 16px;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase;">Payment Bank Details:</h4>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569;">Account Name: <strong>R2R Studio Photography</strong></p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569;">Bank: <strong>HDFC Bank (Tarnaka Branch)</strong></p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569;">Account #: <strong>50200012345678</strong></p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569;">IFSC Code: <strong>HDFC0001234</strong></p>
            <p style="margin: 0; font-size: 12px; color: ${tm.borderLeftColor}; font-weight: bold;">UPI ID: r2rstudio@hdfcbank</p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 5px; padding: 16px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">Subtotal Amount:</td><td style="text-align: right; font-weight: bold;">₹${subtotal.toLocaleString('en-IN')}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #64748b;">GST (18% Included):</td><td style="text-align: right; font-weight: bold;">₹${gstAmount.toLocaleString('en-IN')}</td></tr>
              <tr style="border-bottom: 2px solid #0f172a;"><td style="padding: 8px 0; font-weight: 800; color: #0f172a; font-size: 14px;">Grand Total:</td><td style="text-align: right; font-weight: 900; font-size: 16px; color: ${tm.borderLeftColor};">₹${grandTotal.toLocaleString('en-IN')}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 6px 0; color: #059669; font-weight: bold;">Advance Paid:</td><td style="text-align: right; color: #059669; font-weight: bold;">₹${paidAmount.toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 800; color: #dc2626; font-size: 14px;">Balance Due:</td><td style="text-align: right; font-weight: 900; font-size: 16px; color: #dc2626;">₹${balance.toLocaleString('en-IN')}</td></tr>
            </table>
          </div>
        </div>

        <!-- Footer Sign-off -->
        <div style="margin-top: 36px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">Computer generated tax invoice statement.</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8;">Thank you for choosing R2R Studio Photography!</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #0f172a;">For R2R Studio Photography</p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return renderHtmlToPdfBuffer(fullHtml);
}
