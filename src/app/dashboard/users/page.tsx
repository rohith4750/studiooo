'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import { Users, Plus, Trash2, Edit3, Mail, Shield, UserCog, Calendar, RefreshCw, ShieldCheck } from 'lucide-react';

export default function DynamicUsersPage() {
  const router = useRouter();
  const { users, rolePermissions, fetchData, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchData('users'),
        fetchData('rolePermissions'),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id: string) => {
    const ok = await confirmAction("Are you sure you want to revoke dashboard access for this user?", { title: "Revoke Access" });
    if (ok) {
      try {
        await deleteRecord('users', id);
        toast('User access revoked successfully.', 'success');
        fetchData('users');
      } catch (err: any) {
        toast('Failed to delete user: ' + (err.message || err), 'error');
      }
    }
  };

  const getRoleBadgeStyle = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PHOTOGRAPHER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'EDITOR':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ACCOUNTANT':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'RECEPTIONIST':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <UserCog className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">User Accounts & Dynamic Roles</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage user login credentials and assign dedicated dynamic roles for module access control.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="p-2.5 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 text-neutral-600 transition"
            title="Refresh Users"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push('/dashboard/users/create')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add New User Account</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-md"><Users className="h-6 w-6" /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400">Total Registered Users</span>
            <p className="text-xl font-extrabold text-neutral-900 mt-0.5">{users.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-md"><Shield className="h-6 w-6" /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400">Administrators</span>
            <p className="text-xl font-extrabold text-neutral-900 mt-0.5">
              {users.filter(u => ['SUPER_ADMIN', 'ADMIN'].includes(u.role)).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-md"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400">Operational & Crew Staff</span>
            <p className="text-xl font-extrabold text-neutral-900 mt-0.5">
              {users.filter(u => !['SUPER_ADMIN', 'ADMIN'].includes(u.role)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-neutral-400">
            Loading registered system users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            No system user accounts registered. Click "Add New User Account" above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Dedicated System Role</th>
                  <th className="py-3 px-4">Access Scope & Responsibilities</th>
                  <th className="py-3 px-4">Registered On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {users.map((userItem) => {
                  const roleRecord = rolePermissions?.find((r: any) => r.roleName === userItem.role);
                  const roleDisplayName = roleRecord?.displayName || userItem.role;
                  const roleDescription = roleRecord?.description || 'Custom studio role access.';

                  return (
                    <tr key={userItem.id} className="hover:bg-neutral-50/50 transition">
                      {/* User Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900 text-sm">{userItem.name}</span>
                          <span className="flex items-center space-x-1 text-[11px] text-neutral-500 mt-0.5">
                            <Mail className="h-3 w-3 text-neutral-400" />
                            <span>{userItem.email}</span>
                          </span>
                        </div>
                      </td>

                      {/* Dedicated System Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col space-y-1 items-start">
                          <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase border inline-flex items-center space-x-1.5 ${getRoleBadgeStyle(userItem.role)}`}>
                            <UserCog className="h-3 w-3" />
                            <span>{roleDisplayName}</span>
                          </span>
                          <code className="text-[9px] font-mono text-neutral-400 bg-neutral-100 px-1 py-0.5 rounded">
                            {userItem.role}
                          </code>
                        </div>
                      </td>

                      {/* Access Scope */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                          {roleDescription}
                        </p>
                      </td>

                      {/* Registered On */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 text-neutral-500 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{new Date(userItem.createdAt || Date.now()).toLocaleDateString('en-GB')}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => router.push(`/dashboard/users/create?userId=${userItem.id}`)}
                            title="Edit User Credentials"
                            className="p-1.5 hover:bg-amber-50 text-neutral-500 hover:text-amber-600 rounded transition"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userItem.id)}
                            title="Revoke User Access"
                            className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
