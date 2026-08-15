'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Receipt, Plus, Trash2, Banknote, Calendar, BarChart3, Clock, NotebookTabs
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Select, MenuItem, FormControl } from '@mui/material';

import DateYearFilter, { initialDateYearFilterState, DateYearFilterState, matchesDateFilter } from '@/components/DateYearFilter';
import DataTablePagination from '@/components/DataTablePagination';

const EXPENSE_CATEGORIES = ['FUEL', 'SALARY', 'PRINTING', 'EQUIPMENT', 'MARKETING', 'FOOD', 'MISCELLANEOUS'];
const COLORS = ['#e0a96d', '#8294c4', '#5c8f7a', '#8ea8c3', '#a78bfa', '#f48fb1', '#4db6ac'];

export default function ExpensesPage() {
  const router = useRouter();
  const { expenses, fetchData, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<DateYearFilterState>(initialDateYearFilterState);

  useEffect(() => { fetchData('expenses').finally(() => setLoading(false)); }, [fetchData]);

  const handleDeleteExpense = async (id: string) => {
    const ok = await confirmAction('Are you sure you want to delete this expense receipt?', { title: 'Confirm Deletion' });
    if (ok) {
      try { await deleteRecord('expenses', id); toast('Expense deleted.', 'success'); }
      catch (err) { toast('Failed to delete expense: ' + err, 'error'); }
    }
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredExpenses = expenses.filter(exp => {
    const matchesCat = filterCategory === 'ALL' || exp.category === filterCategory;
    const matchesDate = matchesDateFilter(exp.date || exp.createdAt, dateFilter);
    return matchesCat && matchesDate;
  });

  const paginatedExpenses = filteredExpenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentDay = new Date().toISOString().slice(0, 10);
  const dailyExpenses = filteredExpenses.filter(e => e.date === currentDay).reduce((sum, e) => sum + e.amount, 0);
  const monthlyExpenses = filteredExpenses.filter(e => (e.date || '').startsWith(currentMonth)).reduce((sum, e) => sum + e.amount, 0);

  const categorySumMap: Record<string, number> = {};
  EXPENSE_CATEGORIES.forEach(cat => { categorySumMap[cat] = 0; });
  filteredExpenses.forEach(exp => { categorySumMap[exp.category] = (categorySumMap[exp.category] || 0) + (exp.amount || 0); });
  const chartData = Object.keys(categorySumMap).map(key => ({ name: key, Amount: categorySumMap[key] }));

  return (
    <div className="space-y-4 animate-fadeIn font-sans text-xs text-neutral-700">
      
      {/* Date & Year Filter */}
      <DateYearFilter filter={dateFilter} onChange={setDateFilter} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Expense Ledger & Accounts</h2>
          <p className="text-xs text-neutral-500 font-normal mt-0.5">Track studio operating expenses, vendor disbursements and equipment expenditures.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/expenses/create')}
          className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Expenses</p>
          <p className="text-2xl font-black text-neutral-900">₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">This Month</p>
          <p className="text-2xl font-black text-amber-600">₹{monthlyExpenses.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-2xs space-y-1">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Today's Spend</p>
          <p className="text-2xl font-black text-neutral-800">₹{dailyExpenses.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Analytics & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded p-4 border border-neutral-200/50 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-neutral-800 mb-2 flex items-center space-x-1.5">
            <BarChart3 className="h-4 w-4 text-amber-600" />
            <span>Category Spending Breakdown</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip formatter={(value) => value !== undefined ? `₹${Number(value).toLocaleString()}` : ''} />
                <Bar dataKey="Amount" radius={[8, 8, 0, 0]} barSize={30}>
                  {chartData.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded overflow-hidden border border-neutral-200/50 flex flex-col">
          <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center space-x-1">
              <NotebookTabs className="h-4 w-4" /><span>Expense Receipts ({filteredExpenses.length})</span>
            </span>
            <FormControl size="small">
              <Select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value as string); setPage(0); }}
                displayEmpty
                sx={{ minWidth: 120, height: 28, fontSize: '0.7rem', bgcolor: 'white' }}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                {EXPENSE_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 text-xs max-h-[280px]">
            {loading ? (
              <div className="p-12 text-center text-xs font-semibold text-neutral-400">Loading ledger...</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 font-medium">No logged expense receipts.</div>
            ) : (
              paginatedExpenses.map((exp) => (
                <div key={exp.id} className="p-3 flex items-center justify-between hover:bg-neutral-50/40 transition">
                  <div className="space-y-0.5">
                    <p className="font-bold text-neutral-800">₹{exp.amount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-neutral-500">{exp.category} • {exp.description}</p>
                    <span className="text-[9px] text-neutral-400 font-medium">{exp.date}</span>
                  </div>
                  <button onClick={() => handleDeleteExpense(exp.id)} className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <DataTablePagination
            count={filteredExpenses.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>
    </div>
  );
}
