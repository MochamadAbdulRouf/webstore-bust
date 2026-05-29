'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Wallet, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice, getImageUrl, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    fetchCart();
  }, [user, router, fetchCart]);

  const items = cart?.items || [];
  const total = cart?.total || 0;
  const hasBalance = (user?.balance || 0) >= total;

  const handleCheckout = async () => {
    setError('');
    setProcessing(true);
    try {
      const response = await api.post('/orders/checkout');
      setOrderId(response.data.data.id);
      setSuccess(true);
      await refreshUser();
      await fetchCart();
      toast.success('Purchase successful! Games added to your library 🎮');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  if (!user) return null;

  // Success state
  if (success) {
    return (
      <div className="container" style={{ maxWidth: 560, paddingBottom: '4rem', textAlign: 'center' }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--success-bg)',
          border: '2px solid var(--success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
        }}>
          <CheckCircle size={40} style={{ color: 'var(--success)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Purchase Complete!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.0625rem' }}>
          Your games have been added to your library. Enjoy playing!
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/library" className="btn btn-primary btn-lg">
            <ShoppingBag size={18} /> Go to Library
          </Link>
          <Link href="/" className="btn btn-ghost btn-lg">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 860, paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Checkout
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Review your order and confirm purchase</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Left - Order Items */}
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '1rem' }}>Order Items</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {items.map((item) => (
              <div key={item.gameId} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={getImageUrl(item.game.imageUrl)}
                  alt={item.game.title}
                  style={{ width: 72, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.game.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{item.game.category}</div>
                </div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: item.game.price === 0 ? 'var(--success)' : undefined }}>
                  {formatPrice(item.game.price)}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet size={18} style={{ color: 'var(--accent)' }} />
              Payment Method
            </h3>
            <div style={{
              padding: '0.875rem 1rem',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  background: 'var(--accent)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}>
                  <Zap size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Bust Wallet</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Digital balance</div>
                </div>
              </div>
              <div style={{
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: hasBalance ? 'var(--success)' : 'var(--danger)',
              }}>
                {formatPrice(user.balance)}
              </div>
            </div>
            {!hasBalance && (
              <div style={{
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--danger)',
                fontSize: '0.875rem',
              }}>
                <AlertCircle size={15} />
                Insufficient balance. Please add funds in your{' '}
                <Link href="/profile?tab=balance" style={{ color: 'var(--accent-lighter)', fontWeight: 600 }}>
                  Profile
                </Link>.
              </div>
            )}
          </div>
        </div>

        {/* Right - Summary */}
        <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: 'calc(var(--nav-height) + 1.5rem)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.25rem' }}>Order Total</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal ({items.length} items)</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--success)' }}>
              <span>Taxes & Fees</span>
              <span>Included</span>
            </div>
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent-lighter)' }}>{formatPrice(total)}</span>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'var(--danger-bg)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            onClick={handleCheckout}
            disabled={processing || !hasBalance || items.length === 0}
            style={{ width: '100%' }}
          >
            {processing ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                Processing...
              </span>
            ) : (
              <>Confirm Purchase <ArrowRight size={16} /></>
            )}
          </button>

          <Link href="/cart" className="btn btn-ghost" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
            Back to Cart
          </Link>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
            By confirming, your wallet will be charged {formatPrice(total)}
          </p>
        </div>
      </div>
    </div>
  );
}
