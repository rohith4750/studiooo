'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

function PhotographerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const { employees, createRecord, updateRecord } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'PHOTOGRAPHER', // Hardcoded for this specific portal
    status: 'ACTIVE',
    salary: 0
  });

  useEffect(() => {
    if (employeeId) {
      const existing = employees.find(e => e.id === employeeId);
      if (existing) {
        setFormData({
          name: existing.name,
          email: existing.email,
          phone: existing.phone,
          role: 'PHOTOGRAPHER',
          status: existing.status,
          salary: existing.salary
        });
      }
    }
  }, [employeeId, employees]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'salary' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (employeeId) {
        await updateRecord('employees', { id: employeeId, ...formData });
        toast('Photographer updated successfully', 'success');
      } else {
        await createRecord('employees', formData);
        toast('Photographer added successfully', 'success');
      }
      router.push('/dashboard/photographers');
    } catch (error: any) {
      toast(error.message || 'Failed to save photographer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fadeIn">
      <div className="flex items-center space-x-4">
        <button onClick={() => router.push('/dashboard/photographers')} className="p-2 bg-white border border-neutral-200 rounded hover:bg-neutral-50 transition text-neutral-600">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800">
            {employeeId ? 'Edit Photographer Profile' : 'Add New Photographer'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">Register contact and payroll details for photographers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 rounded border border-neutral-200/60 shadow-lg shadow-primary-500/5 bg-white space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100">
          <Camera className="h-5 w-5 text-primary-500" />
          <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Photographer Details</h3>
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
            label="Phone Number"
            name="phone"
            value={formData.phone}
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
            label="Base Salary (Monthly)"
            name="salary"
            type="number"
            value={formData.salary || ''}
            onChange={handleChange}
            required
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
          />

          <FormControl fullWidth size="small">
            <InputLabel id="status-label">Roster Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formData.status}
              label="Roster Status"
              onChange={handleChange}
              sx={{ borderRadius: '4px' }}
            >
              <MenuItem value="ACTIVE">Active Available</MenuItem>
              <MenuItem value="INACTIVE">Inactive / On Leave</MenuItem>
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
            <span>{employeeId ? 'Save Changes' : 'Add Photographer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PhotographerCreatePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Loading form...</div>}>
      <PhotographerForm />
    </Suspense>
  );
}
