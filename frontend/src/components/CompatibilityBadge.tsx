import React from 'react';
import type { CompatibilityLevel } from '../types/types';

interface CompatibilityBadgeProps {
  level: CompatibilityLevel;
}

export const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({ level }) => {
  let label = '';
  let color = '';
  let bgColor = '';

  switch (level) {
    case 'compatible':
      label = '✅ Compatible';
      color = '#10b981';
      bgColor = 'rgba(16, 185, 129, 0.15)';
      break;
    case 'partial':
      label = '⚠️ Partial';
      color = '#f59e0b';
      bgColor = 'rgba(245, 158, 11, 0.15)';
      break;
    case 'incompatible':
      label = '❌ Incompatible';
      color = '#ef4444';
      bgColor = 'rgba(239, 68, 68, 0.15)';
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
