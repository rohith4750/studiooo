'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import { 
  Box, Card, CardContent, Button, TextField, Typography, 
  Chip, Stack, IconButton, Paper, Dialog, DialogTitle, DialogContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Divider, Tooltip
} from '@mui/material';
import { 
  Plus, Search, Download, Upload, Trash2, Edit3, X, Mail, Phone, 
  MapPin, Gift, Calendar, Notebook, Eye, User
} from 'lucide-react';

export default function ClientsPage() {
  const router = useRouter();
  const { clients, bookings, payments, fetchData, createRecord, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('clients'),
      fetchData('bookings'),
      fetchData('payments')
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const ok = await confirmAction(
      'Are you sure you want to delete this client profile? All bookings and payment records linked to them will be impacted.',
      { title: 'Confirm Profile Deletion' }
    );
    if (ok) {
      try {
        await deleteRecord('clients', id);
        toast('Client profile deleted successfully.', 'success');
        if (selectedClient && selectedClient.id === id) {
          setSelectedClient(null);
          setProfileOpen(false);
        }
      } catch (err) {
        toast('Failed to delete client: ' + err, 'error');
      }
    }
  };

  const handleOpenProfile = (client: any) => {
    setSelectedClient(client);
    setProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileOpen(false);
  };

  // CSV export
  const handleExportCSV = () => {
    if (clients.length === 0) return;
    const headers = ['Name', 'Phone', 'WhatsApp', 'Email', 'Address', 'City', 'State', 'Pincode', 'Birthday', 'Anniversary'];
    const rows = clients.map(c => [
      c.name, c.phone, c.whatsappNumber || '', c.email || '', c.address || '',
      c.city || '', c.state || '', c.pincode || '', c.birthday || '', c.anniversary || ''
    ]);
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `r2r_studio_clients_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Client directory exported successfully!', 'success');
  };

  // CSV import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      if (lines.length <= 1) return;

      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
        if (parts.length < 2) continue;

        try {
          await createRecord('clients', {
            name: parts[0],
            phone: parts[1],
            whatsappNumber: parts[2] || parts[1],
            email: parts[3] || null,
            address: parts[4] || null,
            city: parts[5] || null,
            state: parts[6] || null,
            pincode: parts[7] || null,
            birthday: parts[8] || null,
            anniversary: parts[9] || null,
            gstNumber: null,
          });
          importedCount++;
        } catch (err) {
          console.error('Error importing row:', err);
        }
      }
      toast(`CSV import complete. Successfully registered ${importedCount} client profiles!`, 'success');
      await fetchData('clients');
    };
    reader.readAsText(file);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const clientBookings = selectedClient ? bookings.filter(b => b.clientId === selectedClient.id) : [];
  const clientPayments = selectedClient ? payments.filter(p => clientBookings.map(b => b.id).includes(p.bookingId)) : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Header Utilities */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Client Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage customer directory profiles and booking histories.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<Upload className="h-4 w-4" />}
          >
            Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} hidden />
          </Button>

          <Button
            variant="outlined"
            onClick={handleExportCSV}
            disabled={clients.length === 0}
            startIcon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/dashboard/clients/create')}
          >
            Add Client
          </Button>
        </Stack>
      </Box>

      {/* Search Input Box */}
      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, phone or email..."
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
        </CardContent>
      </Card>

      {/* Client Table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5 }}>
                  Client Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5 }}>
                  Phone
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5, display: { xs: 'none', md: 'table-cell' } }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5, display: { xs: 'none', lg: 'table-cell' } }}>
                  City
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5, display: { xs: 'none', lg: 'table-cell' } }}>
                  Bookings
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em', py: 1.5 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    Loading client directory...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    No client records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => {
                  const clientBookingCount = bookings.filter(b => b.clientId === client.id).length;
                  return (
                    <TableRow 
                      key={client.id} 
                      hover
                      onClick={() => handleOpenProfile(client)}
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                          bgcolor: 'primary.light',
                        },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 30, height: 30, 
                              bgcolor: 'primary.main', 
                              fontSize: '0.72rem', 
                              fontWeight: 600 
                            }}
                          >
                            {client.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.78rem', color: 'text.primary' }}>
                            {client.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>
                          {client.phone}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>
                          {client.email || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                        <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>
                          {client.city || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                        <Chip 
                          label={clientBookingCount} 
                          size="small" 
                          variant={clientBookingCount > 0 ? 'filled' : 'outlined'}
                          color={clientBookingCount > 0 ? 'primary' : 'default'}
                          sx={{ 
                            height: 20, fontSize: '0.68rem', fontWeight: 500, minWidth: 28,
                          }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                          <Tooltip title="View Profile" arrow>
                            <IconButton 
                              onClick={(e) => { e.stopPropagation(); handleOpenProfile(client); }} 
                              size="small" 
                              color="primary"
                              sx={{ borderRadius: 1 }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Client" arrow>
                            <IconButton 
                              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/clients/create?clientId=${client.id}`); }} 
                              size="small" 
                              color="secondary"
                              sx={{ borderRadius: 1 }}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Client" arrow>
                            <IconButton 
                              onClick={(e) => handleDelete(client.id, e)} 
                              size="small" 
                              color="error"
                              sx={{ borderRadius: 1 }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Row count footer */}
        {!loading && filteredClients.length > 0 && (
          <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(227, 236, 231, 0.6)', bgcolor: 'background.default' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
              Showing {filteredClients.length} of {clients.length} client profiles
            </Typography>
          </Box>
        )}
      </Card>

      {/* Client Profile Dialog (Popup) */}
      <Dialog 
        open={profileOpen} 
        onClose={handleCloseProfile} 
        maxWidth="sm" 
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 0.5,
              maxHeight: '85vh',
            }
          }
        }}
      >
        {selectedClient && (
          <>
            {/* Dialog Header */}
            <DialogTitle sx={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              bgcolor: 'background.default', borderBottom: '1px solid rgba(227, 236, 231, 0.6)',
              py: 1.5, px: 2.5
            }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 600 }}>
                  {selectedClient.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'text.primary' }}>
                    {selectedClient.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                    Client Profile & Timeline
                  </Typography>
                </Box>
              </Stack>
              <IconButton size="small" onClick={handleCloseProfile} sx={{ borderRadius: 1 }}>
                <X className="h-4 w-4" />
              </IconButton>
            </DialogTitle>

            {/* Dialog Content */}
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                
                {/* Contact Details */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.06em', mb: 1, display: 'block' }}>
                    Contact Information
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Phone className="h-3.5 w-3.5 text-neutral-400" />
                        <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>
                          {selectedClient.whatsappNumber || selectedClient.phone}
                        </Typography>
                      </Stack>
                      {selectedClient.email && (
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Mail className="h-3.5 w-3.5 text-neutral-400" />
                          <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>{selectedClient.email}</Typography>
                        </Stack>
                      )}
                      {selectedClient.address && (
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                          <Typography sx={{ fontSize: '0.78rem', color: 'text.primary' }}>
                            {selectedClient.address}, {selectedClient.city} - {selectedClient.pincode}
                          </Typography>
                        </Stack>
                      )}

                    </Stack>
                  </Paper>
                </Box>



                <Divider />

                {/* Booking History */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.06em', mb: 1, display: 'block' }}>
                    Booking History ({clientBookings.length})
                  </Typography>
                  <Stack spacing={1}>
                    {clientBookings.map((booking) => (
                      <Paper key={booking.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.78rem', color: 'text.primary' }}>{booking.bookingNumber}</Typography>
                          <Chip label={booking.status} size="small" color="primary" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 500 }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.5 }}>Venue: {booking.venue || 'TBD'}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Total: ₹{booking.grandTotal.toLocaleString()}</Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: 'error.main', fontWeight: 500 }}>Balance: ₹{booking.balance.toLocaleString()}</Typography>
                        </Box>
                      </Paper>
                    ))}
                    {clientBookings.length === 0 && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.72rem' }}>
                        No bookings aggregated.
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {/* Payment Ledger */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.06em', mb: 1, display: 'block' }}>
                    Receipt Ledger
                  </Typography>
                  <Stack spacing={1}>
                    {clientPayments.map((payment) => (
                      <Paper key={payment.id} variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 1.5 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 500, fontSize: '0.78rem' }}>₹{payment.amount.toLocaleString()}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>{payment.paymentMode} • {payment.paymentDate}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.68rem' }}>{payment.receiptNumber}</Typography>
                      </Paper>
                    ))}
                    {clientPayments.length === 0 && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.72rem' }}>
                        No payments recorded.
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<Edit3 className="h-3.5 w-3.5" />}
                    onClick={() => { handleCloseProfile(); router.push(`/dashboard/clients/create?clientId=${selectedClient.id}`); }}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    color="error"
                    startIcon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={() => handleDelete(selectedClient.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
