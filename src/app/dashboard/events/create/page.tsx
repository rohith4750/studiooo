'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Box, Grid, Card, CardContent, Button, TextField, Typography,
  MenuItem, Select, InputLabel, FormControl, FormControlLabel, Checkbox, Stack, Divider
} from '@mui/material';
import { Sparkles, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';

const CATEGORIES = ['TRADITIONAL', 'CANDID', 'CINEMATIC', 'DRONE', 'PRE_SHOOT', 'PORTRAIT', 'EVENT_OTHER'];

function EventCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const { events, fetchData, createRecord, updateRecord } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDuration, setFormDuration] = useState('Full Day');
  const [formCategory, setFormCategory] = useState('TRADITIONAL');
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchData('events').finally(() => setLoading(false));
  }, [fetchData]);

  const event = events.find((e) => e.id === eventId);

  useEffect(() => {
    if (event) {
      setFormName(event.name);
      setFormDescription(event.description || '');
      setFormDuration(event.duration || 'Full Day');
      setFormCategory(event.category || 'TRADITIONAL');
      setFormActive(event.active);
    }
  }, [event]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) { toast('Event name is required', 'error'); return; }
    setSaving(true);
    const payload = {
      name: formName, defaultPrice: 0,
      description: formDescription || null, duration: formDuration || null,
      category: formCategory, active: formActive,
    };
    try {
      if (event) {
        await updateRecord('events', { id: event.id, ...payload });
        toast('Event preset updated!', 'success');
      } else {
        await createRecord('events', payload);
        toast('Event preset created!', 'success');
      }
      router.push('/dashboard/events');
    } catch (err) {
      toast('Failed to save event: ' + err, 'error');
    } finally { setSaving(false); }
  };

  if (loading && eventId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
        <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading event preset...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>{eventId ? 'Modify Shoot Event Preset' : 'Create Shoot Event Preset'}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Define event templates with shoot categories and duration estimates.</Typography>
        </div>
        <Button 
          variant="outlined" 
          startIcon={<ArrowLeft className="h-4 w-4" />} 
          onClick={() => router.push('/dashboard/events')}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Event Template Configuration</Typography>
            </Stack>
            <Divider />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Event Name *" required fullWidth size="small" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Pre-Wedding Outdoor" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Functional Category</InputLabel>
                  <Select value={formCategory} label="Functional Category" onChange={(e) => setFormCategory(e.target.value)}>
                    {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Duration Estimate" fullWidth size="small" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} placeholder="e.g. Full Day, 6 Hours" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={<Checkbox checked={formActive} onChange={(e) => setFormActive(e.target.checked)} color="primary" />}
                  label="Set Event Preset as Active"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: 13, fontWeight: 'bold' } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Service Description" fullWidth multiline rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="e.g. Multicamera standard photography covers..." />
              </Grid>
            </Grid>
            <Divider />
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="secondary" onClick={() => router.push('/dashboard/events')}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={saving} startIcon={<CheckCircle2 className="h-4.5 w-4.5" />}>
                {saving ? 'Saving...' : eventId ? 'Save Changes' : 'Create Preset'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function EventCreatePage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><RefreshCw className="h-6 w-6 animate-spin text-neutral-400" /></Box>}>
      <EventCreateContent />
    </Suspense>
  );
}
