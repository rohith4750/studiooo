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

const EXPENSE_CATEGORIES = ['FUEL', 'SALARY', 'PRINTING', 'EQUIPMENT', 'MARKETING', 'FOOD', 'MISCELLANEOUS'];
const COLORS = ['#e0a96d', '#8294c4', '#5c8f7a', '#8ea8c3', '#a78bfa', '#f48fb1', '#4db6ac'];

export default function ExpensesPage() {
  const router = useRouter();
  const { expenses, fetchData, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => { fetchData('expenses').finally(() => setLoading(false)); }, [fetchData]);

  const handleDeleteExpense = async (id: string) => {
    const ok = await confirmAction('Are you sure you want to delete this expense receipt?', { title: 'Confirm Deletion' });
    if (ok) {
      try { await deleteRecord('expenses', id); toast('Expense deleted.', 'success'); }
      catch (err) { toast('Failed to delete expense: ' + err, 'error'); }
    }
  };

  const filteredExpenses = expenses.filter(exp => filterCategory === 'ALL' || exp.category === filterCategory);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentDay = new Date().toISOString().slice(0, 10);
  const dailyExpenses = expenses.filter(e => e.date === currentDay).reduce((sum, e) => sum + e.amount, 0);
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonth)).reduce((sum, e) => sum + e.amount, 0);

  const categorySumMap: Record<string, number> = {};
  EXPENSE_CATEGORIES.forEach(cat => { categorySumMap[cat] = 0; });
  expenses.forEach(exp => { categorySumMap[exp.category] = (categorySumMap[exp.category] || 0) + (exp.amount || 0); });
  const chartData = Object.keys(categorySumMap).map(key => ({ name: key, Amount: categorySumMap[key] }));

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800">Operational Expenses</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Record studio bills, employee salaries, and printing press expenses.</p>
        </div>
        <button onClick={() => router.push('/dashboard/expenses/create')} className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded cursor-pointer shadow-xs transition duration-150">
          <Plus className="h-4 w-4" /><span>Record Expense Bill</span>
        </button>
      </div>

      {/* Financial Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded flex items-center space-x-3.5">
          <div className="p-3 bg-red-50 text-red-600 rounded"><Clock className="h-6 w-6" /></div>
          <div><span className="text-[10px] uppercase font-bold text-neutral-400">Spent Today</span><p className="text-xl font-extrabold text-neutral-700">₹{dailyExpenses.toLocaleString()}</p></div>
        </div>
        <div className="glass-card p-4 rounded flex items-center space-x-3.5">
          <div className="p-3 bg-red-50 text-red-600 rounded"><Calendar className="h-6 w-6" /></div>
          <div><span className="text-[10px] uppercase font-bold text-neutral-400">Spent This Month</span><p className="text-xl font-extrabold text-neutral-700">₹{monthlyExpenses.toLocaleString()}</p></div>
        </div>
        <div className="glass-card p-4 rounded flex items-center space-x-3.5">
          <div className="p-3 bg-red-50 text-red-600 rounded"><Banknote className="h-6 w-6" /></div>
          <div><span className="text-[10px] uppercase font-bold text-neutral-400">Total Accumulation</span><p className="text-xl font-extrabold text-neutral-700">₹{totalExpenses.toLocaleString()}</p></div>
        </div>
      </div>

      {/* Grid: Charts + Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:p-5">
        <div className="glass-card p-5 rounded border border-neutral-200/50 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-xs uppercase text-neutral-500 tracking-wider flex items-center space-x-1.5">
            <BarChart3 className="h-4.5 w-4.5 text-primary-500" /><span>Expenses by Category</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeef5" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#817963', fontSize: 10 }} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} tick={{ fill: '#817963', fontSize: 10 }} />
                <Tooltip formatter={(value) => value !== undefined ? `₹${Number(value).toLocaleString()}` : ''} />
                <Bar dataKey="Amount" radius={[8, 8, 0, 0]} barSize={30}>
                  {chartData.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded overflow-hidden border border-neutral-200/50 flex flex-col h-[328px]">
          <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center space-x-1">
              <NotebookTabs className="h-4 w-4" /><span>Expense Receipts ({filteredExpenses.length})</span>
            </span>
            <FormControl size="small">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as string)}
                displayEmpty
                sx={{ minWidth: 120, height: 28, fontSize: '0.7rem', bgcolor: 'white' }}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                {EXPENSE_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 text-xs">
            {loading ? (
              <div className="p-12 text-center text-xs font-semibold text-neutral-400">Loading ledger...</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 font-medium">No logged expense receipts.</div>
            ) : (
              filteredExpenses.map((exp) => (
                <div key={exp.id} className="p-3 flex items-center justify-between hover:bg-neutral-50/40 transition">
                  <div className="space-y-0.5">
                    <p className="font-bold text-neutral-800">₹{exp.amount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-neutral-500">{exp.category} • {exp.description}</p>
                    <span className="text-[9px] text-neutral-400 font-medium">{exp.date}</span>
                  </div>
                  <button onClick={() => handleDeleteExpense(exp.id)} className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
