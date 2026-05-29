'use client';

import React from 'react';
import NextLink from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CartItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface CartSummaryProps {
  items: CartItem[];
  total: number;
  userBalance: number;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  items,
  total,
  userBalance,
}) => {
  const isBalanceSufficient = userBalance >= total;

  return (
    <Card
      style={{
        padding: '1.5rem',
        position: 'sticky',
        top: 'calc(var(--nav-height) + 1.5rem)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '1.125rem',
          marginBottom: '1.25rem',
        }}
      >
        Order Summary
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {items.map((item) => (
          <div
            key={item.gameId}
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}
          >
            <span
              style={{
                color: 'var(--text-secondary)',
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.game.title}
            </span>
            <span style={{ fontWeight: 500 }}>{formatPrice(item.game.price)}</span>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '1.125rem',
          fontFamily: 'var(--font-display)',
          marginBottom: '1.25rem',
        }}
      >
        <span>Total</span>
        <span style={{ color: 'var(--accent-lighter)' }}>{formatPrice(total)}</span>
      </div>

      {/* Balance check */}
      <div
        style={{
          padding: '0.75rem 1rem',
          background: isBalanceSufficient ? 'var(--success-bg)' : 'var(--danger-bg)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          marginBottom: '1rem',
          color: isBalanceSufficient ? 'var(--success)' : 'var(--danger)',
        }}
      >
        Your balance: {formatPrice(userBalance)}
        {!isBalanceSufficient && ' — Insufficient funds'}
      </div>

      <NextLink href="/checkout" passHref legacyBehavior>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={items.length === 0}
          style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}
        >
          Proceed to Checkout <ArrowRight size={16} />
        </Button>
      </NextLink>

      <NextLink href="/" passHref legacyBehavior>
        <Button variant="ghost" fullWidth>
          Continue Shopping
        </Button>
      </NextLink>
    </Card>
  );
};

export default CartSummary;
