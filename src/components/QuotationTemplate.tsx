'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Check, Sparkles, Printer, Download, 
  Phone, Camera, MapPin, Calendar, CheckCircle2, ShieldCheck, QrCode
} from 'lucide-react';
import { FinancialAmount } from '@/lib/permissions';

interface QuotationTemplateProps {
  doc: any;
  showControls?: boolean;
}

interface EventItem {
  id?: string;
  name: string;
  price: number;
  deliverables: string[];
}

export default function QuotationTemplate({ doc, showControls = true }: QuotationTemplateProps) {
  const booking = doc?.booking || {};
  const client = booking?.client || {};
  const initialEventsFromDoc = booking?.bookingEvents || [];
  const initialGrandTotal = doc?.grandTotal || doc?.amount || booking?.grandTotal || 0;

  // Helper to resolve default deliverables for an event name
  const getDefaultDeliverables = (eventName: string): string[] => {
    const nameLower = (eventName || '').toLowerCase();
    if (nameLower.includes('pre') || nameLower.includes('pre-wedding') || nameLower.includes('pre wedding')) {
      return [
        '1 Candid Photographer',
        '1 Candid Videographer',
        '20 Sheets Luxury Album',
        'Cinematic Trailer Video'
      ];
    }
    if (nameLower.includes('engagement') || nameLower.includes('ring')) {
      return [
        '1 Candid Photographer',
        '1 Candid Videographer',
        '1 Traditional Photographer',
        '1 Traditional Videographer',
        '30-35 Sheets Premium Album',
        'Cinematic Trailer Video',
        'Full Length HD Film',
        '1 Instagram Reel'
      ];
    }
    if (nameLower.includes('haldi') || nameLower.includes('sangeet')) {
      return [
        '1 Candid Photographer',
        '1 Candid Videographer',
        '1 Traditional Photographer',
        '1 Traditional Videographer',
        '20 Sheets Premium Album',
        'Cinematic Trailer Video',
        'Full Length HD Film'
      ];
    }
    if (nameLower.includes('pellikuthuru') || nameLower.includes('mehendi')) {
      return [
        '1 Traditional Photographer',
        '1 Traditional Videographer',
        'Full Length HD Film'
      ];
    }
    if (nameLower.includes('wedding') || nameLower.includes('marriage')) {
      return [
        '1 Candid Photographer',
        '1 Candid Videographer',
        '1 Traditional Photographer',
        '1 Traditional Videographer',
        '50 Sheets Royal Album',
        'Cinematic Teaser & Trailer',
        'Full Length 4K Film',
        '2 Instagram Reels'
      ];
    }
    if (nameLower.includes('reception')) {
      return [
        '1 Candid Photographer',
        '1 Candid Videographer',
        '1 Traditional Photographer',
        '1 Traditional Videographer',
        '30-35 Sheets Premium Album',
        'Cinematic Trailer Video',
        'Full Length HD Film'
      ];
    }

    return [
      '1 Candid Photographer',
      '1 Traditional Photographer',
      '1 Traditional Videographer',
      'Full Length HD Film & Edited Album'
    ];
  };

  // Build initial events array
  const buildInitialEvents = (): EventItem[] => {
    if (initialEventsFromDoc.length > 0) {
      return initialEventsFromDoc.map((be: any, idx: number) => {
        const eventName = be.event?.name || `Event ${idx + 1}`;
        const price = be.price || Math.round((initialGrandTotal || 333000) / initialEventsFromDoc.length);
        const delivs = be.deliverables 
          ? (Array.isArray(be.deliverables) ? be.deliverables : be.deliverables.split('\n'))
          : getDefaultDeliverables(eventName);

        return {
          id: be.id || `evt-${idx}`,
          name: eventName,
          price: price,
          deliverables: delivs
        };
      });
    }

    // Default sample template items matching studio packages
    return [
      { name: 'Pre-Wedding Shoot', price: 38000, deliverables: getDefaultDeliverables('Pre-Wedding') },
      { name: 'Engagement Ceremony', price: 70000, deliverables: getDefaultDeliverables('Engagement') },
      { name: 'Haldi Ceremony', price: 59000, deliverables: getDefaultDeliverables('Haldi') },
      { name: 'Pellikuthuru Rituals', price: 19000, deliverables: getDefaultDeliverables('Pellikuthuru') },
      { name: 'Wedding Ceremony', price: 78000, deliverables: getDefaultDeliverables('Wedding') },
      { name: 'Grand Reception', price: 69000, deliverables: getDefaultDeliverables('Reception') }
    ];
  };

  // Editable template states
  const [isEditing, setIsEditing] = useState(false);
  const [clientName, setClientName] = useState(client.name || booking.name || 'Rohith Telidevara');
  const [quoteDate, setQuoteDate] = useState(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [quoteRef, setQuoteRef] = useState(doc?.id ? `R2R-QT-${doc.id.substring(0, 6).toUpperCase()}` : 'R2R-QT-2026-001');
  const [studioLogoUrl, setStudioLogoUrl] = useState('/r2r-logo.png');
  const [studioHandle, setStudioHandle] = useState('@R2RSTUDIOPHOTOGRAPHY');
  const [studioMobile, setStudioMobile] = useState('+91 9398534380');
  const [studioAddress, setStudioAddress] = useState('Office: Road No 3A, HNo: 12-5-149/12/2/A, Vijayapuri Colony, Tarnaka, Hyderabad.');
  const [imageError, setImageError] = useState(false);

  const [eventItems, setEventItems] = useState<EventItem[]>(buildInitialEvents());
  const [paymentSchedule, setPaymentSchedule] = useState<string[]>([
    'Advance Booking Confirmation: 30%',
    'On Main Event Shoot Date: 50%',
    'Upon Album & Video Final Delivery: 20%'
  ]);
  const [terms, setTerms] = useState<string[]>([
    'Travel and Accommodation for any outstation events covered must be provided by the client.',
    'From our studio, we will provide one set of premium album. Extra album copies are charged separately.',
    'Additional album sheets beyond agreed count are charged at Rs. 600/- per extra sheet.',
    'Deliverables timeline depends on timely client selection of raw photographs.',
    'If an event is rescheduled from client side, dates will be subject to studio slot availability.'
  ]);

  // Sync state if doc props change
  useEffect(() => {
    if (client.name || booking.name) setClientName(client.name || booking.name);
    if (doc?.id) setQuoteRef(`R2R-QT-${doc.id.substring(0, 6).toUpperCase()}`);
    setEventItems(buildInitialEvents());
  }, [doc]);

  const calculatedGrandTotal = eventItems.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  const formatAmount = (num: number) => {
    return (num || 0).toLocaleString('en-IN') + '/-';
  };

  // Handlers for live editing
  const handleUpdateEventName = (idx: number, name: string) => {
    const updated = [...eventItems];
    updated[idx].name = name;
    setEventItems(updated);
  };

  const handleUpdateEventPrice = (idx: number, priceStr: string) => {
    const updated = [...eventItems];
    updated[idx].price = parseFloat(priceStr) || 0;
    setEventItems(updated);
  };

  const handleUpdateDeliverables = (idx: number, text: string) => {
    const updated = [...eventItems];
    updated[idx].deliverables = text.split('\n');
    setEventItems(updated);
  };

  const handleAddEvent = () => {
    setEventItems([
      ...eventItems,
      {
        name: 'Custom Shoot Event',
        price: 25000,
        deliverables: ['1 Candid Photographer', '1 Traditional Videographer', 'Edited Album & Video']
      }
    ]);
  };

  const handleRemoveEvent = (idx: number) => {
    setEventItems(eventItems.filter((_, i) => i !== idx));
  };

  // Print handler that ensures preview mode before printing
  const handlePrintDocument = () => {
    setIsEditing(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Download PDF handler
  const handleDownloadPDFDocument = async () => {
    setIsEditing(false);
    await new Promise((res) => setTimeout(res, 200));

    const element = document.getElementById('pdf-document');
    if (!element) {
      alert('Document canvas not found.');
      return;
    }

    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const dataUrl = await toPng(element, { 
        quality: 1, 
        pixelRatio: 2,
        filter: (node: any) => {
          if (node?.classList?.contains('print:hidden')) return false;
          return true;
        }
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `Quotation_${clientName.replace(/\s+/g, '_')}_R2R.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF download: ' + err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center font-sans">

      {/* Global Print Media Rules to ensure ONLY the Quotation Sheet prints */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body * {
            visibility: hidden !important;
          }
          #pdf-document, #pdf-document * {
            visibility: visible !important;
          }
          #pdf-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          input, textarea {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            resize: none !important;
            outline: none !important;
          }
        }
      `}</style>
      
      {/* Interactive Customizer Bar (Hidden when printing) */}
      {showControls && (
        <div className="print:hidden w-full max-w-[760px] mb-4 p-3.5 bg-gradient-to-r from-amber-900 via-amber-950 to-amber-900 text-amber-50 rounded-2xl flex flex-wrap items-center justify-between shadow-xl border border-amber-800/80 gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
            <span className="text-xs font-bold tracking-wide text-amber-100">PDF Template Customizer</span>
            <span className="text-[10px] text-amber-300/80 hidden sm:inline">
              ({isEditing ? 'Live Editing Mode' : 'Pristine Preview Mode'})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                isEditing ? 'bg-amber-300 text-amber-950 font-bold hover:bg-amber-200' : 'bg-amber-800/90 text-amber-100 hover:bg-amber-800'
              }`}
            >
              {isEditing ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Done Editing & Lock</span>
                </>
              ) : (
                <>
                  <Edit2 className="h-3.5 w-3.5 text-amber-300" />
                  <span>Edit Custom Fields</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintDocument}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-amber-850 hover:bg-amber-800 text-amber-100 rounded-lg text-xs font-medium cursor-pointer transition border border-amber-700/60"
            >
              <Printer className="h-3.5 w-3.5 text-amber-300" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDFDocument}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-lg text-xs font-extrabold cursor-pointer transition shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Quotation Sheet Container */}
      <div 
        id="pdf-document"
        className="relative bg-white text-neutral-800 font-sans p-6 sm:p-10 border-l-[12px] border-amber-400 shadow-xl min-h-[1050px] w-full max-w-[760px] text-left border-y border-r border-neutral-200/80 rounded-r-xl space-y-6"
      >
        
        {/* Luxury Top Header Section */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-neutral-100 gap-4">
          
          {/* Left Header: Studio Info & Branding */}
          <div className="space-y-2 max-w-md">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 flex items-center gap-2">
                <span>R2R STUDIO</span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                  OFFICIAL QUOTATION
                </span>
              </h1>
              <p className="text-[11px] font-bold text-amber-600 tracking-wider uppercase mt-0.5">
                CREATIVE PHOTOGRAPHY & CINEMATIC FILMS
              </p>
            </div>

            <div className="space-y-1 text-[11px] text-neutral-600 font-medium pt-1">
              <div className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={studioMobile}
                    onChange={(e) => setStudioMobile(e.target.value)}
                    className="border-b border-amber-300 text-[11px] focus:outline-none w-full"
                  />
                ) : (
                  <span>{studioMobile}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Camera className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={studioHandle}
                    onChange={(e) => setStudioHandle(e.target.value)}
                    className="border-b border-amber-300 text-[11px] focus:outline-none w-full"
                  />
                ) : (
                  <span>{studioHandle} • <span className="text-neutral-400 font-normal">instagram.com/r2rstudiophotography</span></span>
                )}
              </div>

              <div className="flex items-start space-x-2 pt-0.5">
                <MapPin className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                {isEditing ? (
                  <textarea
                    value={studioAddress}
                    onChange={(e) => setStudioAddress(e.target.value)}
                    rows={2}
                    className="w-full text-[10px] border border-amber-300 rounded p-1"
                  />
                ) : (
                  <p className="text-[10px] text-neutral-500 leading-normal font-normal">
                    {studioAddress}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Header: Logo & Studio Badge */}
          <div className="text-right flex flex-col items-end space-y-2">
            {!imageError ? (
              <img
                src={studioLogoUrl}
                alt="R2R Studio Logo"
                onError={() => setImageError(true)}
                className="h-16 sm:h-20 w-auto object-contain max-w-[180px]"
              />
            ) : (
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl text-center shadow-xs border border-amber-400">
                <p className="font-black text-lg tracking-widest leading-none">R2R</p>
                <p className="text-[8px] font-bold text-amber-100 uppercase tracking-widest mt-1">STUDIO FILMS</p>
              </div>
            )}

            <div className="flex items-center space-x-1 bg-neutral-50 border border-neutral-200 px-2 py-1 rounded text-[9px] text-neutral-500 font-semibold">
              <QrCode className="h-3.5 w-3.5 text-neutral-700" />
              <span>Scan to view Portfolio</span>
            </div>

            {isEditing && (
              <div className="pt-1">
                <label className="text-[9px] text-neutral-400 block font-semibold">Logo Image Path:</label>
                <input
                  type="text"
                  value={studioLogoUrl}
                  onChange={(e) => {
                    setStudioLogoUrl(e.target.value);
                    setImageError(false);
                  }}
                  className="text-[10px] text-right border-b border-amber-300 focus:outline-none w-36"
                />
              </div>
            )}
          </div>

        </div>

        {/* Client & Quotation Metadata Banner */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700">
              QUOTATION PREPARED FOR
            </span>
            {isEditing ? (
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="text-lg font-bold text-neutral-900 border-b border-amber-400 focus:outline-none w-full mt-0.5"
              />
            ) : (
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight mt-0.5">
                {clientName}
              </h2>
            )}
          </div>

          <div className="text-left sm:text-right space-y-0.5 text-xs text-neutral-600 font-medium border-t sm:border-t-0 border-amber-200/60 pt-2 sm:pt-0">
            <div className="flex items-center sm:justify-end space-x-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-600" />
              {isEditing ? (
                <input
                  type="text"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                  className="text-xs border-b border-amber-300 text-right w-24"
                />
              ) : (
                <span>Date: {quoteDate}</span>
              )}
            </div>
            <p className="text-[11px] font-bold text-neutral-700">
              Ref No: {quoteRef}
            </p>
          </div>
        </div>

        {/* Per-Event Service Breakdown Cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest pb-1 border-b border-neutral-100">
            Covered Events & Deliverables Summary
          </h3>

          {eventItems.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-xl border border-neutral-200/80 p-4 sm:p-5 shadow-2xs space-y-3 relative transition hover:border-amber-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-2.5 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateEventName(idx, e.target.value)}
                      className="text-base font-bold text-neutral-900 border-b border-amber-300 focus:outline-none"
                    />
                  ) : (
                    <h4 className="text-base font-extrabold text-neutral-900 tracking-wide">
                      {item.name}
                    </h4>
                  )}
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <span className="text-xs font-semibold text-neutral-400">Event Total:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleUpdateEventPrice(idx, e.target.value)}
                      className="w-28 text-right font-bold text-lg border-b border-amber-300 focus:outline-none text-neutral-900"
                    />
                  ) : (
                    <span className="text-lg font-extrabold text-neutral-900">
                      <FinancialAmount value={item.price} />
                    </span>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveEvent(idx)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded transition"
                      title="Remove Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Deliverables Grid */}
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Package Deliverables:
                </span>

                {isEditing ? (
                  <textarea
                    rows={item.deliverables.length || 3}
                    value={item.deliverables.join('\n')}
                    onChange={(e) => handleUpdateDeliverables(idx, e.target.value)}
                    className="w-full text-xs text-neutral-700 p-2 border border-amber-300 rounded font-sans focus:outline-none"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {item.deliverables.map((dItem, dIdx) => (
                      <div key={dIdx} className="flex items-start space-x-2 text-xs text-neutral-700 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{dItem}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-right pt-1">
                <span className="text-[9px] text-neutral-400 font-normal italic">
                  * Note: Additional charges applicable for extra crew/sheets beyond agreed package
                </span>
              </div>
            </div>
          ))}

          {isEditing && (
            <button
              onClick={handleAddEvent}
              className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-dashed border-amber-300 flex items-center justify-center space-x-2 cursor-pointer transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Event Package Block</span>
            </button>
          )}
        </div>

        {/* Grand Total Highlight Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white rounded-2xl p-5.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-amber-500/80">
          <div>
            <p className="text-[10px] font-extrabold text-amber-200 uppercase tracking-widest">
              ESTIMATED PACKAGE INVESTMENT
            </p>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Net All-Inclusive Grand Total
            </h3>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-2xl sm:text-3xl font-black text-amber-100 tracking-tight">
              <FinancialAmount value={calculatedGrandTotal} />
            </span>
            <p className="text-[9px] text-amber-200/80 font-normal mt-0.5">
              Including equipment, post-production & editing charges
            </p>
          </div>
        </div>

        {/* Payment Milestone Schedule & Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          
          {/* Milestone Payment Schedule */}
          <div className="bg-neutral-50 rounded-xl border border-neutral-200/80 p-4 space-y-2">
            <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>Payment Milestone Schedule</span>
            </h4>

            {isEditing ? (
              <textarea
                rows={3}
                value={paymentSchedule.join('\n')}
                onChange={(e) => setPaymentSchedule(e.target.value.split('\n'))}
                className="w-full text-xs p-2 border border-amber-300 rounded font-normal"
              />
            ) : (
              <ul className="space-y-1.5 text-xs text-neutral-700 font-medium">
                {paymentSchedule.map((sched, sIdx) => (
                  <li key={sIdx} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>{sched}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="bg-neutral-50 rounded-xl border border-neutral-200/80 p-4 space-y-2">
            <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">
              Terms & Conditions
            </h4>

            {isEditing ? (
              <textarea
                rows={4}
                value={terms.join('\n')}
                onChange={(e) => setTerms(e.target.value.split('\n'))}
                className="w-full text-[10px] p-2 border border-amber-300 rounded font-normal"
              />
            ) : (
              <ul className="space-y-1 text-[10px] text-neutral-600 leading-relaxed font-normal">
                {terms.map((term, tIdx) => (
                  <li key={tIdx} className="flex items-start space-x-1.5">
                    <span className="text-neutral-400 font-bold">•</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Footer Signature & Branding Note */}
        <div className="pt-6 border-t border-neutral-200/80 flex items-center justify-between text-[10px] text-neutral-400 font-medium">
          <p>Thank you for choosing R2R Studio Photography for your special occasions!</p>
          <p className="font-bold text-neutral-600">R2R Studio Official Quotation</p>
        </div>

      </div>

    </div>
  );
}
