'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Check, Sparkles, Printer, Download, 
  Phone, Camera, MapPin, Calendar, CheckCircle2, ShieldCheck, QrCode,
  Palette, FileText, DollarSign, Percent, RefreshCw, Mail,
  BookOpen, HardDrive, Shield, Lock, Cpu, Film, Star, HelpCircle
} from 'lucide-react';
import { FinancialAmount } from '@/lib/permissions';

interface QuotationTemplateProps {
  doc?: any;
  showControls?: boolean;
  onSendEmail?: () => void;
}

interface EventItem {
  id?: string;
  name: string;
  price: number;
  deliverables: string[];
}

interface DynamicSectionItem {
  title?: string;
  content: string;
}

interface DynamicSection {
  id: string;
  title: string;
  badge?: string;
  items: DynamicSectionItem[];
}

export type QuotationTheme = 'ROYAL_GOLD' | 'ELEGANT_IVORY' | 'MINIMAL_EDITORIAL' | 'ROSE_ROMANCE';

const TERMS_PRESETS = {
  WEDDING: [
    'Travel & luxury accommodation for outstation events to be provided by the client.',
    'Includes 1 master premium flush-mount album (40 sheets). Additional sheets charged at ₹650/sheet.',
    'High-resolution edited RAW photos delivered via private Cloud Gallery link.',
    'Deliverable timeline: 30-45 business days post client photo selection.',
    '50% advance non-refundable deposit required to lock studio booking dates.'
  ],
  PREWEDDING: [
    'All location entry fees, permissions, and local transportation are client responsibility.',
    'Includes up to 8 hours of shoot coverage across up to 3 outfit changes.',
    'Includes 1 Teaser video (60s Reel format) + 1 Full Length Pre-wedding Film (3-5 mins).',
    'Raw video footage provided on Client USB Drive.',
    'In case of rain/inclement weather, reschedule subject to studio slot availability.'
  ],
  CORPORATE: [
    'Full commercial usage rights granted for digital media, web, and marketing.',
    'On-site backup crew and dual card slot redundant recording enabled.',
    'Edited high-res image deliverables within 7 business days post event.',
    'Includes color-graded highlight video (1080p / 4K resolution).',
    'Payment terms: 50% advance, balance 50% upon final deliverable hand-over.'
  ]
};

const COMMON_DELIVERABLE_PRESETS = [
  '1 Candid Photographer',
  '1 Traditional Photographer',
  '1 Cinematic Videographer',
  '1 Traditional Videographer',
  '4K Aerial Drone Coverage',
  '1 Instagram Same-Day Teaser Reel',
  '40 Sheets Premium Flush-Mount Album',
  'Full HD Edited Long Film (60-90 min)',
  'Complete RAW Data on High-Speed Pendrive'
];

