'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  BarChart3, ShieldAlert, Sparkles, Filter, RefreshCw, 
  TrendingUp, Wallet, CheckCircle, Database 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell 
} from 'recharts';
import { Select, MenuItem, FormControl } from '@mui/material';

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

  // Calculations
  const grossBookingsValue = bookings.reduce((sum, b) => sum + b.grandTotal, 0);
  const paidSales = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = paidSales - totalExpenses;

  // Margin data (mocking comparison)
  const marginData = [
    { month: 'Q1', Revenue: 180000, Expenses: 72000, Margin: 108000 },
    { month: 'Q2', Revenue: 260000, Expenses: 94000, Margin: 166000 },
    { month: 'Q3 (Est)', Revenue: paidSales > 0 ? paidSales : 340000, Expenses: totalExpenses > 0 ? totalExpenses : 120000, Margin: paidSales - totalExpenses }
  ];

  // Filtered audit logs
  const filteredLogs = auditLogs.filter(log => 
    filterAction === 'ALL' || log.action === filterAction
  );

  return (
    <div className="space-y-4 animate-fadeIn text-xs text-neutral-700">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-800">Business Reports & Audits</h2>
        <p className="text-xs text-neutral-500 mt-0.5">Audit system activity records and inspect studio financial margins.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Gross Contracts booked</span>
          <p className="text-xl font-extrabold text-neutral-700 mt-1">₹{grossBookingsValue.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4 rounded">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Total Cash Collected</span>
          <p className="text-xl font-extrabold text-primary-600 mt-1">₹{paidSales.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4 rounded">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Operating Expenses</span>
          <p className="text-xl font-extrabold text-red-500 mt-1">₹{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4 rounded">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Net Cash Margin</span>
          <p className={`text-xl font-extrabold mt-1 ${netProfit >= 0 ? 'text-primary-600' : 'text-red-500'}`}>
            ₹{netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Grid: Margin Graph & Audit Logs table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:p-5">
        
        {/* Margin Area Graph */}
        <div className="glass-card p-5 rounded border border-neutral-200/50 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-xs uppercase text-neutral-500 tracking-wider flex items-center space-x-1.5">
            <BarChart3 className="h-4.5 w-4.5 text-primary-500" />
            <span>Quarterly Net Profit margins</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marginData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeef5" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#817963', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} tick={{ fill: '#817963', fontSize: 10 }} />
                <Tooltip formatter={(value) => value !== undefined ? `₹${Number(value).toLocaleString()}` : ''} />
                <Legend />
                <Area type="monotone" dataKey="Revenue" stroke="#5c8f7a" fill="#e3ece7" strokeWidth={2} />
                <Area type="monotone" dataKey="Expenses" stroke="#d98880" fill="#fbe9e7" strokeWidth={2} />
                <Area type="monotone" dataKey="Margin" stroke="#8294c4" fill="#eaeef5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Logs Table Ledger */}
        <div className="glass-card rounded overflow-hidden border border-neutral-200/50 flex flex-col h-[328px]">
          <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center space-x-1">
              <Database className="h-4 w-4" />
              <span>Audit logs history</span>
            </span>

            <FormControl size="small">
              <Select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value as string)}
                displayEmpty
                sx={{ minWidth: 100, height: 28, fontSize: '0.7rem', bgcolor: 'white' }}
              >
                <MenuItem value="ALL">All Actions</MenuItem>
                <MenuItem value="LOGIN">LOGIN</MenuItem>
                <MenuItem value="LOGOUT">LOGOUT</MenuItem>
                <MenuItem value="CREATE">CREATE</MenuItem>
                <MenuItem value="UPDATE">UPDATE</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 text-xs">
            {loading ? (
              <div className="p-12 text-center text-xs font-semibold text-neutral-400">Loading audit history...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 font-medium">No actions registered in audit log.</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-3 space-y-1 hover:bg-neutral-50/40 transition">
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-1.5 py-0.25 text-[8px] font-bold border rounded uppercase ${
                      log.action === 'CREATE' ? 'bg-primary-50 text-primary-700 border-primary-100' :
                      log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-[9px] text-neutral-400">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[10px] text-neutral-600">{log.details}</p>
                  <p className="text-[9px] text-neutral-400 font-medium">User: {log.user?.name || 'System'}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
