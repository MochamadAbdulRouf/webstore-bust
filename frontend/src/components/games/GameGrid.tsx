'use client';

import React from 'react';
import { Game } from '@/types';
import { GameCard } from './GameCard';
import { Card } from '../ui/Card';

interface GameGridProps {
  games: Game[];
  loading: boolean;
  skeletonCount?: number;
}

export function GameSkeleton() {
  return (
    <Card
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}
    >
      <div className="skeleton" style={{ aspectRatio: '16/10' }} />
      <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: 16, width: '80%' }} />
        <div className="skeleton" style={{ height: 13, width: '50%' }} />
        <div className="skeleton" style={{ height: 12, width: '60%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
          <div className="skeleton" style={{ height: 20, width: 60 }} />
          <div className="skeleton" style={{ height: 30, width: 70, borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    </Card>
  );
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  loading,
  skeletonCount = 12,
}) => {
  return (
    <div className="games-grid">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => <GameSkeleton key={i} />)
        : games.map((game) => <GameCard key={game.id} game={game} />)}
    </div>
  );
};
export default GameGrid;
