'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Box, Grid, Card, CardContent, Button, TextField, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
  InputLabel, FormControl, Chip, Stack, IconButton, Paper, Divider, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip
} from '@mui/material';
import {
  Plus, Search, FileText, ClipboardPlus, CreditCard, Trash2, Edit3, X,
  MapPin, Calendar, Clock, Sparkles, Calculator, Eye
} from 'lucide-react';

import DateYearFilter, { initialDateYearFilterState, DateYearFilterState, matchesDateFilter } from '@/components/DateYearFilter';

const numberToWordsIndian = (num: number): string => {
  if (num === 0) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num < 0) return 'Negative ' + numberToWordsIndian(Math.abs(num));
  if (num > 999999999) return 'Too large';

  let words = '';
  if (Math.floor(num / 10000000) > 0) { words += numberToWordsIndian(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
  if (Math.floor(num / 100000) > 0) { words += numberToWordsIndian(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
  if (Math.floor(num / 1000) > 0) { words += numberToWordsIndian(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
  if (Math.floor(num / 100) > 0) { words += numberToWordsIndian(Math.floor(num / 100)) + ' Hundred '; num %= 100; }
  if (num > 0) {
    if (words !== '') words += 'and ';
    if (num < 20) { words += a[num]; }
    else {
      words += b[Math.floor(num / 10)];
      if (num % 10 > 0) { words += ' ' + a[num % 10]; }
    }
  }
  return words.trim();
};

const STATUSES = [
  'QUOTATION', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'EDITING',
  'ALBUM_DESIGNING', 'PRINTING', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'
];

function BookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    bookings, clients, packages, events, fetchData,
    createRecord, updateRecord, deleteRecord, user
  } = useStore();
  const { toast, confirm: confirmAction } = useToast();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<DateYearFilterState>(initialDateYearFilterState);

  // Booking details popup state
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Booking form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);

  // Installment Record modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentNotes, setPaymentNotes] = useState('');

  // Form states
  const [formClientId, setFormClientId] = useState('');
  const [formPackageId, setFormPackageId] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState('PENDING');
  const [formName, setFormName] = useState('');
  const [formGrandTotal, setFormGrandTotal] = useState('0');

  // Multi-event selections under booking
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
    ]).finally(() => {
      setLoading(false);
      // Auto-select if bookingId exists in URL search params
      const qId = searchParams.get('bookingId');
      if (qId && bookings.length > 0) {
        const found = bookings.find(b => b.id === qId);
        if (found) {
          setSelectedBooking(found);
          setDetailsOpen(true);
        }
      }
    });
  }, [fetchData, searchParams, bookings.length]);

  const handleOpenDetails = (booking: any) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const handleOpenAdd = () => {
    router.push('/dashboard/bookings/create');
  };

  const handleOpenEdit = (booking: any) => {
    setDetailsOpen(false);
    router.push(`/dashboard/bookings/create?bookingId=${booking.id}`);
  };

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

    const bookingNum = editingBooking?.bookingNumber || `R2R-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalPrice = parseFloat(formGrandTotal) || 0;

    const payload = {
      bookingNumber: bookingNum,
      name: formName || null,
      clientId: formClientId,
      packageId: formPackageId || null,
      venue: formVenue || null,
      notes: formNotes || null,
      status: formStatus,
      subtotal: finalPrice,
      discount: 0,
      gstAmount: 0,
      grandTotal: finalPrice,
      balance: finalPrice - (editingBooking?.paidAmount || 0),
    };

    try {
      let savedBookingId = editingBooking?.id;

      if (editingBooking) {
        await updateRecord('bookings', { id: editingBooking.id, ...payload });

        await fetch(`/api/data/bookingEvents?bookingId=${editingBooking.id}`, { method: 'DELETE' });
        for (const row of selectedEvents) {
          await createRecord('bookingEvents', {
            bookingId: editingBooking.id,
            eventId: row.eventId,
            eventDate: row.eventDate,
            eventTime: row.eventTime || null,
            venue: row.venue || null,
            price: 0,
            status: 'ASSIGNED',
          });
        }
      } else {
        const savedBooking = await createRecord('bookings', {
          ...payload,
          paidAmount: 0,
        });
        savedBookingId = savedBooking.id;

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
      }

      setFormOpen(false);
      setEditingBooking(null);
      await fetchData('bookings', '?include={"client":true,"package":true,"bookingEvents":{"include":{"event":true}}}');
      toast('Booking details saved successfully!', 'success');

      if (savedBookingId) {
        const freshList = await useStore.getState().bookings;
        const freshSelected = freshList.find((b: any) => b.id === savedBookingId);
        if (freshSelected) {
          setSelectedBooking(freshSelected);
          setDetailsOpen(true);
        }
      }
    } catch (err) {
      toast('Failed to save booking details: ' + err, 'error');
    }
  };

  const handleDeleteBooking = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const ok = await confirmAction(
      'Are you sure you want to cancel and delete this booking? Permanent data records (excluding past bills) will be removed.',
      { title: 'Confirm Deletion' }
    );
    if (ok) {
      try {
        await deleteRecord('bookings', id);
        setSelectedBooking(null);
        setDetailsOpen(false);
        fetchData('bookings', '?include={"client":true,"package":true,"bookingEvents":{"include":{"event":true}}}');
        toast('Booking canceled and deleted successfully.', 'success');
      } catch (err) {
        toast('Deletion failed: ' + err, 'error');
      }
    }
  };

  // Billing generators
  const handleGenerateInvoice = async (booking: any) => {
    try {
      const invNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await createRecord('invoices', {
        bookingId: booking.id,
        invoiceNumber: invNum,
        gstRate: 0.0,
        gstAmount: 0.0,
        totalAmount: booking.grandTotal,
        grandTotal: booking.grandTotal,
        paidAmount: booking.paidAmount,
        balance: booking.balance,
        status: booking.balance === 0 ? 'PAID' : booking.paidAmount > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
      });
      toast(`Invoice '${invNum}' generated successfully! Redirecting to Billing...`, 'success');
      router.push('/dashboard/billing');
    } catch (e) {
      toast('Invoice generation failed: ' + e, 'error');
    }
  };

  const handleGenerateQuotation = async (booking: any) => {
    try {
      const q = await createRecord('quotations', {
        bookingId: booking.id,
        version: 1,
        terms: 'Payment schedule: 30% advance, 50% on event, 20% on album delivery.',
        status: 'SENT',
      });
      toast(`Quotation generated successfully! Redirecting to Quotation Studio...`, 'success');
      router.push(`/dashboard/quotations?id=${q.id || booking.id}`);
    } catch (e) {
      toast('Quotation generation failed: ' + e, 'error');
    }
  };

  // Collect Payment installment
  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;

    const amountVal = parseFloat(paymentAmount);

    try {
      await createRecord('payments', {
        bookingId: selectedBooking.id,
        receiptNumber: `RCPT-PAY-${Math.floor(10000 + Math.random() * 90000)}`,
        amount: amountVal,
        paymentMode: paymentMode,
        paymentDate: paymentDate,
        notes: paymentNotes || 'Installment collected',
      });

      const newPaid = (selectedBooking.paidAmount || 0) + amountVal;
      const newBalance = Math.max(0, selectedBooking.grandTotal - newPaid);

      await updateRecord('bookings', {
        id: selectedBooking.id,
        paidAmount: newPaid,
        balance: newBalance,
      });

      toast('Installment payment registered successfully!', 'success');
      setPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentNotes('');

      await fetchData('bookings', '?include={"client":true,"package":true,"bookingEvents":{"include":{"event":true}}}');
      setDetailsOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      toast('Payment failed: ' + err, 'error');
    }
  };

  // Filtering
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.client && b.client.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchesDate = matchesDateFilter(b.createdAt, dateFilter);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'QUOTATION': return 'warning';
      case 'PENDING': return 'info';
      case 'CONFIRMED': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'secondary';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Date & Year Filter */}
      <DateYearFilter filter={dateFilter} onChange={setDateFilter} />

      {/* Top Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Booking Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage photography packages, multi-shoot dates, and invoicing ledger.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus className="h-4 w-4" />}
          onClick={handleOpenAdd}
        >
          New Studio Booking
        </Button>
      </Box>

      {/* Filter / Search Bar */}
      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by booking number or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Search className="h-4.5 w-4.5 text-neutral-400 mr-2" />
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5 }}>
                  Booking #
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5 }}>
                  Client
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5 }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5, display: { xs: 'none', md: 'table-cell' } }}>
                  Venue
                </TableCell>
                {user?.role !== 'RECEPTIONIST' && (
                  <>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5 }}>
                      Total
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5, display: { xs: 'none', md: 'table-cell' } }}>
                      Paid
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5 }}>
                      Balance
                    </TableCell>
                  </>
                )}
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    No booking records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((b) => (
                  <TableRow
                    key={b.id}
                    hover
                    onClick={() => handleOpenDetails(b)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: 'primary.light' },
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.78rem', color: 'text.primary' }}>
                        #{b.bookingNumber}
                      </Typography>
                      {b.name && (
                        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', mt: 0.25, color: 'text.primary' }}>
                          {b.name}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ width: 26, height: 26, bgcolor: 'primary.main', fontSize: '0.65rem', fontWeight: 600 }}>
                          {b.client?.name?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                        <Typography sx={{ fontSize: '0.76rem', color: 'text.primary' }}>
                          {b.client?.name || 'Unknown'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={b.status}
                        size="small"
                        color={getStatusChipColor(b.status) as any}
                        sx={{ height: 20, fontSize: '0.62rem', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>
                        {b.venue || '—'}
                      </Typography>
                    </TableCell>
                    {user?.role !== 'RECEPTIONIST' && (
                      <>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 500, fontSize: '0.78rem', color: 'text.primary' }}>
                            ₹{b.grandTotal.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>
                            ₹{b.paidAmount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`₹${b.balance.toLocaleString()}`}
                            size="small"
                            color={b.balance > 0 ? 'warning' : 'success'}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 500 }}
                          />
                        </TableCell>
                      </>
                    )}
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details" arrow>
                          <IconButton
                            onClick={(e) => { e.stopPropagation(); handleOpenDetails(b); }}
                            size="small" color="primary" sx={{ borderRadius: 1 }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Booking" arrow>
                          <IconButton
                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(b); }}
                            size="small" color="secondary" sx={{ borderRadius: 1 }}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Booking" arrow>
                          <IconButton
                            onClick={(e) => handleDeleteBooking(b.id, e)}
                            size="small" color="error" sx={{ borderRadius: 1 }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Row count footer */}
        {!loading && filteredBookings.length > 0 && (
          <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(227, 236, 231, 0.6)', bgcolor: 'background.default' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
              Showing {filteredBookings.length} of {bookings.length} bookings
            </Typography>
          </Box>
        )}
      </Card>

      {/* ========== BOOKING DETAILS DIALOG (POPUP) ========== */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 0.5, maxHeight: '85vh' } }
        }}
      >
        {selectedBooking && (
          <>
            {/* Dialog Header */}
            <DialogTitle sx={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              bgcolor: 'background.default', borderBottom: '1px solid rgba(227, 236, 231, 0.6)',
              py: 1.5, px: 2.5
            }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 600 }}>
                  {selectedBooking.client?.name?.charAt(0).toUpperCase() || '?'}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}>
                    {selectedBooking.bookingNumber}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                    {selectedBooking.client?.name} • Booking Details & Invoicing
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Chip
                  label={selectedBooking.status}
                  size="small"
                  color={getStatusChipColor(selectedBooking.status) as any}
                  sx={{ height: 22, fontSize: '0.65rem', fontWeight: 500 }}
                />
                <IconButton size="small" onClick={handleCloseDetails} sx={{ borderRadius: 1 }}>
                  <X className="h-4 w-4" />
                </IconButton>
              </Stack>
            </DialogTitle>

            {/* Dialog Content */}
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                {/* Booking Info */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.06em', mb: 1, display: 'block' }}>
                    Booking Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                    <Stack spacing={1}>
                      {selectedBooking.package && (
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
                          <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>
                            Package: {selectedBooking.package.name}
                          </Typography>
                        </Stack>
                      )}
                      {selectedBooking.venue && (
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                          <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>
                            Venue: {selectedBooking.venue}
                          </Typography>
                        </Stack>
                      )}
                      {selectedBooking.notes && (
                        <Box sx={{ p: 1.5, bgcolor: 'background.default', border: '1px solid rgba(227, 236, 231, 0.6)', borderRadius: 1, fontSize: '0.72rem', fontStyle: 'italic', color: 'text.secondary', mt: 0.5 }}>
                          {selectedBooking.notes}
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Box>

                {/* Scheduled Events */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.06em', mb: 1, display: 'block' }}>
                    Scheduled Shoot Events
                  </Typography>
                  <Stack spacing={1}>
                    {selectedBooking.bookingEvents?.map((be: any) => (
                      <Paper key={be.id} variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 1.5 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.78rem' }}>{be.event?.name}</Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5, color: 'text.secondary' }}>
                            <Calendar className="h-3 w-3" />
                            <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>
                              {be.eventDate} ({be.eventTime || '09:00 AM'})
                            </Typography>
                          </Stack>
                        </Box>
                      </Paper>
                    ))}
                    {(!selectedBooking.bookingEvents || selectedBooking.bookingEvents.length === 0) && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.72rem' }}>
                        No events scheduled.
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Pricing Breakdown - Hidden for RECEPTIONIST */}
                {user?.role !== 'RECEPTIONIST' && (
                  <Box sx={{ p: 2, bgcolor: 'background.default', border: '1px solid rgba(227, 236, 231, 0.6)', borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.06em', mb: 1.5, display: 'block' }}>
                      Pricing Breakdown
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 500, color: 'text.primary' }}>
                        <span>Grand Total</span>
                        <span>₹{selectedBooking.grandTotal.toLocaleString()}</span>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'primary.main', fontWeight: 500 }}>
                        <span>Amount Paid</span>
                        <span>₹{selectedBooking.paidAmount.toLocaleString()}</span>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'warning.light', color: 'warning.dark', p: 0.75, borderRadius: 1, fontWeight: 500, fontSize: '0.76rem' }}>
                        <span>Outstanding Balance</span>
                        <span>₹{selectedBooking.balance.toLocaleString()}</span>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Action Buttons */}
                <Stack spacing={1} sx={{ pt: 1 }}>
                  {user?.role !== 'RECEPTIONIST' && selectedBooking.balance > 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CreditCard className="h-4 w-4" />}
                      onClick={() => setPaymentModalOpen(true)}
                      fullWidth
                    >
                      Collect Installment Payment
                    </Button>
                  )}

                  {user?.role !== 'RECEPTIONIST' && (
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<FileText className="h-3.5 w-3.5" />}
                          onClick={() => handleGenerateQuotation(selectedBooking)}
                          fullWidth
                        >
                          Quotation
                        </Button>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ClipboardPlus className="h-3.5 w-3.5" />}
                          onClick={() => handleGenerateInvoice(selectedBooking)}
                          fullWidth
                        >
                          Tax Invoice
                        </Button>
                      </Grid>
                    </Grid>
                  )}

                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<Edit3 className="h-3.5 w-3.5" />}
                        onClick={() => handleOpenEdit(selectedBooking)}
                        fullWidth
                      >
                        Edit Booking
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Trash2 className="h-3.5 w-3.5" />}
                        onClick={() => handleDeleteBooking(selectedBooking.id)}
                        fullWidth
                      >
                        Cancel Booking
                      </Button>
                    </Grid>
                  </Grid>
                </Stack>

              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* ========== COLLECT PAYMENT DIALOG ========== */}
      <Dialog open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(227, 236, 231, 0.6)', fontSize: '0.9rem', fontWeight: 600 }}>
          Collect Installment Receipt
        </DialogTitle>
        <form onSubmit={handleCollectPayment}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
            <TextField
              label="Installment Payment Amount (₹)"
              type="number"
              required
              fullWidth
              slotProps={{ htmlInput: { min: 1 } }}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="e.g. 50000"
            />

            <TextField
              label="Payment Date *"
              type="date"
              fullWidth
              required
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMode}
                label="Payment Method"
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <MenuItem value="UPI">UPI / QR Scan</MenuItem>
                <MenuItem value="CASH">Cash Payment</MenuItem>
                <MenuItem value="BANK_TRANSFER">Bank IMPS/NEFT</MenuItem>
                <MenuItem value="CARD">Credit / Debit Card</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Receipt Notes"
              fullWidth
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Advance deposit, 2nd installment"
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(227, 236, 231, 0.6)' }}>
            <Button onClick={() => setPaymentModalOpen(false)} variant="outlined" color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Issue Receipt
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </Box>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <Typography variant="body2" sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        Loading Bookings View...
      </Typography>
    }>
      <BookingsContent />
    </Suspense>
  );
}
