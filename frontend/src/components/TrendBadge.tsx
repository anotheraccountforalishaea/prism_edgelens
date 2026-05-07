import React from 'react';
import type { TrendDirection } from '../types/types';

interface TrendBadgeProps {
  direction: TrendDirection;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ direction }) => {
  const getStyles = () => {
    switch (direction) {
      case 'rising':
        return { color: '#10b981', label: 'Market Uptrend' };
      case 'stable':
        return { color: '#3b82f6', label: 'Market Stable' };
      case 'declining':
        return { color: '#64748b', label: 'Market Downtrend' };
      default:
        return { color: '#64748b', label: 'Market Neutral' };
    }
  };

  const { color, label } = getStyles();

  return (
    <span style={{
      fontSize: '0.625rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: color }}></div>
      {label}
    </span>
  );
};
