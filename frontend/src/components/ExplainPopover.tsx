import React, { useState } from 'react';
import { getExplanation } from '../api/apiClient';

interface ExplainPopoverProps {
  candidateId: string;
}

export const ExplainPopover: React.FC<ExplainPopoverProps> = ({ candidateId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = async () => {
    setIsOpen(!isOpen);

    if (isOpen || explanation || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Calls P1's API Client Endpoint
      const data = await getExplanation(candidateId);
      setExplanation(data.explanation);
    } catch (err) {
      console.error(err);
      setError('Could not load explanation. Make sure Ollama is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: '8px' }}>
      <button
        onClick={fetchExplanation}
        style={{
          padding: '6px 12px',
          backgroundColor: '#374151',
          color: '#e5e7eb',
          border: '1px solid #4b5563',
          borderRadius: '6px',
          fontSize: '0.85rem',
          cursor: 'pointer',
          marginTop: '12px',
          fontWeight: 500
        }}
      >
        Why?
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          width: '250px',
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          color: '#d1d5db',
          fontSize: '0.85rem',
          lineHeight: 1.4
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '8px' }}>Loading...</div>
          ) : error ? (
            <div style={{ color: '#ef4444' }}>{error}</div>
          ) : (
            <div>{explanation}</div>
          )}

          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '6px',
            borderStyle: 'solid',
            borderColor: '#1f2937 transparent transparent transparent'
          }} />
        </div>
      )}
    </div>
  );
};
