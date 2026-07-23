'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { 
  Search, CheckCircle2, MapPin, CalendarDays, RefreshCw, 
  ChevronRight, Filter, Clock, Sparkles, AlertCircle, ArrowRight
} from 'lucide-react';
import { TextField, Select, MenuItem, FormControl } from '@mui/material';

const PIPELINE_STAGES = [
  { key: 'CONFIRMED', label: '1. Confirmed' },
  { key: 'IN_PROGRESS', label: '2. Shoot On-Site' },
  { key: 'EDITING', label: '3. Editing' },
  { key: 'ALBUM_DESIGNING', label: '4. Album Design' },
  { key: 'PRINTING', label: '5. Printing Press' },
  { key: 'READY_FOR_DELIVERY', label: '6. Ready' },
  { key: 'COMPLETED', label: '7. Delivered' },
];

export default function StatusRosterPage() {
  const router = useRouter();
  const { bookings, fetchData } = useStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    fetchData('bookings', '?include={"client":true,"package":true}')
      .finally(() => setLoading(false));
  }, [fetchData]);

  const filteredBookings = bookings.filter((b) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      b.bookingNumber.toLowerCase().includes(term) ||
      (b.client && b.client.name.toLowerCase().includes(term)) ||
      (b.venue && b.venue.toLowerCase().includes(term));

    const matchesStage = filterStage === 'ALL' || b.status === filterStage;

    return matchesSearch && matchesStage;
  });

  // Calculations for summary stats
  const totalCount = bookings.length;
  const inProgressCount = bookings.filter(b => b.status === 'IN_PROGRESS').length;
  const editingCount = bookings.filter(b => ['EDITING', 'ALBUM_DESIGNING', 'PRINTING'].includes(b.status)).length;
  const readyCount = bookings.filter(b => b.status === 'READY_FOR_DELIVERY').length;

  const getStageIndex = (status: string) => {
    const idx = PIPELINE_STAGES.findIndex(s => s.key === status);
    return idx === -1 ? (status === 'COMPLETED' ? 6 : 0) : idx;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'EDITING': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ALBUM_DESIGNING': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'PRINTING': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'READY_FOR_DELIVERY': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'COMPLETED': return 'bg-emerald-500 text-white border-emerald-600';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Title Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <span>Lifecycle Progress & Status Roster</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-medium">
            Interactive pipeline tracking, production stage timelines, and operational statuses across all active bookings.
          </p>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Total Bookings</span>
          <p className="text-xl font-extrabold text-neutral-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-600">On-Site Shoots</span>
          <p className="text-xl font-extrabold text-amber-700 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-purple-600">Post-Production</span>
          <p className="text-xl font-extrabold text-purple-700 mt-1">{editingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600">Ready For Delivery</span>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">{readyCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <TextField 
            fullWidth
            size="small"
            placeholder="Search booking number, client name, or venue..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <Search className="h-4 w-4 text-neutral-400 mr-2" />
                )
              }
            }}
            sx={{ '& .MuiInputBase-root': { height: 38, fontSize: '0.75rem', borderRadius: '10px' } }}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-600">Stage Filter:</span>
          <FormControl size="small">
            <Select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value as string)}
              displayEmpty
              sx={{ minWidth: 160, height: 38, fontSize: '0.75rem', bgcolor: 'white', borderRadius: '10px' }}
            >
              <MenuItem value="ALL">All Stages</MenuItem>
              {PIPELINE_STAGES.map(s => (
                <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Interactive Roster Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs font-semibold text-neutral-400 flex items-center justify-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
            <span>Loading active status roster...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-400 font-medium">
            No booking records found matching search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50/70 text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200/80">
                  <th className="py-3.5 px-4 font-bold">Booking & Client</th>
                  <th className="py-3.5 px-4 font-bold">Financials</th>
                  <th className="py-3.5 px-4 font-bold">Stage Timeline Progress</th>
                  <th className="py-3.5 px-4 font-bold">Current Stage</th>
                  <th className="py-3.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredBookings.map((b) => {
                  const currentIdx = getStageIndex(b.status);

                  return (
                    <tr key={b.id} className="hover:bg-neutral-50/60 transition group">
                      
                      {/* Booking & Client */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="font-mono text-[11px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                            #{b.bookingNumber}
                          </span>
                          <p className="font-bold text-neutral-900 text-xs mt-1">{b.client?.name || 'Client'}</p>
                          {b.venue && (
                            <p className="text-[10px] text-neutral-400 flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-neutral-400" />
                              <span className="truncate max-w-[140px]">{b.venue}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="font-extrabold text-neutral-800">₹{b.grandTotal?.toLocaleString('en-IN') || 0}</p>
                          {b.balance > 0 ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                              Due: ₹{b.balance.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              Fully Settled
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Visual Stage Timeline Progress Bar */}
                      <td className="py-4 px-4 min-w-[340px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-1">
                            {PIPELINE_STAGES.map((stage, idx) => {
                              const isCompleted = idx < currentIdx;
                              const isCurrent = idx === currentIdx;

                              return (
                                <React.Fragment key={stage.key}>
                                  <div 
                                    title={stage.label}
                                    className={`h-2.5 flex-1 rounded-full transition-all duration-300 ${
                                      isCompleted 
                                        ? 'bg-emerald-500' 
                                        : isCurrent 
                                          ? 'bg-amber-500 animate-pulse ring-2 ring-amber-200' 
                                          : 'bg-neutral-200/70'
                                    }`}
                                  />
                                </React.Fragment>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-semibold text-neutral-400">
                            <span>1. Deposit</span>
                            <span className="text-amber-600 font-bold">Stage {currentIdx + 1} of 7</span>
                            <span>7. Delivered</span>
                          </div>
                        </div>
                      </td>

                      {/* Current Stage Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2.5 py-1 border text-[10px] font-extrabold rounded-full tracking-wide ${getStatusBadge(b.status)}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => router.push(`/dashboard/bookings/status/update?bookingId=${b.id}`)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                        >
                          <span>Update Stage</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
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
