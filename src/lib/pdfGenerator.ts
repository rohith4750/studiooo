import { jsPDF } from 'jspdf';

export interface PdfEventItem {
  name?: string;
  category?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  price?: number;
  event?: { name: string };
}

/**
 * Generates an Official Tax Invoice / Bill PDF Buffer using jsPDF
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
}): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

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
    createdAt = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } = params;

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(245, 158, 11); // #f59e0b
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('R2R STUDIO PHOTOGRAPHY', 14, 16);

  doc.setTextColor(226, 232, 240); // #e2e8f0
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Road No 3A, Tarnaka, Hyderabad • Phone: +91 9398534380 • Email: info@r2rstudio.com', 14, 23);
  doc.text('GSTIN: 36ABCDE1234F1Z5 • Official Tax Invoice & Bill Statement', 14, 29);

  // Document Title Box
  doc.setFillColor(241, 245, 249); // #f1f5f9
  doc.rect(14, 42, 182, 14, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 42, 182, 14, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TAX INVOICE & BILL SUMMARY', 18, 51);

  doc.setTextColor(180, 83, 9);
  doc.setFontSize(10);
  doc.text(`INVOICE #: ${invoiceNumber}`, 145, 51);

  // Client & Invoice Metadata Box
  let y = 62;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, 90, 32, 'S');
  doc.rect(106, y, 90, 32, 'S');

  // Left: Billed To
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO:', 18, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(clientName, 18, y + 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  if (clientPhone) doc.text(`Phone: ${clientPhone}`, 18, y + 19);
  if (clientEmail) doc.text(`Email: ${clientEmail}`, 18, y + 24);
  if (clientAddress) doc.text(`Address: ${clientAddress.substring(0, 40)}`, 18, y + 29);

  // Right: Invoice Details
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE METADATA:', 110, y + 6);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Booking Ref:`, 110, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(bookingNumber, 150, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice Date:`, 110, y + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(createdAt, 150, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Status:`, 110, y + 25);
  doc.setFont('helvetica', 'bold');
  const statusStr = balance <= 0 ? 'FULLY PAID' : (paidAmount > 0 ? 'PARTIALLY PAID' : 'UNPAID');
  doc.setTextColor(balance <= 0 ? 5 : 180, balance <= 0 ? 150 : 83, balance <= 0 ? 105 : 9);
  doc.text(statusStr, 150, y + 25);

  // Covered Events Table Header
  y = 100;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('EVENT SHOOT SESSION', 18, y + 5.5);
  doc.text('CATEGORY', 90, y + 5.5);
  doc.text('DATE & TIME', 125, y + 5.5);
  doc.text('AMOUNT (₹)', 170, y + 5.5);

  y += 8;

  // Event Table Rows
  const eventRows = events.length > 0 ? events : [
    { name: 'Photography & Cinematic Video Services', category: 'WEDDING', eventDate: 'As Agreed', price: subtotal }
  ];

  eventRows.forEach((item, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(14, y, 182, 10, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 10, 196, y + 10);

    const eventTitle = item.event?.name || item.name || 'Shoot Session';
    const cat = item.category || 'EVENT';
    const dateStr = `${item.eventDate || ''} ${item.eventTime ? `@ ${item.eventTime}` : ''}`.trim() || 'Scheduled';
    const amountVal = item.price ? `₹${item.price.toLocaleString('en-IN')}` : '-';

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(eventTitle.substring(0, 32), 18, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(cat, 90, y + 6.5);
    doc.text(dateStr.substring(0, 24), 125, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(amountVal, 170, y + 6.5);

    y += 10;
  });

  // Space before totals box
  y = Math.max(y + 8, 145);

  // Summary Financial Box (Right Side)
  const totalsX = 110;
  const totalsWidth = 86;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(totalsX, y, totalsWidth, 42, 'F');
  doc.rect(totalsX, y, totalsWidth, 42, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  // Subtotal
  doc.text('Subtotal Amount:', totalsX + 6, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`₹${subtotal.toLocaleString('en-IN')}`, totalsX + 54, y + 7);

  // GST
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('GST (18% Included):', totalsX + 6, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`₹${gstAmount.toLocaleString('en-IN')}`, totalsX + 54, y + 14);

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX + 4, y + 18, totalsX + totalsWidth - 4, y + 18);

  // Grand Total
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', totalsX + 6, y + 25);
  doc.setTextColor(180, 83, 9);
  doc.text(`₹${grandTotal.toLocaleString('en-IN')}`, totalsX + 50, y + 25);

  // Advance Paid
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(5, 150, 105);
  doc.text('Advance Paid:', totalsX + 6, y + 32);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${paidAmount.toLocaleString('en-IN')}`, totalsX + 54, y + 32);

  // Balance Due
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('Balance Due:', totalsX + 6, y + 38);
  doc.text(`₹${balance.toLocaleString('en-IN')}`, totalsX + 54, y + 38);

  // Payment Terms & Bank Info (Left Side)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, 90, 42, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PAYMENT DETAILS & TERMS', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('• Account Name: R2R Studio Photography', 18, y + 14);
  doc.text('• Bank: HDFC Bank • Branch: Tarnaka', 18, y + 20);
  doc.text('• A/C No: 50200012345678 • IFSC: HDFC0001234', 18, y + 26);
  doc.text('• UPI ID: r2rstudio@hdfcbank', 18, y + 32);
  doc.text('• All payments are non-refundable.', 18, y + 37);

  // Footer & Authorized Signature Box
  const footerY = 250;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, 196, footerY);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text('Computer generated invoice. No physical signature required for validation.', 14, footerY + 6);
  doc.text('Thank you for choosing R2R Studio Photography!', 14, footerY + 11);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('For R2R Studio Photography', 145, footerY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory', 145, footerY + 12);

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

/**
 * Generates an Official Quotation PDF Buffer using jsPDF
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
}): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const {
    clientName,
    clientEmail = '',
    clientPhone = '',
    clientAddress = '',
    bookingNumber,
    quotationId = 'QT-2026',
    grandTotal,
    events = [],
    createdAt = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } = params;

  const quoteRef = quotationId.startsWith('R2R-QT-') ? quotationId : `R2R-QT-${quotationId.substring(0, 6).toUpperCase()}`;

  // Header Banner
  doc.setFillColor(180, 83, 9); // #b45309 Warm Gold / Amber
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('R2R STUDIO PHOTOGRAPHY', 14, 16);

  doc.setTextColor(254, 243, 199); // #fef3c7
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Road No 3A, Tarnaka, Hyderabad • Phone: +91 9398534380 • Email: info@r2rstudio.com', 14, 23);
  doc.text('Luxury Photography, Cinematic Wedding Films & Drone Coverage', 14, 29);

  // Document Title Box
  doc.setFillColor(254, 243, 199); // #fef3c7
  doc.rect(14, 42, 182, 14, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.rect(14, 42, 182, 14, 'S');

  doc.setTextColor(120, 53, 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('OFFICIAL PHOTOGRAPHY QUOTATION', 18, 51);

  doc.setTextColor(180, 83, 9);
  doc.setFontSize(10);
  doc.text(`REF: ${quoteRef}`, 145, 51);

  // Client & Quote Metadata Box
  let y = 62;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, 90, 32, 'S');
  doc.rect(106, y, 90, 32, 'S');

  // Left: Prepared For
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PREPARED FOR:', 18, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(clientName, 18, y + 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  if (clientPhone) doc.text(`Phone: ${clientPhone}`, 18, y + 19);
  if (clientEmail) doc.text(`Email: ${clientEmail}`, 18, y + 24);
  if (clientAddress) doc.text(`Location: ${clientAddress.substring(0, 40)}`, 18, y + 29);

  // Right: Quote Metadata
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION DETAILS:', 110, y + 6);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Booking Ref:`, 110, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(bookingNumber, 150, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`Quotation Date:`, 110, y + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(createdAt, 150, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.text(`Valid Until:`, 110, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('30 Days From Issue', 150, y + 25);

  // Covered Events Table Header
  y = 100;
  doc.setFillColor(180, 83, 9);
  doc.rect(14, y, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('EVENT SHOOT SESSION', 18, y + 5.5);
  doc.text('CATEGORY', 90, y + 5.5);
  doc.text('DATE & SCHEDULE', 125, y + 5.5);
  doc.text('ESTIMATE (₹)', 170, y + 5.5);

  y += 8;

  // Event Table Rows
  const eventRows = events.length > 0 ? events : [
    { name: 'Photography & Cinematic Video Services', category: 'WEDDING', eventDate: 'As Agreed', price: grandTotal }
  ];

  eventRows.forEach((item, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 254, isEven ? 255 : 252, isEven ? 255 : 243);
    doc.rect(14, y, 182, 10, 'F');
    doc.setDrawColor(254, 243, 199);
    doc.line(14, y + 10, 196, y + 10);

    const eventTitle = item.event?.name || item.name || 'Shoot Session';
    const cat = item.category || 'EVENT';
    const dateStr = `${item.eventDate || ''} ${item.eventTime ? `@ ${item.eventTime}` : ''}`.trim() || 'Scheduled';
    const amountVal = item.price ? `₹${item.price.toLocaleString('en-IN')}` : '-';

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(eventTitle.substring(0, 32), 18, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(cat, 90, y + 6.5);
    doc.text(dateStr.substring(0, 24), 125, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(amountVal, 170, y + 6.5);

    y += 10;
  });

  y = Math.max(y + 8, 145);

  // Total Investment Box (Right Side)
  const totalsX = 110;
  const totalsWidth = 86;

  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.rect(totalsX, y, totalsWidth, 42, 'F');
  doc.rect(totalsX, y, totalsWidth, 42, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 53, 15);
  doc.text('ESTIMATED INVESTMENT', totalsX + 6, y + 10);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(`₹${grandTotal.toLocaleString('en-IN')}/-`, totalsX + 6, y + 22);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(146, 64, 14);
  doc.text('• Taxes & travel included as per agreement.', totalsX + 6, y + 30);
  doc.text('• High-Res edited photos + 4K Teasers included.', totalsX + 6, y + 36);

  // Deliverables & Milestones (Left Side)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, 90, 42, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DELIVERABLES & PAYMENT MILESTONES', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('• 30% Advance for Date Lock & Booking', 18, y + 14);
  doc.text('• 50% On Main Event Shoot Date', 18, y + 20);
  doc.text('• 20% On Final Album & Video Delivery', 18, y + 26);
  doc.text('• Standard Delivery: 3-4 weeks post selection.', 18, y + 32);
  doc.text('• Raw photos delivered within 48 hours.', 18, y + 37);

  // Footer & Signature
  const footerY = 250;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, 196, footerY);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text('Official R2R Studio Photography quotation estimate. Subject to terms & conditions.', 14, footerY + 6);
  doc.text('Looking forward to creating unforgettable memories with you!', 14, footerY + 11);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('R2R Studio Photography Team', 145, footerY + 6);

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
