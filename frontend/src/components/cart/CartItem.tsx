'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, Tag } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface CartItemProps {
  item: CartItemType;
  onRemove: (gameId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
  return (
    <Card
      style={{
        padding: '1.25rem',
        display: 'flex',
        gap: '1.25rem',
        alignItems: 'center',
      }}
    >
      <Link href={`/game/${item.game.slug}`}>
        <img
          src={getImageUrl(item.game.imageUrl)}
          alt={item.game.title}
          style={{
            width: 100,
            height: 65,
            objectFit: 'cover',
            borderRadius: 'var(--radius-md)',
            flexShrink: 0,
            display: 'block',
          }}
        />
      </Link>
      
      <div style={{ flex: 1 }}>
        <Link href={`/game/${item.game.slug}`}>
          <h3
            style={{
              fontWeight: 600,
              marginBottom: '0.25rem',
              transition: 'color var(--transition-fast)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-lighter)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          >
            {item.game.title}
          </h3>
        </Link>
        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
          <Tag size={9} /> {item.game.category}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
        <span
          style={{
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            fontSize: '1.125rem',
            color: item.game.price === 0 ? 'var(--success)' : 'var(--text-primary)',
          }}
        >
          {formatPrice(item.game.price)}
        </span>
        <Button
          variant="danger"
          iconOnly
          onClick={() => onRemove(item.gameId)}
          aria-label="Remove"
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </Card>
  );
};

export default CartItem;
