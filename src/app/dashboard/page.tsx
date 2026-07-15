'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  TrendingUp, Users, Calendar, Banknote, FileSpreadsheet, 
  UserPlus, PlusCircle, CreditCard, Receipt, FileText, ArrowUpRight, 
  AlertCircle, ShieldCheck, Clock
} from 'lucide-react';


export default function DashboardPage() {
  const router = useRouter();
  const { 
    bookings, leads, clients, payments, expenses, bookingEvents,
    fetchData, user 
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRefreshing(true);
    Promise.all([
      fetchData('bookings', '?include={"client":true}'),
      fetchData('leads'),
      fetchData('clients'),
      fetchData('payments'),
      fetchData('expenses'),
      fetchData('bookingevents', '?include={"event":true}'),
    ]).finally(() => setRefreshing(false));
  }, [fetchData]);

  if (!mounted) return null;

  // 1. Calculations for Today's Summary Cards
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const paidRevenue = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const pendingRevenue = totalRevenue - paidRevenue;
  const convertedLeads = leads.filter(l => l.status === 'CONVERTED').length;
  const totalLeads = leads.length;
  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  
  // Pending deliveries
  const pendingDeliveries = bookings.filter(b => 
    ['IN_PROGRESS', 'EDITING', 'ALBUM_DESIGNING', 'PRINTING', 'READY_FOR_DELIVERY'].includes(b.status)
  ).length;

  // Active shoots today (mocking against current local time 2026-07-14)
  const todayStr = '2026-07-14';
  const todayShoots = bookingEvents.filter(be => be.eventDate === todayStr);
  const upcomingShoots = bookingEvents.filter(be => be.eventDate > todayStr);

  // (Removed chart data construction)

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Studio analytics and workflow snapshot for {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-neutral-400 font-medium">
            Role: <span className="font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{user?.role}</span>
          </span>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 sm:p-5">
        <div className="glass-card p-4 sm:p-5 rounded">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Today's Shoots</span>
            <div className="p-1.5 bg-primary-50 rounded text-primary-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-neutral-800 mt-2">
            {todayShoots.length}
          </p>
          <p className="text-xs text-neutral-500 mt-1.5 flex items-center space-x-1">
            <span>{upcomingShoots.length} scheduled next</span>
          </p>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Total Billings</span>
            <div className="p-1.5 bg-primary-50 rounded text-primary-600">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-neutral-800 mt-2">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-neutral-500 mt-1.5">
            Pending Collection: <span className="font-bold text-accent-500">₹{pendingRevenue.toLocaleString('en-IN')}</span>
          </p>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Pending Deliveries</span>
            <div className="p-1.5 bg-primary-50 rounded text-primary-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-neutral-800 mt-2">
            {pendingDeliveries}
          </p>
          <p className="text-xs text-neutral-500 mt-1.5">
            Bookings active in pipelines
          </p>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Leads Conversion</span>
            <div className="p-1.5 bg-primary-50 rounded text-primary-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-neutral-800 mt-2">
            {conversionRate}%
          </p>
          <p className="text-xs text-neutral-500 mt-1.5">
            {convertedLeads} converted out of {totalLeads}
          </p>
        </div>
      </div>

      {/* Quick Action cards (visible for receptionists/managers/admins) */}
      {user && ['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(user.role) && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Quick Studio Shortcuts</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => router.push('/dashboard/clients')}
              className="glass-card p-4 rounded flex flex-col items-center justify-center text-center hover-lift cursor-pointer"
            >
              <UserPlus className="h-6 w-6 text-primary-600 mb-2" />
              <span className="text-xs font-bold text-neutral-700">Add Client</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/bookings')}
              className="glass-card p-4 rounded flex flex-col items-center justify-center text-center hover-lift cursor-pointer"
            >
              <PlusCircle className="h-6 w-6 text-primary-600 mb-2" />
              <span className="text-xs font-bold text-neutral-700">New Booking</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="glass-card p-4 rounded flex flex-col items-center justify-center text-center hover-lift cursor-pointer"
            >
              <FileText className="h-6 w-6 text-primary-600 mb-2" />
              <span className="text-xs font-bold text-neutral-700">New Quotation</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="glass-card p-4 rounded flex flex-col items-center justify-center text-center hover-lift cursor-pointer"
            >
              <CreditCard className="h-6 w-6 text-primary-600 mb-2" />
              <span className="text-xs font-bold text-neutral-700">Collect Payment</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/expenses')}
              className="glass-card p-4 rounded flex flex-col items-center justify-center text-center hover-lift cursor-pointer"
            >
              <Receipt className="h-6 w-6 text-primary-600 mb-2" />
              <span className="text-xs font-bold text-neutral-700">Add Expense</span>
            </button>
          </div>
        </div>
      )}

      {/* Informative Data Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:p-5">
        {/* Recent Bookings */}
        <div className="glass-card p-4 sm:p-5 rounded">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-neutral-800 tracking-wide uppercase">Recent Bookings</h4>
            <button onClick={() => router.push('/dashboard/bookings')} className="text-[10px] bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full hover:bg-primary-200">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="py-2 font-semibold">Booking ID</th>
                  <th className="py-2 font-semibold">Client</th>
                  <th className="py-2 font-semibold">Status</th>
                  <th className="py-2 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bookings.slice(0, 5).map(b => (
                  <tr key={b.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => router.push('/dashboard/bookings')}>
                    <td className="py-3 font-medium text-primary-600">{b.bookingNumber}</td>
                    <td className="py-3 text-neutral-800 font-semibold">{b.client?.name || 'Unknown'}</td>
                    <td className="py-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600 uppercase tracking-wider">{b.status}</span>
                    </td>
                    <td className="py-3 text-right font-bold text-neutral-800">₹{b.grandTotal?.toLocaleString('en-IN') || 0}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-neutral-400">No bookings found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="glass-card p-4 sm:p-5 rounded">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-neutral-800 tracking-wide uppercase">Recent Leads</h4>
            <button onClick={() => router.push('/dashboard/leads')} className="text-[10px] bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full hover:bg-primary-200">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="py-2 font-semibold">Name</th>
                  <th className="py-2 font-semibold">Event</th>
                  <th className="py-2 font-semibold">Source</th>
                  <th className="py-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {leads.slice(0, 5).map(l => (
                  <tr key={l.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => router.push('/dashboard/leads')}>
                    <td className="py-3 text-neutral-800 font-semibold">{l.name}</td>
                    <td className="py-3 text-neutral-600">{l.event}</td>
                    <td className="py-3 text-neutral-500">{l.source}</td>
                    <td className="py-3 text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${l.status === 'CONVERTED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-neutral-400">No leads found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid of Alert Feed & Today's Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-5">
        {/* Today's Shoot Schedule Feed */}
        <div className="glass-card p-4 sm:p-5 rounded">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-neutral-800 tracking-wide uppercase">Today's Schedule ({todayShoots.length})</h4>
            <span className="text-xs text-neutral-400 font-medium">Date: 2026-07-14</span>
          </div>

          {todayShoots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
              <ShieldCheck className="h-8 w-8 text-primary-500 mb-2" />
              <p className="text-xs font-semibold">No shoots scheduled for today</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Use Photographer Schedule page to add bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayShoots.map((shoot) => (
                <div key={shoot.id} className="p-3.5 bg-neutral-50 rounded border border-primary-100/40 flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-neutral-800">{shoot.event?.name}</h5>
                    <p className="text-[10px] text-neutral-500 mt-1 flex items-center space-x-1">
                      <span>Venue: {shoot.venue || 'TBA'}</span>
                    </p>
                    <span className="inline-flex mt-2 items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary-100 text-primary-800 uppercase tracking-wider">
                      {shoot.status}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-primary-600">{shoot.eventTime || '09:00 AM'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning Alerts / Pending Payments Feed */}
        <div className="glass-card p-4 sm:p-5 rounded">
          <h4 className="text-sm font-bold text-neutral-800 tracking-wide uppercase mb-4">Outstanding Payments Alerts</h4>
          
          <div className="space-y-3.5">
            {bookings.filter(b => b.balance > 0).slice(0, 3).map((b) => (
              <div key={b.id} className="p-3.5 bg-neutral-50 border border-neutral-200/50 rounded flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-accent-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-neutral-800 truncate">{b.client?.name}</p>
                    <span className="text-xs font-extrabold text-accent-500">₹{b.balance.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Booking: {b.bookingNumber} • Status: {b.status}</p>
                </div>
              </div>
            ))}

            {bookings.filter(b => b.balance > 0).length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                <ShieldCheck className="h-8 w-8 text-primary-500 mb-2" />
                <p className="text-xs font-semibold">All accounts are fully paid!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
