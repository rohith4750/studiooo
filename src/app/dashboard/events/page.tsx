'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Grid, Box, Card, CardContent, Button, Typography, Chip, Stack, IconButton
} from '@mui/material';
import { Plus, Trash2, Edit3, Clock } from 'lucide-react';

export default function EventsPage() {
  const router = useRouter();
  const { events, fetchData, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData('events').finally(() => setLoading(false)); }, [fetchData]);

  const handleDeleteEvent = async (id: string) => {
    const ok = await confirmAction('Are you sure you want to delete this Event template?', { title: 'Confirm Deletion' });
    if (ok) {
      try { await deleteRecord('events', id); toast('Event preset deleted.', 'success'); }
      catch (err) { toast('Deletion failed: ' + err, 'error'); }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>Shoot Event Presets</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Manage base operational templates and shoot categories for events.</Typography>
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
        <Grid container spacing={2}>
          {events.map((ev) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={ev.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={ev.category} color="secondary" size="small" sx={{ fontSize: 9, height: 20, fontWeight: 'bold' }} />
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Box sx={{ borderRadius: '50%', backgroundColor: ev.active ? 'success.main' : 'neutral.300', width: 6, height: 6 }} />
                      <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase' }}>{ev.active ? 'Active' : 'Inactive'}</Typography>
                    </Stack>
                  </Box>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'extrabold', color: 'text.primary' }}>{ev.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 32 }}>{ev.description || 'No event description.'}</Typography>
                  </Stack>
                  <Stack spacing={1} sx={{ pt: 1.5, borderTop: '1px solid rgba(227, 236, 231, 0.6)', fontSize: 10, color: 'text.secondary' }}>
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
      )}
    </Box>
  );
}
