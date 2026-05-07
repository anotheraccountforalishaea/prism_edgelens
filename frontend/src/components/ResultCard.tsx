import React from 'react';
import type { ScoredCandidate } from '../types/types';
import { ScoreBar } from './ScoreBar';
import { TrendBadge } from './TrendBadge';
import { CompatibilityBadge } from './CompatibilityBadge';
import { ExternalLink } from './ExternalLink';
import { ExplainPopover } from './ExplainPopover';

interface ResultCardProps {
  candidate: ScoredCandidate;
}

export const ResultCard: React.FC<ResultCardProps> = ({ candidate }) => {
  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      border: '1px solid #374151',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#f3f4f6' }}>{candidate.name}</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <TrendBadge direction={candidate.trendDirection} />
            <CompatibilityBadge level={candidate.compatibility} />
          </div>
        </div>
        <div style={{ fontSize: '1.5rem' }}>
          {candidate.source === 'huggingface' ? '🤗' : candidate.source === 'github' ? '🐙' : '📄'}
        </div>
      </div>

      <p style={{ margin: '0', fontSize: '0.9rem', color: '#9ca3af', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {candidate.description}
      </p>

      <div style={{ marginTop: '4px' }}>
        <ScoreBar label="Match" score={candidate.matchScore} />
        <ScoreBar label="Feasibility" score={candidate.feasibilityScore} />
        <ScoreBar label="Confidence" score={candidate.confidenceScore} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ExternalLink url={candidate.url} source={candidate.source} />
        <ExplainPopover candidateId={candidate.id} />
      </div>
    </div>
  );
};
