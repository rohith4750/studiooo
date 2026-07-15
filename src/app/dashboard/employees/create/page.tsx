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

const ROLES = ['PHOTOGRAPHER', 'EDITOR', 'MANAGER', 'ACCOUNTANT', 'RECEPTIONIST'];
const STATUSES = ['ACTIVE', 'INACTIVE'];

function EmployeeCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const { employees, fetchData, createRecord, updateRecord } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('PHOTOGRAPHER');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [formSalary, setFormSalary] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchData('employees').finally(() => setLoading(false));
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
    }
  }, [employee]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: formName, email: formEmail.toLowerCase(), phone: formPhone,
      role: formRole, status: formStatus, salary: parseFloat(formSalary) || 0,
    };
    try {
      if (employee) {
        await updateRecord('employees', { id: employee.id, ...payload });
        toast('Staff profile updated!', 'success');
      } else {
        await createRecord('employees', payload);
        toast('Staff member registered!', 'success');
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
