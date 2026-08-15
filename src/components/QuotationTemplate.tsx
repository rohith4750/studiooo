'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, Sparkles } from 'lucide-react';

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

  // Helper to resolve initial deliverables for an event name
  const getDefaultDeliverables = (eventName: string): string[] => {
    const nameLower = (eventName || '').toLowerCase();
    if (nameLower.includes('pre') || nameLower.includes('pre-wedding') || nameLower.includes('pre wedding')) {
      return [
        '1 Candid Photographer',
        '1 Candid Videographer',
        '20 Sheets Album',
        'Trailer Video'
      ];
    }
    if (nameLower.includes('engagement') || nameLower.includes('ring')) {
      return [
        '1 Candid Photographer',
        '1 Candid Videographer',
        '1 Traditional Photographer',
        '1 Traditional Videographer',
        '30-35 Sheets Album',
        'Trailer Video',
        'Full Length video',
        '1 Reel'
      ];
    }
    if (nameLower.includes('haldi') || nameLower.includes('sangeet')) {
      return [
        '1 Candid Photographer',
        '1 Candid Videographer',
        '1 Traditional Photographer',
        '1 Traditional Videographer',
        '20 Sheets Album',
        'Trailer Video',
        'Full Length video'
      ];
    }
    if (nameLower.includes('pellikuthuru') || nameLower.includes('mehendi')) {
      return [
        '1 Traditional Photographer',
        '1 Traditional Videographer',
        'Full Length video'
      ];
    }
    if (nameLower.includes('wedding') || nameLower.includes('marriage')) {
      return [
        '1 Candid Photographer',
        '1 Candid Videographer',
        '1 Traditional Photographer',
        '1 Traditional Videographer',
        '50 Sheets Album',
        'Trailer Video',
        'Full Length video',
        '1 Reel'
      ];
    }
    if (nameLower.includes('reception')) {
      return [
        '1 Candid Photographer',
        '1 Candid Videographer',
        '1 Traditional Photographer',
        '1 Traditional Videographer',
        '30-35 Sheets Album',
        'Trailer Video',
        'Full Length video'
      ];
    }

    return [
      '1 Candid Photographer',
      '1 Traditional Photographer',
      '1 Traditional Videographer',
      'Full Length HD Video & Edited Album'
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

    // Default sample template items matching the uploaded PDF layout exactly
    return [
      { name: 'Pre - Wedding', price: 38000, deliverables: getDefaultDeliverables('Pre - Wedding') },
      { name: 'Engagement', price: 70000, deliverables: getDefaultDeliverables('Engagement') },
      { name: 'Haldi', price: 59000, deliverables: getDefaultDeliverables('Haldi') },
      { name: 'Pellikuthuru', price: 19000, deliverables: getDefaultDeliverables('Pellikuthuru') },
      { name: 'Wedding', price: 78000, deliverables: getDefaultDeliverables('Wedding') },
      { name: 'Reception', price: 69000, deliverables: getDefaultDeliverables('Reception') }
    ];
  };

  // Editable template state
  const [isEditing, setIsEditing] = useState(false);
  const [clientName, setClientName] = useState(client.name || booking.name || 'Rohith');
  const [studioLogoUrl, setStudioLogoUrl] = useState('/r2r-logo.png');
  const [studioHandle, setStudioHandle] = useState('@R2RSTUDIOPHOTOGRAPHY');
  const [studioMobile, setStudioMobile] = useState('9398534380');
  const [studioAddress, setStudioAddress] = useState('Office : Road No 3A, HNo:- 12-5-149/12/2/A, Vijayapuri Colony, Tarnaka, Hyderabad.');
  
  const [eventItems, setEventItems] = useState<EventItem[]>(buildInitialEvents());
  const [paymentSchedule, setPaymentSchedule] = useState<string[]>([
    'Advance 30%',
    'On Event 50%',
    'after Album and videos deliver 20%'
  ]);
  const [terms, setTerms] = useState<string[]>([
    'Travel and Accommodation for any events covered must be provided by clients',
    'From our side we will provide one set of album. In need of any extra copies only printing charges are applicable',
    'Any requests for extra sheets in album, will be charged an additional Rs:600/- per extra sheet',
    'According to the Client Responsiveness we will delivery Albums',
    'By chance if any event postponed from your end coverage of the event will be depending on the availability of our dates'
  ]);

  // Sync state if doc changes
  useEffect(() => {
    if (client.name || booking.name) setClientName(client.name || booking.name);
    setEventItems(buildInitialEvents());
  }, [doc]);

  const calculatedGrandTotal = eventItems.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  const formatAmount = (num: number) => {
    return (num || 0).toLocaleString('en-IN') + '/-';
  };

  // Handlers for template editing
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
        name: 'New Custom Event',
        price: 25000,
        deliverables: ['1 Candid Photographer', '1 Traditional Videographer', 'Edited Album & Video']
      }
    ]);
  };

  const handleRemoveEvent = (idx: number) => {
    setEventItems(eventItems.filter((_, i) => i !== idx));
  };

  const handleUpdateTerms = (text: string) => {
    setTerms(text.split('\n'));
  };

  const handleUpdateSchedule = (text: string) => {
    setPaymentSchedule(text.split('\n'));
  };

  return (
    <div className="w-full flex flex-col items-center font-sans">
      
      {/* Interactive Customizer Bar (Only shown on screen when showControls is true) */}
      {showControls && (
        <div className="print:hidden w-full max-w-[760px] mb-4 p-3 bg-neutral-900 text-white rounded-lg flex items-center justify-between shadow-md border border-neutral-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold tracking-wide">PDF Template Customizer</span>
            <span className="text-[10px] text-neutral-400 hidden sm:inline">
              ({isEditing ? 'Editing fields live...' : 'Preview Mode'})
            </span>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold cursor-pointer transition ${
              isEditing ? 'bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400' : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Done Editing & Lock PDF</span>
              </>
            ) : (
              <>
                <Edit2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Customize Template Fields</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Quotation Sheet Container */}
      <div className="relative bg-white text-neutral-900 font-sans p-6 sm:p-10 border-l-[16px] sm:border-l-[20px] border-[#F59E0B] shadow-sm min-h-[950px] w-full max-w-[760px] text-left border-y border-r border-neutral-200">
        
        {/* Header Section */}
        <div className="flex justify-between items-start pb-6 border-b border-neutral-300 gap-4">
          
          {/* Left Header: QR & Contact Details */}
          <div className="space-y-1.5 text-xs text-neutral-700">
            <div className="flex items-center space-x-3">
              {/* Instagram / QR Box */}
              <div className="h-16 w-16 bg-neutral-900 text-white rounded p-1 flex flex-col items-center justify-center border border-neutral-200 flex-shrink-0">
                <svg className="w-9 h-9 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
                  <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
                  <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
                  <rect x="14" y="14" width="3" height="3" fill="currentColor" />
                  <rect x="18" y="18" width="3" height="3" fill="currentColor" />
                </svg>
              </div>
              <div className="space-y-0.5">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={studioHandle}
                      onChange={(e) => setStudioHandle(e.target.value)}
                      className="font-extrabold text-[11px] uppercase tracking-wider text-neutral-900 border-b border-amber-300 focus:outline-none w-full"
                    />
                    <input
                      type="text"
                      value={studioMobile}
                      onChange={(e) => setStudioMobile(e.target.value)}
                      className="font-semibold text-neutral-700 text-[11px] border-b border-amber-300 focus:outline-none w-full"
                    />
                  </>
                ) : (
                  <>
                    <p className="font-extrabold text-[11px] uppercase tracking-wider text-neutral-900">
                      {studioHandle}
                    </p>
                    <p className="font-semibold text-neutral-700 text-[11px]">
                      Mobile No: {studioMobile}
                    </p>
                    <p className="text-neutral-500 text-[10px]">
                      instagram.com/r2rstudiophotography
                    </p>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={studioAddress}
                onChange={(e) => setStudioAddress(e.target.value)}
                rows={2}
                className="text-[10px] text-neutral-600 font-medium pt-1 w-full border border-amber-300 rounded p-1"
              />
            ) : (
              <p className="text-[10px] text-neutral-600 font-medium pt-1 max-w-md leading-relaxed">
                {studioAddress}
              </p>
            )}
          </div>

          {/* Right Header: Official R2R Logo Image */}
          <div className="text-right flex-shrink-0 flex flex-col items-end">
            <img
              src={studioLogoUrl}
              alt="R2R Story Arcs Logo"
              className="h-20 sm:h-24 w-auto object-contain max-w-[200px]"
            />
            {isEditing && (
              <input
                type="text"
                value={studioLogoUrl}
                onChange={(e) => setStudioLogoUrl(e.target.value)}
                placeholder="Logo Image Path"
                className="text-[9px] text-right border-b border-amber-300 focus:outline-none mt-1 w-36"
              />
            )}
          </div>


        </div>

        {/* Main Title: Quotation For [Client Name] */}
        <div className="my-6 flex items-center justify-between">
          {isEditing ? (
            <div className="flex items-center space-x-2 text-2xl font-extrabold text-neutral-800">
              <span>Quotation For</span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="border-b-2 border-amber-400 font-extrabold focus:outline-none text-neutral-900 px-1"
              />
            </div>
          ) : (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">
              Quotation For {clientName}
            </h2>
          )}
        </div>

        {/* Per-Event Service Breakdown */}
        <div className="space-y-6">
          {eventItems.map((item, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start pb-4 border-b border-neutral-100 relative group">
              
              {/* Left Column: Event Name & Deliverables */}
              <div className="sm:col-span-2 space-y-1.5">
                {isEditing ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateEventName(idx, e.target.value)}
                        className="text-lg font-bold text-neutral-800 tracking-wide border-b border-amber-300 focus:outline-none w-full mr-2"
                      />
                      <button
                        onClick={() => handleRemoveEvent(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <label className="text-[9px] font-bold text-neutral-400 uppercase block">Deliverables (1 per line):</label>
                    <textarea
                      rows={item.deliverables.length || 3}
                      value={item.deliverables.join('\n')}
                      onChange={(e) => handleUpdateDeliverables(idx, e.target.value)}
                      className="w-full text-xs text-neutral-700 p-1.5 border border-amber-200 rounded font-sans focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-neutral-800 tracking-wide">
                      {item.name}
                    </h3>
                    <ul className="space-y-1 text-xs text-neutral-600 font-medium">
                      {item.deliverables.map((dItem, dIdx) => (
                        <li key={dIdx} className="flex items-center">
                          <span className="mr-2 text-neutral-400">•</span>
                          <span>{dItem}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Right Column: Event Subtotal & Note */}
              <div className="sm:text-right space-y-1 flex flex-col sm:items-end justify-start">
                <div className="flex items-center space-x-3 text-lg font-extrabold text-neutral-900">
                  <span className="font-bold text-neutral-500 text-sm">Total</span>
                  <span className="text-neutral-400 font-normal">|</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleUpdateEventPrice(idx, e.target.value)}
                      className="w-28 text-right font-extrabold text-xl border-b border-amber-300 focus:outline-none"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl">{formatAmount(item.price)}</span>
                  )}
                </div>
                <p className="text-[9px] text-neutral-400 font-medium leading-tight max-w-[190px]">
                  Note: Additional charges applicable for extra videographer/photographer
                </p>
              </div>
            </div>
          ))}

          {isEditing && (
            <button
              onClick={handleAddEvent}
              className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded border border-dashed border-amber-400 flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Event Block</span>
            </button>
          )}
        </div>

        {/* Grand Total & Payment Schedule Block */}
        <div className="mt-8 pt-4 border-t-2 border-neutral-200 flex flex-col items-end space-y-3">
          <div className="flex items-center space-x-3 text-2xl font-extrabold text-neutral-900">
            <span className="font-bold text-neutral-700 text-lg">Grand Total</span>
            <span className="text-neutral-400 font-normal">|</span>
            <span className="text-2xl sm:text-3xl text-neutral-900">{formatAmount(calculatedGrandTotal)}</span>
          </div>
          <p className="text-[10px] text-neutral-400 font-medium text-right max-w-xs">
            Note: Additional charges applicable for extra videographer/photographer
          </p>

          {/* Milestone Schedule */}
          <div className="text-right space-y-0.5 text-xs font-semibold text-neutral-700 pt-2 w-full max-w-xs">
            {isEditing ? (
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase block text-right">Payment Schedule (1 per line):</label>
                <textarea
                  rows={3}
                  value={paymentSchedule.join('\n')}
                  onChange={(e) => handleUpdateSchedule(e.target.value)}
                  className="w-full text-xs text-right border border-amber-200 p-1 rounded"
                />
              </div>
            ) : (
              paymentSchedule.map((sched, sIdx) => (
                <p key={sIdx}>{sched}</p>
              ))
            )}
          </div>
        </div>

        {/* Terms and Conditions Section */}
        <div className="mt-10 space-y-2 pt-4">
          <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider">
            Terms and Conditions :
          </h4>
          {isEditing ? (
            <textarea
              rows={5}
              value={terms.join('\n')}
              onChange={(e) => handleUpdateTerms(e.target.value)}
              className="w-full text-[10px] text-neutral-700 p-2 border border-amber-200 rounded font-mono"
            />
          ) : (
            <ul className="space-y-1 text-[10px] text-neutral-600 leading-relaxed font-normal">
              {terms.map((term, tIdx) => (
                <li key={tIdx}>{term}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom Horizontal Accent Line */}
        <div className="mt-8 border-b-2 border-neutral-800 w-full" />

      </div>

    </div>
  );
}
