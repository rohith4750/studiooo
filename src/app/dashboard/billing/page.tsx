'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  FileText, ClipboardCheck, Printer, CheckCircle, XCircle, Eye, 
  ArrowLeft, Download, Send, CreditCard, Sparkles, Building, QrCode, X 
} from 'lucide-react';

export default function BillingPage() {
  const { 
    quotations, invoices, fetchData, updateRecord, deleteRecord 
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'QUOTATIONS'>('INVOICES');
  
  // Document preview state
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [previewType, setPreviewType] = useState<'INVOICE' | 'QUOTATION'>('INVOICE');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('quotations', '?include={"booking":{"include":{"client":true,"bookingEvents":{"include":{"event":true}}}}}'),
      fetchData('invoices', '?include={"booking":{"include":{"client":true,"bookingEvents":{"include":{"event":true}}}}}'),
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  const handleUpdateQuotationStatus = async (id: string, status: string) => {
    try {
      await updateRecord('quotations', { id, status });
      
      // If approved, verify and update associated booking status to CONFIRMED
      const quote = quotations.find(q => q.id === id);
      if (quote && status === 'APPROVED') {
        await updateRecord('bookings', {
          id: quote.bookingId,
          status: 'CONFIRMED'
        });
      }

      alert(`Quotation status updated to ${status}!`);
      fetchData('quotations', '?include={"booking":{"include":{"client":true,"bookingEvents":{"include":{"event":true}}}}}');
    } catch (e) {
      alert('Failed to update status: ' + e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const openPreview = (doc: any, type: 'INVOICE' | 'QUOTATION') => {
    setPreviewDoc(doc);
    setPreviewType(type);
  };

  const handleDownloadPDF = async (docObj: any = previewDoc, typeStr: string = previewType) => {
    if (!docObj) {
      alert('No document selected.');
      return;
    }

    const generatePdf = async () => {
      const element = document.getElementById('pdf-document');
      if (!element) return;
      try {
        const { toPng } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');

        // Capture DOM as high-quality PNG
        const dataUrl = await toPng(element, { quality: 1, pixelRatio: 2 });
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${typeStr === 'INVOICE' ? 'Invoice' : 'Quotation'}_${docObj.booking?.bookingNumber || 'R2R'}.pdf`);
      } catch (err) {
        console.error('Failed to generate PDF', err);
        alert('Failed to generate PDF. Check console.');
      }
    };
    
    // Ensure the document is set so the layout renders
    if (previewDoc?.id !== docObj.id) {
      openPreview(docObj, typeStr as 'INVOICE' | 'QUOTATION');
      setTimeout(generatePdf, 500);
    } else {
      generatePdf();
    }
  };

  const handleDirectDownload = (doc: any, type: 'INVOICE' | 'QUOTATION') => {
    handleDownloadPDF(doc, type);
  };

  return (
    <div className="space-y-4">
      {/* Printable Area Wrapper (Only shown when printing) */}
      {previewDoc && (
        <div className="hidden print:block bg-white text-neutral-800 p-8 space-y-4 text-xs leading-relaxed w-full font-sans">
          {/* Logo / Company Header */}
          <div className="flex justify-between items-start border-b-2 border-primary-500 pb-4">
            <div>
              <h1 className="text-xl font-bold text-neutral-800 tracking-tight">R2R STUDIO</h1>
              <p className="text-[10px] text-neutral-400">Creative Photography & Cinematic Video</p>
              <p className="text-[10px] text-neutral-500 mt-1">102, Shanti Vihar, Jayanagar, Bengaluru</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-primary-600 tracking-wider">
                {previewType === 'INVOICE' ? 'TAX INVOICE' : 'STUDIO QUOTATION'}
              </h2>
              <p className="font-semibold text-neutral-700 mt-1">
                {previewType === 'INVOICE' ? previewDoc.invoiceNumber : `QTN-${previewDoc.booking?.bookingNumber}-${previewDoc.version}`}
              </p>
              <p className="text-neutral-400 text-[10px]">Date: {new Date(previewDoc.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Customer / Event details */}
          <div className="grid grid-cols-2 gap-5 text-[11px]">
            <div>
              <h4 className="font-bold text-neutral-500 border-b border-neutral-100 pb-1 mb-2 uppercase tracking-wide">Client Profile</h4>
              <p className="font-bold text-neutral-800">{previewDoc.booking?.client?.name}</p>
              <p className="text-neutral-500">Phone: {previewDoc.booking?.client?.phone}</p>
              {previewDoc.booking?.client?.email && <p className="text-neutral-500">Email: {previewDoc.booking?.client?.email}</p>}
              {previewDoc.booking?.client?.address && (
                <p className="text-neutral-500 mt-1">{previewDoc.booking?.client?.address}, {previewDoc.booking?.client?.city}</p>
              )}
            </div>
            <div>
              <h4 className="font-bold text-neutral-500 border-b border-neutral-100 pb-1 mb-2 uppercase tracking-wide">Contract Details</h4>
              <p className="text-neutral-500">Venue: {previewDoc.booking?.venue || 'As specified per shoot'}</p>
              <p className="text-neutral-500">Booking Reference: {previewDoc.booking?.bookingNumber}</p>
              {previewType === 'INVOICE' && <p className="text-neutral-500">HSN Code: {previewDoc.hsnCode || '998381'}</p>}
            </div>
          </div>

          {/* Event Items table */}
          <table className="w-full text-left border-collapse text-[10px] mt-4">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200">
                <th className="py-2 px-2">Shoot Event</th>
                <th className="py-2 px-2">Date & Time</th>
                <th className="py-2 px-2">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {previewDoc.booking?.bookingEvents?.map((be: any) => (
                <tr key={be.id}>
                  <td className="py-2.5 px-2 font-bold text-neutral-800">{be.event?.name}</td>
                  <td className="py-2.5 px-2">{be.eventDate} ({be.eventTime || 'TBA'})</td>
                  <td className="py-2.5 px-2">{be.venue || previewDoc.booking?.venue || 'Studio'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Payments */}
          <div className="grid grid-cols-2 gap-5 pt-4 border-t border-neutral-200">
            <div>
              {previewType === 'INVOICE' ? (
                <div className="p-3 bg-neutral-50 border border-neutral-200/50 rounded space-y-2">
                  <h4 className="font-bold text-neutral-500 uppercase text-[9px]">Outstanding collection details</h4>
                  <div className="space-y-1 text-[10px] text-neutral-600">
                    <div className="flex justify-between">
                      <span>Total Invoice Amount</span>
                      <span>₹{previewDoc.grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-primary-700 font-bold">
                      <span>Paid to Date</span>
                      <span>₹{previewDoc.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-accent-500 font-bold border-t border-neutral-200 pt-1">
                      <span>Balance Outstanding</span>
                      <span>₹{previewDoc.balance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-neutral-500 italic">
                  <p className="font-bold text-neutral-700 not-italic">Quotation Terms & Conditions</p>
                  <p className="mt-1">1. 50% advance to confirm booking.</p>
                  <p>2. RAW pictures delivered within 5 days.</p>
                  <p>3. Balance collected prior to printing delivery.</p>
                </div>
              )}
            </div>

            <div className="text-right space-y-1.5 text-[11px]">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>₹{((previewDoc.booking?.subtotal || 0) - (previewDoc.booking?.discount || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-800 font-extrabold text-xs border-t border-neutral-200 pt-1.5">
                <span>Grand Total</span>
                <span>₹{(previewDoc.grandTotal || previewDoc.amount || 0).toLocaleString('en-IN')}</span>
              </div>

              {/* QR and Signature */}
              <div className="pt-6 grid grid-cols-2 gap-4 items-end text-[9px] text-left">
                <div>
                  <p className="font-bold text-neutral-600 mb-1">Scan UPI to Pay</p>
                  <div className="h-16 w-16 border border-neutral-200 flex items-center justify-center bg-neutral-50">
                    <span className="font-mono text-[8px] text-neutral-400">UPI QR</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="italic font-bold text-neutral-500">Digitally Authorized</p>
                  <p className="font-bold text-neutral-800 mt-6">R2R Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen Interface (Only shown in browser screen) */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-800">Billing Center</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Track invoices, invoice balances, and version-controlled quotations.</p>
          </div>

          <div className="flex items-center space-x-1.5 p-1 bg-neutral-100 rounded">
            <button
              onClick={() => setActiveTab('INVOICES')}
              className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition ${
                activeTab === 'INVOICES' ? 'bg-white text-neutral-800 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('QUOTATIONS')}
              className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition ${
                activeTab === 'QUOTATIONS' ? 'bg-white text-neutral-800 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Quotations
            </button>
          </div>
        </div>

        {/* Ledger view */}
        <div className="glass-card rounded overflow-hidden border border-neutral-200/50">
          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-neutral-400">Loading ledger files...</div>
          ) : activeTab === 'INVOICES' ? (
            /* Invoices list */
            invoices.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">No generated invoices found. Create one from the Bookings page.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Invoice details</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Billing stats</th>
                      <th className="py-3 px-4">Outstanding Balance</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-neutral-50/40 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-neutral-800">{inv.invoiceNumber}</p>
                          <span className="text-[9px] text-neutral-400">Booking: {inv.booking?.bookingNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-neutral-700">{inv.booking?.client?.name}</p>
                        </td>
                        <td className="py-3 px-4 space-y-0.5">
                          <p className="font-bold">₹{inv.grandTotal.toLocaleString()}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block text-[10px] font-bold text-accent-500 bg-accent-50 px-1.5 py-0.5 rounded">
                            ₹{inv.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 border text-[10px] font-bold rounded-full tracking-wide ${
                            inv.status === 'PAID' ? 'bg-primary-50 text-primary-700 border-primary-100' : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleDirectDownload(inv, 'INVOICE')}
                              title="Download PDF"
                              className="p-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded cursor-pointer transition"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openPreview(inv, 'INVOICE')}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded hover:bg-neutral-100 text-neutral-600 font-semibold cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Preview</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* Quotations list */
            quotations.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">No generated quotations found. Create one from the Bookings page.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Quotation Version</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Proposed Value</th>
                      <th className="py-3 px-4">Booking Reference</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {quotations.map((q) => (
                      <tr key={q.id} className="hover:bg-neutral-50/40 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-neutral-800">Quotation V{q.version}</p>
                          <span className="text-[9px] text-neutral-400">Created: {new Date(q.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-neutral-700">{q.booking?.client?.name}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold">₹{q.booking?.grandTotal.toLocaleString()}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-mono text-neutral-400">{q.booking?.bookingNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 border text-[10px] font-bold rounded-full tracking-wide ${
                            q.status === 'APPROVED' ? 'bg-primary-50 text-primary-700 border-primary-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {q.status === 'SENT' && (
                              <>
                                <button
                                  onClick={() => handleUpdateQuotationStatus(q.id, 'APPROVED')}
                                  title="Approve & Confirm Booking"
                                  className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleUpdateQuotationStatus(q.id, 'REJECTED')}
                                  title="Reject Quotation"
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDirectDownload(q, 'QUOTATION')}
                              title="Download PDF"
                              className="p-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded cursor-pointer transition"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openPreview(q, 'QUOTATION')}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded hover:bg-neutral-100 text-neutral-600 font-semibold cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Preview</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Screen Preview Modal (Only shown in browser screen) */}
      {previewDoc && (
        <div className="print:hidden fixed inset-0 z-50 bg-neutral-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-3xl w-full shadow-lg border border-primary-100 flex flex-col h-[90vh] animate-scaleIn">
            
            {/* Modal Header Actions */}
            <div className="p-4 border-b border-primary-100/50 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800 flex items-center space-x-1.5 text-xs sm:text-sm">
                <Sparkles className="h-4.5 w-4.5 text-primary-500" />
                <span>Document PDF print Preview</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadPDF()}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-semibold cursor-pointer shadow-sm transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded text-xs font-semibold cursor-pointer shadow-sm transition"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 hover:bg-neutral-100 rounded text-neutral-400 ml-2"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Document sheet wrapper */}
            <div className="flex-1 overflow-y-auto p-8 bg-neutral-100/50 flex justify-center">
              <div id="pdf-document" className="bg-white p-10 w-full max-w-[700px] shadow-sm border border-neutral-200/50 space-y-5 text-xs text-neutral-700 leading-relaxed font-sans min-h-[842px]">
                
                {/* Header branding */}
                <div className="flex justify-between items-start border-b-2 border-primary-500 pb-4">
                  <div>
                    <h1 className="text-base font-extrabold text-neutral-800 flex items-center space-x-1.5">
                      <Building className="h-4.5 w-4.5 text-primary-500" />
                      <span>R2R STUDIO</span>
                    </h1>
                    <p className="text-[10px] text-neutral-400">Creative Photography & Cinematic Video</p>
                    <p className="text-[10px] text-neutral-500 mt-1">102, Shanti Vihar, Jayanagar, Bengaluru</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-sm font-bold text-primary-600 tracking-wider">
                      {previewType === 'INVOICE' ? 'TAX INVOICE' : 'STUDIO QUOTATION'}
                    </h2>
                    <p className="font-bold text-neutral-700 text-xs mt-0.5">
                      {previewType === 'INVOICE' ? previewDoc.invoiceNumber : `QTN-${previewDoc.booking?.bookingNumber}-V${previewDoc.version}`}
                    </p>
                    <p className="text-neutral-400 text-[10px] mt-0.5">Date: {new Date(previewDoc.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-5 text-[11px]">
                  <div>
                    <h4 className="font-bold text-neutral-400 border-b border-neutral-100 pb-0.5 mb-1.5 uppercase tracking-wide">Client Profile</h4>
                    <p className="font-bold text-neutral-800 text-xs">{previewDoc.booking?.client?.name}</p>
                    <p className="text-neutral-500">Phone: {previewDoc.booking?.client?.phone}</p>
                    {previewDoc.booking?.client?.email && <p className="text-neutral-500">Email: {previewDoc.booking?.client?.email}</p>}
                    {previewDoc.booking?.client?.address && (
                      <p className="text-neutral-500 mt-1">{previewDoc.booking?.client?.address}, {previewDoc.booking?.client?.city}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-400 border-b border-neutral-100 pb-0.5 mb-1.5 uppercase tracking-wide">Contract Details</h4>
                    <p className="text-neutral-500">Venue: {previewDoc.booking?.venue || 'As specified per shoot'}</p>
                    <p className="text-neutral-500">Booking Reference: {previewDoc.booking?.bookingNumber}</p>
                    {previewType === 'INVOICE' && <p className="text-neutral-500">HSN Code: {previewDoc.hsnCode || '998381'}</p>}
                  </div>
                </div>

                {/* Event Deliverables & Schedule (Bulleted Points) */}
                <div className="mt-8 mb-6 bg-neutral-50/50 p-4 rounded border border-neutral-100">
                  <h4 className="font-extrabold text-neutral-800 border-b border-neutral-200 pb-2 mb-4 text-[11px] uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-primary-500" />
                    <span>Shoot Deliverables & Schedule</span>
                  </h4>
                  <ul className="space-y-3.5 pl-1">
                    {previewDoc.booking?.bookingEvents?.map((be: any) => (
                      <li key={be.id} className="flex items-start">
                        <span className="text-primary-500 font-bold mr-2.5 mt-0.5 text-sm">•</span>
                        <div>
                          <p className="font-extrabold text-neutral-800 text-[12px]">{be.event?.name}</p>
                          <p className="text-neutral-500 text-[10px] mt-0.5">
                            <span className="font-semibold text-neutral-600">Schedule:</span> {be.eventDate} ({be.eventTime || 'TBA'}) &nbsp;|&nbsp; 
                            <span className="font-semibold text-neutral-600 ml-1">Location:</span> {be.venue || previewDoc.booking?.venue || 'Studio'}
                          </p>
                        </div>
                      </li>
                    ))}
                    {/* Standard included deliverable point */}
                    <li className="flex items-start">
                      <span className="text-primary-500 font-bold mr-2.5 mt-0.5 text-sm">•</span>
                      <div>
                        <p className="font-extrabold text-neutral-800 text-[12px]">High-Resolution Digital Assets</p>
                        <p className="text-neutral-500 text-[10px] mt-0.5">
                          Professional color-graded photos and cinematic highlights delivered via secure cloud link.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Financial breakdown */}
                <div className="grid grid-cols-2 gap-5 pt-4 border-t border-neutral-200">
                  <div>
                    {previewType === 'INVOICE' ? (
                      <div className="p-3 bg-neutral-50 border border-neutral-200/50 rounded space-y-2 text-[10px]">
                        <h4 className="font-bold text-neutral-500 uppercase text-[8px] tracking-wider">Receipt collections</h4>
                        <div className="space-y-1 text-neutral-600">
                          <div className="flex justify-between">
                            <span>Total Invoice Value</span>
                            <span>₹{previewDoc.grandTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-primary-700 font-bold">
                            <span>Paid to Date</span>
                            <span>₹{previewDoc.paidAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-accent-500 font-bold border-t border-neutral-200 pt-1">
                            <span>Outstanding Balance</span>
                            <span>₹{previewDoc.balance.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-neutral-600 mt-2">
                        <h4 className="font-bold text-neutral-800 uppercase tracking-wide text-[9px] mb-2">Terms & Conditions</h4>
                        <ul className="space-y-1.5 list-none pl-1 text-[9px]">
                          <li className="flex items-start">
                            <span className="text-primary-400 mr-2 font-bold">•</span>
                            <span>50% advance to confirm booking contract.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary-400 mr-2 font-bold">•</span>
                            <span>RAW pictures shared within 5 days of shoot.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-primary-400 mr-2 font-bold">•</span>
                            <span>Balance collected prior to final print/album delivery.</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-1.5 text-[10px]">
                    <div className="flex justify-between text-neutral-500">
                      <span>Subtotal</span>
                      <span>₹{((previewDoc.booking?.subtotal || 0) - (previewDoc.booking?.discount || 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-neutral-800 font-extrabold text-xs border-t border-neutral-200 pt-1.5">
                      <span>Grand Total</span>
                      <span>₹{(previewDoc.grandTotal || previewDoc.amount || 0).toLocaleString('en-IN')}</span>
                    </div>

                    {/* QR Code and digital signatures */}
                    <div className="pt-6 grid grid-cols-2 gap-4 items-end text-[9px] text-left">
                      <div className="space-y-1">
                        <p className="font-bold text-neutral-500 uppercase text-[8px] tracking-wider">Scan UPI to pay</p>
                        <div className="p-2 border border-neutral-200 rounded bg-neutral-50/50 inline-flex items-center space-x-1">
                          <QrCode className="h-8 w-8 text-neutral-700" />
                          <span className="font-mono text-[7px] text-neutral-400">R2R UPI</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="italic font-bold text-primary-600 font-mono text-[8px]">Digitally Authorized</p>
                        <p className="font-bold text-neutral-800">R2R Studio</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
