import React, { useState } from 'react';

interface InputFormProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <div style={{
      padding: '40px',
      background: 'rgba(31, 41, 55, 0.5)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      border: '1px solid rgba(75, 85, 99, 0.3)',
      maxWidth: '800px',
      margin: '40px auto',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      <h2 style={{ 
        color: 'white', 
        fontSize: '1.5rem', 
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        What are you building?
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., I need an object detection model for a Raspberry Pi 4 that works offline with less than 100ms latency..."
          style={{
            width: '100%',
            height: '150px',
            padding: '20px',
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: '16px',
            color: 'white',
            fontSize: '1rem',
            resize: 'none',
            outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#6366f1'}
          onBlur={(e) => e.target.style.borderColor = '#374151'}
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          style={{
            padding: '16px 32px',
            backgroundColor: isLoading ? '#4b5563' : '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s, background-color 0.2s',
            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
          }}
          onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#4f46e5')}
          onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#6366f1')}
          onMouseDown={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isLoading ? 'Analyzing Project...' : 'Generate EDGE_LENS Report'}
        </button>
      </form>
    </div>
  );
};
