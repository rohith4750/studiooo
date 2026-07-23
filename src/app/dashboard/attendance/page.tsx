'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Calendar, UserCheck, AlertCircle, Clock, Banknote, Save } from 'lucide-react';
import { TextField, Select, MenuItem, FormControl } from '@mui/material';

const ATTENDANCE_STATUS = ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'];

export default function AttendancePage() {
  const { employees, attendances, fetchData, createRecord } = useStore();
  const [loading, setLoading] = useState(true);

  // Form states
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState('PRESENT');
  const [formWorkDesc, setFormWorkDesc] = useState('');

  // Payroll Filter State
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('employees'),
      fetchData('attendances', '?include={"employee":true}'),
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeId || !formDate) return;

    try {
      await createRecord('attendances', {
        employeeId: formEmployeeId,
        date: formDate,
        status: formStatus,
        workDescription: formWorkDesc,
      });
      alert('Attendance recorded successfully!');
      setFormWorkDesc('');
    } catch (err: any) {
      alert('Failed to mark attendance: ' + err.message);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });

  // Calculate payroll summary for current month
  const payrollSummary = employees.filter(emp => emp.role !== 'ADMIN').map(emp => {
    // Filter attendance records for this employee in the selected month
    const empAttendances = attendances.filter((a: any) => {
      if (a.employeeId !== emp.id) return false;
      const d = new Date(a.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;

    let leaveBalanceRemaining = emp.leaveBalance || 0;

    const recordedDates = new Set();

    empAttendances.forEach((a: any) => {
      recordedDates.add(a.date);
      if (a.status === 'PRESENT') present++;
      else if (a.status === 'ABSENT') absent++;
      else if (a.status === 'HALF_DAY') halfDay++;
      else if (a.status === 'LEAVE') {
        if (leaveBalanceRemaining >= 1) {
          leaveBalanceRemaining -= 1;
          leave++; // This is a paid leave
        } else {
          absent++; // Treats unpaid leave as absent
        }
      }
    });

    // Auto-calculate absences for missing working days
    // Up to "today" if in current month, or end of month if past month.
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    
    // Only check up to today if it's the current month, else the whole month
    let lastDayToCheck = daysInMonth;
    if (currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonth > today.getMonth())) {
      lastDayToCheck = 0; // Future months have 0 checked days
    } else if (isCurrentMonth) {
      lastDayToCheck = today.getDate();
    }

    for (let day = 1; day <= lastDayToCheck; day++) {
      // Create local date string YYYY-MM-DD to match database format
      const dateToCheck = new Date(currentYear, currentMonth, day);
      const dayOfWeek = dateToCheck.getDay();
      
      // Skip Weekends (Saturday=6, Sunday=0) for penalty
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Adjust for local timezone offset to get correct YYYY-MM-DD
      const offset = dateToCheck.getTimezoneOffset() * 60000;
      const localDate = new Date(dateToCheck.getTime() - offset);
      const dateStr = localDate.toISOString().split('T')[0];

      if (!recordedDates.has(dateStr)) {
        absent++; // Auto mark absent
      }
    }

    const perDayPay = (emp.salary || 0) / daysInMonth;
    // We deduct pay for absences and half days (0.5). Paid leaves are already accounted for.
    const deductionDays = absent + (halfDay * 0.5);
    const totalDeduction = deductionDays * perDayPay;
    const finalSalary = Math.max(0, (emp.salary || 0) - totalDeduction);

    return {
      ...emp,
      present, absent, halfDay, leave,
      deductionDays,
      totalDeduction,
      finalSalary
    };
  });

  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayAttendances = attendances.filter((a: any) => a.date === todayStr);

  return (
    <div className="space-y-6 animate-fadeIn">

      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-800 flex items-center space-x-2">
          <UserCheck className="h-6 w-6 text-primary-500" />
          <span>Automated Attendance & Payroll Hub</span>
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">Staff attendance is automatically registered when they log into the portal. Managers can review check-ins and monthly payroll.</p>
      </div>

      {/* Auto-Attendance Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-primary-500/10 to-amber-600/5 border border-primary-200 p-4 rounded-xl flex items-start space-x-3">
        <Clock className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="text-xs text-neutral-700 leading-relaxed">
          <span className="font-bold text-neutral-900 block mb-0.5">Automatic Login Check-In Active</span>
          Whenever staff members log into the R2R Studio Portal on their phone or desktop, their attendance for today is automatically logged as <span className="font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">PRESENT</span> along with their exact login timestamp.
        </div>
      </div>

      {/* Today's Live Login Feed */}
      <div className="glass-card rounded-xl border border-neutral-200/60 p-5 bg-white shadow-xs">
        <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-3 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-neutral-800">Today's Staff Check-In Log ({todayStr})</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-normal">{todayAttendances.length} of {employees.filter(e => e.role !== 'ADMIN').length} Checked In</span>
        </h3>

        {todayAttendances.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-400 font-medium bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
            No staff logins recorded yet today. Staff check-ins will automatically appear here when they sign in.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayAttendances.map((a: any) => (
              <div key={a.id} className="p-3 bg-neutral-50 border border-neutral-200/70 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-neutral-800">{a.employee?.name || 'Staff Member'}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">{a.workDescription || 'Logged in via Portal'}</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">
                  PRESENT
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Attendance Form / Manual Adjustment */}
        <div className="glass-card rounded border border-neutral-200/50 p-6 shadow-sm bg-white lg:col-span-1 h-fit">
          <h3 className="font-bold text-sm text-neutral-700 border-b border-neutral-100 pb-3 mb-4 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-primary-500" />
            <span>Manual Adjust / Mark Leave</span>
          </h3>

          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div>
              <label className="block font-bold text-neutral-600 mb-1.5 text-xs uppercase tracking-wide">Select Staff *</label>
              <FormControl fullWidth size="small">
                <Select
                  required
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value as string)}
                  displayEmpty
                >
                  <MenuItem value="" disabled><em>-- Choose Employee --</em></MenuItem>
                  {employees.filter(e => e.role !== 'ADMIN').map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>{emp.name} ({emp.role})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1.5 text-xs uppercase tracking-wide">Date *</label>
              <TextField
                required
                fullWidth
                size="small"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1.5 text-xs uppercase tracking-wide">Status *</label>
              <FormControl fullWidth size="small">
                <Select
                  required
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as string)}
                >
                  {ATTENDANCE_STATUS.map(status => (
                    <MenuItem key={status} value={status}>{status.replace('_', ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div>
              <label className="block font-bold text-neutral-600 mb-1.5 text-xs uppercase tracking-wide">Work Description (Optional)</label>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder="What did they work on today?"
                value={formWorkDesc}
                onChange={(e) => setFormWorkDesc(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded shadow-sm transition duration-150 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Attendance</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Payroll Calculation */}
        <div className="glass-card rounded border border-neutral-200/50 lg:col-span-2 shadow-sm bg-white overflow-hidden flex flex-col">
          <div className="bg-neutral-50 p-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-700 flex items-center space-x-2">
              <Banknote className="h-4 w-4 text-emerald-500" />
              <span>Payroll Preview for {monthName} {currentYear}</span>
            </h3>
            <div className="flex items-center space-x-2">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  sx={{ height: 32, fontSize: '0.8rem', bgcolor: 'white' }}
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const mName = new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' });
                    return <MenuItem key={i} value={i} sx={{ fontSize: '0.8rem' }}>{mName}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 90 }}>
                <Select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  sx={{ height: 32, fontSize: '0.8rem', bgcolor: 'white' }}
                >
                  {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                    <MenuItem key={y} value={y} sx={{ fontSize: '0.8rem' }}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="p-0 flex-1 overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-sm font-semibold text-neutral-400">Loading payroll data...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50/50 text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200/60">
                    <th className="px-4 py-3 font-bold">Staff Member</th>
                    <th className="px-4 py-3 font-bold text-center">Base Salary</th>
                    <th className="px-4 py-3 font-bold text-center">Logged Status</th>
                    <th className="px-4 py-3 font-bold text-center">Remaining Leaves</th>
                    <th className="px-4 py-3 font-bold text-right text-red-600">Deduction</th>
                    <th className="px-4 py-3 font-bold text-right text-emerald-600">Final Salary</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-neutral-100">
                  {payrollSummary.map((emp) => (
                    <tr key={emp.id} className="hover:bg-primary-50/20 transition group">
                      <td className="px-4 py-3">
                        <p className="font-bold text-neutral-800">{emp.name}</p>
                        <p className="text-[10px] font-semibold text-primary-600 uppercase tracking-wide">{emp.role}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-neutral-600">
                        ₹{emp.salary?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {emp.present > 0 && <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{emp.present} P</span>}
                          {emp.absent > 0 && <span className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold">{emp.absent} A</span>}
                          {emp.halfDay > 0 && <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">{emp.halfDay} HD</span>}
                          {emp.leave > 0 && <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">{emp.leave} L</span>}
                          {(emp.present === 0 && emp.absent === 0 && emp.halfDay === 0 && emp.leave === 0) && (
                            <span className="text-[9px] text-neutral-400 font-medium">No records</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center bg-neutral-100 text-neutral-600 font-bold px-2 py-1 rounded text-xs border border-neutral-200">
                          {emp.leaveBalance || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {emp.totalDeduction > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-red-600">-₹{Math.round(emp.totalDeduction).toLocaleString()}</span>
                            <span className="text-[9px] text-red-400 font-medium">{emp.deductionDays} days deducted</span>
                          </div>
                        ) : (
                          <span className="text-neutral-300 font-medium">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-emerald-600 text-base">
                        ₹{Math.round(emp.finalSalary).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {payrollSummary.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm font-medium text-neutral-400">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-100 flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-neutral-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
              Calculations assume full pay for standard weekends/holidays unless explicitly marked as Absent/Leave.
              Any working day (Mon-Fri) without a recorded login automatically counts as Absent up to today.
              Deductions are calculated proportionally as: <code className="bg-neutral-200/60 px-1 rounded mx-0.5">Base Salary / {daysInMonth} days</code> per missed day.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
