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

const CATEGORIES = ['CAMERA', 'LENS', 'DRONE', 'GIMBAL', 'LIGHT', 'BATTERY', 'MEMORY_CARD', 'TRIPOD'];
const STATUSES = ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'LOST'];

function InventoryCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get('itemId');
  const { inventory, fetchData, createRecord, updateRecord } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('CAMERA');
  const [formSerial, setFormSerial] = useState('');
  const [formStatus, setFormStatus] = useState('AVAILABLE');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchData('inventory').finally(() => setLoading(false));
  }, [fetchData]);

  const item = inventory.find((i) => i.id === itemId);

  useEffect(() => {
    if (item) {
      setFormName(item.name);
      setFormCategory(item.category);
      setFormSerial(item.serialNumber);
      setFormStatus(item.status);
      setFormNotes(item.notes || '');
    }
  }, [item]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSerial) { toast('Name and serial number are required', 'error'); return; }
    setSaving(true);
    const payload = {
      name: formName, category: formCategory, serialNumber: formSerial,
      status: formStatus, notes: formNotes || null,
    };
    try {
      if (item) {
        await updateRecord('inventory', { id: item.id, ...payload });
        toast('Equipment details updated!', 'success');
      } else {
        await createRecord('inventory', payload);
        toast('Equipment registered!', 'success');
      }
      router.push('/dashboard/inventory');
    } catch (err) {
      toast('Failed to save equipment: ' + err, 'error');
    } finally { setSaving(false); }
  };

  if (loading && itemId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
        <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading equipment profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>{itemId ? 'Edit Equipment Details' : 'Register Equipment Asset'}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Track cameras, lenses, drones, and equipment health statuses.</Typography>
        </div>
        <Button 
          variant="outlined" 
          startIcon={<ArrowLeft className="h-4 w-4" />} 
          onClick={() => router.push('/dashboard/inventory')}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Asset Registration</Typography>
            </Stack>
            <Divider />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Equipment Name *" required fullWidth size="small" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Sony A7 IV Camera Body" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Serial Number Code *" required fullWidth size="small" value={formSerial} onChange={(e) => setFormSerial(e.target.value)} placeholder="e.g. SN-SONY-7491A" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Equipment Category</InputLabel>
                  <Select value={formCategory} label="Equipment Category" onChange={(e) => setFormCategory(e.target.value)}>
                    {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Initial Status</InputLabel>
                  <Select value={formStatus} label="Initial Status" onChange={(e) => setFormStatus(e.target.value)}>
                    {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Asset Description / Condition Notes" fullWidth multiline rows={3} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Condition e.g. Minor scratches, filters, box included..." />
              </Grid>
            </Grid>
            <Divider />
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="secondary" onClick={() => router.push('/dashboard/inventory')}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={saving} startIcon={<CheckCircle2 className="h-4.5 w-4.5" />}>
                {saving ? 'Saving...' : itemId ? 'Save Changes' : 'Register Asset'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function InventoryCreatePage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><RefreshCw className="h-6 w-6 animate-spin text-neutral-400" /></Box>}>
      <InventoryCreateContent />
    </Suspense>
  );
}
