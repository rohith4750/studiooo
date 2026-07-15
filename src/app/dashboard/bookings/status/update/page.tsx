'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import { 
  Box, Grid, Card, CardContent, Button, TextField, Typography, 
  Chip, Stack, Paper, Divider
} from '@mui/material';
import { 
  CheckCircle2, ArrowLeft, MapPin, CalendarDays, Kanban, ArrowRight, RefreshCw
} from 'lucide-react';

const STATUS_FLOW = [
  { key: 'QUOTATION', label: 'Quotation', desc: 'Draft proposal sent to client', color: 'info' },
  { key: 'PENDING', label: 'Pending', desc: 'Awaiting client approval / advance payment', color: 'warning' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Booking locked and deposit cleared', color: 'primary' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Event shoot actively underway', color: 'secondary' },
  { key: 'EDITING', label: 'Editing', desc: 'Raw media in post-production queue', color: 'warning' },
  { key: 'ALBUM_DESIGNING', label: 'Designing', desc: 'Album mockup drafting and review', color: 'secondary' },
  { key: 'PRINTING', label: 'Printing', desc: 'Approved album sent to print press', color: 'info' },
  { key: 'READY_FOR_DELIVERY', label: 'Ready', desc: 'Deliverables ready for packaging', color: 'info' },
  { key: 'COMPLETED', label: 'Completed', desc: 'All deliverables sent and balance paid', color: 'success' },
  { key: 'CANCELLED', label: 'Cancelled', desc: 'Contract voided or cancelled', color: 'error' }
];

function UpdateStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { bookings, invoices, quotations, fetchData, updateRecord, createRecord } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('bookings', '?include={"client":true,"package":true}'),
      fetchData('invoices'),
      fetchData('quotations')
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  const booking = bookings.find((b) => b.id === bookingId);

  useEffect(() => {
    if (booking) {
      setTargetStatus(booking.status);
    }
  }, [booking]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    if (targetStatus === booking.status) {
      toast('Selected status is already active', 'info');
      return;
    }

    setSaving(true);
    const combinedNotes = statusComment.trim() 
      ? `${new Date().toLocaleDateString()}: [Status changed to ${targetStatus}] ${statusComment}. ${booking.notes || ''}`
      : booking.notes;

    try {
      await updateRecord('bookings', {
        id: booking.id,
        status: targetStatus,
        notes: combinedNotes
      });

      if (targetStatus === 'CONFIRMED') {
        const existingInvoice = invoices.find(i => i.bookingId === booking.id);
        if (!existingInvoice) {
          const invNum = `INV-${booking.bookingNumber}-${Math.floor(100 + Math.random() * 900)}`;
          await createRecord('invoices', {
            bookingId: booking.id,
            invoiceNumber: invNum,
            gstRate: 0,
            gstAmount: 0,
            totalAmount: booking.grandTotal,
            grandTotal: booking.grandTotal,
            paidAmount: booking.paidAmount || 0,
            balance: booking.balance ?? booking.grandTotal,
            status: (booking.balance === 0 && booking.grandTotal > 0) ? 'PAID' : ((booking.paidAmount || 0) > 0 ? 'PARTIALLY_PAID' : 'UNPAID'),
          });
          toast(`Booking updated to ${targetStatus} and Invoice ${invNum} auto-generated!`, 'success');
        } else {
          toast(`Booking ${booking.bookingNumber} updated to ${targetStatus}!`, 'success');
        }
      } else if (targetStatus === 'QUOTATION') {
        const existingQuote = quotations?.find(q => q.bookingId === booking.id);
        if (!existingQuote) {
          await createRecord('quotations', {
            bookingId: booking.id,
            version: 1,
            terms: 'Payment schedule: 50% advance, 40% on shoot completion, 10% on album delivery.',
            status: 'SENT',
          });
          toast(`Booking updated to ${targetStatus} and Quotation auto-generated!`, 'success');
        } else {
          toast(`Booking ${booking.bookingNumber} updated to ${targetStatus}!`, 'success');
        }
      } else {
        toast(`Booking ${booking.bookingNumber} updated to ${targetStatus}!`, 'success');
      }

      setStatusComment('');
      router.push('/dashboard/bookings/status');
    } catch (err) {
      toast('Failed to update booking status: ' + err, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
        <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
          Loading booking profile...
        </Typography>
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="error" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Booking record not found
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowLeft className="h-4 w-4" />} 
          onClick={() => router.push('/dashboard/bookings/status')}
          sx={{ mt: 2 }}
        >
          Back to Status Roster
        </Button>
      </Box>
    );
  }

  const currentFlowIndex = STATUS_FLOW.findIndex(s => s.key === booking.status);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Header Utilities */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Update Booking Status
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Update operational statuses and view project milestone progressions.
          </Typography>
        </div>
        <Button 
          variant="outlined" 
          startIcon={<ArrowLeft className="h-4 w-4" />} 
          onClick={() => router.push('/dashboard/bookings/status')}
          sx={{ py: 1, px: 2 }}
        >
          Back
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Booking Profile Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <div>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main', textTransform: 'uppercase', fontSize: 9 }}>
                  Booking Details
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                  {booking.bookingNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'semibold', mt: 0.5 }}>
                  Client: {booking.client?.name}
                </Typography>
              </div>

              <Divider />

              <Stack spacing={1.5}>
                {booking.package && (
                  <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 0.5 }}>
                    <CalendarDays className="h-4.5 w-4.5 text-primary-500" />
                    <div>
                      <Typography sx={{ fontWeight: 'bold', fontSize: 11 }}>Service Preset Package</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{booking.package.name} (₹{booking.package.price.toLocaleString()})</Typography>
                    </div>
                  </Paper>
                )}
                {booking.venue && (
                  <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 0.5 }}>
                    <MapPin className="h-4.5 w-4.5 text-secondary-500" />
                    <div>
                      <Typography sx={{ fontWeight: 'bold', fontSize: 11 }}>Default Shoot Venue</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{booking.venue}</Typography>
                    </div>
                  </Paper>
                )}
              </Stack>

              {booking.notes && (
                <>
                  <Divider />
                  <div>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: 9, display: 'block', mb: 1 }}>
                      Past Ledger Notes
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'background.default', border: '1px solid rgba(227, 236, 231, 0.6)', borderRadius: 0.5, maxHeight: 200, overflowY: 'auto', fontSize: 11, fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.5 }}>
                      {booking.notes}
                    </Box>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Stepper and Status Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Stepper Timeline */}
              <div>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>
                  Progression Tracker
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, alignItems: 'center' }}>
                  {STATUS_FLOW.filter(s => s.key !== 'CANCELLED').map((flow, idx) => {
                    const isActive = flow.key === booking.status;
                    const isPassed = idx < currentFlowIndex;
                    
                    let chipColor = 'default';
                    let variant: 'filled' | 'outlined' = 'outlined';
                    
                    if (isActive) {
                      chipColor = flow.color;
                      variant = 'filled';
                    } else if (isPassed) {
                      chipColor = 'primary';
                    }

                    return (
                      <React.Fragment key={flow.key}>
                        <Chip
                          label={flow.label}
                          color={chipColor as any}
                          variant={variant}
                          size="small"
                          sx={{ 
                            fontWeight: isActive || isPassed ? 'bold' : 'medium',
                            fontSize: 9, 
                            height: 22,
                            transition: 'all 0.2s',
                            transform: isActive ? 'scale(1.08)' : 'none',
                            boxShadow: isActive ? 1 : 0
                          }}
                        />
                        {idx < STATUS_FLOW.filter(s => s.key !== 'CANCELLED').length - 1 && (
                          <ArrowRight className="h-3 w-3 text-neutral-300" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </Box>
              </div>

              <Divider />

              {/* Status Update Form */}
              <Box component="form" onSubmit={handleUpdateStatus} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Stack spacing={1.5}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>
                    Update State Option
                  </Typography>

                  <Grid container spacing={1.5}>
                    {STATUS_FLOW.map((flow) => {
                      const isCurrent = flow.key === booking.status;
                      const isSelected = flow.key === targetStatus;

                      return (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={flow.key}>
                          <Card 
                            variant="outlined"
                            onClick={() => setTargetStatus(flow.key)}
                            sx={{
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: isSelected ? 'primary.main' : isCurrent ? 'success.light' : 'divider',
                              bgcolor: isSelected ? 'primary.light' : isCurrent ? 'success.light' : 'background.paper',
                              transition: 'all 0.15s ease',
                              transform: isSelected ? 'translateY(-2px)' : 'none',
                              boxShadow: isSelected ? 1 : 0,
                              '&:hover': {
                                borderColor: isSelected ? 'primary.main' : 'primary.light',
                                boxShadow: 1
                              }
                            }}
                          >
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 'bold', fontSize: 10.5, color: isSelected ? 'primary.dark' : 'text.primary' }}>
                                  {flow.label}
                                </Typography>
                                {isCurrent && (
                                  <Chip label="Current" color="success" size="small" sx={{ height: 14, fontSize: 7, fontWeight: 'bold' }} />
                                )}
                              </Stack>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 8, mt: 0.5, display: 'block', leading: '1.2' }}>
                                {flow.desc}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Stack>

                {/* Remarks comment box */}
                <Stack spacing={1}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>
                    Status Change Remarks / Audit Note
                  </Typography>
                  <TextField
                    placeholder="Enter audit reasons or updates (e.g. photoshoot finished, album approved, client invoice balance clear)..."
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                  />
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={() => router.push('/dashboard/bookings/status')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={saving || targetStatus === booking.status}
                    startIcon={<CheckCircle2 className="h-4.5 w-4.5" />}
                  >
                    {saving ? 'Updating...' : 'Save Status Update'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function UpdateStatusPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <RefreshCw className="h-6 w-6 animate-spin text-neutral-400" />
      </Box>
    }>
      <UpdateStatusContent />
    </Suspense>
  );
}
