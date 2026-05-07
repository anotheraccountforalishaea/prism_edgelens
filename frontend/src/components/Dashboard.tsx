import React from 'react';
import type { ScoredCandidate } from '../types/types';
import { ResultCard } from './ResultCard';

interface DashboardProps {
  candidates: ScoredCandidate[];
}

export const Dashboard: React.FC<DashboardProps> = ({ candidates }) => {
  const huggingfaceModels = candidates.filter(c => c.source === 'huggingface');
  const githubRepos = candidates.filter(c => c.source === 'github');
  const arxivPapers = candidates.filter(c => c.source === 'arxiv');

  const Column = ({ title, items, icon }: { title: string, items: ScoredCandidate[], icon: string }) => (
    <div style={{ flex: 1, minWidth: '300px' }}>
      <h2 style={{ 
        color: '#f9fafb', 
        borderBottom: '2px solid #374151', 
        paddingBottom: '12px', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>{icon}</span> {title}
        <span style={{ 
          marginLeft: 'auto', 
          backgroundColor: '#374151', 
          padding: '2px 8px', 
          borderRadius: '999px', 
          fontSize: '0.8rem' 
        }}>
          {items.length}
        </span>
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.length > 0 ? (
          items.map(candidate => (
            <ResultCard key={candidate.id} candidate={candidate} />
          ))
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>No candidates found.</p>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#111827',
      minHeight: '100vh',
      padding: '32px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          color: 'white', 
          marginBottom: '32px',
          background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          PRISM Results
        </h1>
        
        <div style={{ 
          display: 'flex', 
          gap: '32px', 
          flexWrap: 'wrap' 
        }}>
          <Column title="HuggingFace Models" items={huggingfaceModels} icon="🤗" />
          <Column title="GitHub Repos" items={githubRepos} icon="🐙" />
          <Column title="ArXiv Papers" items={arxivPapers} icon="📄" />
        </div>
      </div>
    </div>
  );
};
