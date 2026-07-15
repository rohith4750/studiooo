'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import { Users, Plus, Trash2, Edit3, Mail, Shield, UserCog, Calendar } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const { users, fetchData, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData('users').finally(() => setLoading(false));
  }, [fetchData]);

  const handleDeleteUser = async (id: string) => {
    const ok = await confirmAction("Are you sure you want to revoke dashboard access for this user?", { title: "Revoke Access" });
    if (ok) {
      try { await deleteRecord('users', id); toast('User access revoked successfully.', 'success'); }
      catch (err) { toast('Failed to delete user: ' + err, 'error'); }
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800">System Access & Users</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Manage dashboard login credentials and role-based permissions.</p>
        </div>
        <button onClick={() => router.push('/dashboard/users/create')} className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded cursor-pointer shadow-xs transition duration-150">
          <Plus className="h-4 w-4" /><span>Add New User</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded flex items-center space-x-3.5 border border-neutral-200/50">
          <div className="p-3 bg-primary-50 text-primary-600 rounded"><Users className="h-6 w-6" /></div>
          <div><span className="text-[10px] uppercase font-bold text-neutral-400">Total Registered Users</span><p className="text-xl font-extrabold text-neutral-700">{users.length}</p></div>
        </div>
        <div className="glass-card p-4 rounded flex items-center space-x-3.5 border border-neutral-200/50">
          <div className="p-3 bg-primary-50 text-primary-600 rounded"><Shield className="h-6 w-6" /></div>
          <div><span className="text-[10px] uppercase font-bold text-neutral-400">Admin Accounts</span><p className="text-xl font-extrabold text-neutral-700">{users.filter(u => u.role === 'ADMIN').length}</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded overflow-hidden border border-neutral-200/50">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-neutral-400">Loading system users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Access Level</th>
                  <th className="py-3 px-4">Registered On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-800 text-sm">{user.name}</span>
                        <span className="flex items-center space-x-1 text-[10px] text-neutral-500 mt-0.5"><Mail className="h-3 w-3" /><span>{user.email}</span></span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-semibold flex items-center space-x-1.5 w-fit uppercase">
                        <UserCog className="h-3 w-3 text-primary-500" /><span>{user.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                       <span className={`inline-flex px-2 py-0.5 border text-[10px] font-bold rounded-full tracking-wide ${user.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                         {user.role === 'ADMIN' ? 'Full Access' : 'Restricted'}
                       </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 text-neutral-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(user.createdAt || Date.now()).toLocaleDateString('en-GB')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => router.push(`/dashboard/users/create?userId=${user.id}`)} title="Edit User" className="p-1.5 hover:bg-neutral-100 text-neutral-600 rounded transition"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteUser(user.id)} title="Revoke Access" className="p-1.5 hover:bg-red-50 text-red-500 rounded transition"><Trash2 className="h-4 w-4" /></button>
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
