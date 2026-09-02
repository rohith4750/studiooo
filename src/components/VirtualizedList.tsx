'use client';

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Box, Typography } from '@mui/material';

interface VirtualizedListProps<T> {
  items: T[];
  estimateSize?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string | React.ReactNode;
  maxHeight?: number | string;
  overscan?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualizedList<T>({
  items,
  estimateSize = 115,
  renderItem,
  emptyMessage = 'No items found',
  maxHeight = 420,
  overscan = 5,
  getItemKey,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  if (items.length === 0) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        {typeof emptyMessage === 'string' ? (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center' }}>
            {emptyMessage}
          </Typography>
        ) : (
          emptyMessage
        )}
      </Box>
    );
  }

  return (
    <Box
      ref={parentRef}
      sx={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: maxHeight,
        position: 'relative',
        contain: 'strict',
        '&::-webkit-scrollbar': { width: 5 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 1 },
      }}
    >
      <Box
        sx={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow: any) => {
          const item = items[virtualRow.index];
          const key = getItemKey ? getItemKey(item, virtualRow.index) : virtualRow.index;

          return (
            <Box
              key={key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                pb: 1.5,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default VirtualizedList;
