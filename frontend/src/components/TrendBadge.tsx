import React from 'react';
import type { TrendDirection } from '../types/types';

interface TrendBadgeProps {
  direction: TrendDirection;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ direction }) => {
  let label = '';
  let color = '';
  let bgColor = '';

  switch (direction) {
    case 'rising':
      label = '🔥 Rising';
      color = '#ef4444'; // Red-orange
      bgColor = 'rgba(239, 68, 68, 0.15)';
      break;
    case 'stable':
      label = '→ Stable';
      color = '#3b82f6'; // Blue
      bgColor = 'rgba(59, 130, 246, 0.15)';
      break;
    case 'declining':
      label = '↓ Declining';
      color = '#9ca3af'; // Gray
      bgColor = 'rgba(156, 163, 175, 0.15)';
      break;
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: color,
      backgroundColor: bgColor,
      border: `1px solid ${color}`,
      whiteSpace: 'nowrap'
    }}>
      {label}
    </span>
  );
};
