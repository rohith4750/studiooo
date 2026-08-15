'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Grid, Box, Card, CardContent, Button, Typography, Stack, IconButton, CardActions
} from '@mui/material';
import { Plus, Trash2, Edit3, Clock } from 'lucide-react';
import DataTablePagination from '@/components/DataTablePagination';

export default function EventsPage() {
  const router = useRouter();
  const { events, fetchData, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  useEffect(() => { fetchData('events').finally(() => setLoading(false)); }, [fetchData]);

  const handleDeleteEvent = async (id: string) => {
    const ok = await confirmAction('Are you sure you want to delete this Event template?', { title: 'Confirm Deletion' });
    if (ok) {
      try { await deleteRecord('events', id); toast('Event preset deleted.', 'success'); }
      catch (err) { toast('Deletion failed: ' + err, 'error'); }
    }
  };

  const paginatedEvents = events.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>Shoot Event Presets</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Manage base operational templates for events.</Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<Plus className="h-4 w-4" />} onClick={() => router.push('/dashboard/events/create')}>
          New Shoot Event
        </Button>
      </Box>

      {loading ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>Loading templates...</Typography>
      ) : events.length === 0 ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>No event templates found. Create your first preset.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={2}>
            {paginatedEvents.map((ev) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={ev.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 3,
                    borderColor: 'rgba(227, 236, 231, 0.8)',
                    boxShadow: 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {ev.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 32 }}>
                      {ev.description || 'No event description.'}
                    </Typography>
                    <Stack spacing={1} sx={{ pt: 1.5, borderTop: '1px solid rgba(227, 236, 231, 0.6)', fontSize: 10, color: 'text.secondary', mt: 'auto' }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                        <Typography variant="caption" sx={{ fontSize: 10 }}>Duration: {ev.duration || 'Full Day'}</Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, p: 1.5, borderTop: '1px solid rgba(227, 236, 231, 0.6)' }}>
                    <IconButton onClick={() => router.push(`/dashboard/events/create?eventId=${ev.id}`)} color="secondary" size="small" sx={{ p: 1 }}><Edit3 className="h-4 w-4" /></IconButton>
                    <IconButton onClick={() => handleDeleteEvent(ev.id)} color="error" size="small" sx={{ p: 1 }}><Trash2 className="h-4 w-4" /></IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Card sx={{ borderRadius: 2 }}>
            <DataTablePagination
              count={events.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
              rowsPerPageOptions={[8, 12, 24, 48]}
            />
          </Card>
        </Box>
      )}
    </Box>
  );
}
