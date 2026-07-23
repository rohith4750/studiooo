'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Box, Grid, Card, CardContent, Button, TextField, Typography,
  MenuItem, Select, InputLabel, FormControl, Stack, IconButton, Divider, Paper
} from '@mui/material';
import {
  Plus, Trash2, X, Sparkles, ArrowLeft, CheckCircle2, RefreshCw
} from 'lucide-react';

const STATUSES = [
  'QUOTATION', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'EDITING',
  'ALBUM_DESIGNING', 'PRINTING', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'
];

function BookingCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const {
    bookings, clients, packages, events, fetchData,
    createRecord, updateRecord
  } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formClientId, setFormClientId] = useState('');
  const [formPackageId, setFormPackageId] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState('PENDING');
  const [formGrandTotal, setFormGrandTotal] = useState('0');

  const [selectedEvents, setSelectedEvents] = useState<Array<{
    eventId: string;
    eventDate: string;
    eventTime: string;
    venue: string;
  }>>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('bookings', '?include={"client":true,"package":true,"bookingEvents":{"include":{"event":true}}}'),
      fetchData('clients'),
      fetchData('packages'),
      fetchData('events'),
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  const booking = bookings.find((b) => b.id === bookingId);

  useEffect(() => {
    if (booking) {
      setFormClientId(booking.clientId);
      setFormPackageId(booking.packageId || '');
      setFormVenue(booking.venue || '');
      setFormNotes(booking.notes || '');
      setFormStatus(booking.status);
      setFormGrandTotal(booking.grandTotal.toString());

      if (booking.bookingEvents && Array.isArray(booking.bookingEvents)) {
        const rows = booking.bookingEvents.map((be: any) => ({
          eventId: be.eventId,
          eventDate: be.eventDate,
          eventTime: be.eventTime || '',
          venue: be.venue || '',
        }));
        setSelectedEvents(rows);
      } else {
        setSelectedEvents([]);
      }
    }
  }, [booking]);

  const handlePackageChange = (pkgId: string) => {
    setFormPackageId(pkgId);
    if (!pkgId) return;

    const selectedPkg = packages.find(p => p.id === pkgId);
    if (!selectedPkg) return;

    setFormGrandTotal(selectedPkg.price.toString());

    try {
      const pkgEventNames = JSON.parse(selectedPkg.includedEvents);
      if (Array.isArray(pkgEventNames)) {
        const rows = pkgEventNames.map(name => {
          const master = events.find(e => e.name.toLowerCase() === name.toLowerCase());
          return {
            eventId: master ? master.id : '',
            eventDate: new Date().toISOString().slice(0, 10),
            eventTime: '09:00 AM',
            venue: '',
          };
        }).filter(r => r.eventId !== '');
        setSelectedEvents(rows);
      }
    } catch (e) {
      setSelectedEvents([]);
    }
  };

  const addEventRow = () => {
    setSelectedEvents([
      ...selectedEvents,
      {
        eventId: events[0]?.id || '',
        eventDate: new Date().toISOString().slice(0, 10),
        eventTime: '09:00 AM',
        venue: '',
      }
    ]);
  };

  const removeEventRow = (idx: number) => {
    setSelectedEvents(selectedEvents.filter((_, i) => i !== idx));
  };

  const updateEventRow = (idx: number, field: string, value: any) => {
    const updated = [...selectedEvents];
    if (field === 'eventId') {
      updated[idx].eventId = value;
    } else if (field === 'eventDate') {
      updated[idx].eventDate = value;
    } else if (field === 'eventTime') {
      updated[idx].eventTime = value;
    } else if (field === 'venue') {
      updated[idx].venue = value;
    }
    setSelectedEvents(updated);
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId) {
      toast('Please select a registered client', 'error');
      return;
    }
    if (selectedEvents.length === 0) {
      toast('Please add at least one shoot event', 'error');
      return;
    }

    setSaving(true);
    const bookingNum = booking?.bookingNumber || `R2R-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalPrice = parseFloat(formGrandTotal) || 0;

    const payload = {
      bookingNumber: bookingNum,
      clientId: formClientId,
      packageId: formPackageId || null,
      venue: formVenue || null,
      notes: formNotes || null,
      status: formStatus,
      subtotal: finalPrice,
      discount: 0,
      gstAmount: 0,
      grandTotal: finalPrice,
      balance: finalPrice - (booking?.paidAmount || 0),
    };

    try {
      if (booking) {
        // Update booking base
        await updateRecord('bookings', { id: booking.id, ...payload });

        // Remove old events and save new ones
        await fetch(`/api/data/bookingEvents?bookingId=${booking.id}`, { method: 'DELETE' });
        for (const row of selectedEvents) {
          await createRecord('bookingEvents', {
            bookingId: booking.id,
            eventId: row.eventId,
            eventDate: row.eventDate,
            eventTime: row.eventTime || null,
            venue: row.venue || null,
            price: 0,
            status: 'ASSIGNED',
          });
        }
        toast('Booking contract updated successfully!', 'success');
      } else {
        // Create booking base
        const savedBooking = await createRecord('bookings', {
          ...payload,
          paidAmount: 0,
        });

        // Save events checklist
        for (const row of selectedEvents) {
          await createRecord('bookingEvents', {
            bookingId: savedBooking.id,
            eventId: row.eventId,
            eventDate: row.eventDate,
            eventTime: row.eventTime || null,
            venue: row.venue || null,
            price: 0,
            status: 'ASSIGNED',
          });
        }
        toast('New booking registered successfully!', 'success');
      }
      router.push('/dashboard/bookings');
    } catch (err) {
      toast('Failed to save booking details: ' + err, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading && bookingId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
        <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
          Loading booking contract...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {bookingId ? 'Modify Booking Contract' : 'Create Booking Contract'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Configure studio packages, multi-shoot dates, and client invoicing details.
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.push('/dashboard/bookings')}
          sx={{ py: 1, px: 2 }}
        >
          Back
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSaveBooking} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Sparkles className="h-5 w-5 text-primary-500 animate-pulse" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Contract Structure
              </Typography>
            </Stack>

            <Divider />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required size="small">
                  <InputLabel>Choose Client</InputLabel>
                  <Select
                    value={formClientId}
                    label="Choose Client"
                    onChange={(e) => setFormClientId(e.target.value)}
                  >
                    <MenuItem value="">-- Choose Profile --</MenuItem>
                    {clients.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name} ({c.phone})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Package Preset</InputLabel>
                  <Select
                    value={formPackageId}
                    label="Package Preset"
                    onChange={(e) => handlePackageChange(e.target.value)}
                  >
                    <MenuItem value="">-- Custom Preset --</MenuItem>
                    {packages.map(p => (
                      <MenuItem key={p.id} value={p.id}>{p.name} (₹{p.price.toLocaleString()})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Booking Status</InputLabel>
                  <Select
                    value={formStatus}
                    label="Booking Status"
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    {STATUSES.map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Default Venue"
                  fullWidth
                  size="small"
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  placeholder="Petals Palace, Bengaluru"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Contract Notes"
                  fullWidth
                  size="small"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Crew size restrictions, travel specifications, or styling rules..."
                />
              </Grid>
            </Grid>

            {/* Dynamic Event Builder */}
            <Stack spacing={2} sx={{ pt: 2, borderTop: '1px solid rgba(227, 236, 231, 0.6)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>
                  Events Scheduled Checklist ({selectedEvents.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Plus className="h-3.5 w-3.5" />}
                  onClick={addEventRow}
                >
                  Add Custom Event
                </Button>
              </Box>

              <Stack spacing={2}>
                {selectedEvents.map((row, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2.5, bgcolor: 'background.default', border: '1px solid rgba(227, 236, 231, 0.6)', borderRadius: 0.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth required size="small">
                          <InputLabel>Event Master</InputLabel>
                          <Select
                            value={row.eventId}
                            label="Event Master"
                            onChange={(e) => updateEventRow(index, 'eventId', e.target.value)}
                          >
                            {events.map(e => (
                              <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                          label="Date"
                          type="date"
                          required
                          size="small"
                          fullWidth
                          slotProps={{ inputLabel: { shrink: true }, htmlInput: { style: { padding: '8.5px 14px' } } }}
                          value={row.eventDate}
                          onChange={(e) => updateEventRow(index, 'eventDate', e.target.value)}
                        />
                      </Grid>

                      <Grid size={{ xs: 4, sm: 2 }}>
                        <TextField
                          label="Time"
                          size="small"
                          fullWidth
                          value={row.eventTime}
                          onChange={(e) => updateEventRow(index, 'eventTime', e.target.value)}
                          placeholder="09:00 AM"
                        />
                      </Grid>

                      <Grid size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton color="error" size="small" onClick={() => removeEventRow(index)}>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </Grid>
                    </Grid>

                    <TextField
                      label="Venue Override"
                      size="small"
                      fullWidth
                      value={row.venue}
                      onChange={(e) => updateEventRow(index, 'venue', e.target.value)}
                      placeholder="Leave blank to inherit default venue"
                    />
                  </Paper>
                ))}
              </Stack>
            </Stack>

            {/* Pricing Input Box */}
            <Box sx={{ p: 2.5, bgcolor: 'primary.light', borderRadius: 0.5, display: 'flex', flexDirection: 'column', gap: 2, border: '1px solid', borderColor: 'primary.main' }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Typography sx={{ fontWeight: 'bold', color: 'primary.dark', fontSize: 13 }}>Final Invoiced Total</Typography>
                <TextField
                  label="Grand Total (₹)"
                  type="number"
                  size="small"
                  required
                  value={formGrandTotal}
                  onChange={(e) => setFormGrandTotal(e.target.value)}
                  sx={{ width: 180, bgcolor: 'background.paper', borderRadius: 1.5 }}
                  slotProps={{ htmlInput: { style: { fontWeight: 'bold', textAlign: 'right' } } }}
                />
              </Stack>
            </Box>

            <Divider />

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => router.push('/dashboard/bookings')}
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
                {saving ? 'Registering...' : bookingId ? 'Save Contract Changes' : 'Register Booking'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function BookingCreatePage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <RefreshCw className="h-6 w-6 animate-spin text-neutral-400" />
      </Box>
    }>
      <BookingCreateContent />
    </Suspense>
  );
}
