'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import QuotationTemplate from '@/components/QuotationTemplate';
import { 
  FileText, Download, Printer, ArrowLeft, Sparkles, RefreshCw, Plus, CheckCircle
} from 'lucide-react';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';

function QuotationStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('bookingId');

  const { quotations, bookings, fetchData } = useStore();

  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(initialId || '');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('quotations', '?include={"booking":{"include":{"client":true,"bookingEvents":{"include":{"event":true}}}}}'),
      fetchData('bookings', '?include={"client":true,"package":true,"bookingEvents":{"include":{"event":true}}}'),
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  useEffect(() => {
    if (selectedBookingId && (bookings.length > 0 || quotations.length > 0)) {
      // Find matching quote or booking
      const foundQuote = quotations.find((q: any) => q.id === selectedBookingId || q.bookingId === selectedBookingId);
      if (foundQuote) {
        setSelectedQuote(foundQuote);
      } else {
        const foundBooking = bookings.find((b: any) => b.id === selectedBookingId);
        if (foundBooking) {
          setSelectedQuote({
            id: `temp-${foundBooking.id}`,
            bookingId: foundBooking.id,
            booking: foundBooking,
            version: 1,
            grandTotal: foundBooking.grandTotal,
            createdAt: new Date().toISOString()
          });
        }
      }
    } else if (quotations.length > 0 && !selectedQuote) {
      setSelectedQuote(quotations[0]);
      setSelectedBookingId(quotations[0].bookingId || quotations[0].id);
    } else if (bookings.length > 0 && !selectedQuote) {
      setSelectedQuote({
        id: `temp-${bookings[0].id}`,
        bookingId: bookings[0].id,
        booking: bookings[0],
        version: 1,
        grandTotal: bookings[0].grandTotal,
        createdAt: new Date().toISOString()
      });
      setSelectedBookingId(bookings[0].id);
    }
  }, [selectedBookingId, quotations, bookings]);

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('pdf-document');
    if (!element) {
      alert('Document not ready');
      return;
    }
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const dataUrl = await toPng(element, { quality: 1, pixelRatio: 2 });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `Quotation_${selectedQuote?.booking?.client?.name || 'R2R'}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF Generation error:', err);
      alert('Failed to generate PDF. Check browser console.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
        <span className="text-xs font-semibold text-neutral-400">Loading Quotation Studio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-16">
      
      {/* Top Header Banner */}
      <div className="print:hidden bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">Quotation Studio Page</h1>
          </div>
          <p className="text-xs text-neutral-500 font-medium">
            Dedicated full-page workspace for creating, customizing, and exporting studio quotations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Booking Selector */}
          <div className="min-w-[220px]">
            <FormControl fullWidth size="small">
              <InputLabel id="select-booking-label">Select Client Booking</InputLabel>
              <Select
                labelId="select-booking-label"
                value={selectedBookingId}
                label="Select Client Booking"
                onChange={(e) => handleSelectBooking(e.target.value)}
                sx={{ borderRadius: '0.75rem', bgcolor: 'neutral.50', fontSize: '0.8rem' }}
              >
                {bookings.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.client?.name || b.name || 'Client'} (#{b.bookingNumber})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/billing')}
            className="inline-flex items-center space-x-1 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Billing</span>
          </button>
        </div>
      </div>

      {/* Main Quotation Sheet Canvas (Dedicated Full Page Container) */}
      <div className="flex justify-center w-full">
        {/* Printable & Canvas Element */}
        <div id="pdf-document" className="w-full max-w-[760px] flex justify-center">
          <QuotationTemplate doc={selectedQuote} showControls={true} />
        </div>
      </div>

    </div>
  );
}

export default function QuotationStudioPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    }>
      <QuotationStudioContent />
    </Suspense>
  );
}
