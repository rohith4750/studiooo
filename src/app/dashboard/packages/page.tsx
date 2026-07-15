'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Grid, Box, Card, CardContent, Button, Typography, Chip, Stack
} from '@mui/material';
import { Plus, Trash2, Edit3, Box as BoxIcon } from 'lucide-react';

export default function PackagesPage() {
  const router = useRouter();
  const { packages, fetchData, deleteRecord } = useStore();
  const { toast, confirm: confirmAction } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData('packages').finally(() => setLoading(false));
  }, [fetchData]);

  const handleDeletePackage = async (id: string) => {
    const ok = await confirmAction(
      'Are you sure you want to delete this preset package? Associated bookings will keep their rates but set package reference to null.',
      { title: 'Confirm Deletion' }
    );
    if (ok) {
      try { await deleteRecord('packages', id); toast('Package preset deleted.', 'success'); }
      catch (err) { toast('Deletion failed: ' + err, 'error'); }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>Studio Package Catalog</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Define preset shoot coverages, bundled crew requirements, and special deliverables.</Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<Plus className="h-4 w-4" />} onClick={() => router.push('/dashboard/packages/create')}>
          New Studio Package
        </Button>
      </Box>

      {loading ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>Loading catalog presets...</Typography>
      ) : packages.length === 0 ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>No preset packages defined. Add your first package bundle.</Typography>
      ) : (
        <Grid container spacing={3}>
          {packages.map((pkg) => {
            let parsedEvents: string[] = [];
            try { parsedEvents = JSON.parse(pkg.includedEvents); } catch (e) {}

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={pkg.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                      <Chip label={pkg.active ? 'Active' : 'Inactive'} color={pkg.active ? 'success' : 'default'} size="small" sx={{ fontWeight: 'bold', fontSize: 10 }} />
                    </Box>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BoxIcon className="h-4 w-4 text-primary-500" />
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main', textTransform: 'uppercase' }}>Package Preset</Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{pkg.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>{pkg.description || 'No package details specified.'}</Typography>
                      <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 800 }}>₹{pkg.price.toLocaleString('en-IN')}</Typography>
                    </Stack>
                    <Stack spacing={2} sx={{ pt: 2, borderTop: '1px solid rgba(227, 236, 231, 0.6)' }}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>Event Inclusions</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {parsedEvents.map(ev => <Chip key={ev} label={ev} size="small" variant="outlined" sx={{ fontSize: 9, height: 20 }} />)}
                          {parsedEvents.length === 0 && <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No events bundled.</Typography>}
                        </Box>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: 9 }}>Specifications</Typography>
                        <Grid container spacing={1} sx={{ fontSize: 11, color: 'text.secondary' }}>
                          <Grid size={{ xs: 6 }}>Photographers: <b>{pkg.photographers}</b></Grid>
                          <Grid size={{ xs: 6 }}>Cinematographers: <b>{pkg.cinematographers}</b></Grid>
                          {pkg.drone && <Grid size={{ xs: 6 }} sx={{ color: 'primary.main', fontWeight: 'bold' }}>✓ Drone</Grid>}
                          {pkg.album && <Grid size={{ xs: 6 }} sx={{ color: 'primary.main', fontWeight: 'bold' }}>✓ Custom Album</Grid>}
                          {pkg.led && <Grid size={{ xs: 6 }} sx={{ color: 'primary.main', fontWeight: 'bold' }}>✓ LED Display</Grid>}
                          {pkg.liveStreaming && <Grid size={{ xs: 6 }} sx={{ color: 'primary.main', fontWeight: 'bold' }}>✓ Live Stream</Grid>}
                        </Grid>
                      </Stack>
                      {pkg.complimentaryShoot && (
                        <Box sx={{ p: 1, backgroundColor: 'secondary.light', borderRadius: 0.5, border: '1px solid', borderColor: 'secondary.dark', opacity: 0.85 }}>
                          <Typography variant="caption" sx={{ color: 'secondary.dark', fontWeight: 'bold', fontStyle: 'italic' }}>Complimentary: {pkg.complimentaryShoot}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2, borderTop: '1px solid rgba(227, 236, 231, 0.6)' }}>
                    <Button variant="outlined" color="secondary" size="small" startIcon={<Edit3 className="h-3.5 w-3.5" />} onClick={() => router.push(`/dashboard/packages/create?packageId=${pkg.id}`)}>Edit</Button>
                    <Button variant="outlined" color="error" size="small" startIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => handleDeletePackage(pkg.id)}>Delete</Button>
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
