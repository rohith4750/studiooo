'use client';

import React from 'react';
import { 
  Box, Paper, FormControl, Select, MenuItem, TextField, 
  Chip, Button, Typography, Stack, InputAdornment 
} from '@mui/material';
import { Calendar, Filter, RotateCcw, Sparkles } from 'lucide-react';

export interface DateYearFilterState {
  year: string; // 'ALL' | '2026' | '2025'
  month: string; // 'ALL' | '01' .. '12'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

interface DateYearFilterProps {
  filter: DateYearFilterState;
  onChange: (newFilter: DateYearFilterState) => void;
  className?: string;
  showPresets?: boolean;
}

export const initialDateYearFilterState: DateYearFilterState = {
  year: '2026',
  month: 'ALL',
  startDate: '',
  endDate: '',
};

export const MONTH_OPTIONS = [
  { value: 'ALL', label: 'All Months' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export const YEAR_OPTIONS = [
  { value: 'ALL', label: 'All Years' },
  { value: '2026', label: 'Year 2026' },
  { value: '2025', label: 'Year 2025' },
  { value: '2024', label: 'Year 2024' },
];

export default function DateYearFilter({
  filter,
  onChange,
  className = '',
  showPresets = true,
}: DateYearFilterProps) {
  const handleYearChange = (year: string) => {
    onChange({ ...filter, year, startDate: '', endDate: '' });
  };

  const handleMonthChange = (month: string) => {
    onChange({ ...filter, month, startDate: '', endDate: '' });
  };

  const handleStartDateChange = (startDate: string) => {
    onChange({ ...filter, startDate });
  };

  const handleEndDateChange = (endDate: string) => {
    onChange({ ...filter, endDate });
  };

  const handleReset = () => {
    onChange({
      year: 'ALL',
      month: 'ALL',
      startDate: '',
      endDate: '',
    });
  };

  const applyPreset = (preset: 'ALL' | 'AUG_2026' | 'AUG_27' | 'Q3_2026') => {
    if (preset === 'ALL') {
      onChange({ year: 'ALL', month: 'ALL', startDate: '', endDate: '' });
    } else if (preset === 'AUG_2026') {
      onChange({ year: '2026', month: '08', startDate: '', endDate: '' });
    } else if (preset === 'AUG_27') {
      onChange({ year: '2026', month: '08', startDate: '2026-08-27', endDate: '2026-08-27' });
    } else if (preset === 'Q3_2026') {
      onChange({ year: '2026', month: 'ALL', startDate: '2026-07-01', endDate: '2026-09-30' });
    }
  };

  const hasActiveFilters = filter.year !== 'ALL' || filter.month !== 'ALL' || filter.startDate !== '' || filter.endDate !== '';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      className={className}
    >
      <Stack spacing={1.5}>
        
        {/* Top Control Bar */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
          
          {/* Section Title */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                p: 0.8,
                borderRadius: 1.5,
                bgcolor: 'amber.50',
                color: '#c5963b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Filter className="h-4 w-4" />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.825rem' }}>
              Period & Date Filters
            </Typography>
          </Stack>

          {/* MUI Filter Controls */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            
            {/* Year Dropdown (MUI Select) */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filter.year}
                onChange={(e) => handleYearChange(e.target.value as string)}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <Calendar className="h-3.5 w-3.5 text-amber-600" />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: 'neutral.50',
                  '& .MuiSelect-select': { py: 0.8, pl: 0.5 },
                }}
              >
                {YEAR_OPTIONS.map((y) => (
                  <MenuItem key={y.value} value={y.value} sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    {y.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Month Dropdown (MUI Select) */}
            <FormControl size="small" sx={{ minWidth: 125 }}>
              <Select
                value={filter.month}
                onChange={(e) => handleMonthChange(e.target.value as string)}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: 'neutral.50',
                  '& .MuiSelect-select': { py: 0.8 },
                }}
              >
                {MONTH_OPTIONS.map((m) => (
                  <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Start Date Picker (MUI TextField) */}
            <TextField
              size="small"
              type="date"
              value={filter.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              placeholder="Start Date"
              sx={{
                width: 140,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  bgcolor: 'neutral.50',
                },
                '& input': { py: 0.8, px: 1 },
              }}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              →
            </Typography>

            {/* End Date Picker (MUI TextField) */}
            <TextField
              size="small"
              type="date"
              value={filter.endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              placeholder="End Date"
              sx={{
                width: 140,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  bgcolor: 'neutral.50',
                },
                '& input': { py: 0.8, px: 1 },
              }}
            />

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={handleReset}
                startIcon={<RotateCcw className="h-3.5 w-3.5" />}
                sx={{
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  py: 0.7,
                  px: 1.5,
                }}
              >
                Reset
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Quick Select Presets (MUI Chips) */}
        {showPresets && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.8, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', mr: 0.5 }}>
              Quick Select:
            </Typography>

            <Chip
              label="All Time"
              size="small"
              onClick={() => applyPreset('ALL')}
              color={filter.year === 'ALL' && filter.month === 'ALL' && !filter.startDate ? 'primary' : 'default'}
              variant={filter.year === 'ALL' && filter.month === 'ALL' && !filter.startDate ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600, cursor: 'pointer' }}
            />

            <Chip
              label="August 2026"
              size="small"
              onClick={() => applyPreset('AUG_2026')}
              color={filter.year === '2026' && filter.month === '08' && !filter.startDate ? 'primary' : 'default'}
              variant={filter.year === '2026' && filter.month === '08' && !filter.startDate ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600, cursor: 'pointer' }}
            />

            <Chip
              icon={<Sparkles className="h-3 w-3" />}
              label="August 27 (Peak Day)"
              size="small"
              onClick={() => applyPreset('AUG_27')}
              color={filter.startDate === '2026-08-27' ? 'warning' : 'default'}
              variant={filter.startDate === '2026-08-27' ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem', height: 24, fontWeight: 700, cursor: 'pointer' }}
            />

            <Chip
              label="Q3 2026 (Jul-Sep)"
              size="small"
              onClick={() => applyPreset('Q3_2026')}
              color={filter.startDate === '2026-07-01' && filter.endDate === '2026-09-30' ? 'primary' : 'default'}
              variant={filter.startDate === '2026-07-01' && filter.endDate === '2026-09-30' ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600, cursor: 'pointer' }}
            />
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

// Utility function to check if a date string matches current DateYearFilterState
export function matchesDateFilter(dateStr: string | null | undefined, filter: DateYearFilterState): boolean {
  if (!dateStr) return true;
  
  // Format target date: "YYYY-MM-DD"
  const formattedDate = dateStr.substring(0, 10);
  
  if (filter.startDate && formattedDate < filter.startDate) {
    return false;
  }
  if (filter.endDate && formattedDate > filter.endDate) {
    return false;
  }

  if (filter.year !== 'ALL') {
    const itemYear = formattedDate.substring(0, 4);
    if (itemYear !== filter.year) return false;
  }

  if (filter.month !== 'ALL') {
    const itemMonth = formattedDate.substring(5, 7);
    if (itemMonth !== filter.month) return false;
  }

  return true;
}
