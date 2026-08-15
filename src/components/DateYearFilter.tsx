'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Box, Paper, FormControl, Select, MenuItem, 
  Chip, Button, Typography, Stack, InputAdornment, Tooltip,
  Popover, Grid, IconButton
} from '@mui/material';
import { Calendar, Filter, RotateCcw, Sparkles, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface DateYearFilterState {
  year: string; // 'ALL' | '2026' | '2025'
  month: string; // 'ALL' | '01' .. '12'
  exactDate: string; // YYYY-MM-DD
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
  exactDate: '',
  startDate: '',
  endDate: '',
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_OPTIONS = [
  { value: 'ALL', label: 'All Months' },
  ...MONTH_NAMES.map((name, i) => ({
    value: (i + 1) < 10 ? `0${i + 1}` : `${i + 1}`,
    label: name
  }))
];

export const YEAR_OPTIONS = [
  { value: 'ALL', label: 'All Years' },
  { value: '2026', label: 'Year 2026' },
  { value: '2025', label: 'Year 2025' },
  { value: '2024', label: 'Year 2024' },
];

/* Custom Material UI Calendar Date Picker Component */
function MuiDatePickerButton({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0 - 11

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleSelectDay = (day: number) => {
    const mStr = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
    const dStr = day < 10 ? `0${day}` : `${day}`;
    onChange(`${year}-${mStr}-${dStr}`);
    setAnchorEl(null);
  };

  const handleClear = () => {
    onChange('');
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={<Calendar className="h-3.5 w-3.5 text-amber-600" />}
        endIcon={value ? <X className="h-3 w-3 text-neutral-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); onChange(''); }} /> : null}
        sx={{
          borderRadius: 2,
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'none',
          bgcolor: value ? 'amber.50' : 'neutral.50',
          borderColor: value ? '#c5963b' : 'divider',
          color: value ? '#8c4e1e' : 'text.secondary',
          py: 0.8,
          px: 1.5,
          boxShadow: 'none',
          '&:hover': {
            borderColor: '#c5963b',
            bgcolor: 'amber.50',
          },
        }}
      >
        {value ? `${label}: ${value}` : label}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { p: 2, borderRadius: 3, width: 280, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' },
          },
        }}
      >
        {/* MUI Calendar Header */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <IconButton size="small" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {MONTH_NAMES[month]} {year}
          </Typography>
          <IconButton size="small" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </Stack>

        {/* Day of Week Header */}
        <Grid container spacing={0.5} sx={{ textAlign: 'center', mb: 0.5 }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <Grid key={d} size={{ xs: 1.71 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.65rem' }}>
                {d}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Days Grid */}
        <Grid container spacing={0.5} sx={{ textAlign: 'center' }}>
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <Grid key={`empty-${i}`} size={{ xs: 1.71 }} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const mStr = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
            const dStr = day < 10 ? `0${day}` : `${day}`;
            const isSelected = value === `${year}-${mStr}-${dStr}`;

            return (
              <Grid key={day} size={{ xs: 1.71 }}>
                <Button
                  size="small"
                  onClick={() => handleSelectDay(day)}
                  sx={{
                    minWidth: 0,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    p: 0,
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    bgcolor: isSelected ? '#c5963b' : 'transparent',
                    color: isSelected ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: isSelected ? '#b3842c' : 'action.hover',
                    },
                  }}
                >
                  {day}
                </Button>
              </Grid>
            );
          })}
        </Grid>

        {/* Footer Actions */}
        <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider', mt: 1.5 }}>
          <Button size="small" color="inherit" onClick={handleClear} sx={{ fontSize: '0.7rem' }}>
            Clear
          </Button>
          <Button size="small" variant="contained" color="primary" onClick={() => setAnchorEl(null)} sx={{ fontSize: '0.7rem', fontWeight: 700 }}>
            Done
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

export default function DateYearFilter({
  filter,
  onChange,
  className = '',
  showPresets = true,
}: DateYearFilterProps) {
  // Subscribe to store collections to compute Dynamic Peak Day across real records
  const bookings = useStore((state) => state.bookings);
  const bookingEvents = useStore((state) => state.bookingEvents);
  const leads = useStore((state) => state.leads);

  // Dynamic Today calculation
  const todayDateObj = new Date();
  const todayYearStr = String(todayDateObj.getFullYear());
  const todayMonthStr = String(todayDateObj.getMonth() + 1).padStart(2, '0');
  const todayDayStr = String(todayDateObj.getDate()).padStart(2, '0');
  const todayStr = `${todayYearStr}-${todayMonthStr}-${todayDayStr}`;
  const todayDisplayLabel = `Today (${MONTH_NAMES[todayDateObj.getMonth()].substring(0, 3)} ${todayDateObj.getDate()})`;

  // Calculate Peak Day dynamically based on actual order / event frequency in database
  const peakDayInfo = useMemo(() => {
    const counts: Record<string, number> = {};

    const addCount = (dateVal: string | null | undefined) => {
      if (!dateVal || dateVal.length < 10) return;
      const d = dateVal.substring(0, 10);
      counts[d] = (counts[d] || 0) + 1;
    };

    bookings.forEach((b: any) => {
      addCount(b.createdAt);
      if (Array.isArray(b.bookingEvents)) {
        b.bookingEvents.forEach((be: any) => addCount(be.eventDate));
      }
    });

    bookingEvents.forEach((be: any) => addCount(be.eventDate));
    leads.forEach((l: any) => addCount(l.eventDate));

    let topDate = '';
    let maxCount = 0;

    Object.entries(counts).forEach(([date, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topDate = date;
      }
    });

    if (!topDate || maxCount === 0) return null;

    const parts = topDate.split('-').map(Number);
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const monthName = MONTH_NAMES[dateObj.getMonth()].substring(0, 3);
    const day = dateObj.getDate();

    return {
      date: topDate, // "YYYY-MM-DD"
      year: topDate.substring(0, 4),
      month: topDate.substring(5, 7),
      label: `★ ${monthName} ${day} (Peak Day: ${maxCount} ${maxCount === 1 ? 'event' : 'events'})`,
      count: maxCount,
    };
  }, [bookings, bookingEvents, leads]);

  const handleYearChange = (year: string) => {
    onChange({ ...filter, year, exactDate: '', startDate: '', endDate: '' });
  };

  const handleMonthChange = (month: string) => {
    onChange({ ...filter, month, exactDate: '', startDate: '', endDate: '' });
  };

  const handleExactDateChange = (exactDate: string) => {
    onChange({ ...filter, exactDate, startDate: '', endDate: '' });
  };

  const handleStartDateChange = (startDate: string) => {
    onChange({ ...filter, startDate, exactDate: '' });
  };

  const handleEndDateChange = (endDate: string) => {
    onChange({ ...filter, endDate, exactDate: '' });
  };

  const handleReset = () => {
    onChange({
      year: 'ALL',
      month: 'ALL',
      exactDate: '',
      startDate: '',
      endDate: '',
    });
  };

  const applyPreset = (preset: 'ALL' | 'TODAY' | 'CURRENT_MONTH' | 'PEAK_DAY' | 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
    if (preset === 'ALL') {
      onChange({ year: 'ALL', month: 'ALL', exactDate: '', startDate: '', endDate: '' });
    } else if (preset === 'TODAY') {
      onChange({ year: todayYearStr, month: todayMonthStr, exactDate: todayStr, startDate: '', endDate: '' });
    } else if (preset === 'CURRENT_MONTH') {
      onChange({ year: todayYearStr, month: todayMonthStr, exactDate: '', startDate: '', endDate: '' });
    } else if (preset === 'PEAK_DAY') {
      if (peakDayInfo) {
        onChange({ year: peakDayInfo.year, month: peakDayInfo.month, exactDate: peakDayInfo.date, startDate: '', endDate: '' });
      }
    } else if (preset === 'Q1') {
      onChange({ year: todayYearStr, month: 'ALL', exactDate: '', startDate: `${todayYearStr}-01-01`, endDate: `${todayYearStr}-03-31` });
    } else if (preset === 'Q2') {
      onChange({ year: todayYearStr, month: 'ALL', exactDate: '', startDate: `${todayYearStr}-04-01`, endDate: `${todayYearStr}-06-30` });
    } else if (preset === 'Q3') {
      onChange({ year: todayYearStr, month: 'ALL', exactDate: '', startDate: `${todayYearStr}-07-01`, endDate: `${todayYearStr}-09-30` });
    } else if (preset === 'Q4') {
      onChange({ year: todayYearStr, month: 'ALL', exactDate: '', startDate: `${todayYearStr}-10-01`, endDate: `${todayYearStr}-12-31` });
    }
  };

  const hasActiveFilters = 
    filter.year !== 'ALL' || 
    filter.month !== 'ALL' || 
    (filter.exactDate && filter.exactDate !== '') || 
    (filter.startDate && filter.startDate !== '') || 
    (filter.endDate && filter.endDate !== '');

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
              Material UI Date & Period Filters
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

            {/* Custom MUI Date Picker: Exact Date */}
            <MuiDatePickerButton
              label="Exact Date"
              value={filter.exactDate || ''}
              onChange={handleExactDateChange}
            />

            {/* Custom MUI Date Picker: From Date */}
            <MuiDatePickerButton
              label="From Date"
              value={filter.startDate || ''}
              onChange={handleStartDateChange}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              →
            </Typography>

            {/* Custom MUI Date Picker: To Date */}
            <MuiDatePickerButton
              label="To Date"
              value={filter.endDate || ''}
              onChange={handleEndDateChange}
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
              color={filter.year === 'ALL' && filter.month === 'ALL' && !filter.exactDate && !filter.startDate ? 'primary' : 'default'}
              variant={filter.year === 'ALL' && filter.month === 'ALL' && !filter.exactDate && !filter.startDate ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600, cursor: 'pointer' }}
            />

            <Chip
              icon={<Clock className="h-3 w-3" />}
              label={todayDisplayLabel}
              size="small"
              onClick={() => applyPreset('TODAY')}
              color={filter.exactDate === todayStr ? 'info' : 'default'}
              variant={filter.exactDate === todayStr ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600, cursor: 'pointer' }}
            />

            <Chip
              label={`${MONTH_NAMES[todayDateObj.getMonth()]} ${todayYearStr}`}
              size="small"
              onClick={() => applyPreset('CURRENT_MONTH')}
              color={filter.year === todayYearStr && filter.month === todayMonthStr && !filter.exactDate && !filter.startDate ? 'primary' : 'default'}
              variant={filter.year === todayYearStr && filter.month === todayMonthStr && !filter.exactDate && !filter.startDate ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600, cursor: 'pointer' }}
            />

            {/* Dynamic Peak Day Chip: Only renders when peak date data exists */}
            {peakDayInfo && (
              <Chip
                icon={<Sparkles className="h-3 w-3" />}
                label={peakDayInfo.label}
                size="small"
                onClick={() => applyPreset('PEAK_DAY')}
                color={filter.exactDate === peakDayInfo.date ? 'warning' : 'default'}
                variant={filter.exactDate === peakDayInfo.date ? 'filled' : 'outlined'}
                sx={{ fontSize: '0.7rem', height: 24, fontWeight: 700, cursor: 'pointer' }}
              />
            )}

            <Chip
              label={`Q1 ${todayYearStr}`}
              size="small"
              onClick={() => applyPreset('Q1')}
              color={filter.startDate === `${todayYearStr}-01-01` && filter.endDate === `${todayYearStr}-03-31` ? 'primary' : 'default'}
              variant={filter.startDate === `${todayYearStr}-01-01` && filter.endDate === `${todayYearStr}-03-31` ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600, cursor: 'pointer' }}
            />

            <Chip
              label={`Q2 ${todayYearStr}`}
              size="small"
              onClick={() => applyPreset('Q2')}
              color={filter.startDate === `${todayYearStr}-04-01` && filter.endDate === `${todayYearStr}-06-30` ? 'primary' : 'default'}
              variant={filter.startDate === `${todayYearStr}-04-01` && filter.endDate === `${todayYearStr}-06-30` ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600, cursor: 'pointer' }}
            />

            <Chip
              label={`Q3 ${todayYearStr} (Jul-Sep)`}
              size="small"
              onClick={() => applyPreset('Q3')}
              color={filter.startDate === `${todayYearStr}-07-01` && filter.endDate === `${todayYearStr}-09-30` ? 'primary' : 'default'}
              variant={filter.startDate === `${todayYearStr}-07-01` && filter.endDate === `${todayYearStr}-09-30` ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600, cursor: 'pointer' }}
            />

            <Chip
              label={`Q4 ${todayYearStr}`}
              size="small"
              onClick={() => applyPreset('Q4')}
              color={filter.startDate === `${todayYearStr}-10-01` && filter.endDate === `${todayYearStr}-12-31` ? 'primary' : 'default'}
              variant={filter.startDate === `${todayYearStr}-10-01` && filter.endDate === `${todayYearStr}-12-31` ? 'filled' : 'outlined'}
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

  // Exact Single Date Filter
  if (filter.exactDate && filter.exactDate !== '') {
    return formattedDate === filter.exactDate;
  }
  
  // Date Range Filter
  if (filter.startDate && formattedDate < filter.startDate) {
    return false;
  }
  if (filter.endDate && formattedDate > filter.endDate) {
    return false;
  }

  // Year Filter
  if (filter.year !== 'ALL') {
    const itemYear = formattedDate.substring(0, 4);
    if (itemYear !== filter.year) return false;
  }

  // Month Filter
  if (filter.month !== 'ALL') {
    const itemMonth = formattedDate.substring(5, 7);
    if (itemMonth !== filter.month) return false;
  }

  return true;
}
