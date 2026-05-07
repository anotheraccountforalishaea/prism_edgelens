import React from 'react';

interface ExternalLinkProps {
  url: string;
  source: string;
}

export const ExternalLink: React.FC<ExternalLinkProps> = ({ url }) => {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 12px',
        backgroundColor: '#334155',
        color: '#ffffff',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'background-color 0.2s ease',
        border: '1px solid #475569'
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#475569'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#334155'}
    >
      Open Source
    </a>
  );
};