export default function QuotationTemplate({ doc, showControls = true, onSendEmail }: QuotationTemplateProps) {
  const booking = doc?.booking || {};
  const client = booking?.client || {};
  const initialEventsFromDoc = booking?.bookingEvents || [];
  const initialGrandTotal = doc?.grandTotal || doc?.amount || booking?.grandTotal || 0;

  // Helper for initial deliverables
  const getDefaultDeliverables = (eventName: string): string[] => {
    const nameLower = (eventName || '').toLowerCase();
    if (nameLower.includes('pre') || nameLower.includes('pre-wedding')) {
      return ['1 Candid Photographer', '1 Cinematic Videographer', '20 Sheets Luxury Album', 'Cinematic Trailer Video'];
    }
    if (nameLower.includes('engagement') || nameLower.includes('ring')) {
      return ['1 Candid Photographer', '1 Cinematic Videographer', '1 Traditional Photographer', '30 Sheets Premium Album', '1 Instagram Reel'];
    }
    if (nameLower.includes('haldi') || nameLower.includes('sangeet')) {
      return ['1 Candid Photographer', '1 Traditional Photographer', '1 Traditional Videographer', '20 Sheets Album', 'Full HD Film'];
    }
    if (nameLower.includes('wedding') || nameLower.includes('marriage')) {
      return ['1 Candid Photographer', '1 Cinematic Videographer', '1 Traditional Photographer', '1 Traditional Videographer', '50 Sheets Royal Album', '4K Teaser & Film', '2 Instagram Reels'];
    }
    return ['1 Candid Photographer', '1 Traditional Photographer', '1 Traditional Videographer', 'Edited HD Album & Film'];
  };

  const buildInitialEvents = (): EventItem[] => {
    if (initialEventsFromDoc.length > 0) {
      return initialEventsFromDoc.map((be: any, idx: number) => ({
        id: be.id || `evt-${idx}`,
        name: be.event?.name || `Event ${idx + 1}`,
        price: be.price || Math.round((initialGrandTotal || 300000) / initialEventsFromDoc.length),
        deliverables: be.deliverables 
          ? (Array.isArray(be.deliverables) ? be.deliverables : be.deliverables.split('\n'))
          : getDefaultDeliverables(be.event?.name || '')
      }));
    }

    return [
      { name: 'Pre-Wedding Shoot', price: 38000, deliverables: getDefaultDeliverables('Pre-Wedding') },
      { name: 'Engagement Ceremony', price: 70000, deliverables: getDefaultDeliverables('Engagement') },
      { name: 'Haldi & Sangeet', price: 59000, deliverables: getDefaultDeliverables('Haldi') },
      { name: 'Wedding Ceremony', price: 88000, deliverables: getDefaultDeliverables('Wedding') },
      { name: 'Grand Reception', price: 65000, deliverables: getDefaultDeliverables('Reception') }
    ];
  };

  // State
  const [theme, setTheme] = useState<QuotationTheme>('ROYAL_GOLD');
  const [isEditing, setIsEditing] = useState(false);
  const [clientName, setClientName] = useState(client.name || booking.name || 'Rohith Telidevara');
  const [clientEmail, setClientEmail] = useState(client.email || 'client@example.com');
  const [clientPhone, setClientPhone] = useState(client.phone || '+91 98765 43210');
  const [quoteDate, setQuoteDate] = useState(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [quoteRef, setQuoteRef] = useState(doc?.id ? `R2R-QT-${doc.id.substring(0, 6).toUpperCase()}` : 'R2R-QT-2026-001');

  // Studio info
  const [studioName, setStudioName] = useState('R2R STUDIO');
  const [studioTagline, setStudioTagline] = useState('CREATIVE PHOTOGRAPHY & CINEMATIC FILMS');
  const [studioMobile, setStudioMobile] = useState('+91 9398534380');
  const [studioEmail, setStudioEmail] = useState('contact@r2rstudio.com');
  const [studioHandle, setStudioHandle] = useState('@R2RSTUDIOPHOTOGRAPHY');
  const [studioAddress, setStudioAddress] = useState('Office: Road No 3A, HNo: 12-5-149/12/2/A, Vijayapuri Colony, Tarnaka, Hyderabad.');
  const [studioGst, setStudioGst] = useState('36AAAAA0000A1Z5');

  // Financial state
  const [discountType, setDiscountType] = useState<'FLAT' | 'PERCENT'>('FLAT');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [showGst, setShowGst] = useState<boolean>(false);
  const [gstRate, setGstRate] = useState<number>(18);

  const [eventItems, setEventItems] = useState<EventItem[]>(buildInitialEvents());
  
  // Payment Schedule & Terms State
  const [paymentSchedule, setPaymentSchedule] = useState<string[]>([
    'Advance Booking Deposit: 30%',
    'On Main Event Shoot Date: 50%',
    'Upon Final Album & Video Delivery: 20%'
  ]);
  const [terms, setTerms] = useState<string[]>(TERMS_PRESETS.WEDDING);

  // Dynamic Custom Sections
  const [dynamicSections, setDynamicSections] = useState<DynamicSection[]>([
    {
      id: 'sec-album-specs',
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
      id: 'sec-security-safeguards',
      title: 'Studio Data Security, Backup & Privacy Safeguards',
      badge: '100% Data Safety',
      items: [
        { title: '📷 Dual Card Slot Redundant Recording', content: 'Every camera shot with real-time dual card recording to eliminate memory card failure risks.' },
        { title: '💾 Triple RAID NAS & Cloud Vault', content: 'Raw data backed up across dual RAID local NAS servers + offsite encrypted cloud storage.' },
        { title: '⚡ On-Site Equipment Redundancy', content: 'Backup camera bodies, prime lenses & wireless microphones brought standby to every event.' }
      ]
    }
  ]);

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  // Sync state if doc props change
  useEffect(() => {
    if (client.name || booking.name) setClientName(client.name || booking.name);
    if (client.email) setClientEmail(client.email);
    if (client.phone) setClientPhone(client.phone);
    if (doc?.id) setQuoteRef(`R2R-QT-${doc.id.substring(0, 6).toUpperCase()}`);
    setEventItems(buildInitialEvents());
  }, [doc]);

  // Financial calculations
  const subtotal = eventItems.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const calculatedDiscount = discountType === 'PERCENT' ? Math.round((subtotal * (discountValue || 0)) / 100) : (discountValue || 0);
  const amountAfterDiscount = Math.max(0, subtotal - calculatedDiscount);
  const calculatedGst = showGst ? Math.round((amountAfterDiscount * (gstRate || 18)) / 100) : 0;
  const calculatedGrandTotal = amountAfterDiscount + calculatedGst;

  // Event Handlers
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

  const handleAddPresetDeliverable = (idx: number, presetText: string) => {
    const updated = [...eventItems];
    if (!updated[idx].deliverables.includes(presetText)) {
      updated[idx].deliverables.push(presetText);
      setEventItems(updated);
    }
  };

  const handleAddEvent = () => {
    setEventItems([
      ...eventItems,
      {
        name: 'Custom Event Package',
        price: 25000,
        deliverables: ['1 Candid Photographer', '1 Traditional Videographer', 'Edited HD Album & Video']
      }
    ]);
  };

  const handleRemoveEvent = (idx: number) => {
    setEventItems(eventItems.filter((_, i) => i !== idx));
  };

  // Dynamic Section Handlers
  const handleAddDynamicSection = () => {
    const newSec: DynamicSection = {
      id: `sec-${Date.now()}`,
      title: 'Custom Studio Policy / Add-on Section',
      badge: 'Custom Note',
      items: [
        { title: 'Itemized Clause 1', content: 'Specify details for travel, drone permissions, or extra deliverables here.' }
      ]
    };
    setDynamicSections([...dynamicSections, newSec]);
  };

  const handleRemoveDynamicSection = (secId: string) => {
    setDynamicSections(dynamicSections.filter(s => s.id !== secId));
  };

  const handleUpdateSectionTitle = (secId: string, newTitle: string) => {
    setDynamicSections(dynamicSections.map(s => s.id === secId ? { ...s, title: newTitle } : s));
  };

  const handleUpdateSectionItem = (secId: string, itemIdx: number, field: 'title' | 'content', val: string) => {
    setDynamicSections(dynamicSections.map(s => {
      if (s.id === secId) {
        const newItems = [...s.items];
        newItems[itemIdx] = { ...newItems[itemIdx], [field]: val };
        return { ...s, items: newItems };
      }
      return s;
    }));
  };

  const handleAddSectionItem = (secId: string) => {
    setDynamicSections(dynamicSections.map(s => {
      if (s.id === secId) {
        return {
          ...s,
          items: [...s.items, { title: 'New Item Clause', content: 'Description content here...' }]
        };
      }
      return s;
    }));
  };

  const handleRemoveSectionItem = (secId: string, itemIdx: number) => {
    setDynamicSections(dynamicSections.map(s => {
      if (s.id === secId) {
        return {
          ...s,
          items: s.items.filter((_, i) => i !== itemIdx)
        };
      }
      return s;
    }));
  };

  // Dispatch Email Handler
  const handleSendEmailToClient = async () => {
    setSendingEmail(true);
    setEmailStatus('Sending quotation email to client...');
    try {
      if (onSendEmail) {
        await onSendEmail();
      } else {
        const res = await fetch('/api/data/quotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking?.id || doc?.id || 'temp-id',
            clientEmail: clientEmail,
            clientName: clientName,
            quoteRef: quoteRef,
            grandTotal: calculatedGrandTotal,
            status: 'SENT'
          })
        });
        if (!res.ok) throw new Error('Failed to dispatch email');
      }
      setEmailStatus('✅ Quotation Email sent successfully to client!');
      setTimeout(() => setEmailStatus(''), 4000);
    } catch (e: any) {
      setEmailStatus('❌ Sending failed: ' + e.message);
      setTimeout(() => setEmailStatus(''), 4000);
    } finally {
      setSendingEmail(false);
    }
  };

  // Print & PDF
  const handlePrintDocument = () => {
    setIsEditing(false);
    setTimeout(() => window.print(), 150);
  };

  const handleDownloadPDFDocument = async () => {
    setIsEditing(false);
    await new Promise((res) => setTimeout(res, 200));

    const element = document.getElementById('pdf-document');
    if (!element) return;

    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const dataUrl = await toPng(element, { 
        quality: 1, 
        pixelRatio: 2,
        filter: (node: any) => node?.classList?.contains('print:hidden') ? false : true
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `Quotation_${clientName.replace(/\s+/g, '_')}_${quoteRef}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('PDF Generation failed: ' + err);
    }
  };

  // Theme Styling Map (ALL BRIGHT & LIGHT - ZERO BLACK BOXES ON CANVAS)
  const themeStyles = {
    ROYAL_GOLD: {
      cardBg: 'bg-white text-neutral-900 border-l-[12px] border-amber-500 shadow-2xl border-y border-r border-neutral-200/80',
      headerBanner: 'border-b-2 border-amber-100',
      tagBadge: 'bg-amber-100 text-amber-900 border border-amber-200',
      iconColor: 'text-amber-600',
      clientBanner: 'bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border border-amber-200/80',
      eventCard: 'bg-white border border-neutral-200 hover:border-amber-400',
      totalBanner: 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white border border-amber-500 shadow-md',
      totalHighlight: 'text-amber-100',
      scheduleCard: 'bg-amber-50/40 border border-amber-200/60 text-neutral-800',
      sectionCard: 'bg-gradient-to-br from-amber-50/60 to-orange-50/30 border border-amber-200/80 text-neutral-900 shadow-2xs',
      bulletDot: 'bg-amber-500'
    },
    ELEGANT_IVORY: {
      cardBg: 'bg-amber-50/20 text-neutral-900 border-l-[12px] border-amber-600 shadow-2xl border-y border-r border-amber-200/60',
      headerBanner: 'border-b-2 border-amber-200',
      tagBadge: 'bg-amber-200/60 text-amber-900 border border-amber-300',
      iconColor: 'text-amber-700',
      clientBanner: 'bg-amber-100/40 border border-amber-200 text-neutral-900',
      eventCard: 'bg-white border border-amber-200 hover:border-amber-500',
      totalBanner: 'bg-gradient-to-r from-amber-700 to-amber-900 text-white border border-amber-600',
      totalHighlight: 'text-amber-200',
      scheduleCard: 'bg-white border border-amber-200 text-neutral-900',
      sectionCard: 'bg-amber-100/30 border border-amber-200 text-neutral-900',
      bulletDot: 'bg-amber-600'
    },
    MINIMAL_EDITORIAL: {
      cardBg: 'bg-white text-neutral-900 border-l-[12px] border-neutral-900 shadow-2xl border-y border-r border-neutral-300',
      headerBanner: 'border-b-2 border-neutral-900',
      tagBadge: 'bg-neutral-900 text-white border border-neutral-900',
      iconColor: 'text-neutral-900',
      clientBanner: 'bg-neutral-100 border border-neutral-300 text-neutral-900',
      eventCard: 'bg-neutral-50 border border-neutral-200 hover:border-neutral-900',
      totalBanner: 'bg-neutral-900 text-white border border-neutral-900',
      totalHighlight: 'text-neutral-100',
      scheduleCard: 'bg-neutral-50 border border-neutral-200 text-neutral-900',
      sectionCard: 'bg-neutral-50 border border-neutral-200 text-neutral-900',
      bulletDot: 'bg-neutral-900'
    },
    ROSE_ROMANCE: {
      cardBg: 'bg-rose-50/20 text-neutral-900 border-l-[12px] border-rose-400 shadow-2xl border-y border-r border-rose-200',
      headerBanner: 'border-b-2 border-rose-100',
      tagBadge: 'bg-rose-100 text-rose-800 border border-rose-200',
      iconColor: 'text-rose-500',
      clientBanner: 'bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200',
      eventCard: 'bg-white border border-rose-200 hover:border-rose-400',
      totalBanner: 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white border border-rose-500',
      totalHighlight: 'text-rose-100',
      scheduleCard: 'bg-rose-50/50 border border-rose-200 text-neutral-900',
      sectionCard: 'bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 text-neutral-900',
      bulletDot: 'bg-rose-500'
    }
  };

  const currentStyle = themeStyles[theme];

  return (
    <div className="w-full flex flex-col items-center font-sans">
      
      {/* Global Print Rules */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          body * { visibility: hidden !important; }
          #pdf-document, #pdf-document * { visibility: visible !important; }
          #pdf-document {
            position: absolute !important; left: 0 !important; top: 0 !important;
            width: 100% !important; max-width: 100% !important;
            box-shadow: none !important; border-top: none !important; border-right: none !important; border-bottom: none !important;
            padding: 0 !important; margin: 0 !important;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      {/* Interactive Quotation Customizer Toolbar */}
      {showControls && (
        <div className="print:hidden w-full max-w-[780px] mb-4 p-4 bg-neutral-900 text-white rounded-2xl shadow-xl border border-neutral-800 space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-extrabold tracking-wider uppercase text-amber-300">
                Advanced Quotation Designer & Builder
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                  isEditing ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                }`}
              >
                {isEditing ? <Check className="h-3.5 w-3.5" /> : <Edit2 className="h-3.5 w-3.5 text-amber-400" />}
                <span>{isEditing ? 'Done Customizing' : 'Customize Fields'}</span>
              </button>

              <button
                onClick={handleSendEmailToClient}
                disabled={sendingEmail}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs disabled:opacity-50"
              >
                {sendingEmail ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                <span>Email Client</span>
              </button>

              <button
                onClick={handlePrintDocument}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                <Printer className="h-3.5 w-3.5 text-amber-400" />
                <span>Print</span>
              </button>

              <button
                onClick={handleDownloadPDFDocument}
                className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-extrabold cursor-pointer transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>PDF Export</span>
              </button>
            </div>
          </div>

          {/* Theme & Controls Palette */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            
            {/* Theme Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1">
                <Palette className="h-3 w-3 text-amber-400" />
                <span>Aesthetic Template Theme</span>
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as QuotationTheme)}
                className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-400"
              >
                <option value="ROYAL_GOLD">👑 Royal Gold (Luxury Wedding)</option>
                <option value="ELEGANT_IVORY">✨ Elegant Ivory (Warm Cream)</option>
                <option value="MINIMAL_EDITORIAL">📰 Minimal Editorial (High-End Clean)</option>
                <option value="ROSE_ROMANCE">🌸 Rose Romance (Pastel Wedding)</option>
              </select>
            </div>

            {/* Discount Options */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1">
                <Percent className="h-3 w-3 text-amber-400" />
                <span>Custom Discount</span>
              </label>
              <div className="flex items-center space-x-1.5">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'FLAT' | 'PERCENT')}
                  className="bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                >
                  <option value="FLAT">Flat ₹</option>
                  <option value="PERCENT">% Off</option>
                </select>
                <input
                  type="number"
                  placeholder="0"
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* GST Tax Toggle */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1">
                <DollarSign className="h-3 w-3 text-amber-400" />
                <span>GST Tax Breakdown</span>
              </label>
              <div className="flex items-center space-x-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowGst(!showGst)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    showGst ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {showGst ? 'GST Included (18%)' : 'GST Exempt / Off'}
                </button>
              </div>
            </div>

          </div>

          {emailStatus && (
            <div className="p-2 rounded-lg bg-neutral-800 text-amber-300 text-xs font-bold text-center animate-fadeIn">
              {emailStatus}
            </div>
          )}

        </div>
      )}

      {/* Main Quotation Sheet Canvas (ALWAYS PISTINE LIGHT & BLACK-FREE) */}
      <div 
        id="pdf-document"
        className={`relative p-6 sm:p-10 min-h-[1050px] w-full max-w-[780px] text-left rounded-r-2xl space-y-6 transition-all duration-300 ${currentStyle.cardBg}`}
      >
        
        {/* Top Header Section */}
        <div className={`flex justify-between items-start pb-6 gap-4 ${currentStyle.headerBanner}`}>
          
          {/* Left Header: Studio Info */}
          <div className="space-y-2 max-w-md">
            <div>
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="text-xl font-black bg-transparent border-b border-amber-400 focus:outline-none w-full"
                  />
                  <input
                    type="text"
                    value={studioTagline}
                    onChange={(e) => setStudioTagline(e.target.value)}
                    className="text-[10px] font-bold text-amber-600 bg-transparent border-b border-amber-300 focus:outline-none w-full"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <span>{studioName}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${currentStyle.tagBadge}`}>
                      OFFICIAL QUOTATION
                    </span>
                  </h1>
                  <p className="text-[10px] font-extrabold tracking-widest uppercase mt-0.5 text-amber-600">
                    {studioTagline}
                  </p>
                </>
              )}
            </div>

            <div className="space-y-1 text-[11px] opacity-80 font-medium pt-1">
              <div className="flex items-center space-x-2">
                <Phone className={`h-3.5 w-3.5 flex-shrink-0 ${currentStyle.iconColor}`} />
                {isEditing ? (
                  <input
                    type="text"
                    value={studioMobile}
                    onChange={(e) => setStudioMobile(e.target.value)}
                    className="bg-transparent border-b border-amber-300 text-[11px] focus:outline-none w-full"
                  />
                ) : (
                  <span>{studioMobile}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Camera className={`h-3.5 w-3.5 flex-shrink-0 ${currentStyle.iconColor}`} />
                {isEditing ? (
                  <input
                    type="text"
                    value={studioHandle}
                    onChange={(e) => setStudioHandle(e.target.value)}
                    className="bg-transparent border-b border-amber-300 text-[11px] focus:outline-none w-full"
                  />
                ) : (
                  <span>{studioHandle}</span>
                )}
              </div>

              <div className="flex items-start space-x-2 pt-0.5">
                <MapPin className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${currentStyle.iconColor}`} />
                {isEditing ? (
                  <textarea
                    value={studioAddress}
                    onChange={(e) => setStudioAddress(e.target.value)}
                    rows={2}
                    className="w-full text-[10px] bg-transparent border border-amber-300 rounded p-1"
                  />
                ) : (
                  <p className="text-[10px] leading-relaxed opacity-75">
                    {studioAddress}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Header: Studio Badge & QR */}
          <div className="text-right flex flex-col items-end space-y-2">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl text-center shadow-md border border-amber-400">
              <p className="font-black text-xl tracking-widest leading-none">R2R</p>
              <p className="text-[8px] font-extrabold text-amber-100 uppercase tracking-widest mt-1">CINEMATIC FILMS</p>
            </div>

            <div className="flex items-center space-x-1.5 opacity-80 border border-neutral-300/40 px-2 py-1 rounded-lg text-[9px] font-semibold">
              <QrCode className="h-3.5 w-3.5" />
              <span>Scan to view Portfolio</span>
            </div>
          </div>

        </div>

        {/* Client & Quotation Metadata Banner */}
        <div className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${currentStyle.clientBanner}`}>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 block">
              QUOTATION PREPARED FOR
            </span>
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="text-lg font-bold bg-transparent border-b border-amber-400 focus:outline-none w-full"
                  placeholder="Client Name"
                />
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="text-xs bg-transparent border-b border-amber-300 focus:outline-none w-full"
                  placeholder="Client Email"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  {clientName}
                </h2>
                <p className="text-xs opacity-75 font-medium">{clientEmail} • {clientPhone}</p>
              </div>
            )}
          </div>

          <div className="text-left sm:text-right space-y-0.5 text-xs font-medium border-t sm:border-t-0 border-neutral-300/40 pt-2 sm:pt-0">
            <div className="flex items-center sm:justify-end space-x-1.5">
              <Calendar className={`h-3.5 w-3.5 ${currentStyle.iconColor}`} />
              {isEditing ? (
                <input
                  type="text"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                  className="text-xs bg-transparent border-b border-amber-300 text-right w-24"
                />
              ) : (
                <span>Date: {quoteDate}</span>
              )}
            </div>
            <p className="text-[11px] font-bold opacity-90">
              Ref No: {quoteRef}
            </p>
          </div>
        </div>

        {/* Per-Event Service Breakdown Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200/40 pb-1">
            <h3 className="text-xs font-extrabold uppercase tracking-widest opacity-60">
              Covered Events & Deliverables Package
            </h3>
            <span className="text-[10px] font-bold text-amber-600">
              {eventItems.length} Event Block(s)
            </span>
          </div>

          {eventItems.map((item, idx) => (
            <div 
              key={idx} 
              className={`rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 transition ${currentStyle.eventCard}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200/30 pb-2.5 gap-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${currentStyle.bulletDot}`}></div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateEventName(idx, e.target.value)}
                      className="text-base font-bold bg-transparent border-b border-amber-300 focus:outline-none"
                    />
                  ) : (
                    <h4 className="text-base font-extrabold tracking-wide">
                      {item.name}
                    </h4>
                  )}
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <span className="text-xs font-semibold opacity-60">Event Amount:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleUpdateEventPrice(idx, e.target.value)}
                      className="w-28 text-right font-bold text-lg bg-transparent border-b border-amber-300 focus:outline-none"
                    />
                  ) : (
                    <span className="text-lg font-extrabold">
                      <FinancialAmount value={item.price} />
                    </span>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveEvent(idx)}
                      className="text-red-500 hover:bg-red-50/20 p-1.5 rounded transition"
                      title="Remove Event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Deliverables Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">
                  Package Deliverables & Crew Scope:
                </span>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      rows={item.deliverables.length || 3}
                      value={item.deliverables.join('\n')}
                      onChange={(e) => handleUpdateDeliverables(idx, e.target.value)}
                      className="w-full text-xs p-2 bg-transparent border border-amber-300 rounded font-sans focus:outline-none"
                    />
                    
                    {/* Quick Deliverable Presets */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold opacity-60 block">1-Click Preset Append:</span>
                      <div className="flex flex-wrap gap-1">
                        {COMMON_DELIVERABLE_PRESETS.map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleAddPresetDeliverable(idx, preset)}
                            className="px-2 py-0.5 bg-amber-100 hover:bg-amber-400 hover:text-neutral-950 rounded text-[9px] font-semibold transition"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {item.deliverables.map((dItem, dIdx) => (
                      <div key={dIdx} className="flex items-start space-x-2 text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{dItem}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isEditing && (
            <button
              onClick={handleAddEvent}
              className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-xs font-bold rounded-xl border border-dashed border-amber-400 flex items-center justify-center space-x-2 cursor-pointer transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Event Package Block</span>
            </button>
          )}
        </div>

        {/* Financial Calculation Summary (Subtotal, Discount, GST, Grand Total) */}
        <div className="space-y-3 pt-2">
          
          {/* Subtotal & Adjustments */}
          <div className="space-y-1.5 text-xs border-t border-neutral-200/40 pt-3 opacity-90">
            <div className="flex justify-between font-semibold">
              <span>Package Subtotal ({eventItems.length} Events):</span>
              <span><FinancialAmount value={subtotal} /></span>
            </div>

            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Special Discount ({discountType === 'PERCENT' ? `${discountValue}%` : 'Flat'}):</span>
                <span>- <FinancialAmount value={calculatedDiscount} /></span>
              </div>
            )}

            {showGst && (
              <div className="flex justify-between font-medium">
                <span>GST Tax ({gstRate}%):</span>
                <span>+ <FinancialAmount value={calculatedGst} /></span>
              </div>
            )}
          </div>

          {/* Grand Total Banner */}
          <div className={`rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${currentStyle.totalBanner}`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                ESTIMATED PACKAGE INVESTMENT
              </p>
              <h3 className="text-lg font-extrabold mt-0.5">
                Net All-Inclusive Grand Total
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${currentStyle.totalHighlight}`}>
                <FinancialAmount value={calculatedGrandTotal} />
              </span>
              <p className="text-[9px] opacity-75 font-normal mt-0.5">
                Includes shoot crew, post-production & cinematic color grading
              </p>
            </div>
          </div>

        </div>

        {/* Payment Milestone & Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          
          {/* Milestone Payment Schedule */}
          <div className={`rounded-xl p-4 space-y-2 ${currentStyle.scheduleCard}`}>
            <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 text-amber-700">
              <ShieldCheck className={`h-4 w-4 ${currentStyle.iconColor}`} />
              <span>Payment Milestone Schedule</span>
            </h4>

            {isEditing ? (
              <textarea
                rows={3}
                value={paymentSchedule.join('\n')}
                onChange={(e) => setPaymentSchedule(e.target.value.split('\n'))}
                className="w-full text-xs p-2 bg-transparent border border-amber-300 rounded font-normal"
              />
            ) : (
              <ul className="space-y-1.5 text-xs font-medium opacity-90">
                {paymentSchedule.map((sched, sIdx) => (
                  <li key={sIdx} className="flex items-center space-x-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.bulletDot}`}></span>
                    <span>{sched}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className={`rounded-xl p-4 space-y-2 ${currentStyle.scheduleCard}`}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
                Terms & Conditions
              </h4>

              {isEditing && (
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setTerms(TERMS_PRESETS.WEDDING)}
                    className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 text-amber-700 rounded font-bold"
                  >
                    Wedding
                  </button>
                  <button
                    type="button"
                    onClick={() => setTerms(TERMS_PRESETS.PREWEDDING)}
                    className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 text-amber-700 rounded font-bold"
                  >
                    Pre-Wedding
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <textarea
                rows={4}
                value={terms.join('\n')}
                onChange={(e) => setTerms(e.target.value.split('\n'))}
                className="w-full text-[10px] p-2 bg-transparent border border-amber-300 rounded font-normal"
              />
            ) : (
              <ul className="space-y-1 text-[10px] opacity-80 leading-relaxed font-normal">
                {terms.map((term, tIdx) => (
                  <li key={tIdx} className="flex items-start space-x-1.5">
                    <span className="font-bold">•</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* 🌟 DYNAMIC CUSTOM SECTIONS BUILDER (ALBUMS, SECURITY, POLICIES, CUSTOM NOTES) */}
        <div className="space-y-4 pt-2">
          {dynamicSections.map((sec) => (
            <div 
              key={sec.id} 
              className={`rounded-2xl p-5 shadow-2xs space-y-3.5 transition-all relative ${currentStyle.sectionCard}`}
            >
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2 gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={sec.title}
                    onChange={(e) => handleUpdateSectionTitle(sec.id, e.target.value)}
                    className="text-xs font-black uppercase tracking-wider bg-transparent border-b border-amber-400 focus:outline-none w-full text-amber-800"
                  />
                ) : (
                  <h4 className="text-xs font-black uppercase tracking-wider flex items-center space-x-2 text-amber-700">
                    <BookOpen className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span>{sec.title}</span>
                  </h4>
                )}

                <div className="flex items-center space-x-2">
                  {sec.badge && (
                    <span className="text-[9px] font-extrabold uppercase bg-amber-200/50 text-amber-900 px-2 py-0.5 rounded border border-amber-300/80">
                      {sec.badge}
                    </span>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveDynamicSection(sec.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                      title="Delete Dynamic Section Block"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items Grid inside Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-medium">
                {sec.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="space-y-1 bg-white/70 p-3 rounded-xl border border-amber-200/70 shadow-2xs">
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => handleUpdateSectionItem(sec.id, itemIdx, 'title', e.target.value)}
                            className="w-full text-[11px] font-extrabold text-amber-800 bg-transparent border-b border-amber-400 focus:outline-none"
                            placeholder="Clause Title"
                          />
                          <button
                            onClick={() => handleRemoveSectionItem(sec.id, itemIdx)}
                            className="text-red-500 p-0.5 ml-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={item.content}
                          onChange={(e) => handleUpdateSectionItem(sec.id, itemIdx, 'content', e.target.value)}
                          className="w-full text-[10px] bg-transparent border border-amber-300 rounded p-1 font-normal"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {item.title && (
                          <p className="text-[11px] font-bold text-amber-900">{item.title}</p>
                        )}
                        <p className="text-[10px] leading-relaxed opacity-85 text-neutral-800">{item.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleAddSectionItem(sec.id)}
                  className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center space-x-1 pt-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Clause Item to "{sec.title}"</span>
                </button>
              )}
            </div>
          ))}

          {isEditing && (
            <button
              type="button"
              onClick={handleAddDynamicSection}
              className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl border border-dashed border-amber-400 flex items-center justify-center space-x-1.5 cursor-pointer transition"
            >
              <Plus className="h-4 w-4" />
              <span>➕ Add Custom Dynamic Section Block</span>
            </button>
          )}
        </div>

        {/* Footer Signature & Branding Note */}
        <div className="pt-6 border-t border-neutral-300/40 flex items-center justify-between text-[10px] opacity-70 font-medium text-neutral-600">
          <p>Thank you for choosing {studioName} for your memorable occasions!</p>
          <p className="font-bold">{studioName} Official Quotation Document</p>
        </div>

      </div>

    </div>
  );
}
