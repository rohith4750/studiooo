'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Calendar, Users, AlertTriangle, CheckCircle, Info, Plus, 
  Trash2, X, ClipboardCheck, Sparkles, MapPin, Clock 
} from 'lucide-react';
import { TextField, Select, MenuItem, FormControl } from '@mui/material';

const STAFF_ROLES = ['LEAD_PHOTOGRAPHER', 'CINEMATOGRAPHER', 'DRONE_OPERATOR', 'ASSISTANT'];
const ATTENDANCE_STATUSES = ['PENDING', 'PRESENT', 'ABSENT'];

export default function AssignmentsPage() {
  const { 
    assignments, employees, bookingEvents, bookings, 
    fetchData, createRecord, deleteRecord, updateRecord 
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [formClientId, setFormClientId] = useState('');
  const [formBookingEventId, setFormBookingEventId] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formRole, setFormRole] = useState('LEAD_PHOTOGRAPHER');
  const [formTravelAllowance, setFormTravelAllowance] = useState('0');
  const [formAttendance, setFormAttendance] = useState('PENDING');

  // Conflict warning trigger state
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('assignments', '?include={"bookingEvent":{"include":{"event":true,"booking":{"include":{"client":true}}}},"employee":true}'),
      fetchData('employees'),
      fetchData('bookingevents', '?include={"event":true,"booking":{"include":{"client":true}}}'),
      fetchData('bookings'),
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  // Check conflicts dynamically when employee or event is selected
  useEffect(() => {
    if (!formEmployeeId || !formBookingEventId) {
      setConflictWarning(null);
      return;
    }

    const selectedEvent = bookingEvents.find(be => be.id === formBookingEventId);
    if (!selectedEvent) return;

    const targetDate = selectedEvent.eventDate;

    // Check if employee already has an assignment on this date
    const conflicting = assignments.find(
      (a: any) => a.employeeId === formEmployeeId && a.bookingEvent?.eventDate === targetDate
    );

    if (conflicting) {
      setConflictWarning(
        `Staff Conflict: ${conflicting.employee?.name} is already assigned to a ${conflicting.bookingEvent?.event?.name || 'Shoot'} on ${targetDate}.`
      );
    } else {
      setConflictWarning(null);
    }
  }, [formEmployeeId, formBookingEventId, bookingEvents, assignments]);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBookingEventId || !formEmployeeId) {
      alert('Please select both a shoot event and staff employee');
      return;
    }

    const payload = {
      bookingEventId: formBookingEventId,
      employeeId: formEmployeeId,
      role: formRole,
      travelAllowance: parseFloat(formTravelAllowance) || 0,
      attendance: formAttendance,
    };

    try {
      await createRecord('assignments', payload);
      setModalOpen(false);
      // Re-fetch assignments
      fetchData('assignments', '?include={"bookingEvent":{"include":{"event":true,"booking":{"include":{"client":true}}}},"employee":true}');
    } catch (e) {
      alert('Failed to assign employee: ' + e);
    }
  };

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
    return bookingEvents.filter(be => be.eventDate === dateStr);
  };

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
        <button
          onClick={() => {
            setFormClientId('');
            setFormBookingEventId('');
            setFormEmployeeId('');
            setFormRole('LEAD_PHOTOGRAPHER');
            setFormTravelAllowance('0');
            setFormAttendance('PENDING');
            setConflictWarning(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded cursor-pointer shadow-xs transition duration-150"
        >
          <Plus className="h-4 w-4" />
          <span>Assign Staff to Shoot</span>
        </button>
      </div>

      {/* Main Grid: July 2026 Calendar (Left) & Active Assignments Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:p-5">
        
        {/* July 2026 Calendar view */}
        <div className="glass-card p-5 rounded border border-neutral-200/50 lg:col-span-2">
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

        {/* Assignments list table (Right side) */}
        <div className="glass-card rounded overflow-hidden border border-neutral-200/50 flex flex-col h-[460px] lg:h-[420px]">
          <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex justify-between">
            <span>Active Staff Load</span>
            <span>List</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 text-xs">
            {loading ? (
              <div className="p-12 text-center text-xs font-semibold text-neutral-400">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 font-medium">No staff assigned to events yet.</div>
            ) : (
              assignments.map((a: any) => (
                <div key={a.id} className="p-3.5 space-y-2 hover:bg-neutral-50/40 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-neutral-800">{a.employee?.name}</p>
                      <span className="inline-block mt-0.5 text-[8px] uppercase tracking-wide px-1.5 py-0.25 bg-neutral-100 border rounded font-semibold text-neutral-600">
                        {a.role.replace('_', ' ')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteAssignment(a.id)}
                      title="Remove Staff Assignment"
                      className="p-1 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-[10px] text-neutral-500 space-y-0.5">
                    <p className="font-semibold text-neutral-700">Event: {a.bookingEvent?.event?.name} (Ref: {a.bookingEvent?.booking?.bookingNumber})</p>
                    <p className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Date: {a.bookingEvent?.eventDate} ({a.bookingEvent?.eventTime || '09:00 AM'})</span>
                    </p>
                    {a.bookingEvent?.venue && (
                      <p className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-neutral-400" />
                        <span>Venue: {a.bookingEvent.venue}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100/50">
                    <span className="text-[9px] text-neutral-400">Allowance: ₹{a.travelAllowance}</span>
                    
                    {/* Attendance selection */}
                    <div className="flex items-center space-x-1 text-[9px] font-bold">
                      <span>Attendance:</span>
                      <FormControl size="small">
                        <Select
                          value={a.attendance}
                          onChange={(e) => handleUpdateAttendance(a.id, e.target.value as string)}
                          sx={{ height: 20, fontSize: '0.65rem', minWidth: 80, '& .MuiSelect-select': { py: 0, px: 1 } }}
                        >
                          {ATTENDANCE_STATUSES.map(status => (
                            <MenuItem key={status} value={status} sx={{ fontSize: '0.75rem' }}>{status}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Assign Staff Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-md w-full shadow-lg border border-primary-100 flex flex-col animate-scaleIn">
            <div className="p-4 border-b border-primary-100/50 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800 flex items-center space-x-1.5 text-xs sm:text-sm">
                <Sparkles className="h-4.5 w-4.5 text-primary-500" />
                <span>Assign Staff to Shoot Event</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="p-5 space-y-4 text-xs">
              
              {/* Select Client (Optional Filter) */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Filter by Client</label>
                <FormControl fullWidth size="small" variant="outlined">
                  <Select
                    value={formClientId}
                    onChange={(e) => {
                      setFormClientId(e.target.value as string);
                      setFormBookingEventId('');
                    }}
                    displayEmpty
                  >
                    <MenuItem value=""><em>-- All Clients --</em></MenuItem>
                    {Array.from(new Map(bookingEvents.filter(be => be.status !== 'COMPLETED' && be.booking?.client).map(be => [be.booking.client.id, be.booking.client])).values()).map((client: any) => (
                      <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Select Booking Event */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Select Shoot Event *</label>
                <FormControl fullWidth size="small" variant="outlined">
                  <Select
                    required
                    value={formBookingEventId}
                    onChange={(e) => setFormBookingEventId(e.target.value as string)}
                    displayEmpty
                  >
                    <MenuItem value=""><em>-- Choose Event Shoot --</em></MenuItem>
                    {bookingEvents
                      .filter(be => be.status !== 'COMPLETED' && (!formClientId || be.booking?.client?.id === formClientId))
                      .map(be => (
                      <MenuItem key={be.id} value={be.id}>
                        {be.booking?.client?.name} - {be.event?.name} ({be.eventDate})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Select Staff Employee */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Select Staff Employee *</label>
                <FormControl fullWidth size="small" variant="outlined">
                  <Select
                    required
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value as string)}
                    displayEmpty
                  >
                    <MenuItem value=""><em>-- Choose Staff Member --</em></MenuItem>
                    {employees.filter(emp => emp.role === 'PHOTOGRAPHER' || emp.role === 'EDITOR').map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>{emp.name} ({emp.role})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Conflict warning banner */}
              {conflictWarning && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded flex items-start space-x-2 animate-shake">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] font-semibold">{conflictWarning}</span>
                </div>
              )}

              {/* Assignment Role */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Assignment Assignment Role</label>
                <FormControl fullWidth size="small" variant="outlined">
                  <Select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as string)}
                  >
                    {STAFF_ROLES.map(role => (
                      <MenuItem key={role} value={role}>{role.replace('_', ' ')}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Travel allowance */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1">Travel Allowance (₹)</label>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  type="number"
                  value={formTravelAllowance}
                  onChange={(e) => setFormTravelAllowance(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
