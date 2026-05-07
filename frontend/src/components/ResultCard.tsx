import React from 'react';
import type { ScoredCandidate } from '../types/types';
import { ScoreBar } from './ScoreBar';
import { TrendBadge } from './TrendBadge';
import { CompatibilityBadge } from './CompatibilityBadge';
import { ExternalLink } from './ExternalLink';
import { ExplainPopover } from './ExplainPopover';

interface ResultCardProps {
  candidate: ScoredCandidate;
  isBookmarked: boolean;
  onToggleBookmark: (candidate: ScoredCandidate) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  candidate, 
  isBookmarked, 
  onToggleBookmark 
}) => {
  return (
    <div style={{
      backgroundColor: '#1e293b',
      borderRadius: '8px',
      padding: '20px',
      border: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative',
      transition: 'border-color 0.2s ease',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#475569'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, paddingRight: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ 
              fontSize: '0.625rem', 
              fontWeight: '800', 
              textTransform: 'uppercase', 
              color: '#3b82f6', 
              padding: '2px 6px', 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: '4px',
              letterSpacing: '0.05em'
            }}>
              {candidate.source}
            </span>
            <TrendBadge direction={candidate.trendDirection} />
          </div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600', color: '#f8fafc' }}>
            {candidate.name}
          </h3>
        </div>
        <button
          onClick={() => onToggleBookmark(candidate)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '4px',
            color: isBookmarked ? '#3b82f6' : '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isBookmarked ? '★' : '☆'}
        </button>
      </div>

      <p style={{ 
        margin: '0', 
        fontSize: '0.875rem', 
        color: '#94a3b8', 
        lineHeight: '1.5',
        display: '-webkit-box', 
        WebkitLineClamp: 3, 
        WebkitBoxOrient: 'vertical', 
        overflow: 'hidden' 
      }}>
        {candidate.description}
      </p>

      <div style={{ 
        padding: '12px', 
        backgroundColor: 'rgba(15, 23, 42, 0.5)', 
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <ScoreBar label="Match Alignment" score={candidate.matchScore} />
        <ScoreBar label="Hardware Feasibility" score={candidate.feasibilityScore} />
        <ScoreBar label="Market Confidence" score={candidate.confidenceScore} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <CompatibilityBadge level={candidate.compatibility} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <ExplainPopover candidateId={candidate.id} />
          <ExternalLink url={candidate.url} source={candidate.source} />
        </div>
      </div>

      <details style={{ fontSize: '0.75rem' }}>
        <summary style={{ cursor: 'pointer', color: '#475569', userSelect: 'none', fontWeight: '600' }}>
          Technical Validation
        </summary>
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {candidate.passedChecks?.map((p, i) => (
            <div key={`pass-${i}`} style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
              {p}
            </div>
          ))}
          {candidate.failedChecks?.map((f, i) => (
            <div key={`fail-${i}`} style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#475569' }}></div>
              {f}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};
