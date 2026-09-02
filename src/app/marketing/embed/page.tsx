'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Sparkles, AlertCircle, Phone, Calendar, User, Mail, DollarSign, FileText } from 'lucide-react';

const EVENT_TYPES = [
  'Wedding Photography & Film',
  'Pre-Wedding Shoot',
  'Engagement / Ring Ceremony',
  'Haldi & Mehendi Celebration',
  'Birthday & Milestone Party',
  'Maternity & Baby Shoot',
  'Corporate & Commercial Event',
  'Other Custom Project',
];

export default function EmbeddableLeadFormPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    event: EVENT_TYPES[0],
    eventDate: '',
    budget: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg('Name and Phone Number are required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/marketing/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'WEBSITE',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSuccessMsg(data.message || 'Thank you! Your inquiry has been sent to R2R Studio.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        event: EVENT_TYPES[0],
        eventDate: '',
        budget: '',
        notes: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while sending your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xl text-neutral-900">
        
        <div className="flex items-center space-x-3 border-b border-neutral-100 pb-4 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            R2R
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-neutral-900">R2R Studio Inquiry Form</h2>
            <p className="text-[10px] text-neutral-500 font-medium">Directly syncs to R2R Studio CRM</p>
          </div>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-neutral-900">Inquiry Sent!</h3>
            <p className="text-xs text-neutral-600">{successMsg}</p>
            <button
              onClick={() => setSuccessMsg('')}
              className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-black"
            >
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs outline-none focus:bg-white focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs outline-none focus:bg-white focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">Event Type *</label>
                <select
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs outline-none focus:bg-white focus:border-amber-500 font-medium"
                >
                  {EVENT_TYPES.map((ev, i) => (
                    <option key={i} value={ev} className="bg-white text-neutral-900">{ev}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">Event Date</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs outline-none focus:bg-white focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">Notes / Requirements</label>
              <textarea
                rows={2}
                placeholder="Venue location, guest count, or preferences..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs outline-none focus:bg-white focus:border-amber-500 resize-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
