'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import { 
  CheckCircle2, ArrowLeft, MapPin, CalendarDays, ArrowRight, RefreshCw,
  Sparkles, FileText, Check, Clock, ChevronRight, Zap, PlayCircle, AlertCircle
} from 'lucide-react';
import { TextField } from '@mui/material';

const CHAIN_STAGES = [
  { step: 1, key: 'QUOTATION', label: 'Quotation', desc: 'Draft proposal sent to client' },
  { step: 2, key: 'PENDING', label: 'Pending', desc: 'Awaiting client approval or advance deposit' },
  { step: 3, key: 'CONFIRMED', label: 'Confirmed', desc: 'Booking locked and deposit cleared' },
  { step: 4, key: 'IN_PROGRESS', label: 'Shoot On-Site', desc: 'Event shoot actively underway' },
  { step: 5, key: 'EDITING', label: 'Editing', desc: 'Raw media in post-production queue' },
  { step: 6, key: 'ALBUM_DESIGNING', label: 'Album Design', desc: 'Album mockup drafting and client review' },
  { step: 7, key: 'PRINTING', label: 'Printing Press', desc: 'Approved album sent to print press' },
  { step: 8, key: 'READY_FOR_DELIVERY', label: 'Ready', desc: 'Deliverables packaged for dispatch' },
  { step: 9, key: 'COMPLETED', label: 'Completed', desc: 'All deliverables sent and balance paid' },
];

function UpdateStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { bookings, invoices, quotations, fetchData, updateRecord, createRecord } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('bookings', '?include={"client":true,"package":true}'),
      fetchData('invoices'),
      fetchData('quotations')
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  const booking = bookings.find((b) => b.id === bookingId);

  useEffect(() => {
    if (booking) {
      setTargetStatus(booking.status);
    }
  }, [booking]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    if (targetStatus === booking.status) {
      toast('Selected status is already active', 'info');
      return;
    }

    setSaving(true);
    const combinedNotes = statusComment.trim() 
      ? `${new Date().toLocaleDateString('en-IN')}: [Chain advanced to ${targetStatus}] ${statusComment}. ${booking.notes || ''}`
      : booking.notes;

    try {
      await updateRecord('bookings', {
        id: booking.id,
        status: targetStatus,
        notes: combinedNotes
      });

      if (targetStatus === 'CONFIRMED') {
        const existingInvoice = invoices.find(i => i.bookingId === booking.id);
        if (!existingInvoice) {
          const invNum = `INV-${booking.bookingNumber}-${Math.floor(100 + Math.random() * 900)}`;
          await createRecord('invoices', {
            bookingId: booking.id,
            invoiceNumber: invNum,
            gstRate: 0,
            gstAmount: 0,
            totalAmount: booking.grandTotal,
            grandTotal: booking.grandTotal,
            paidAmount: booking.paidAmount || 0,
            balance: booking.balance ?? booking.grandTotal,
            status: (booking.balance === 0 && booking.grandTotal > 0) ? 'PAID' : ((booking.paidAmount || 0) > 0 ? 'PARTIALLY_PAID' : 'UNPAID'),
          });
          toast(`Booking updated to ${targetStatus} and Invoice ${invNum} auto-generated!`, 'success');
        } else {
          toast(`Booking ${booking.bookingNumber} updated to ${targetStatus}!`, 'success');
        }
      } else if (targetStatus === 'QUOTATION') {
        const existingQuote = quotations?.find(q => q.bookingId === booking.id);
        if (!existingQuote) {
          await createRecord('quotations', {
            bookingId: booking.id,
            version: 1,
            terms: 'Payment schedule: 50% advance, 40% on shoot completion, 10% on album delivery.',
            status: 'SENT',
          });
          toast(`Booking updated to ${targetStatus} and Quotation auto-generated!`, 'success');
        } else {
          toast(`Booking ${booking.bookingNumber} updated to ${targetStatus}!`, 'success');
        }
      } else {
        toast(`Booking ${booking.bookingNumber} updated to ${targetStatus}!`, 'success');
      }

      setStatusComment('');
      router.push('/dashboard/bookings/status');
    } catch (err) {
      toast('Failed to update booking status: ' + err, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
        <span className="text-xs font-semibold text-neutral-400">Loading chain pipeline...</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-sm font-bold text-red-600">Booking record not found</p>
        <button 
          onClick={() => router.push('/dashboard/bookings/status')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-bold transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Status Roster</span>
        </button>
      </div>
    );
  }

  const currentIdx = CHAIN_STAGES.findIndex(s => s.key === booking.status);
  const targetIdx = CHAIN_STAGES.findIndex(s => s.key === targetStatus);
  const nextStageNode = currentIdx < CHAIN_STAGES.length - 1 ? CHAIN_STAGES[currentIdx + 1] : null;

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-900 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-amber-500 fill-amber-400" />
              <span>Chain Mode Pipeline: #{booking.bookingNumber}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
              Active Step {currentIdx + 1} of {CHAIN_STAGES.length}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 font-medium">
            Client: <span className="font-bold text-neutral-800">{booking.client?.name}</span> • Advance through interconnected stage nodes.
          </p>
        </div>

        <button 
          onClick={() => router.push('/dashboard/bookings/status')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Roster</span>
        </button>
      </div>

      {/* Connected Visual Chain Pipeline Bar */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4 overflow-x-auto">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 block">
          Sequential Stage Chain Nodes (Click any node to select)
        </span>

        <div className="flex items-center space-x-2 min-w-[760px] py-3">
          {CHAIN_STAGES.map((node, idx) => {
            const isCurrent = node.key === booking.status;
            const isSelected = node.key === targetStatus;
            const isCompleted = idx < currentIdx;

            return (
              <React.Fragment key={node.key}>
                {/* Chain Node */}
                <div
                  onClick={() => setTargetStatus(node.key)}
                  className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center relative ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-md scale-105 z-10'
                      : isCurrent
                        ? 'border-amber-400 bg-amber-50 text-neutral-900 ring-2 ring-amber-200'
                        : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                          : 'border-neutral-200/80 bg-white text-neutral-400 hover:border-neutral-300'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-extrabold mb-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-900'
                      : isCurrent
                        ? 'bg-amber-500 text-white animate-pulse'
                        : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : node.step}
                  </div>
                  
                  <span className="font-bold text-[11px] leading-tight block">{node.label}</span>
                  <span className={`text-[8px] mt-1 uppercase font-semibold ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                    {isCurrent ? 'Current' : isSelected ? 'Target' : isCompleted ? 'Done' : 'Next'}
                  </span>
                </div>

                {/* Interconnecting Chain Connector Line */}
                {idx < CHAIN_STAGES.length - 1 && (
                  <div className="flex items-center justify-center">
                    <div className={`h-1 w-5 rounded-full transition-colors ${
                      idx < currentIdx ? 'bg-emerald-500' : idx === currentIdx ? 'bg-amber-400' : 'bg-neutral-200'
                    }`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Contract Profile & Financials */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-5 h-fit">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block mb-1">Contract Profile</span>
            <h3 className="text-lg font-extrabold text-neutral-900">#{booking.bookingNumber}</h3>
            <p className="text-xs text-neutral-600 font-semibold mt-0.5">{booking.client?.name}</p>
          </div>

          <hr className="border-neutral-100" />

          {/* Financials */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Contract Billing:</span>
              <span className="font-extrabold text-neutral-900">₹{booking.grandTotal?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-neutral-200/50">
              <span className="text-neutral-500">Balance Due:</span>
              <span className={`font-extrabold ${booking.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ₹{booking.balance?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-xs">
            {booking.package && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 flex items-center space-x-3">
                <CalendarDays className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-neutral-800">Package Preset</p>
                  <p className="text-[10px] text-neutral-500">{booking.package.name} (₹{booking.package.price.toLocaleString('en-IN')})</p>
                </div>
              </div>
            )}

            {booking.venue && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 flex items-center space-x-3">
                <MapPin className="h-4.5 w-4.5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-neutral-800">Shoot Venue</p>
                  <p className="text-[10px] text-neutral-500">{booking.venue}</p>
                </div>
              </div>
            )}
          </div>

          {/* Past Notes */}
          {booking.notes && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Past Chain Audit Log</span>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 max-h-40 overflow-y-auto text-[11px] text-neutral-600 leading-relaxed font-mono">
                {booking.notes}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Chain Target & Action Control */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs lg:col-span-2 space-y-6">
          
          {/* Active Chain Transition Card */}
          <div className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-white rounded-2xl border border-amber-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 flex items-center space-x-1.5">
                <PlayCircle className="h-4 w-4 text-amber-600" />
                <span>Selected Target Node</span>
              </span>
              <span className="text-xs font-bold text-neutral-800 bg-white px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
                Stage {targetIdx + 1} of {CHAIN_STAGES.length}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-neutral-900">{CHAIN_STAGES[targetIdx]?.label}</h2>
              <p className="text-xs text-neutral-600 font-medium">{CHAIN_STAGES[targetIdx]?.desc}</p>
            </div>

            {nextStageNode && targetStatus === booking.status && (
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                <span className="text-xs text-neutral-600 font-semibold">Fast Advance Chain:</span>
                <button
                  type="button"
                  onClick={() => setTargetStatus(nextStageNode.key)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
                >
                  <span>Advance to Next: {nextStageNode.label}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Form and Remarks */}
          <form onSubmit={handleUpdateStatus} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                Chain Transition Audit Remarks / Work Notes
              </label>
              <textarea
                rows={3}
                placeholder="Enter audit reasons or updates for this chain advancement (e.g., photoshoot wrapped, raw files transferred, album proof approved by client)..."
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                className="w-full p-3.5 bg-neutral-50 border border-neutral-200/80 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-neutral-800 font-sans"
              />
            </div>

            <hr className="border-neutral-100" />

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/bookings/status')}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || targetStatus === booking.status}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-neutral-900 hover:bg-black disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{saving ? 'Advancing Chain...' : `Confirm & Transition to Stage ${targetIdx + 1}`}</span>
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
}

export default function UpdateStatusPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    }>
      <UpdateStatusContent />
    </Suspense>
  );
}
