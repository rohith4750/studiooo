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

export default function MarketingLeadInquiryForm() {
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
      setErrorMsg('Please enter your Name and Phone Number.');
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
    <section id="inquiry" className="py-20 bg-gradient-to-b from-white via-amber-50/40 to-white text-neutral-900 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Direct Studio Inquiry</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900">
            Book Your Shoot with R2R Studio
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto">
            Fill out the form below. Our team will review your date availability and send you a custom quotation immediately.
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          
          {successMsg ? (
            <div className="py-12 text-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Inquiry Received!</h3>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">{successMsg}</p>
              <button
                onClick={() => setSuccessMsg('')}
                className="mt-4 px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 text-xs placeholder-neutral-400 outline-none transition font-medium"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mobile / WhatsApp Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 text-xs placeholder-neutral-400 outline-none transition font-medium"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>Email Address (Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. client@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 text-xs placeholder-neutral-400 outline-none transition font-medium"
                  />
                </div>

                {/* Event Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Event Type *</span>
                  </label>
                  <select
                    value={formData.event}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 text-xs outline-none transition font-medium"
                  >
                    {EVENT_TYPES.map((ev, i) => (
                      <option key={i} value={ev} className="bg-white text-neutral-900">
                        {ev}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Estimated Event Date</span>
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 text-xs outline-none transition font-medium"
                  />
                </div>

                {/* Budget */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    <span>Estimated Budget (₹)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 75000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 text-xs placeholder-neutral-400 outline-none transition font-medium"
                  />
                </div>

              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tell us about your venue or requirements</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Venue location, number of guests, specific photography styles preferred..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 text-xs placeholder-neutral-400 outline-none transition resize-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending Inquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Booking Inquiry</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </div>
    </section>
  );
}
