import React from 'react';

interface ScoreBarProps {
  label: string;
  score: number;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ label, score }) => {
  // Use a subtle professional green/blue gradient based on score
  const getBarColor = (s: number) => {
    if (s >= 70) return '#10b981'; // Professional Emerald
    if (s >= 40) return '#3b82f6'; // Professional Blue
    return '#64748b'; // Professional Slate
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', color: '#94a3b8' }}>
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div style={{ width: '100%', height: '4px', backgroundColor: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
        <div 
          style={{ 
            width: `${score}%`, 
            height: '100%', 
            backgroundColor: getBarColor(score),
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }} 
        />
      </div>
    </div>
  );
};
