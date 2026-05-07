import React, { useState } from 'react';

interface InputFormProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      <div style={{ position: 'relative' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Specify project requirements, hardware constraints, and technical goals..."
          style={{
            width: '100%',
            minHeight: '160px',
            padding: '24px',
            backgroundColor: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '1rem',
            lineHeight: '1.6',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            fontFamily: 'inherit'
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = '#334155';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        style={{
          padding: '16px 32px',
          backgroundColor: isLoading ? '#334155' : '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          alignSelf: 'center',
          minWidth: '240px',
          transition: 'all 0.2s ease'
        }}
      >
        {isLoading ? 'Processing Analysis...' : 'Initiate Intelligence Matrix'}
      </button>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Discovery Depth</p>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>150+ Candidates</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Analysis Engine</p>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>OpenClaw v2.1</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Search Mode</p>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Multi-Keyword OR</p>
        </div>
      </div>
    </form>
  );
};
