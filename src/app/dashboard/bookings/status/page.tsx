'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { 
  Box, Grid, Card, CardContent, TextField, Typography, 
  Chip, Stack, Button, Divider, Paper
} from '@mui/material';
import { 
  Search, CheckCircle2, MapPin, CalendarDays, RefreshCw, ChevronRight
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  QUOTATION: 'info',
  PENDING: 'warning',
  CONFIRMED: 'primary',
  IN_PROGRESS: 'secondary',
  EDITING: 'warning',
  ALBUM_DESIGNING: 'secondary',
  PRINTING: 'info',
  READY_FOR_DELIVERY: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error'
};

export default function StatusRosterPage() {
  const router = useRouter();
  const { bookings, fetchData } = useStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchData('bookings', '?include={"client":true,"package":true}')
      .finally(() => setLoading(false));
  }, [fetchData]);

  const filteredBookings = bookings.filter((b) => {
    const term = searchQuery.toLowerCase();
    return (
      b.bookingNumber.toLowerCase().includes(term) ||
      (b.client && b.client.name.toLowerCase().includes(term))
    );
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Title Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Status Update Roster
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Track project lifecycles, crew status, and progress timelines across active bookings.
          </Typography>
        </div>
      </Box>

      {/* Filter / Search Bar Card */}
      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search booking number or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <Search className="h-4.5 w-4.5 text-neutral-400 mr-2" />
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Bookings Grid list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12, gap: 2 }}>
          <RefreshCw className="h-6 w-6 animate-spin text-neutral-400" />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
            Loading bookings...
          </Typography>
        </Box>
      ) : filteredBookings.length === 0 ? (
        <Card sx={{ p: 6, textStyle: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CalendarDays className="h-10 w-10 text-neutral-300 mb-2" />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
            No booking records found
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Try adjusting your search terms or verify bookings have been created in the registry.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((b) => {
            const activeColor = STATUS_COLORS[b.status] || 'secondary';
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={b.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    transition: 'all 0.2s', 
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 30px rgba(0, 0, 0, 0.05)' } 
                  }}
                >
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Card Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 'bold', fontSize: 13, color: 'text.primary' }}>
                        {b.bookingNumber}
                      </Typography>
                      <Chip 
                        label={b.status} 
                        size="small" 
                        color={activeColor as any} 
                        sx={{ height: 18, fontSize: 8.5, fontWeight: 'bold' }} 
                      />
                    </Box>

                    {/* Client & Venue */}
                    <Stack spacing={0.5}>
                      <Typography sx={{ fontWeight: 'bold', fontSize: 13, color: 'text.primary' }}>
                        {b.client?.name}
                      </Typography>
                      {b.venue && (
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                          <MapPin className="h-3.5 w-3.5" />
                          <Typography variant="caption" sx={{ fontSize: 10 }}>
                            {b.venue}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    <Divider />

                    {/* Financial Summary */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.default', p: 1.5, borderRadius: 0.5, border: '1px solid rgba(227, 236, 231, 0.4)' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' }}>
                          Total Billing
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: 12.5, color: 'text.primary' }}>
                          ₹{b.grandTotal.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: 'error.main', display: 'block', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' }}>
                          Balance Due
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: 12.5, color: 'error.main' }}>
                          ₹{b.balance.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  {/* Actions footer */}
                  <Box sx={{ p: 2, pt: 0, borderTop: '1px solid rgba(227, 236, 231, 0.4)' }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={() => router.push(`/dashboard/bookings/status/update?bookingId=${b.id}`)}
                      endIcon={<ChevronRight className="h-4 w-4" />}
                      sx={{ py: 1 }}
                    >
                      Update Status Flow
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
