'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Plus, Search, SlidersHorizontal, UserCheck, Trash2, Edit3,
  Mail, Phone, Calendar, Filter
} from 'lucide-react';
import { TextField, Select, MenuItem, InputAdornment, FormControl } from '@mui/material';

const SOURCES = ['INSTAGRAM', 'FACEBOOK', 'WHATSAPP', 'WEBSITE', 'WALK_IN', 'REFERRAL', 'GOOGLE_ADS'];
const STATUSES = ['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'CONVERTED', 'LOST'];

export default function LeadsPage() {
  const router = useRouter();
  const { leads, fetchData, createRecord, updateRecord, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchData('leads').finally(() => setLoading(false));
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    const ok = await confirmAction('Are you sure you want to delete this lead?', { title: 'Confirm Deletion' });
    if (ok) {
      try { await deleteRecord('leads', id); toast('Lead deleted.', 'success'); }
      catch (err) { toast('Failed to delete lead: ' + err, 'error'); }
    }
  };

  const handleConvertToClient = async (lead: any) => {
    const ok = await confirmAction(`Convert ${lead.name} to a Registered Client?`, { title: 'Confirm Conversion' });
    if (ok) {
      try {
        const client = await createRecord('clients', {
          name: lead.name, phone: lead.phone, whatsappNumber: lead.phone,
          email: lead.email, notes: `Converted from Lead. Event preference: ${lead.event}`,
        });
        await updateRecord('leads', { id: lead.id, status: 'CONVERTED' });
        toast(`Converted! Client registered. Redirecting to Bookings...`, 'success');
        router.push(`/dashboard/bookings/create?newClient=${client.id}&event=${lead.event}&date=${lead.eventDate}`);
      } catch (err) { toast('Conversion failed: ' + err, 'error'); }
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.phone.includes(searchQuery);
    const matchesSource = filterSource === 'ALL' || lead.source === filterSource;
    const matchesStatus = filterStatus === 'ALL' || lead.status === filterStatus;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'CONTACTED': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'INTERESTED': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'FOLLOW_UP': return 'bg-secondary-50 text-secondary-700 border-secondary-100';
      case 'CONVERTED': return 'bg-primary-50 text-primary-700 border-primary-100';
      case 'LOST': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn font-sans text-xs text-neutral-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-neutral-800">Inquiries & Lead Pipeline</h1>
          <p className="text-[11px] text-neutral-500 mt-0.5 font-normal">Track studio lead inquiries and convert prospects directly into bookings.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/leads/create')}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-medium rounded-lg shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <TextField 
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Search by name or phone..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </InputAdornment>
                )
              }
            }}
            sx={{ '& .MuiInputBase-root': { height: 36, fontSize: '0.75rem', borderRadius: '8px' } }}
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <Filter className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-500 font-medium">Source:</span>
            <FormControl size="small">
              <Select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as string)}
                displayEmpty
                sx={{ minWidth: 120, height: 34, fontSize: '0.75rem', borderRadius: '8px' }}
              >
                <MenuItem value="ALL">All Sources</MenuItem>
                {SOURCES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-neutral-500 font-medium">Status:</span>
            <FormControl size="small">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as string)}
                displayEmpty
                sx={{ minWidth: 120, height: 34, fontSize: '0.75rem', borderRadius: '8px' }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden">

        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-neutral-400">Loading leads database...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-medium">No lead inquiries found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Contact Profile</th>
                  <th className="py-3 px-4">Inquiry details</th>
                  <th className="py-3 px-4">Est. Budget</th>
                  <th className="py-3 px-4">Lead Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-neutral-50/40 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-800">{lead.name}</p>
                      <div className="flex flex-col space-y-0.5 mt-1 text-[10px] text-neutral-400">
                        <span className="flex items-center space-x-1"><Phone className="h-3 w-3" /><span>{lead.phone}</span></span>
                        {lead.email && <span className="flex items-center space-x-1"><Mail className="h-3 w-3" /><span>{lead.email}</span></span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold text-[10px] uppercase">{lead.event}</span>
                      <p className="text-[10px] text-neutral-500 mt-1 flex items-center space-x-1"><Calendar className="h-3 w-3" /><span>Date: {lead.eventDate}</span></p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-800">{lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}` : 'TBA'}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] bg-neutral-100/70 border border-neutral-200/50 text-neutral-600 font-semibold px-2 py-0.5 rounded-full uppercase">{lead.source}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 border text-[10px] font-bold rounded-full tracking-wide ${getStatusBadgeColor(lead.status)}`}>{lead.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {lead.status !== 'CONVERTED' && (
                          <button onClick={() => handleConvertToClient(lead)} title="Convert to Registered Client" className="p-1.5 bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white rounded transition duration-150 cursor-pointer">
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => router.push(`/dashboard/leads/create?leadId=${lead.id}`)} title="Edit Details" className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-800 rounded transition duration-150 cursor-pointer">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(lead.id)} title="Delete Lead" className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded transition duration-150 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
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
