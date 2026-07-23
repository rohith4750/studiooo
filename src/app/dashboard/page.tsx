'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  TrendingUp, Users, Calendar, Banknote, UserPlus, PlusCircle, 
  CreditCard, Receipt, FileText, Clock, AlertCircle, ShieldCheck, 
  ArrowUpRight, Sparkles, CheckCircle2, Flame, Award
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

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

  // Real-time calculations
  const localTodayStr = new Date().toLocaleDateString('en-CA');
  
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const paidRevenue = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const pendingRevenue = totalRevenue - paidRevenue;
  const convertedLeads = leads.filter(l => l.status === 'CONVERTED').length;
  const totalLeads = leads.length;
  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = paidRevenue - totalExpenses;

  // Active shoots today & upcoming
  const todayShoots = bookingEvents.filter(be => be.eventDate === localTodayStr);
  const upcomingShoots = bookingEvents.filter(be => be.eventDate > localTodayStr);

  const pendingDeliveries = bookings.filter(b => 
    ['IN_PROGRESS', 'EDITING', 'ALBUM_DESIGNING', 'PRINTING', 'READY_FOR_DELIVERY'].includes(b.status)
  ).length;

  // Build last 6 months trend data dynamically
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrends: Record<string, { month: string; Revenue: number; Expenses: number; Profit: number }> = {};
  
  const currentMonthIdx = new Date().getMonth();
  const currentYearVal = new Date().getFullYear();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYearVal, currentMonthIdx - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${monthNames[d.getMonth()]}`;
    monthlyTrends[key] = { month: label, Revenue: 0, Expenses: 0, Profit: 0 };
  }

  bookings.forEach(b => {
    if (b.createdAt) {
      const key = b.createdAt.substring(0, 7);
      if (monthlyTrends[key]) {
        monthlyTrends[key].Revenue += (b.grandTotal || 0);
      }
    }
  });

  expenses.forEach(e => {
    if (e.date) {
      const key = e.date.substring(0, 7);
      if (monthlyTrends[key]) {
        monthlyTrends[key].Expenses += (e.amount || 0);
      }
    }
  });

  const chartData = Object.values(monthlyTrends).map(item => ({
    ...item,
    Profit: item.Revenue - item.Expenses
  }));

  return (
    <div className="space-y-4 animate-fadeIn font-sans text-xs text-neutral-700">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-neutral-800">
              Welcome back, {user?.name} 👋
            </h1>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {user?.role}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5 font-normal">
            Studio command dashboard for {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push('/dashboard/bookings/create')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-medium rounded-lg shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Revenue */}
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs group hover:border-neutral-300 transition">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Gross Contract Value</span>
            <div className="p-1.5 bg-amber-50 rounded-md text-amber-600">
              <Banknote className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-neutral-800 mt-1.5">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-100 font-normal">
            <span className="text-neutral-500">Collected: <span className="font-semibold text-emerald-600">₹{paidRevenue.toLocaleString('en-IN')}</span></span>
            <span className="text-neutral-500">Due: <span className="font-semibold text-amber-600">₹{pendingRevenue.toLocaleString('en-IN')}</span></span>
          </div>
        </div>

        {/* Card 2: Today's Shoots */}
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs group hover:border-neutral-300 transition">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Today's Shoots</span>
            <div className="p-1.5 bg-blue-50 rounded-md text-blue-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-neutral-800 mt-1.5">
            {todayShoots.length}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-100 font-normal">
            <span className="text-neutral-500">{upcomingShoots.length} upcoming shoot events</span>
          </div>
        </div>

        {/* Card 3: Pending Deliveries */}
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs group hover:border-neutral-300 transition">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Active Workflows</span>
            <div className="p-1.5 bg-purple-50 rounded-md text-purple-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-neutral-800 mt-1.5">
            {pendingDeliveries}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-100 font-normal">
            <span className="text-neutral-500">In Editing, Album Design, or Print</span>
          </div>
        </div>

        {/* Card 4: Net Margin */}
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs group hover:border-neutral-300 transition">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Net Profit Margin</span>
            <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-lg font-bold mt-1.5 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            ₹{netProfit.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-100 font-normal">
            <span className="text-neutral-500">Lead Conversion: <span className="font-semibold text-neutral-700">{conversionRate}%</span></span>
          </div>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider px-0.5">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => router.push('/dashboard/clients/create')}
            className="p-3 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-xl flex flex-col items-center justify-center text-center shadow-2xs transition cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-amber-600 mb-1" />
            <span className="text-[11px] font-medium text-neutral-700">Add Client</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/bookings/create')}
            className="p-3 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-xl flex flex-col items-center justify-center text-center shadow-2xs transition cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 text-blue-600 mb-1" />
            <span className="text-[11px] font-medium text-neutral-700">New Booking</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/billing')}
            className="p-3 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-xl flex flex-col items-center justify-center text-center shadow-2xs transition cursor-pointer"
          >
            <FileText className="h-4 w-4 text-purple-600 mb-1" />
            <span className="text-[11px] font-medium text-neutral-700">Tax Invoice</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/billing')}
            className="p-3 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-xl flex flex-col items-center justify-center text-center shadow-2xs transition cursor-pointer"
          >
            <CreditCard className="h-4 w-4 text-emerald-600 mb-1" />
            <span className="text-[11px] font-medium text-neutral-700">Collect Cash</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/expenses/create')}
            className="p-3 bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-xl flex flex-col items-center justify-center text-center shadow-2xs transition cursor-pointer"
          >
            <Receipt className="h-4 w-4 text-red-500 mb-1" />
            <span className="text-[11px] font-medium text-neutral-700">Log Expense</span>
          </button>
        </div>
      </div>

      {/* Main Analytics Section: Chart + Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Revenue Trend Area Chart (2 Cols) */}
        <div className="bg-white p-4.5 rounded-xl border border-neutral-200/80 shadow-2xs lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-xs text-neutral-800 flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Monthly Financial Performance</span>
              </h3>
              <p className="text-[10px] text-neutral-400 mt-0.5 font-normal">Revenue vs Operating Expenses (Last 6 Months)</p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/reports')}
              className="text-[11px] font-medium text-primary-600 hover:text-primary-700 transition"
            >
              Full Reports →
            </button>
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="Revenue" stroke="#d97706" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Schedule & Outstanding Alerts (1 Col) */}
        <div className="space-y-4">
          
          {/* Today's Shoot Schedule Feed */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <h4 className="text-[11px] font-semibold text-neutral-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>Today's Shoots ({todayShoots.length})</span>
              </h4>
              <span className="text-[10px] font-normal text-neutral-400">{localTodayStr}</span>
            </div>

            {todayShoots.length === 0 ? (
              <div className="p-4 text-center text-[11px] text-neutral-400 font-normal bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                No active shoot events scheduled for today.
              </div>
            ) : (
              <div className="space-y-2">
                {todayShoots.map((shoot) => (
                  <div key={shoot.id} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/60 flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-neutral-800">{shoot.event?.name}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Venue: {shoot.venue || 'Studio'}</p>
                    </div>
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-semibold rounded-md">
                      {shoot.eventTime || '09:00 AM'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outstanding Payment Collection Reminder */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <h4 className="text-[11px] font-semibold text-neutral-800 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                <span>Pending Payment Due</span>
              </h4>
            </div>

            <div className="space-y-2">
              {bookings.filter(b => b.balance > 0).slice(0, 3).map((b) => (
                <div key={b.id} className="p-2.5 bg-amber-50/40 border border-amber-200/50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-800">{b.client?.name}</p>
                    <p className="text-[9px] text-neutral-400">Ref: #{b.bookingNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-amber-700">₹{b.balance.toLocaleString('en-IN')}</p>
                    <span className="text-[8px] text-neutral-400 font-normal">Balance</span>
                  </div>
                </div>
              ))}

              {bookings.filter(b => b.balance > 0).length === 0 && (
                <div className="p-3 text-center text-[11px] text-emerald-600 font-medium bg-emerald-50 rounded-lg">
                  ✓ All client accounts fully settled!
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
