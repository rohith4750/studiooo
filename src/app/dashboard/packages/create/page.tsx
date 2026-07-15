'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Box, Grid, Card, CardContent, Button, TextField, Typography,
  MenuItem, Select, InputLabel, FormControl, FormControlLabel, Checkbox,
  Stack, Divider, Chip
} from '@mui/material';
import { Sparkles, ArrowLeft, CheckCircle2, RefreshCw, X } from 'lucide-react';

function PackageCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');
  const { packages, events, fetchData, createRecord, updateRecord } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [selectedEventNames, setSelectedEventNames] = useState<string[]>([]);
  const [formPhotographers, setFormPhotographers] = useState('1');
  const [formCinematographers, setFormCinematographers] = useState('0');
  const [formDrone, setFormDrone] = useState(false);
  const [formAlbum, setFormAlbum] = useState(false);
  const [formLed, setFormLed] = useState(false);
  const [formLiveStreaming, setFormLiveStreaming] = useState(false);
  const [formComplimentaryShoot, setFormComplimentaryShoot] = useState('');
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchData('packages'), fetchData('events')]).finally(() => setLoading(false));
  }, [fetchData]);

  const pkg = packages.find((p) => p.id === packageId);

  useEffect(() => {
    if (pkg) {
      setFormName(pkg.name);
      setFormDescription(pkg.description || '');
      setFormPrice(pkg.price.toString());
      setFormPhotographers(pkg.photographers.toString());
      setFormCinematographers(pkg.cinematographers.toString());
      setFormDrone(pkg.drone);
      setFormAlbum(pkg.album);
      setFormLed(pkg.led);
      setFormLiveStreaming(pkg.liveStreaming);
      setFormComplimentaryShoot(pkg.complimentaryShoot || '');
      setFormActive(pkg.active);
      try {
        const parsed = JSON.parse(pkg.includedEvents);
        setSelectedEventNames(Array.isArray(parsed) ? parsed : []);
      } catch { setSelectedEventNames([]); }
    }
  }, [pkg]);

  const toggleEventSelection = (name: string) => {
    setSelectedEventNames(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) { toast('Name and price are required', 'error'); return; }
    setSaving(true);
    const payload = {
      name: formName, description: formDescription || null,
      price: parseFloat(formPrice), includedEvents: JSON.stringify(selectedEventNames),
      photographers: parseInt(formPhotographers) || 1,
      cinematographers: parseInt(formCinematographers) || 0,
      drone: formDrone, album: formAlbum, led: formLed,
      liveStreaming: formLiveStreaming, complimentaryShoot: formComplimentaryShoot || null,
      active: formActive,
    };
    try {
      if (pkg) {
        await updateRecord('packages', { id: pkg.id, ...payload });
        toast('Package updated!', 'success');
      } else {
        await createRecord('packages', payload);
        toast('Package created!', 'success');
      }
      router.push('/dashboard/packages');
    } catch (err) {
      toast('Failed to save package: ' + err, 'error');
    } finally { setSaving(false); }
  };

  if (loading && packageId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
        <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading package details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>{packageId ? 'Modify Studio Package' : 'Create Studio Package'}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Configure package tiers with events, crew counts, and add-ons.</Typography>
        </div>
        <Button 
          variant="outlined" 
          startIcon={<ArrowLeft className="h-4 w-4" />} 
          onClick={() => router.push('/dashboard/packages')}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Package Configuration</Typography>
            </Stack>
            <Divider />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Package Name *" required fullWidth size="small" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Premium Gold" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Package Price (₹) *" required type="number" fullWidth size="small" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="e.g. 150000" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Package Description" fullWidth multiline rows={2} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Describe what this package includes..." />
              </Grid>

              {/* Events selector */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: 9, display: 'block', mb: 1 }}>
                  Included Event Presets ({selectedEventNames.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {events.map(ev => {
                    const isSelected = selectedEventNames.includes(ev.name);
                    return (
                      <Chip
                        key={ev.id}
                        label={ev.name}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        onClick={() => toggleEventSelection(ev.name)}
                        onDelete={isSelected ? () => toggleEventSelection(ev.name) : undefined}
                        size="small"
                        sx={{ fontWeight: 'bold', fontSize: 10 }}
                      />
                    );
                  })}
                </Box>
              </Grid>

              {/* Crew counts */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Photographers" type="number" fullWidth size="small" value={formPhotographers} onChange={(e) => setFormPhotographers(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Cinematographers" type="number" fullWidth size="small" value={formCinematographers} onChange={(e) => setFormCinematographers(e.target.value)} />
              </Grid>

              {/* Add-ons */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: 9, display: 'block', mb: 1 }}>
                  Package Add-Ons
                </Typography>
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                  <FormControlLabel control={<Checkbox checked={formDrone} onChange={(e) => setFormDrone(e.target.checked)} color="primary" />} label="Drone Coverage" sx={{ '& .MuiFormControlLabel-label': { fontSize: 12, fontWeight: 'bold' } }} />
                  <FormControlLabel control={<Checkbox checked={formAlbum} onChange={(e) => setFormAlbum(e.target.checked)} color="primary" />} label="Premium Album" sx={{ '& .MuiFormControlLabel-label': { fontSize: 12, fontWeight: 'bold' } }} />
                  <FormControlLabel control={<Checkbox checked={formLed} onChange={(e) => setFormLed(e.target.checked)} color="primary" />} label="LED Wall" sx={{ '& .MuiFormControlLabel-label': { fontSize: 12, fontWeight: 'bold' } }} />
                  <FormControlLabel control={<Checkbox checked={formLiveStreaming} onChange={(e) => setFormLiveStreaming(e.target.checked)} color="primary" />} label="Live Streaming" sx={{ '& .MuiFormControlLabel-label': { fontSize: 12, fontWeight: 'bold' } }} />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Complimentary Shoot" fullWidth size="small" value={formComplimentaryShoot} onChange={(e) => setFormComplimentaryShoot(e.target.value)} placeholder="e.g. Baby Shoot, Maternity Shoot" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={<Checkbox checked={formActive} onChange={(e) => setFormActive(e.target.checked)} color="primary" />}
                  label="Package is Active"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: 13, fontWeight: 'bold' } }}
                />
              </Grid>
            </Grid>
            <Divider />
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="secondary" onClick={() => router.push('/dashboard/packages')}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={saving} startIcon={<CheckCircle2 className="h-4.5 w-4.5" />}>
                {saving ? 'Saving...' : packageId ? 'Save Changes' : 'Create Package'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function PackageCreatePage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><RefreshCw className="h-6 w-6 animate-spin text-neutral-400" /></Box>}>
      <PackageCreateContent />
    </Suspense>
  );
}
