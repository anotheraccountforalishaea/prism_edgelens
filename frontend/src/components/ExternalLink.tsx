import React from 'react';
import type { SourceType } from '../types/types';

interface ExternalLinkProps {
  url: string;
  source: SourceType;
}

export const ExternalLink: React.FC<ExternalLinkProps> = ({ url, source }) => {
  let label = 'View';
  
  if (source === 'huggingface') {
    label = 'View on HuggingFace';
  } else if (source === 'github') {
    label = 'View on GitHub';
  } else if (source === 'arxiv') {
    label = 'Read Paper';
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        display: 'inline-block',
        padding: '6px 12px',
        backgroundColor: '#4f46e5',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: 500,
        transition: 'background-color 0.2s',
        marginTop: '12px'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
    >
      {label}
    </a>
  );
};
