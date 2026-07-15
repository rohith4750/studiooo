'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import { 
  Box, Grid, Card, CardContent, Button, TextField, Typography, 
  MenuItem, Select, InputLabel, FormControl, Chip, Stack,
  IconButton, Paper, Divider
} from '@mui/material';
import { 
  Sparkles, Kanban, Link, HardDriveUpload, Users, 
  Trash2, X, ClipboardList, Clock, ArrowRight, Eye 
} from 'lucide-react';

const COLUMNS = [
  { key: 'IN_PROGRESS', label: 'Shoot started', color: 'primary' },
  { key: 'EDITING', label: 'In Editing Queue', color: 'warning' },
  { key: 'ALBUM_DESIGNING', label: 'Album Designing', color: 'secondary' },
  { key: 'READY_FOR_DELIVERY', label: 'Ready for Delivery', color: 'info' },
  { key: 'COMPLETED', label: 'Completed', color: 'success' },
];

const ALBUM_TYPES = [
  { key: 'PREMIUM', label: 'Premium Leatherette' },
  { key: 'ACRYLIC', label: 'Acrylic Glass Cover' },
  { key: 'MAGAZINE', label: 'Magazine Soft Bound' },
  { key: 'HD', label: 'HD High Definition Album' },
];

export default function WorkflowsPage() {
  const { 
    bookings, employees, fetchData, createRecord, updateRecord 
  } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<any>(null);

  // Form open states (inline right pane)
  const [formOpen, setFormOpen] = useState(false);
  const [formEditorId, setFormEditorId] = useState('');
  const [formAlbumType, setFormAlbumType] = useState('PREMIUM');
  const [formNotes, setFormNotes] = useState('');
  const [formRawLink, setFormRawLink] = useState('');
  const [formEditedLink, setFormEditedLink] = useState('');
  const [formStatus, setFormStatus] = useState('PENDING');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('bookings', '?include={"client":true,"bookingEvents":{"include":{"event":true}},"albums":true}'),
      fetchData('employees'),
      fetchData('albums', '?include={"booking":true,"editor":true}'),
    ]).finally(() => setLoading(false));
  }, [fetchData]);

  const handleOpenManager = (booking: any) => {
    setActiveBooking(booking);
    const existingAlbum = booking.albums?.[0] || null;
    
    setFormEditorId(existingAlbum?.editorId || '');
    setFormAlbumType(existingAlbum?.type || 'PREMIUM');
    setFormNotes(existingAlbum?.notes || '');
    setFormRawLink(existingAlbum?.rawLink || '');
    setFormEditedLink(existingAlbum?.editedLink || '');
    setFormStatus(existingAlbum?.status || 'PENDING');
    setFormOpen(true);
  };

  const handleSaveAlbumWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    const existingAlbum = activeBooking.albums?.[0] || null;

    const payload = {
      bookingId: activeBooking.id,
      type: formAlbumType,
      status: formStatus,
      designStatus: formStatus === 'COMPLETED' ? 'DELIVERED' : 'DESIGNING',
      editorId: formEditorId || null,
      notes: formNotes || null,
      rawLink: formRawLink || null,
      editedLink: formEditedLink || null,
    };

    try {
      if (existingAlbum) {
        await updateRecord('albums', { id: existingAlbum.id, ...payload });
      } else {
        await createRecord('albums', payload);
      }
      
      // Update overall booking status
      await updateRecord('bookings', {
        id: activeBooking.id,
        status: formStatus === 'COMPLETED' ? 'COMPLETED' : formStatus,
      });

      toast('Workflow card updated successfully!', 'success');
      setFormOpen(false);
      setActiveBooking(null);
      
      // Re-fetch datasets
      await fetchData('bookings', '?include={"client":true,"bookingEvents":{"include":{"event":true}},"albums":true}');
    } catch (e) {
      toast('Failed to update workflow: ' + e, 'error');
    }
  };

  const handleAdvanceStatus = async (booking: any, currentStatus: string) => {
    const statusSequence = ['IN_PROGRESS', 'EDITING', 'ALBUM_DESIGNING', 'READY_FOR_DELIVERY', 'COMPLETED'];
    const currentIndex = statusSequence.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusSequence.length - 1) return;

    const nextStatus = statusSequence[currentIndex + 1];
    
    try {
      await updateRecord('bookings', {
        id: booking.id,
        status: nextStatus,
      });
      toast(`Booking ${booking.bookingNumber} moved to ${nextStatus}`, 'success');
      await fetchData('bookings', '?include={"client":true,"bookingEvents":{"include":{"event":true}},"albums":true}');
    } catch (e) {
      toast('Failed to advance card status: ' + e, 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Production Pipeline
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Track shoots, manage editor assignments, and capture raw/edited media drives.
        </Typography>
      </div>

      {loading ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          Loading pipeline...
        </Typography>
      ) : (
        <Grid container spacing={3}>
          
          {/* Kanban board (Left 8 Columns) */}
          <Grid size={{ xs: 12 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                overflowX: 'auto', 
                pb: 2, 
                minHeight: 550,
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: 0.5 },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
              }}
            >
              {COLUMNS.map((col) => {
                const colBookings = bookings.filter(b => b.status === col.key);

                return (
                  <Box 
                    key={col.key} 
                    sx={{ 
                      flex: 1, 
                      minWidth: 260, 
                      bgcolor: 'background.paper', 
                      border: '1px solid rgba(227, 236, 231, 0.6)', 
                      borderRadius: 4, 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 2,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(227, 236, 231, 0.6)', pb: 1 }}>
                      <Chip 
                        label={col.label} 
                        color={col.color as any} 
                        size="small" 
                        sx={{ fontWeight: 'bold', fontSize: 9, height: 20 }} 
                      />
                      <Chip 
                        label={colBookings.length} 
                        size="small" 
                        sx={{ fontWeight: 'extrabold', fontSize: 9, height: 20, bgcolor: 'background.default' }} 
                      />
                    </Box>

                    {/* Cards */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto', maxHeight: 420 }}>
                      {colBookings.map((b) => {
                        const activeAlbum = b.albums?.[0] || null;
                        return (
                          <Card 
                            key={b.id} 
                            onClick={() => handleOpenManager(b)}
                            sx={{ 
                              cursor: 'pointer', 
                              border: '1px solid rgba(227, 236, 231, 0.6)', 
                              transition: 'all 0.15s ease',
                              '&:hover': { borderColor: 'primary.main', boxShadow: 1 }
                            }}
                          >
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 'bold', fontSize: 10, color: 'text.primary' }}>
                                  {b.bookingNumber}
                                </Typography>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdvanceStatus(b, b.status);
                                  }}
                                >
                                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400 hover:text-primary-500 transition" />
                                </IconButton>
                              </Box>

                              <Typography sx={{ fontWeight: 'bold', fontSize: 11, color: 'text.primary' }}>
                                {b.client?.name}
                              </Typography>

                              <Stack spacing={0.25} sx={{ color: 'text.secondary', fontSize: 9 }}>
                                {b.bookingEvents?.slice(0, 2).map((be: any) => (
                                  <Typography key={be.id} variant="caption" sx={{ fontSize: 9, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
                                    • {be.event?.name} ({be.eventDate})
                                  </Typography>
                                ))}
                                {b.bookingEvents && b.bookingEvents.length > 2 && (
                                  <Typography variant="caption" sx={{ fontSize: 8.5, color: 'primary.main', fontWeight: 'bold', mt: 0.5 }}>
                                    + {b.bookingEvents.length - 2} more events
                                  </Typography>
                                )}
                              </Stack>

                              <Divider sx={{ my: 0.5 }} />

                              {/* Tags */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 8 }}>
                                {activeAlbum?.editor ? (
                                  <Chip 
                                    label={`Ed: ${activeAlbum.editor.name.split(' ')[0]}`} 
                                    size="small" 
                                    color="primary" 
                                    sx={{ height: 16, fontSize: 8, fontWeight: 'bold' }} 
                                  />
                                ) : (
                                  <Typography sx={{ fontSize: 8, color: 'error.main', fontStyle: 'italic', fontWeight: 'bold' }}>Unassigned</Typography>
                                )}

                                <Stack direction="row" spacing={0.5}>
                                  {activeAlbum?.rawLink && <HardDriveUpload className="h-3 w-3 text-neutral-400" />}
                                  {activeAlbum?.editedLink && <Link className="h-3 w-3 text-primary-500" />}
                                </Stack>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}

                      {colBookings.length === 0 && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', py: 4 }}>
                          Column is empty
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Details / Form panel (Below Kanban board) */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ display: 'flex', flexDirection: 'column', minHeight: 180 }}>
              {formOpen && activeBooking ? (
                
                /* 1. RENDER INLINE WORKFLOW MANAGER FORM */
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Box sx={{ bgcolor: 'background.default', px: 3, py: 2, borderBottom: '1px solid rgba(227, 236, 231, 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Kanban className="h-5 w-5 text-primary-500" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Production Manager & Assignments
                      </Typography>
                    </Stack>
                    <IconButton size="small" onClick={() => setFormOpen(false)}>
                      <X className="h-4 w-4" />
                    </IconButton>
                  </Box>

                  <Box component="form" onSubmit={handleSaveAlbumWorkflow} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Grid container spacing={4}>
                      {/* Left side: Booking details info */}
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Paper variant="outlined" sx={{ p: 2.5, bgcolor: 'background.default', height: '100%', borderRadius: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main', textTransform: 'uppercase', fontSize: 9 }}>
                            Booking Details
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                            {activeBooking.bookingNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'semibold', mt: 0.5 }}>
                            Client: {activeBooking.client?.name}
                          </Typography>

                          <Divider sx={{ my: 2 }} />

                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', fontSize: 9, display: 'block', mb: 1 }}>
                            Shoot Schedule Checklist
                          </Typography>
                          <Stack spacing={0.75} sx={{ maxHeight: 180, overflowY: 'auto' }}>
                            {activeBooking.bookingEvents?.map((be: any) => (
                              <Typography key={be.id} variant="caption" sx={{ fontSize: 10, color: 'text.primary', leading: '1.4' }}>
                                • <b>{be.event?.name}</b> ({be.eventDate})
                              </Typography>
                            ))}
                            {(!activeBooking.bookingEvents || activeBooking.bookingEvents.length === 0) && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                No scheduled events.
                              </Typography>
                            )}
                          </Stack>
                        </Paper>
                      </Grid>

                      {/* Right side: Form controls */}
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Assign Album Editor</InputLabel>
                              <Select
                                value={formEditorId}
                                label="Assign Album Editor"
                                onChange={(e) => setFormEditorId(e.target.value)}
                              >
                                <MenuItem value="">-- No Editor Assigned --</MenuItem>
                                {employees.filter((emp: any) => emp.role === 'EDITOR').map((emp: any) => (
                                  <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Album Material Type</InputLabel>
                              <Select
                                value={formAlbumType}
                                label="Album Material Type"
                                onChange={(e) => setFormAlbumType(e.target.value)}
                              >
                                {ALBUM_TYPES.map(type => (
                                  <MenuItem key={type.key} value={type.key}>{type.label}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="RAW Images Drive Path Link"
                              fullWidth
                              size="small"
                              type="url"
                              value={formRawLink}
                              onChange={(e) => setFormRawLink(e.target.value)}
                              placeholder="https://drive.google.com/..."
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              label="Edited Files Drive Path Link"
                              fullWidth
                              size="small"
                              type="url"
                              value={formEditedLink}
                              onChange={(e) => setFormEditedLink(e.target.value)}
                              placeholder="https://drive.google.com/..."
                            />
                          </Grid>

                          <Grid size={{ xs: 12 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Workflow Status</InputLabel>
                              <Select
                                value={formStatus}
                                label="Workflow Status"
                                onChange={(e) => setFormStatus(e.target.value)}
                              >
                                <MenuItem value="IN_PROGRESS">Shoot Started</MenuItem>
                                <MenuItem value="EDITING">In Editing Queue</MenuItem>
                                <MenuItem value="ALBUM_DESIGNING">Album Design & Review</MenuItem>
                                <MenuItem value="READY_FOR_DELIVERY">Ready for Delivery</MenuItem>
                                <MenuItem value="COMPLETED">Completed & Closed</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12 }}>
                            <TextField
                              label="Revision Comments / Notes"
                              fullWidth
                              multiline
                              rows={3}
                              value={formNotes}
                              onChange={(e) => setFormNotes(e.target.value)}
                              placeholder="Client requests e.g. skin retouching, color grading notes..."
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Divider />

                    <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 1 }}>
                      <Button onClick={() => setFormOpen(false)} variant="outlined" color="secondary">
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained" color="primary">
                        Save Workflow Settings
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              ) : (
                
                /* 2. RENDER IDLE VIEW PANEL */
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
                  <Kanban className="h-8 w-8 text-neutral-300 mb-1" />
                  <Typography sx={{ fontWeight: 'bold', fontSize: 11, color: 'text.secondary' }}>Select a Kanban Card</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 350 }}>
                    Click on any active booking card on the pipeline above to assign editors, link Google Drive photo folders, or manage revision requests inline.
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>

        </Grid>
      )}
    </Box>
  );
}
