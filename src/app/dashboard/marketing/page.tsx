'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Box, Card, CardContent, Button, TextField, Typography,
  Stack, Switch, FormControlLabel, Divider, Paper, Chip, Avatar
} from '@mui/material';
import {
  Sparkles, Globe, Send, RefreshCw, Eye, CheckCircle2,
  Megaphone, Layout, Tag, ArrowUpRight, UserCheck, Calendar
} from 'lucide-react';

export default function ReceptionistMarketingStudio() {
  const router = useRouter();
  const { user, leads, fetchData } = useStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [marketingContent, setMarketingContent] = useState({
    heroBadge: 'Premium Wedding & Event Cinematography',
    heroTitle: 'Preserving Your Most Precious Love Stories',
    heroSubtitle: 'Welcome to R2R Studio. We craft timeless wedding films, candid portraits, pre-wedding concept shoots, and aerial drone cinematography with unmatched artistry.',
    promoBannerText: '✨ Special Season Offer: Book Your Wedding Cinematography Package & Get Complimentary Pre-Wedding Shoot!',
    promoBannerActive: true,
    ctaText: 'Request Custom Quote',
  });

  // Load existing live content & website leads
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/marketing/content').then((res) => res.json()),
      fetchData('leads'),
    ])
      .then(([contentData]) => {
        if (contentData && !contentData.error) {
          setMarketingContent({
            heroBadge: contentData.heroBadge || '',
            heroTitle: contentData.heroTitle || '',
            heroSubtitle: contentData.heroSubtitle || '',
            promoBannerText: contentData.promoBannerText || '',
            promoBannerActive: contentData.promoBannerActive ?? true,
            ctaText: contentData.ctaText || 'Request Custom Quote',
          });
        }
      })
      .catch((err) => toast('Failed to load live marketing content: ' + err, 'error'))
      .finally(() => setLoading(false));
  }, [fetchData, toast]);

  const websiteLeads = leads.filter((l) => l.source === 'WEBSITE');

  const handleSaveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/marketing/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marketingContent),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish content.');
      }

      toast('Marketing strategy and live website content published successfully!', 'success');
    } catch (err: any) {
      toast('Publishing error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animate: 'fadeIn' }}>
      
      {/* Top Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.25)',
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip
              icon={<Sparkles className="h-3.5 w-3.5 text-amber-300" />}
              label="Live Marketing CMS Engine"
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, backdropFilter: 'blur(10px)' }}
            />
            <Chip
              icon={<UserCheck className="h-3.5 w-3.5 text-emerald-300" />}
              label={`Role: ${user?.role || 'Receptionist'}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600 }}
            />
          </Stack>

          <Typography variant="h5" sx={{ fontWeight: 800, tracking: '-0.02em' }}>
            Receptionist Marketing Studio & Dynamic Content Engine
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, maxWidth: 650 }}>
            Create dynamic marketing strategies, edit hero headlines, post active campaign offers, and control what clients see live on your R2R Marketing Website.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => window.open('/marketing', '_blank')}
            startIcon={<Eye className="h-4 w-4" />}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Live Site Preview
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveAndPublish}
            disabled={saving}
            startIcon={<Send className="h-4 w-4" />}
            sx={{
              bgcolor: '#f59e0b',
              color: 'white',
              fontWeight: 700,
              '&:hover': { bgcolor: '#d97706' },
            }}
          >
            {saving ? 'Publishing Live...' : 'Publish Live Updates'}
          </Button>
        </Stack>
      </Paper>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Live Campaign Banner & Announcements */}
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ bgcolor: 'amber.50', color: 'amber.600', width: 36, height: 36 }}>
                    <Megaphone className="h-4 w-4" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Live Announcement & Promotional Ticker
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Displays at the top of the website for seasonal campaigns, discounts, or announcements.
                    </Typography>
                  </Box>
                </Stack>

                <FormControlLabel
                  control={
                    <Switch
                      checked={marketingContent.promoBannerActive}
                      onChange={(e) =>
                        setMarketingContent({ ...marketingContent, promoBannerActive: e.target.checked })
                      }
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 700, color: marketingContent.promoBannerActive ? 'success.main' : 'text.disabled' }}>
                      {marketingContent.promoBannerActive ? 'ACTIVE LIVE' : 'HIDDEN'}
                    </Typography>
                  }
                />
              </Stack>

              <TextField
                label="Promotional Announcement Text"
                fullWidth
                multiline
                rows={2}
                placeholder="e.g. ✨ Special Season Offer: Flat 20% Off on Booking Pre-Wedding Shoot!"
                value={marketingContent.promoBannerText || ''}
                onChange={(e) => setMarketingContent({ ...marketingContent, promoBannerText: e.target.value })}
                helperText="Keep message concise and attractive for visiting couples."
              />
            </CardContent>
          </Card>

          {/* Card 2: Main Hero Section Content Editor */}
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar sx={{ bgcolor: 'rose.50', color: 'rose.600', width: 36, height: 36 }}>
                  <Layout className="h-4 w-4" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Hero Section Headlines & Taglines
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Control the main title, highlight badge, and introduction paragraph on the marketing homepage.
                  </Typography>
                </Box>
              </Stack>

              <TextField
                label="Highlight Badge Text"
                fullWidth
                value={marketingContent.heroBadge}
                onChange={(e) => setMarketingContent({ ...marketingContent, heroBadge: e.target.value })}
                placeholder="e.g. Premium Wedding & Event Cinematography"
              />

              <TextField
                label="Main Hero Title"
                fullWidth
                value={marketingContent.heroTitle}
                onChange={(e) => setMarketingContent({ ...marketingContent, heroTitle: e.target.value })}
                placeholder="e.g. Preserving Your Most Precious Love Stories"
              />

              <TextField
                label="Hero Subtitle & Introduction"
                fullWidth
                multiline
                rows={3}
                value={marketingContent.heroSubtitle}
                onChange={(e) => setMarketingContent({ ...marketingContent, heroSubtitle: e.target.value })}
                placeholder="Brief paragraph describing studio services..."
              />

              <TextField
                label="Call to Action (Button Text)"
                fullWidth
                value={marketingContent.ctaText}
                onChange={(e) => setMarketingContent({ ...marketingContent, ctaText: e.target.value })}
                placeholder="e.g. Request Custom Quote"
              />

              <Box sx={{ pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSaveAndPublish}
                  disabled={saving}
                  startIcon={<Send className="h-4 w-4" />}
                  sx={{ borderRadius: 2.5, px: 4, py: 1.2, fontWeight: 700 }}
                >
                  {saving ? 'Publishing...' : 'Save & Publish Live'}
                </Button>
              </Box>

            </CardContent>
          </Card>

        </div>

        {/* Right Column: Analytics & Quick Links (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Real-time Website Lead Counter */}
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'amber.200', bgcolor: 'amber.50/30' }}>
            <CardContent sx={{ p: 3, spaceY: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'amber.700', textTransform: 'uppercase', tracking: 'wider' }}>
                Website Marketing Inquiries
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: 'neutral.900', my: 1 }}>
                {websiteLeads.length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Total online inquiries captured directly from the R2R marketing web form.
              </Typography>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.push('/dashboard/leads')}
                endIcon={<ArrowUpRight className="h-4 w-4" />}
                sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                View Website Leads
              </Button>
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Marketing Management Shortcuts
              </Typography>

              <Stack spacing={1}>
                <Button
                  variant="text"
                  fullWidth
                  justifyContent="flex-start"
                  onClick={() => router.push('/dashboard/packages')}
                  startIcon={<Tag className="h-4 w-4 text-amber-600" />}
                  sx={{ justifyContent: 'flex-start', color: 'text.primary', textTransform: 'none', fontWeight: 600 }}
                >
                  Manage Pricing Packages
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => router.push('/dashboard/events')}
                  startIcon={<Calendar className="h-4 w-4 text-rose-600" />}
                  sx={{ justifyContent: 'flex-start', color: 'text.primary', textTransform: 'none', fontWeight: 600 }}
                >
                  Manage Event Categories
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => window.open('/marketing/embed', '_blank')}
                  startIcon={<Globe className="h-4 w-4 text-indigo-600" />}
                  sx={{ justifyContent: 'flex-start', color: 'text.primary', textTransform: 'none', fontWeight: 600 }}
                >
                  View Embeddable Form Widget
                </Button>
              </Stack>
            </CardContent>
          </Card>

        </div>

      </div>

    </Box>
  );
}
