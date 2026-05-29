'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User, Wallet, Package, Heart, Settings, Plus, Camera,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Order, LibraryItem } from '@/types';
import { formatPrice, formatDate, getImageUrl, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const TABS = ['overview', 'orders', 'wishlist', 'balance', 'settings'] as const;
type Tab = typeof TABS[number];

function TabBtn({ tab, active, onClick, icon, label }: { tab: Tab; active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.625rem 1rem',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.9rem',
        fontWeight: active ? 600 : 400,
        background: active ? 'var(--purple-200)' : 'transparent',
        border: `1px solid ${active ? 'var(--border-hover)' : 'transparent'}`,
        color: active ? 'var(--accent-lighter)' : 'var(--text-secondary)',
        width: '100%',
        textAlign: 'left',
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Settings form
  const [settingsForm, setSettingsForm] = useState({ username: '', currentPassword: '', newPassword: '' });
  const [savingSettings, setSavingSettings] = useState(false);

  // Balance
  const [addAmount, setAddAmount] = useState('10');
  const [addingBalance, setAddingBalance] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    setSettingsForm((f) => ({ ...f, username: user.username }));
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'orders' && orders.length === 0) {
      setLoading(true);
      api.get('/orders').then((r) => setOrders(r.data.data)).finally(() => setLoading(false));
    }
    if (activeTab === 'wishlist' && wishlist.length === 0) {
      setLoading(true);
      api.get('/users/wishlist').then((r) => setWishlist(r.data.data)).finally(() => setLoading(false));
    }
  }, [activeTab, user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/users/profile', { username: settingsForm.username });
      if (settingsForm.currentPassword && settingsForm.newPassword) {
        await api.put('/users/password', {
          currentPassword: settingsForm.currentPassword,
          newPassword: settingsForm.newPassword,
        });
      }
      await refreshUser();
      toast.success('Profile updated!');
      setSettingsForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddBalance = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    setAddingBalance(true);
    try {
      await api.post('/users/balance', { amount });
      await refreshUser();
      toast.success(`${formatPrice(amount)} added to your wallet!`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingBalance(false);
    }
  };

  if (!user) return null;

  const stats = [
    { label: 'Games Owned', value: user._count?.library || 0, icon: '🎮' },
    { label: 'Orders', value: user._count?.orders || 0, icon: '📦' },
    { label: 'Reviews', value: user._count?.reviews || 0, icon: '⭐' }, 
  ];

  return (
    <div className="container" style={{ paddingBottom: '4rem', maxWidth: 1100 }}>
      <div className="profile-layout">
        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1.5rem)' }}>
          {/* Profile Card */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.875rem' }}>
              <img
                src={getImageUrl(user.avatar, 'avatar')}
                alt={user.username}
                style={{ width: 80, height: 80, borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '3px solid var(--accent)' }}
              />
              <div style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                width: 28,
                height: 28,
                background: 'var(--accent)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                border: '2px solid var(--bg-card)',
              }}>
                <Camera size={13} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.125rem' }}>
              {user.username}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>{user.email}</div>
            {user.isAdmin && (
              <span className="badge badge-purple" style={{ margin: '0 auto 0.875rem' }}>
                🛡️ Admin
              </span>
            )}
            <div style={{
              padding: '0.625rem 1rem',
              background: 'var(--purple-100)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
            }}>
              <Wallet size={15} style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-lighter)' }}>
                {formatPrice(user.balance)}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <TabBtn tab="overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<User size={16} />} label="Overview" />
            <TabBtn tab="orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Package size={16} />} label="Orders" />
            <TabBtn tab="wishlist" active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} icon={<Heart size={16} />} label="Wishlist" />
            <TabBtn tab="balance" active={activeTab === 'balance'} onClick={() => setActiveTab('balance')} icon={<Wallet size={16} />} label="Add Balance" />
            <TabBtn tab="settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={16} />} label="Settings" />
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                Welcome back, {user.username}!
              </h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {stats.map((stat) => (
                  <div key={stat.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-lighter)' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Quick Actions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { href: '/library', label: 'My Library', icon: '🎮', desc: 'View & download your games' },
                    { href: '/', label: 'Browse Store', icon: '🛒', desc: 'Discover new games' },
                    { href: '/profile?tab=balance', label: 'Add Funds', icon: '💳', desc: 'Top up your wallet' },
                    { href: '/profile?tab=wishlist', label: 'Wishlist', icon: '❤️', desc: 'Games you want' },
                  ].map((action) => (
                    <Link key={action.href} href={action.href}
                      className="card card-hover"
                      style={{ padding: '1rem', display: 'flex', gap: '0.875rem', alignItems: 'center' }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{action.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{action.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Order History</h2>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-lg)' }} />)}
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Package size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>No orders yet. <Link href="/" style={{ color: 'var(--accent-lighter)' }}>Start shopping!</Link></p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {orders.map((order) => (
                    <div key={order.id} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>Order #{order.id.slice(-8).toUpperCase()}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className={`badge badge-${order.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                            {order.status}
                          </span>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-lighter)' }}>
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {order.items.map((item) => (
                          <Link key={item.id} href={`/game/${item.game.slug}`}>
                            <img
                              src={getImageUrl(item.game.imageUrl)}
                              alt={item.game.title}
                              title={item.game.title}
                              style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST */}
          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Wishlist</h2>
              {loading ? (
                <div className="games-grid">
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />)}
                </div>
              ) : wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Heart size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>Your wishlist is empty. <Link href="/" style={{ color: 'var(--accent-lighter)' }}>Find games you love!</Link></p>
                </div>
              ) : (
                <div className="games-grid">
                  {wishlist.map((item) => (
                    <Link key={item.gameId} href={`/game/${item.game.slug}`} className="card card-hover" style={{ overflow: 'hidden' }}>
                      <img
                        src={getImageUrl(item.game.imageUrl)}
                        alt={item.game.title}
                        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '0.875rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.game.title}</div>
                        <div style={{ color: 'var(--accent-lighter)', fontWeight: 700 }}>{formatPrice((item.game as any).price || 0)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BALANCE */}
          {activeTab === 'balance' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add Balance</h2>
              <div className="card" style={{ padding: '1.75rem', maxWidth: 480 }}>
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--purple-100)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Current Balance</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-lighter)' }}>
                    {formatPrice(user.balance)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {['5', '10', '25', '50', '100', '200', '500', '1000'].map((amt) => (
                    <button
                      key={amt}
                      className={`btn btn-sm ${addAmount === amt ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setAddAmount(amt)}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label className="label">Custom Amount</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 500 }}>$</span>
                    <input
                      className="input"
                      style={{ paddingLeft: '1.75rem' }}
                      type="number"
                      min="1"
                      max="1000"
                      step="0.01"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleAddBalance}
                  disabled={addingBalance}
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  {addingBalance ? 'Processing...' : (
                    <><Plus size={16} /> Add {addAmount ? formatPrice(parseFloat(addAmount)) : '$0.00'}</>
                  )}
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                  Simulated payment — for demo purposes only
                </p>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Account Settings</h2>
              <div className="card" style={{ padding: '1.75rem', maxWidth: 480 }}>
                <form onSubmit={handleSaveSettings}>
                  <div className="form-group">
                    <label className="label">Username</label>
                    <input
                      className="input"
                      value={settingsForm.username}
                      onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })}
                      minLength={3}
                      maxLength={20}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Email</label>
                    <input className="input" value={user.email} disabled style={{ opacity: 0.6 }} />
                  </div>

                  <div className="divider" />

                  <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>Change Password</h3>
                  <div className="form-group">
                    <label className="label">Current Password</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="Enter current password"
                      value={settingsForm.currentPassword}
                      onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">New Password</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="Enter new password (min. 8 chars)"
                      value={settingsForm.newPassword}
                      onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                      minLength={8}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={savingSettings} style={{ width: '100%' }}>
                    {savingSettings ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        Loading profile...
      </div>
    }>
      <ProfilePageInner />
    </Suspense>
  );
}
