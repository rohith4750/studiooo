'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Calendar, Users, AlertTriangle, CheckCircle, Info, Plus, 
  Trash2, X, ClipboardCheck, Sparkles, MapPin, Clock 
} from 'lucide-react';
import { Select, MenuItem, FormControl } from '@mui/material';
import Link from 'next/link';

const STAFF_ROLES = ['LEAD_PHOTOGRAPHER', 'CINEMATOGRAPHER', 'DRONE_OPERATOR', 'ASSISTANT'];
const ATTENDANCE_STATUSES = ['PENDING', 'PRESENT', 'ABSENT'];

export default function AssignmentsPage() {
  const { 
    assignments, employees, bookingEvents, bookings, 
    fetchData, deleteRecord, updateRecord 
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [filterClientId, setFilterClientId] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('assignments', '?include={"bookingEvent":{"include":{"event":true,"booking":{"include":{"client":true}}}},"employee":true}'),
      fetchData('employees'),
      fetchData('bookingevents', '?include={"event":true,"booking":{"include":{"client":true}}}'),
      fetchData('bookings'),
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  const handleDeleteAssignment = async (id: string) => {
    if (confirm('Are you sure you want to remove this staff assignment?')) {
      try {
        await deleteRecord('assignments', id);
        fetchData('assignments', '?include={"bookingEvent":{"include":{"event":true,"booking":{"include":{"client":true}}}},"employee":true}');
      } catch (err) {
        alert('Failed to remove assignment: ' + err);
      }
    }
  };

  const handleUpdateAttendance = async (id: string, attendance: string) => {
    try {
      await updateRecord('assignments', { id, attendance });
      alert(`Attendance status updated to ${attendance}`);
      fetchData('assignments', '?include={"bookingEvent":{"include":{"event":true,"booking":{"include":{"client":true}}}},"employee":true}');
    } catch (e) {
      alert('Failed to update attendance: ' + e);
    }
  };

  // Prepping Calendar Matrix for July 2026 (matching local year context)
  const daysInJuly = 31;
  const julyDays = Array.from({ length: daysInJuly }, (_, i) => i + 1);

  // Group events by day of July 2026
  const getShootsForDay = (day: number) => {
    const dateStr = `2026-07-${day.toString().padStart(2, '0')}`;
    return bookingEvents.filter(be => 
      be.eventDate === dateStr && 
      (!filterClientId || be.booking?.clientId === filterClientId)
    );
  };

  const activeClients = Array.from(new Map(bookingEvents.filter(be => be.booking?.client).map(be => [be.booking.client.id, be.booking.client])).values());
  const filteredAssignments = assignments.filter((a: any) => !filterClientId || a.bookingEvent?.booking?.clientId === filterClientId);

  const getEventBgColor = (name: string) => {
    if (name.includes('Wedding')) return 'bg-rose-50 text-rose-700 border-rose-100';
    if (name.includes('Haldi')) return 'bg-amber-50 text-amber-700 border-amber-100';
    if (name.includes('Reception')) return 'bg-primary-50 text-primary-700 border-primary-100';
    return 'bg-blue-50 text-blue-700 border-blue-100';
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800">Staff Assignments & Calendar</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Assign photographers, drone pilots, and track shoot schedules.</p>
        </div>
        <div className="flex items-center space-x-3">
          <FormControl size="small" sx={{ minWidth: 220, bgcolor: 'white' }}>
            <Select
              value={filterClientId}
              onChange={(e) => setFilterClientId(e.target.value as string)}
              displayEmpty
              sx={{ fontSize: '0.85rem' }}
            >
              <MenuItem value="" sx={{ fontSize: '0.85rem' }}><em>-- Filter by Client --</em></MenuItem>
              {activeClients.map((client: any) => (
                <MenuItem key={client.id} value={client.id} sx={{ fontSize: '0.85rem' }}>{client.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Link
            href="/dashboard/assignments/create"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded cursor-pointer shadow-xs transition duration-150"
          >
            <Plus className="h-4 w-4" />
            <span>Assign Staff to Shoot</span>
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-6 sm:p-2">
        
        {/* July 2026 Calendar view */}
        <div className="glass-card p-5 rounded border border-neutral-200/50">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
            <h3 className="font-bold text-xs uppercase text-neutral-500 tracking-wider flex items-center space-x-1.5">
              <Calendar className="h-4.5 w-4.5 text-primary-500" />
              <span>July 2026 Schedule</span>
            </h3>
            <span className="text-[10px] bg-primary-50 text-primary-700 font-bold px-2 py-0.5 rounded">Color-Coded Events</span>
          </div>

          {/* Calendar Grid 7 columns */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-neutral-400 mb-2">
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>

          {/* Calendar Days matrix */}
          {/* Note: July 1, 2026 is a Wednesday, so we prepend 3 empty slots for Sun, Mon, Tue */}
          <div className="grid grid-cols-7 gap-2 min-h-[300px]">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-neutral-50/30 rounded border border-neutral-100/30"></div>
            ))}

            {julyDays.map((day) => {
              const dayShoots = getShootsForDay(day);
              return (
                <div key={day} className="p-1.5 bg-white border border-neutral-200/60 rounded flex flex-col items-start min-h-[70px] hover:border-primary-300 transition shadow-xs">
                  <span className="text-[10px] font-bold text-neutral-400">{day}</span>
                  <div className="mt-1 w-full space-y-1 overflow-y-auto max-h-[55px]">
                    {dayShoots.map((be) => (
                      <div
                        key={be.id}
                        title={`${be.event?.name} - ${be.booking?.client?.name}`}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded border text-left truncate leading-tight ${getEventBgColor(be.event?.name || '')}`}
                      >
                        {be.event?.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assignments list table (Below Calendar) */}
        <div className="glass-card rounded overflow-hidden border border-neutral-200/50">
          <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 text-xs font-bold uppercase tracking-wider text-neutral-500 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary-500" />
              <span>Active Staff Load</span>
            </div>
            <span className="bg-white px-2 py-0.5 rounded border border-neutral-200 shadow-sm">{filteredAssignments.length} Assignments</span>
          </div>

          <div className="p-4 sm:p-5 bg-neutral-50/30 min-h-[200px]">
            {loading ? (
              <div className="py-12 text-center text-sm font-semibold text-neutral-400">Loading assignments...</div>
            ) : filteredAssignments.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 font-medium">No staff assigned for this client.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAssignments.map((a: any) => (
                  <div key={a.id} className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs hover:shadow-sm hover:border-primary-200 transition flex flex-col justify-between h-full group relative">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-neutral-800">{a.employee?.name}</p>
                          <span className="inline-block mt-1 text-[9px] uppercase tracking-wide px-2 py-0.5 bg-primary-50 text-primary-700 border border-primary-100 rounded font-bold">
                            {a.role.replace('_', ' ')}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteAssignment(a.id)}
                          title="Remove Staff Assignment"
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-xs text-neutral-500 space-y-1.5 mb-4">
                        <p className="font-semibold text-neutral-700">{a.bookingEvent?.event?.name}</p>
                        <p className="text-[10px] uppercase text-neutral-400 font-medium tracking-wide">Ref: {a.bookingEvent?.booking?.bookingNumber}</p>
                        <div className="flex items-center space-x-1.5 pt-1.5">
                          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{a.bookingEvent?.eventDate} at {a.bookingEvent?.eventTime || '09:00 AM'}</span>
                        </div>
                        {a.bookingEvent?.venue && (
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="truncate">{a.bookingEvent.venue}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100/70 mt-auto">
                      <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">₹{a.travelAllowance || 0} TA</span>
                      
                      {/* Attendance selection */}
                      <div className="flex items-center space-x-1.5">
                        <FormControl size="small">
                          <Select
                            value={a.attendance}
                            onChange={(e) => handleUpdateAttendance(a.id, e.target.value as string)}
                            sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600, minWidth: 90, '& .MuiSelect-select': { py: 0, px: 1 }, bgcolor: a.attendance === 'PRESENT' ? '#f0fdf4' : a.attendance === 'ABSENT' ? '#fef2f2' : 'white' }}
                          >
                            {ATTENDANCE_STATUSES.map(status => (
                              <MenuItem key={status} value={status} sx={{ fontSize: '0.75rem' }}>{status}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
