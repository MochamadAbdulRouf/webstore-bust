'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    fetchCart();
  }, [user, router, fetchCart]);

  if (!user) return null;

  const items = cart?.items || [];
  const total = cart?.total || 0;

  return (
    <div className="container" style={{ maxWidth: 960, paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          <ShoppingCart size={28} style={{ display: 'inline', marginRight: '0.625rem', color: 'var(--accent)' }} />
          Your Cart
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <ShoppingCart size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', opacity: 0.3 }} />
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.375rem' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Browse our store and add some games!</p>
          <Link href="/" passHref legacyBehavior>
            <Button variant="primary" size="lg">Browse Games</Button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {items.map((item) => (
              <CartItem
                key={item.gameId}
                item={item}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* Order Summary */}
          <CartSummary
            items={items}
            total={total}
            userBalance={user.balance}
          />
        </div>
      )}
    </div>
  );
}

