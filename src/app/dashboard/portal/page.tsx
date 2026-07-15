'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import { 
  Sparkles, CheckCircle2, AlertCircle, MessageSquare, Download, 
  ExternalLink, Layers, ArrowLeft, ArrowRight, UserCheck, HelpCircle 
} from 'lucide-react';
import { Select, MenuItem, FormControl, TextField } from '@mui/material';

const MOCK_PAGES = [
  { title: 'Cover Sheet', desc: 'Premium Leather Bound with Embossed Names', color: 'bg-neutral-800 text-white' },
  { title: 'Haldi Joy', desc: 'Collage of yellow turmeric splashes and laughter', color: 'bg-yellow-50 text-yellow-800' },
  { title: 'The Vows', desc: 'Cinematic wide-angle of the sacred fireplace exchanges', color: 'bg-rose-50 text-rose-800' },
  { title: 'Ring Exchange', desc: 'Macro focus on hands and micro-expressions', color: 'bg-primary-50 text-primary-800' },
  { title: 'Grand Reception', desc: 'Candid dance floor snaps with dramatic highlights', color: 'bg-blue-50 text-blue-800' },
];

export default function CustomerPortal() {
  const { 
    clients, bookings, albums, fetchData, updateRecord 
  } = useStore();
  const { toast, confirm: confirmAction } = useToast();

  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // Carousel page index
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [revisionText, setRevisionText] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchData('clients'),
      fetchData('bookings', '?include={"albums":true}'),
      fetchData('albums', '?include={"booking":true}'),
    ]).then(() => {
      setLoading(false);
      // Pick first client as default simulation
      const first = useStore.getState().clients[0];
      if (first) setSelectedClientId(first.id);
    });
  }, [fetchData]);

  // Aggregate selected client bookings and albums
  const clientBookings = bookings.filter(b => b.clientId === selectedClientId);
  const clientAlbums = albums.filter(a => clientBookings.map(b => b.id).includes(a.bookingId));
  const activeAlbum = clientAlbums[0] || null;

  const handleApproveAlbum = async () => {
    if (!activeAlbum) return;
    const ok = await confirmAction(
      'Approve this album design for final printing?',
      { title: 'Confirm Album Approval' }
    );
    if (ok) {
      try {
        await updateRecord('albums', {
          id: activeAlbum.id,
          status: 'COMPLETED',
          designStatus: 'APPROVED',
          notes: 'Client Approved: ' + (activeAlbum.notes || ''),
        });
        toast('Thank you! The album has been approved and moved to the printing queue.', 'success');
        fetchData('albums', '?include={"booking":true}');
      } catch (err) {
        toast('Approval failed: ' + err, 'error');
      }
    }
  };

  const handleSubmitRevisions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlbum || !revisionText.trim()) return;

    try {
      await updateRecord('albums', {
        id: activeAlbum.id,
        status: 'CLIENT_REVIEW',
        notes: `Revision Requested: ${revisionText}. (Previous: ${activeAlbum.notes || ''})`,
      });
      toast('Revision requests submitted to R2R Studio editing team.', 'success');
      setRevisionText('');
      fetchData('albums', '?include={"booking":true}');
    } catch (err) {
      toast('Failed to submit revision: ' + err, 'error');
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Simulation Banner */}
      <div className="p-4 bg-primary-50 border border-primary-100 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary-600 animate-pulse" />
          <div>
            <h4 className="text-xs font-bold text-neutral-800">Customer Portal Simulation Mode</h4>
            <p className="text-[10px] text-neutral-500">Select a registered client to view their private portal dashboard.</p>
          </div>
        </div>

        <FormControl size="small">
          <Select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value as string)}
            displayEmpty
            sx={{ minWidth: 200, height: 32, fontSize: '0.75rem', bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e3ece7' } }}
          >
            <MenuItem value="" disabled>Select Client</MenuItem>
            {clients.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name} ({c.phone})</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-neutral-400">Loading Portal View...</div>
      ) : clientBookings.length === 0 ? (
        <div className="glass-card p-12 text-center text-neutral-400 rounded flex flex-col items-center justify-center">
          <AlertCircle className="h-10 w-10 text-neutral-300 mb-2" />
          <h4 className="text-xs font-bold text-neutral-700">No Active Shoots found</h4>
          <p className="text-[10px] text-neutral-400 mt-0.5">This client does not have any active booking contracts in our system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:p-5">
          
          {/* Main Album Review flipbook (Left) */}
          <div className="glass-card p-5 rounded border border-neutral-200/50 lg:col-span-2 space-y-5 flex flex-col justify-between min-h-[460px]">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-xs uppercase text-neutral-500 tracking-wider">
                  designed wedding album review
                </h3>
                {activeAlbum && (
                  <span className="inline-block mt-1 text-[9px] uppercase tracking-wide bg-primary-100 text-primary-700 px-2 py-0.5 rounded font-bold">
                    Material: {activeAlbum.type}
                  </span>
                )}
              </div>
              
              <div className="text-right">
                <span className="text-[10px] text-neutral-400">Status:</span>
                <span className={`inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                  activeAlbum?.status === 'COMPLETED' ? 'bg-primary-50 text-primary-700 border-primary-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {activeAlbum?.status || 'NOT_STARTED'}
                </span>
              </div>
            </div>

            {/* Album pages Carousel preview */}
            {activeAlbum ? (
              <div className="space-y-4 py-4 flex-1 flex flex-col justify-between">
                
                {/* Visual Slide */}
                <div className={`h-64 rounded border border-neutral-200/40 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 shadow-xs ${MOCK_PAGES[carouselIndex].color}`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Sheet {carouselIndex + 1} of {MOCK_PAGES.length}</span>
                  <div className="text-center space-y-1.5">
                    <h4 className="text-base font-extrabold">{MOCK_PAGES[carouselIndex].title}</h4>
                    <p className="text-xs opacity-75">{MOCK_PAGES[carouselIndex].desc}</p>
                  </div>
                  <span className="text-[9px] italic opacity-60 text-right">R2R Layout Design v1.0</span>
                </div>

                {/* Carousel Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    disabled={carouselIndex === 0}
                    onClick={() => setCarouselIndex(carouselIndex - 1)}
                    className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded cursor-pointer disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-semibold text-neutral-600">Layout Sheet {carouselIndex + 1}</span>
                  <button
                    disabled={carouselIndex === MOCK_PAGES.length - 1}
                    onClick={() => setCarouselIndex(carouselIndex + 1)}
                    className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded cursor-pointer disabled:opacity-40"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                <Layers className="h-10 w-10 text-neutral-300 mb-2" />
                <h4 className="text-xs font-bold text-neutral-700">Album Design Pending</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">The editing team has not uploaded the drafted layout yet. Check back soon!</p>
              </div>
            )}

            {/* Approval Footer bar */}
            {activeAlbum && activeAlbum.status !== 'COMPLETED' && (
              <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleApproveAlbum}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded cursor-pointer shadow-xs transition duration-150"
                >
                  <UserCheck className="h-4.5 w-4.5" />
                  <span>Approve Design for Printing</span>
                </button>
              </div>
            )}
          </div>

          {/* Right panel: Downloads & Revisions Form */}
          <div className="space-y-4">
            
            {/* Download Hub */}
            <div className="glass-card p-5 rounded border border-neutral-200/50 space-y-4">
              <h4 className="font-bold text-xs uppercase text-neutral-500 tracking-wider">Download Center</h4>
              
              <div className="space-y-3 text-xs">
                {activeAlbum?.rawLink ? (
                  <a
                    href={activeAlbum.rawLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200/50 rounded hover:bg-neutral-100 transition"
                  >
                    <div>
                      <p className="font-bold text-neutral-800">RAW Deliverables Link</p>
                      <p className="text-[9px] text-neutral-400">Google Drive share folder</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-primary-500" />
                  </a>
                ) : (
                  <p className="text-[10px] text-neutral-400 italic">No RAW link shared yet.</p>
                )}

                {activeAlbum?.editedLink ? (
                  <a
                    href={activeAlbum.editedLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200/50 rounded hover:bg-neutral-100 transition"
                  >
                    <div>
                      <p className="font-bold text-neutral-800">Final High-Res Downloads</p>
                      <p className="text-[9px] text-neutral-400">Google Drive folder</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-primary-500" />
                  </a>
                ) : (
                  <p className="text-[10px] text-neutral-400 italic">No final download folder shared yet.</p>
                )}
              </div>
            </div>

            {/* Revision Request Form */}
            {activeAlbum && activeAlbum.status !== 'COMPLETED' && (
              <div className="glass-card p-5 rounded border border-neutral-200/50 space-y-3">
                <h4 className="font-bold text-xs uppercase text-neutral-500 tracking-wider">Request Changes / Revisions</h4>
                
                <form onSubmit={handleSubmitRevisions} className="space-y-3 text-xs">
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    variant="outlined"
                    value={revisionText}
                    onChange={(e) => setRevisionText(e.target.value)}
                    placeholder="Type sheet number and instructions (e.g. Page 3 skin smoothing)..."
                  />
                  
                  <button
                    type="submit"
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-900 text-white font-bold rounded cursor-pointer"
                  >
                    Submit Revision Request
                  </button>
                </form>
              </div>
            )}

            {/* Feedback box */}
            {activeAlbum && activeAlbum.status === 'COMPLETED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded text-emerald-800 text-xs flex items-start space-x-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Album Design Approved</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">The print layout has been sent to our production press. You will be notified when shipment delivery is ready.</p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
