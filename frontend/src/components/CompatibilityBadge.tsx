import React from 'react';
import type { CompatibilityLevel } from '../types/types';

interface CompatibilityBadgeProps {
  level: CompatibilityLevel;
}

export const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({ level }) => {
  const getStyles = () => {
    switch (level) {
      case 'compatible':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' };
      case 'partial':
        return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' };
      case 'incompatible':
        return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)' };
      default:
        return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)' };
    }
  };

  const { color, bg, border } = getStyles();

  return (
    <span style={{
      fontSize: '0.625rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: color,
      backgroundColor: bg,
      padding: '4px 8px',
      borderRadius: '4px',
      border: `1px solid ${border}`,
      display: 'inline-flex',
      alignItems: 'center'
    }}>
      {level.replace('-', ' ')}
    </span>
  );
};
