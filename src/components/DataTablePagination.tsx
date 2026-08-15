'use client';

import React from 'react';
import { TablePagination, Box } from '@mui/material';

interface DataTablePaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
}

export default function DataTablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
}: DataTablePaginationProps) {
  if (count === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderTop: '1px solid rgba(227, 236, 231, 0.6)',
        bgcolor: 'background.default',
        px: 1,
      }}
    >
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          if (onRowsPerPageChange) {
            onRowsPerPageChange(parseInt(e.target.value, 10));
            onPageChange(0);
          }
        }}
        rowsPerPageOptions={rowsPerPageOptions}
        sx={{
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: '0.74rem',
            color: 'text.secondary',
            m: 0,
          },
          '.MuiTablePagination-select': {
            fontSize: '0.74rem',
            py: 0.5,
          },
          '.MuiTablePagination-actions button': {
            p: 0.75,
          },
        }}
      />
    </Box>
  );
}
