import React from 'react';

interface ScoreBarProps {
  label: string;
  score: number;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ label, score }) => {
  const getColor = (s: number) => {
    if (s >= 75) return '#10b981'; // Green
    if (s >= 40) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#e5e7eb' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 'bold' }}>{score}/100</span>
      </div>
      <div style={{ width: '100%', backgroundColor: '#374151', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${score}%`,
            backgroundColor: getColor(score),
            transition: 'width 1s ease-in-out',
            borderRadius: '999px',
          }}
        />
      </div>
    </div>
  );
};
