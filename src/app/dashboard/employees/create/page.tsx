'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Box, Grid, Card, CardContent, Button, TextField, Typography,
  MenuItem, Select, InputLabel, FormControl, Stack, Divider
} from '@mui/material';
import { Sparkles, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';

const ROLES = ['PHOTOGRAPHER', 'EDITOR', 'MANAGER', 'ACCOUNTANT', 'RECEPTIONIST', 'HR'];
const STATUSES = ['ACTIVE', 'INACTIVE'];

function EmployeeCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const { employees, users, fetchData, createRecord, updateRecord } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('PHOTOGRAPHER');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [formPassword, setFormPassword] = useState('');
  const [formSalary, setFormSalary] = useState('');
  const [formManagerId, setFormManagerId] = useState('');
  const [formLeaveBalance, setFormLeaveBalance] = useState('0');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('employees'),
      fetchData('users')
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  const employee = employees.find((e) => e.id === employeeId);

  useEffect(() => {
    if (employee) {
      setFormName(employee.name);
      setFormEmail(employee.email);
      setFormPhone(employee.phone);
      setFormRole(employee.role);
      setFormStatus(employee.status);
      setFormSalary(employee.salary.toString());
      setFormManagerId(employee.managerId || '');
      setFormLeaveBalance((employee.leaveBalance || 0).toString());
    }
  }, [employee]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (!employee && formPassword) {
        // Create User account first for portal login
        await createRecord('users', {
          name: formName,
          email: formEmail.toLowerCase(),
          password: formPassword,
          role: formRole
        });
      }

      const payload = {
        name: formName, email: formEmail.toLowerCase(), phone: formPhone,
        role: formRole, status: formStatus, salary: parseFloat(formSalary) || 0,
        managerId: formManagerId || null,
        leaveBalance: parseFloat(formLeaveBalance) || 0,
      };

      if (employee) {
        await updateRecord('employees', { id: employee.id, ...payload });
        toast('Staff profile updated!', 'success');
      } else {
        await createRecord('employees', payload);
        toast('Staff member & User account registered!', 'success');
      }
      router.push('/dashboard/employees');
    } catch (err) {
      toast('Failed to save staff member: ' + err, 'error');
    } finally { setSaving(false); }
  };

  if (loading && employeeId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
        <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading staff profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>{employeeId ? 'Edit Staff Profile' : 'Register Staff Profile'}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Manage employee profiles, functional roles, and salary configurations.</Typography>
        </div>
        <Button 
          variant="outlined" 
          startIcon={<ArrowLeft className="h-4 w-4" />} 
          onClick={() => router.push('/dashboard/employees')}
          sx={{ py: 1, px: 2 }}
        >
          Back
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Sparkles className="h-5 w-5 text-primary-500 animate-pulse" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Employee Information</Typography>
            </Stack>
            <Divider />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Employee Full Name *" required fullWidth size="small" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Ramesh Kumar" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Corporate Email *" required fullWidth size="small" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="ramesh@r2r.com" />
              </Grid>
              {!employeeId && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Portal Login Password *" required fullWidth size="small" type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="••••••••" />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Phone Number *" required fullWidth size="small" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+91 99008 87766" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Monthly Basic Salary (₹) *" required type="number" fullWidth size="small" value={formSalary} onChange={(e) => setFormSalary(e.target.value)} placeholder="e.g. 35000" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Corporate Role</InputLabel>
                  <Select value={formRole} label="Corporate Role" onChange={(e) => setFormRole(e.target.value)}>
                    {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Roster Status</InputLabel>
                  <Select value={formStatus} label="Roster Status" onChange={(e) => setFormStatus(e.target.value)}>
                    {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Assign Manager</InputLabel>
                  <Select value={formManagerId} label="Assign Manager" onChange={(e) => setFormManagerId(e.target.value)}>
                    <MenuItem value=""><em>-- None --</em></MenuItem>
                    {users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN').map(u => <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Available Leave Balance" type="number" fullWidth size="small" value={formLeaveBalance} onChange={(e) => setFormLeaveBalance(e.target.value)} placeholder="e.g. 5" />
              </Grid>
            </Grid>
            <Divider />
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="secondary" onClick={() => router.push('/dashboard/employees')}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={saving} startIcon={<CheckCircle2 className="h-4.5 w-4.5" />}>
                {saving ? 'Saving...' : employeeId ? 'Save Changes' : 'Register Staff'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function EmployeeCreatePage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><RefreshCw className="h-6 w-6 animate-spin text-neutral-400" /></Box>}>
      <EmployeeCreateContent />
    </Suspense>
  );
}
