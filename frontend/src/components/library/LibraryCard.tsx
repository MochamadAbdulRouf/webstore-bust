'use client';

import React from 'react';
import NextLink from 'next/link';
import { LibraryItem } from '@/types';
import { getImageUrl } from '@/lib/utils';
import { Card } from '../ui/Card';
import { DownloadButton } from './DownloadButton';

interface LibraryCardProps {
  item: LibraryItem;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ item }) => {
  return (
    <Card
      hoverable
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <NextLink href={`/game/${item.game.slug}`} style={{ display: 'block' }}>
        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
          <img
            src={getImageUrl(item.game.imageUrl)}
            alt={item.game.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              display: 'block',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '0.5rem',
              background: 'linear-gradient(to top, rgba(8,8,15,0.9), transparent)',
            }}
          >
            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
              {item.game.category}
            </span>
          </div>
        </div>
      </NextLink>

      <div
        style={{
          padding: '1rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
        }}
      >
        <NextLink href={`/game/${item.game.slug}`}>
          <h3
            style={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              lineHeight: 1.3,
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lighter)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          >
            {item.game.title}
          </h3>
        </NextLink>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.game.publisher}</p>

        <DownloadButton
          gameId={item.gameId}
          gameTitle={item.game.title}
          fileUrl={item.game.fileUrl}
        />
      </div>
    </Card>
  );
};

export default LibraryCard;
