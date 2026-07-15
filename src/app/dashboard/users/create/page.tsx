'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import { ArrowLeft, Save, UserCog } from 'lucide-react';
import { TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

function UserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { users, createRecord, updateRecord } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PHOTOGRAPHER'
  });

  useEffect(() => {
    if (userId) {
      const existing = users.find(u => u.id === userId);
      if (existing) {
        setFormData({
          name: existing.name,
          email: existing.email,
          password: existing.password || '', // Display password or keep blank
          role: existing.role
        });
      }
    }
  }, [userId, users]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (userId) {
        await updateRecord('users', { id: userId, ...formData });
        toast('User updated successfully', 'success');
      } else {
        if (!formData.password) {
          toast('Password is required for new users', 'error');
          setLoading(false);
          return;
        }
        await createRecord('users', formData);
        toast('User created successfully', 'success');
      }
      router.push('/dashboard/users');
    } catch (error: any) {
      toast(error.message || 'Failed to save user', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fadeIn">
      <div className="flex items-center space-x-4">
        <button onClick={() => router.push('/dashboard/users')} className="p-2 bg-white border border-neutral-200 rounded hover:bg-neutral-50 transition text-neutral-600">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800">
            {userId ? 'Edit User Access' : 'Create New User'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">Configure dashboard login credentials and internal R2R roles.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded border border-neutral-200/60 shadow-lg shadow-primary-500/5 bg-white space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100">
          <UserCog className="h-5 w-5 text-primary-500" />
          <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Account Credentials</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
          />

          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="text"
            value={formData.password}
            onChange={handleChange}
            required={!userId}
            placeholder={userId ? "Leave blank to keep unchanged" : ""}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
          />

          <FormControl fullWidth size="small">
            <InputLabel id="role-label">System Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formData.role}
              label="System Role"
              onChange={handleChange}
              sx={{ borderRadius: '4px' }}
            >
              <MenuItem value="PHOTOGRAPHER">Photographer</MenuItem>
              <MenuItem value="MANAGER">Manager</MenuItem>
              <MenuItem value="EDITOR">Editor</MenuItem>
              <MenuItem value="ACCOUNTANT">Accountant</MenuItem>
              <MenuItem value="RECEPTIONIST">Receptionist</MenuItem>
              <MenuItem value="ADMIN">Administrator (Full Access)</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-bold rounded shadow-sm transition"
          >
            {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{userId ? 'Update User' : 'Create User'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function UserCreatePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Loading form...</div>}>
      <UserForm />
    </Suspense>
  );
}
