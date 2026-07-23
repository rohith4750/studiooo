'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Users, Plus, Trash2, Edit3, Mail, Phone, Banknote, Shield, UserCheck
} from 'lucide-react';

export default function EmployeesPage() {
  const router = useRouter();
  const { employees, fetchData, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData('employees').finally(() => setLoading(false));
  }, [fetchData]);

  const handleDeleteEmployee = async (id: string) => {
    const ok = await confirmAction('Are you sure you want to remove this employee from studio rosters?', { title: 'Confirm Removal' });
    if (ok) {
      try { await deleteRecord('employees', id); toast('Staff member removed.', 'success'); }
      catch (err) { toast('Failed to delete: ' + err, 'error'); }
    }
  };

  const monthlyPayroll = employees.filter(e => e.status === 'ACTIVE').reduce((sum, e) => sum + e.salary, 0);

  return (
    <div className="space-y-4 animate-fadeIn font-sans text-xs text-neutral-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-neutral-800">Staff & Payroll Directory</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5 font-normal">Manage studio employee profiles, functional roles, and monthly salaries ledger.</p>
        </div>
        <button onClick={() => router.push('/dashboard/employees/create')} className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-medium rounded-lg cursor-pointer shadow-xs transition duration-150 self-start sm:self-auto">
          <Plus className="h-3.5 w-3.5" /><span>Register Staff Profile</span>
        </button>
      </div>

      {/* Roster KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs flex items-center space-x-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Users className="h-5 w-5" /></div>
          <div><span className="text-[10px] uppercase font-semibold text-neutral-400">Total Staff</span><p className="text-lg font-bold text-neutral-800 mt-0.5">{employees.length}</p></div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs flex items-center space-x-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck className="h-5 w-5" /></div>
          <div><span className="text-[10px] uppercase font-semibold text-neutral-400">Active Staff</span><p className="text-lg font-bold text-neutral-800 mt-0.5">{employees.filter(e => e.status === 'ACTIVE').length}</p></div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Banknote className="h-5 w-5" /></div>
          <div><span className="text-[10px] uppercase font-semibold text-neutral-400">Monthly Roster Payroll</span><p className="text-lg font-bold text-neutral-800 mt-0.5">₹{monthlyPayroll.toLocaleString('en-IN')}</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">

        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-neutral-400">Loading staff directory...</div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">No registered staff profiles found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Employee Name</th><th className="py-3 px-4">Functional Role</th>
                  <th className="py-3 px-4">Salary (Monthly)</th><th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4 text-center">Leave Bal.</th>
                  <th className="py-3 px-4">Roster Status</th><th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-neutral-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-neutral-800">{emp.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-semibold flex items-center space-x-1.5 w-fit uppercase">
                        <Shield className="h-3 w-3 text-neutral-400" /><span>{emp.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-800">₹{emp.salary.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="flex items-center space-x-1 text-[10px] text-neutral-500"><Phone className="h-3 w-3" /><span>{emp.phone}</span></p>
                      <p className="flex items-center space-x-1 text-[10px] text-neutral-400"><Mail className="h-3 w-3" /><span>{emp.email}</span></p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-neutral-600">
                      {emp.leaveBalance || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 border text-[10px] font-bold rounded-full tracking-wide ${emp.status === 'ACTIVE' ? 'bg-primary-50 text-primary-700 border-primary-100' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>{emp.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => router.push(`/dashboard/employees/create?employeeId=${emp.id}`)} title="Edit Details" className="p-1.5 hover:bg-neutral-100 text-neutral-600 rounded"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteEmployee(emp.id)} title="Remove Employee" className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
