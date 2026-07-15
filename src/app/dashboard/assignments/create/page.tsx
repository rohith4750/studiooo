'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Users, AlertTriangle, Sparkles, MapPin, Clock, ArrowLeft, CheckCircle, Info
} from 'lucide-react';
import { TextField, Select, MenuItem, FormControl, ListSubheader, Checkbox, ListItemText } from '@mui/material';

const STAFF_ROLES = ['LEAD_PHOTOGRAPHER', 'CINEMATOGRAPHER', 'DRONE_OPERATOR', 'ASSISTANT'];
const ATTENDANCE_STATUSES = ['PENDING', 'PRESENT', 'ABSENT'];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { 
    assignments, employees, bookingEvents, 
    fetchData, createRecord 
  } = useStore();

  const [loading, setLoading] = useState(true);

  // Form states
  const [formClientId, setFormClientId] = useState('');
  const [formBookingEventIds, setFormBookingEventIds] = useState<string[]>([]);
  const [formEmployeeIds, setFormEmployeeIds] = useState<string[]>([]);
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
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  useEffect(() => {
    if (formEmployeeIds.length === 0 || formBookingEventIds.length === 0) {
      setConflictWarning(null);
      return;
    }

    const conflicts: string[] = [];
    formBookingEventIds.forEach(id => {
      const selectedEvent = bookingEvents.find(be => be.id === id);
      if (!selectedEvent) return;

      const targetDate = selectedEvent.eventDate;
      formEmployeeIds.forEach(empId => {
        const conflicting = assignments.find(
          (a: any) => a.employeeId === empId && a.bookingEvent?.eventDate === targetDate
        );

        if (conflicting) {
          conflicts.push(`Staff Conflict: ${conflicting.employee?.name} is already assigned to a ${conflicting.bookingEvent?.event?.name || 'Shoot'} on ${targetDate}.`);
        }
      });
    });

    if (conflicts.length > 0) {
      setConflictWarning(conflicts.join(' '));
    } else {
      setConflictWarning(null);
    }
  }, [formEmployeeIds, formBookingEventIds, bookingEvents, assignments]);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formBookingEventIds.length === 0 || formEmployeeIds.length === 0) {
      alert('Please select at least one shoot event and one staff employee');
      return;
    }

    try {
      const payloads: any[] = [];
      formBookingEventIds.forEach(eventId => {
        formEmployeeIds.forEach(empId => {
          payloads.push({
            bookingEventId: eventId,
            employeeId: empId,
            role: formRole,
            travelAllowance: parseFloat(formTravelAllowance) || 0,
            attendance: formAttendance,
          });
        });
      });

      await Promise.all(payloads.map(payload => createRecord('assignments', payload)));
      router.push('/dashboard/assignments');
    } catch (e) {
      alert('Failed to assign employee: ' + e);
    }
  };

  const selectedEventInfos = bookingEvents.filter(be => formBookingEventIds.includes(be.id));
  const selectedEmployeeInfos = employees.filter(e => formEmployeeIds.includes(e.id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push('/dashboard/assignments')}
          className="p-2 bg-white border border-neutral-200 rounded hover:bg-neutral-50 transition cursor-pointer shadow-xs"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary-500" />
            <span>Create Staff Assignment</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">Allocate photographers and crew to upcoming shoots.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form */}
        <div className="glass-card rounded border border-neutral-200/50 p-6 lg:col-span-2 shadow-sm bg-white">
          <form onSubmit={handleAddAssignment} className="space-y-6 text-sm">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Select Client (Optional Filter) */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1.5 text-xs uppercase tracking-wide">Filter by Client (Optional)</label>
                <FormControl fullWidth size="small">
                  <Select
                    value={formClientId}
                    onChange={(e) => {
                      setFormClientId(e.target.value as string);
                      setFormBookingEventIds([]);
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
                <label className="block font-bold text-neutral-600 mb-1.5 text-xs uppercase tracking-wide">Select Shoot Events (Multi-Select) *</label>
                <FormControl fullWidth size="small">
                  <Select
                    required
                    multiple
                    value={formBookingEventIds}
                    onChange={(e) => {
                      const val = e.target.value;
                      const arr = typeof val === 'string' ? val.split(',') : (val as string[]);
                      setFormBookingEventIds(arr.filter(v => v !== ''));
                    }}
                    displayEmpty
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return <em>-- Choose Event Shoots --</em>;
                      }
                      return `${selected.length} events selected`;
                    }}
                  >
                    <MenuItem value="" disabled><em>-- Choose Event Shoots --</em></MenuItem>
                    {(() => {
                      const filtered = bookingEvents.filter(be => be.status !== 'COMPLETED' && (!formClientId || be.booking?.client?.id === formClientId));
                      const grouped = filtered.reduce((acc, be) => {
                        const groupName = be.booking?.name 
                          ? `${be.booking.client?.name} | ${be.booking.name}` 
                          : `${be.booking?.client?.name} (Booking #${be.booking?.bookingNumber})`;
                        if (!acc[groupName]) acc[groupName] = [];
                        acc[groupName].push(be);
                        return acc;
                      }, {} as Record<string, any[]>);

                      const items: React.ReactNode[] = [];
                      Object.entries(grouped).forEach(([groupName, events]) => {
                        items.push(
                          <ListSubheader key={groupName} sx={{ lineHeight: '32px', bgcolor: '#f8fafc', fontWeight: 700, color: '#334155', fontSize: '0.75rem' }}>
                            {groupName}
                          </ListSubheader>
                        );
                        (events as any[]).forEach((be: any) => {
                          items.push(
                            <MenuItem key={be.id} value={be.id} sx={{ ml: 0.5 }}>
                              <Checkbox checked={formBookingEventIds.includes(be.id)} size="small" sx={{ p: 0.5, mr: 1 }} />
                              <ListItemText 
                                primary={<span style={{ fontSize: '0.8rem' }}>{`${be.event?.name} (${be.eventDate})`}</span>}
                              />
                            </MenuItem>
                          );
                        });
                      });
                      return items;
                    })()}
                  </Select>
                </FormControl>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-neutral-100 pt-5 mt-5">
              {/* Select Staff Employee */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1.5 text-xs uppercase tracking-wide">Select Staff Members (Multi-Select) *</label>
                <FormControl fullWidth size="small">
                  <Select
                    required
                    multiple
                    value={formEmployeeIds}
                    onChange={(e) => {
                      const val = e.target.value;
                      const arr = typeof val === 'string' ? val.split(',') : (val as string[]);
                      setFormEmployeeIds(arr.filter(v => v !== ''));
                    }}
                    displayEmpty
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return <em>-- Choose Staff --</em>;
                      }
                      return `${selected.length} staff selected`;
                    }}
                  >
                    <MenuItem value="" disabled><em>-- Choose Staff --</em></MenuItem>
                    {employees.filter(emp => emp.role === 'PHOTOGRAPHER' || emp.role === 'EDITOR').map(emp => (
                      <MenuItem key={emp.id} value={emp.id} sx={{ ml: 0.5 }}>
                        <Checkbox checked={formEmployeeIds.includes(emp.id)} size="small" sx={{ p: 0.5, mr: 1 }} />
                        <ListItemText 
                          primary={<span style={{ fontSize: '0.8rem' }}>{emp.name} ({emp.role})</span>}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Assignment Role */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1.5 text-xs uppercase tracking-wide">Duty / Role *</label>
                <FormControl fullWidth size="small">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-neutral-100 pt-5 mt-5">
              {/* Travel allowance */}
              <div>
                <label className="block font-bold text-neutral-600 mb-1.5 text-xs uppercase tracking-wide">Travel Allowance (₹)</label>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={formTravelAllowance}
                  onChange={(e) => setFormTravelAllowance(e.target.value)}
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <button
                type="submit"
                className="px-8 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded cursor-pointer shadow-sm transition duration-150 flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Confirm Assignment</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Dynamic Preview / Warnings */}
        <div className="space-y-4">
          
          {conflictWarning && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-3 shadow-xs animate-shake">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-red-800 uppercase tracking-wide">Schedule Conflict Detected</h4>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">{conflictWarning}</p>
              </div>
            </div>
          )}

          {selectedEventInfos.length === 0 && selectedEmployeeInfos.length === 0 && (
            <div className="glass-card p-6 rounded border border-neutral-200/50 bg-neutral-50/50 text-center flex flex-col items-center justify-center min-h-[250px]">
              <div className="h-12 w-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-3">
                <Info className="h-5 w-5 text-neutral-400" />
              </div>
              <h3 className="text-sm font-bold text-neutral-700">Assignment Preview</h3>
              <p className="text-xs text-neutral-500 mt-2 max-w-[220px]">Select events and a staff member to see their assignment summary and potential schedule conflicts.</p>
            </div>
          )}

          {selectedEventInfos.length > 0 && (
            <div className="glass-card p-5 rounded-lg border border-primary-200/60 bg-primary-50/30 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-400"></div>
              <h4 className="text-[10px] font-extrabold text-primary-600 uppercase tracking-wider mb-3">Target Event Details ({selectedEventInfos.length})</h4>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {selectedEventInfos.map((selectedEventInfo, idx) => (
                  <div key={idx} className="space-y-3 text-sm pb-4 border-b border-primary-100/50 last:border-0 last:pb-0">
                    <div>
                      <p className="text-xs text-neutral-500 font-semibold mb-0.5">Booking Contract</p>
                      <p className="font-bold text-neutral-800">{selectedEventInfo.booking?.client?.name}</p>
                      <p className="text-[11px] font-medium text-neutral-500">{selectedEventInfo.booking?.name}</p>
                    </div>
                    <div className="pt-2 border-t border-primary-100/50">
                      <p className="text-xs text-neutral-500 font-semibold mb-0.5">Event Session</p>
                      <p className="font-bold text-neutral-700">{selectedEventInfo.event?.name}</p>
                      <div className="flex items-center space-x-1.5 text-xs text-neutral-600 mt-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{selectedEventInfo.eventDate} at {selectedEventInfo.eventTime || '09:00 AM'}</span>
                      </div>
                      {selectedEventInfo.venue && (
                        <div className="flex items-center space-x-1.5 text-xs text-neutral-600 mt-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{selectedEventInfo.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedEmployeeInfos.length > 0 && (
            <div className="glass-card p-5 rounded-lg border border-indigo-200/60 bg-indigo-50/30 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
              <h4 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider mb-3">Assigned Staff Details ({selectedEmployeeInfos.length})</h4>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {selectedEmployeeInfos.map((selectedEmployeeInfo, idx) => (
                  <div key={idx} className="pb-4 border-b border-indigo-100/50 last:border-0 last:pb-0">
                    <p className="font-bold text-neutral-800">{selectedEmployeeInfo.name}</p>
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wide px-1.5 py-0.5 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded font-bold">
                      {selectedEmployeeInfo.role}
                    </span>
                    
                    <div className="mt-3 pt-3 border-t border-indigo-100/50 flex items-center space-x-2 text-xs text-neutral-600 font-medium">
                      <Users className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Will be assigned as <strong>{formRole.replace('_', ' ')}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
