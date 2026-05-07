import React from 'react';
import type { ScoredCandidate } from '../types/types';
import { ResultCard } from './ResultCard';

interface DashboardProps {
  candidates: ScoredCandidate[];
  bookmarks: ScoredCandidate[];
  onToggleBookmark: (candidate: ScoredCandidate) => void;
  isOnlyBookmarks?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  candidates, 
  bookmarks, 
  onToggleBookmark,
  isOnlyBookmarks
}) => {
  const huggingfaceModels = candidates.filter(c => c.source === 'huggingface');
  const githubRepos = candidates.filter(c => c.source === 'github');
  const arxivPapers = candidates.filter(c => c.source === 'arxiv');

  const Column = ({ title, items }: { title: string, items: ScoredCandidate[] }) => (
    <div style={{ flex: 1, minWidth: '350px' }}>
      <div style={{ 
        borderBottom: '2px solid #334155', 
        paddingBottom: '16px', 
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{ 
          fontSize: '0.875rem', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          color: '#ffffff' 
        }}>
          {title}
        </h3>
        <span style={{ 
          backgroundColor: '#334155', 
          color: '#f1f5f9',
          padding: '2px 10px', 
          borderRadius: '12px', 
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          {items.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.length > 0 ? (
          items.map(candidate => (
            <ResultCard 
              key={candidate.id} 
              candidate={candidate} 
              isBookmarked={bookmarks.some(b => b.id === candidate.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))
        ) : (
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center', 
            border: '1px dashed #334155', 
            borderRadius: '12px',
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            {isOnlyBookmarks ? "No saved items in this category" : "No results discovered"}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff' }}>
          {isOnlyBookmarks ? "Saved Portfolio" : "Discovered Candidates"}
        </h2>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '32px', 
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>
        <Column title="HuggingFace / Models" items={huggingfaceModels} />
        <Column title="GitHub / Repositories" items={githubRepos} />
        <Column title="ArXiv / Research" items={arxivPapers} />
      </div>
    </div>
  );
};
