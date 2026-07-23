'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  BarChart3, ShieldAlert, Sparkles, Filter, RefreshCw, 
  TrendingUp, Wallet, CheckCircle, Database, ArrowUpRight, PieChartIcon, 
  FileText, Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { Select, MenuItem, FormControl } from '@mui/material';

const CATEGORY_COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#64748b'];

export default function ReportsPage() {
  const { 
    bookings, expenses, auditLogs, fetchData 
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('auditlogs', '?include={"user":true}&orderBy={"timestamp":"desc"}'),
      fetchData('bookings'),
      fetchData('expenses'),
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  // Real-time financial calculations
  const grossBookingsValue = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
  const paidSales = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = paidSales - totalExpenses;

  // Compute monthly breakdown dynamically (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrends: Record<string, { month: string; Revenue: number; Expenses: number; Margin: number }> = {};
  
  const currentMonthIdx = new Date().getMonth();
  const currentYearVal = new Date().getFullYear();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYearVal, currentMonthIdx - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${monthNames[d.getMonth()]}`;
    monthlyTrends[key] = { month: label, Revenue: 0, Expenses: 0, Margin: 0 };
  }

  bookings.forEach(b => {
    if (b.createdAt) {
      const key = b.createdAt.substring(0, 7);
      if (monthlyTrends[key]) {
        monthlyTrends[key].Revenue += (b.paidAmount || 0);
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

  const marginChartData = Object.values(monthlyTrends).map(item => ({
    ...item,
    Margin: item.Revenue - item.Expenses
  }));

  // Expense breakdown by category
  const expenseCatMap: Record<string, number> = {};
  expenses.forEach(e => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + (e.amount || 0);
  });
  const expenseChartData = Object.keys(expenseCatMap).map(cat => ({
    name: cat,
    value: expenseCatMap[cat]
  }));

  // Booking status distribution
  const statusMap: Record<string, number> = {};
  bookings.forEach(b => {
    statusMap[b.status] = (statusMap[b.status] || 0) + 1;
  });
  const statusChartData = Object.keys(statusMap).map(st => ({
    name: st.replace('_', ' '),
    count: statusMap[st]
  }));

  // Helper to format raw audit details cleanly
  const formatAuditDetails = (details: string) => {
    if (!details) return '';
    if (details.includes('{"') || details.includes('Created record in') || details.includes('Updated record in')) {
      try {
        const createMatch = details.match(/Created record in (\w+): (\{.*\})/);
        if (createMatch) {
          const model = createMatch[1];
          const data = JSON.parse(createMatch[2]);
          const label = data.invoiceNumber || data.quotationNumber || data.bookingNumber || data.name || data.id || '';
          return `Created ${model} (${label})`;
        }
        const updateMatch = details.match(/Updated record in (\w+)/);
        if (updateMatch) {
          return `Updated ${updateMatch[1]}`;
        }
      } catch (e) {
        return details.split(':{')[0];
      }
    }
    return details;
  };

  // Filtered audit logs
  const filteredLogs = auditLogs.filter(log => 
    filterAction === 'ALL' || log.action === filterAction
  );

  return (
    <div className="space-y-6 animate-fadeIn text-xs text-neutral-700 font-sans">

      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
          Executive Reports & System Audit
        </h1>
        <p className="text-xs text-neutral-500 mt-1 font-medium">
          Comprehensive business analytics, margin distribution, and user action audit logs
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Gross Contract Value</span>
          <p className="text-2xl font-extrabold text-neutral-900 mt-2">₹{grossBookingsValue.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-neutral-400 mt-1 block">Total contracted value across all bookings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Total Cash Collected</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">₹{paidSales.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-neutral-400 mt-1 block">Realized liquid cash inflow</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Operating Expenses</span>
          <p className="text-2xl font-extrabold text-red-500 mt-2">₹{totalExpenses.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-neutral-400 mt-1 block">Total studio operational outflow</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Net Liquid Profit</span>
          <p className={`text-2xl font-extrabold mt-2 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            ₹{netProfit.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-neutral-400 mt-1 block">Realized cash collection minus expenses</span>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Margin Area Graph */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-extrabold text-sm text-neutral-900 flex items-center space-x-2">
              <TrendingUp className="h-4.5 w-4.5 text-amber-500" />
              <span>Cashflow & Net Margin Performance (Last 6 Months)</span>
            </h3>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marginChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${v/1000}k` : v}`} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                <Legend />
                <Area type="monotone" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2.5} name="Cash Collected" />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2.5} name="Expenses" />
                <Area type="monotone" dataKey="Margin" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} strokeDasharray="4 4" name="Net Margin" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Chart */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-neutral-900 flex items-center space-x-2 border-b border-neutral-100 pb-3">
            <PieChartIcon className="h-4.5 w-4.5 text-blue-500" />
            <span>Expenses by Category</span>
          </h3>

          {expenseChartData.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400 font-medium bg-neutral-50 rounded-xl">
              No expense entries recorded yet.
            </div>
          ) : (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tickFormatter={(v) => `₹${v/1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} width={80} />
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {expenseChartData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-5 bg-neutral-50/70 border-b border-neutral-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-neutral-900 flex items-center space-x-2">
              <Activity className="h-4.5 w-4.5 text-purple-600" />
              <span>System Activity Audit Logs</span>
            </h3>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">Real-time audit trail of all logins, creates, updates, and deletes</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-neutral-500">Filter Action:</span>
            <FormControl size="small">
              <Select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value as string)}
                displayEmpty
                sx={{ minWidth: 120, height: 32, fontSize: '0.75rem', bgcolor: 'white', borderRadius: '8px' }}
              >
                <MenuItem value="ALL">All Actions</MenuItem>
                <MenuItem value="LOGIN">LOGIN</MenuItem>
                <MenuItem value="CREATE">CREATE</MenuItem>
                <MenuItem value="UPDATE">UPDATE</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <th className="py-3 px-4 font-bold">Action</th>
                <th className="py-3 px-4 font-bold">Details</th>
                <th className="py-3 px-4 font-bold">User</th>
                <th className="py-3 px-4 font-bold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-neutral-400 font-medium">Loading system audit logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-neutral-400 font-medium">No matching audit logs found.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/60 transition">
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wide border ${
                        log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' :
                        log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-neutral-100 text-neutral-700 border-neutral-200'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-800 max-w-md truncate">
                      {formatAuditDetails(log.details)}
                    </td>

                    <td className="py-3 px-4 text-neutral-600 font-medium">
                      {log.user?.name || 'System / Auto'}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-400 font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

