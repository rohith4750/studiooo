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

const SOURCES = ['INSTAGRAM', 'FACEBOOK', 'WHATSAPP', 'WEBSITE', 'WALK_IN', 'REFERRAL', 'GOOGLE_ADS'];
const STATUSES = ['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'CONVERTED', 'LOST'];

function LeadCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  const { leads, fetchData, createRecord, updateRecord } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formEvent, setFormEvent] = useState('Wedding');
  const [formEventDate, setFormEventDate] = useState('');
  const [formBudget, setFormBudget] = useState('');
  const [formSource, setFormSource] = useState('INSTAGRAM');
  const [formStatus, setFormStatus] = useState('NEW');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchData('leads').finally(() => setLoading(false));
  }, [fetchData]);

  const lead = leads.find((l) => l.id === leadId);

  useEffect(() => {
    if (lead) {
      setFormName(lead.name);
      setFormPhone(lead.phone);
      setFormEmail(lead.email || '');
      setFormEvent(lead.event);
      setFormEventDate(lead.eventDate);
      setFormBudget(lead.budget ? lead.budget.toString() : '');
      setFormSource(lead.source);
      setFormStatus(lead.status);
      setFormNotes(lead.notes || '');
    }
  }, [lead]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      toast('Name and phone are required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      name: formName, phone: formPhone, email: formEmail || null,
      event: formEvent, eventDate: formEventDate,
      budget: formBudget ? parseFloat(formBudget) : null,
      source: formSource, status: formStatus, notes: formNotes || null,
    };
    try {
      if (lead) {
        await updateRecord('leads', { id: lead.id, ...payload });
        toast('Lead inquiry updated!', 'success');
      } else {
        await createRecord('leads', payload);
        toast('New lead registered!', 'success');
      }
      router.push('/dashboard/leads');
    } catch (err) {
      toast('Failed to save lead: ' + err, 'error');
    } finally { setSaving(false); }
  };

  if (loading && leadId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
        <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading lead profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>{leadId ? 'Edit Lead Inquiry' : 'Register New Lead'}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Capture studio inquiries, preferred events, and estimated budgets.</Typography>
        </div>
        <Button 
          variant="outlined" 
          startIcon={<ArrowLeft className="h-4 w-4" />} 
          onClick={() => router.push('/dashboard/leads')}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Lead Inquiry Details</Typography>
            </Stack>
            <Divider />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Contact Name *" required fullWidth size="small" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Ramesh Reddy" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Phone Number *" required fullWidth size="small" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+91 99112 23344" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Email Address" fullWidth size="small" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="name@email.com" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Target Event" required fullWidth size="small" value={formEvent} onChange={(e) => setFormEvent(e.target.value)} placeholder="e.g. Wedding" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Event Date *" type="date" required fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} value={formEventDate} onChange={(e) => setFormEventDate(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Estimated Budget (₹)" type="number" fullWidth size="small" value={formBudget} onChange={(e) => setFormBudget(e.target.value)} placeholder="e.g. 150000" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Inquiry Source</InputLabel>
                  <Select value={formSource} label="Inquiry Source" onChange={(e) => setFormSource(e.target.value)}>
                    {SOURCES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={formStatus} label="Status" onChange={(e) => setFormStatus(e.target.value)}>
                    {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Inquiry Notes" fullWidth multiline rows={3} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Details about client requirements..." />
              </Grid>
            </Grid>
            <Divider />
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="secondary" onClick={() => router.push('/dashboard/leads')}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={saving} startIcon={<CheckCircle2 className="h-4.5 w-4.5" />}>
                {saving ? 'Saving...' : leadId ? 'Save Changes' : 'Create Lead'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function LeadCreatePage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><RefreshCw className="h-6 w-6 animate-spin text-neutral-400" /></Box>}>
      <LeadCreateContent />
    </Suspense>
  );
}
