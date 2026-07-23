'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Box, Grid, Card, CardContent, Button, TextField, Typography,
  Stack, Divider, Paper
} from '@mui/material';
import {
  Sparkles, ArrowLeft, CheckCircle2, RefreshCw
} from 'lucide-react';

function ClientCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  const { clients, fetchData, createRecord, updateRecord } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAltPhone, setFormAltPhone] = useState('');

  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPincode, setFormPincode] = useState('');

  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchData('clients').finally(() => setLoading(false));
  }, [fetchData]);

  const client = clients.find((c) => c.id === clientId);

  useEffect(() => {
    if (client) {
      setFormName(client.name);
      setFormPhone(client.phone);
      setFormAltPhone(client.alternatePhone || '');

      setFormEmail(client.email || '');
      setFormAddress(client.address || '');
      setFormCity(client.city || '');
      setFormState(client.state || '');
      setFormPincode(client.pincode || '');

      setFormNotes(client.notes || '');
    }
  }, [client]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      toast('Name and phone number are required', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      name: formName,
      phone: formPhone,
      alternatePhone: formAltPhone || null,

      email: formEmail || null,
      address: formAddress || null,
      city: formCity || null,
      state: formState || null,
      pincode: formPincode || null,
      gstNumber: null,
      notes: formNotes || null,
    };

    try {
      if (clientId && client) {
        await updateRecord('clients', { id: client.id, ...payload });
        toast('Client details updated successfully!', 'success');
      } else {
        await createRecord('clients', payload);
        toast('New client registered successfully!', 'success');
      }
      router.push('/dashboard/clients');
    } catch (err) {
      toast('Failed to save client: ' + err, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading && clientId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
        <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
          Loading client profile...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Top Header Utilities */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {clientId ? 'Edit Client Profile' : 'Register New Client'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Create or modify client directories, billing details, and event milestones.
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.push('/dashboard/clients')}
          sx={{ py: 1, px: 2 }}
        >Back</Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Sparkles className="h-5 w-5 text-primary-500 animate-pulse" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Client Directory Profile Info
              </Typography>
            </Stack>

            <Divider />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Client Name *"
                  required
                  fullWidth
                  size="small"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Anand Sharma"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Mobile Phone *"
                  required
                  fullWidth
                  size="small"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 99008 87766"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Alternate Phone"
                  fullWidth
                  size="small"
                  value={formAltPhone}
                  onChange={(e) => setFormAltPhone(e.target.value)}
                  placeholder="Secondary contact"
                />
              </Grid>


              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Email Address"
                  fullWidth
                  size="small"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="customer@r2r.com"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Billing Address"
                  fullWidth
                  size="small"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Door no, Street, Layout..."
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="City"
                  fullWidth
                  size="small"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="Bengaluru"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="State"
                  fullWidth
                  size="small"
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  placeholder="Karnataka"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Pincode"
                  fullWidth
                  size="small"
                  value={formPincode}
                  onChange={(e) => setFormPincode(e.target.value)}
                  placeholder="560001"
                />
              </Grid>



              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Notes / Preferences"
                  fullWidth
                  multiline
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Custom preferences, lighting, framing, style requests..."
                />
              </Grid>
            </Grid>

            <Divider />

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => router.push('/dashboard/clients')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                startIcon={<CheckCircle2 className="h-4.5 w-4.5" />}
              >
                {saving ? 'Registering...' : clientId ? 'Save Profile Changes' : 'Register Client'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function ClientCreatePage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <RefreshCw className="h-6 w-6 animate-spin text-neutral-400" />
      </Box>
    }>
      <ClientCreateContent />
    </Suspense>
  );
}
