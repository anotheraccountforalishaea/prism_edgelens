import React, { useState } from 'react';
import { getExplanation } from '../api/apiClient';

interface ExplainPopoverProps {
  candidateId: string;
}

export const ExplainPopover: React.FC<ExplainPopoverProps> = ({ candidateId }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleExplain = async () => {
    if (explanation) {
      setShow(!show);
      return;
    }

    setLoading(true);
    setShow(true);
    try {
      const data = await getExplanation(candidateId);
      setExplanation(data.explanation);
    } catch (err) {
      setExplanation("Failed to retrieve technical justification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleExplain}
        style={{
          background: 'none',
          border: '1px solid #334155',
          color: '#94a3b8',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#475569';
            e.currentTarget.style.color = '#f1f5f9';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#334155';
            e.currentTarget.style.color = '#94a3b8';
        }}
      >
        {loading ? 'Analyzing...' : 'Technical Rationale'}
      </button>

      {show && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          right: '0',
          marginBottom: '12px',
          width: '320px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          zIndex: 50,
          fontSize: '0.8125rem',
          color: '#cbd5e1',
          lineHeight: '1.6'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '8px', color: '#f1f5f9', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Technical Justification
          </div>
          {loading ? (
            <div style={{ color: '#475569' }}>Running inference engine...</div>
          ) : (
            <div>{explanation}</div>
          )}
          <button 
            onClick={() => setShow(false)}
            style={{
              marginTop: '12px',
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
