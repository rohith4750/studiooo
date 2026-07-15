'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useToast } from '@/components/ToastProvider';
import {
  Box, Grid, Card, CardContent, Button, TextField, Typography,
  MenuItem, Select, InputLabel, FormControl, Stack, Divider
} from '@mui/material';
import { Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

const EXPENSE_CATEGORIES = ['FUEL', 'SALARY', 'PRINTING', 'EQUIPMENT', 'MARKETING', 'FOOD', 'MISCELLANEOUS'];

export default function ExpenseCreatePage() {
  const router = useRouter();
  const { createRecord } = useStore();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [formCategory, setFormCategory] = useState('FUEL');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || parseFloat(formAmount) <= 0) { toast('Amount must be greater than zero', 'error'); return; }
    setSaving(true);
    try {
      await createRecord('expenses', {
        category: formCategory, amount: parseFloat(formAmount),
        description: formDescription, date: formDate || new Date().toISOString().slice(0, 10),
      });
      toast('Expense bill logged successfully!', 'success');
      router.push('/dashboard/expenses');
    } catch (err) {
      toast('Failed to log expense: ' + err, 'error');
    } finally { setSaving(false); }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>Log Expense Bill</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Record studio bills, fuel charges, and operational costs.</Typography>
        </div>
        <Button 
          variant="outlined" 
          startIcon={<ArrowLeft className="h-4 w-4" />} 
          onClick={() => router.push('/dashboard/expenses')}
          sx={{ py: 1, px: 2 }}
        >
          Back
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Sparkles className="h-5 w-5 text-primary-500 animate-pulse" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Expense Receipt Details</Typography>
            </Stack>
            <Divider />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Expense Category</InputLabel>
                  <Select value={formCategory} label="Expense Category" onChange={(e) => setFormCategory(e.target.value)}>
                    {EXPENSE_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Bill Amount (₹) *" required type="number" fullWidth size="small" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="e.g. 1500" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Bill Date *" type="date" required fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Bill Description *" required fullWidth size="small" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="e.g. Fuel charges for Bangalore shoot" />
              </Grid>
            </Grid>
            <Divider />
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="secondary" onClick={() => router.push('/dashboard/expenses')}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={saving} startIcon={<CheckCircle2 className="h-4.5 w-4.5" />}>
                {saving ? 'Saving...' : 'Log Expense'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
