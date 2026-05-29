'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Users, Package, Gamepad2, Plus, Edit, Trash2,
  Upload, TrendingUp, DollarSign, Star,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Game, SalesData } from '@/types';
import { formatPrice, formatDate, getImageUrl, getErrorMessage } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameForm } from '@/components/admin/GameForm';
import toast from 'react-hot-toast';

type AdminTab = 'dashboard' | 'games' | 'users' | 'new-game';

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <Card style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{
        width: 48,
        height: 48,
        background: 'var(--purple-200)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-lighter)',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{sub}</div>}
      </div>
    </Card>
  );
}


export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editGame, setEditGame] = useState<Game | null | undefined>(undefined);
  const [showGameForm, setShowGameForm] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!user.isAdmin) { router.push('/'); return; }
  }, [user, router]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    setLoading(true);
    if (tab === 'dashboard') {
      api.get('/admin/sales').then((r) => setSalesData(r.data.data)).finally(() => setLoading(false));
    } else if (tab === 'games') {
      api.get('/admin/games').then((r) => setGames(r.data.data)).finally(() => setLoading(false));
    } else if (tab === 'users') {
      api.get('/admin/users').then((r) => setUsers(r.data.data)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tab, user]);

  const handleDeleteGame = async (gameId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/games/${gameId}`);
      setGames((prev) => prev.filter((g) => g.id !== gameId));
      toast.success('Game deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleUploadFile = async (gameId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/admin/games/${gameId}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Game file uploaded!');
      const res = await api.get('/admin/games');
      setGames(res.data.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!user?.isAdmin) return null;

  const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
    { id: 'games', label: 'Games', icon: <Gamepad2 size={16} /> },
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
  ];

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <div style={{
            padding: '0.375rem 0.875rem',
            background: 'var(--accent)',
            borderRadius: 'var(--radius-full)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}>
            ADMIN PANEL
          </div>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Control Center
        </h1>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        gap: '0.375rem',
        padding: '0.375rem',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        marginBottom: '2rem',
        width: 'fit-content',
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
            </div>
          ) : salesData && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard icon={<DollarSign size={22} />} label="Total Revenue" value={formatPrice(salesData.totalRevenue)} sub="All time" />
                <StatCard icon={<Package size={22} />} label="Total Orders" value={salesData.totalOrders} sub="Completed" />
                <StatCard icon={<Users size={22} />} label="Total Users" value={salesData.totalUsers} sub="Registered" />
                <StatCard icon={<Gamepad2 size={22} />} label="Active Games" value={salesData.totalGames} sub="In store" />
              </div>

              {/* Recent Orders */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} style={{ color: 'var(--accent)' }} /> Recent Orders
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                        {['Order ID', 'User', 'Items', 'Total', 'Date'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '0.625rem 0.875rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.recentOrders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'monospace', fontSize: '0.8125rem' }}>#{order.id.slice(-8).toUpperCase()}</td>
                          <td style={{ padding: '0.75rem 0.875rem' }}>{(order as any).user?.username || 'Unknown'}</td>
                          <td style={{ padding: '0.75rem 0.875rem' }}>{order.items.length}</td>
                          <td style={{ padding: '0.75rem 0.875rem', color: 'var(--success)', fontWeight: 600 }}>{formatPrice(order.total)}</td>
                          <td style={{ padding: '0.75rem 0.875rem', color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* GAMES */}
      {tab === 'games' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.375rem' }}>
              Games ({games.length})
            </h2>
            <button className="btn btn-primary" onClick={() => { setEditGame(null); setShowGameForm(true); }}>
              <Plus size={16} /> Add Game
            </button>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ background: 'var(--bg-tertiary)' }}>
                  <tr>
                    {['Game', 'Category', 'Price', 'Rating', 'Status', 'File', 'Actions'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.875rem 1rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr key={game.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={getImageUrl(game.imageUrl)}
                            alt={game.title}
                            style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                          />
                          <div style={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {game.title}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}><span className="badge badge-purple">{game.category}</span></td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{formatPrice(game.price)}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Star size={12} style={{ color: '#f59e0b' }} />{game.rating}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className={`badge badge-${game.isActive ? 'success' : 'danger'}`}>
                          {game.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <label style={{ cursor: 'pointer' }}>
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadFile(game.id, file);
                            }}
                          />
                          <span className={`badge badge-${game.fileUrl ? 'success' : 'warning'}`}>
                            <Upload size={10} /> {game.fileUrl ? 'Has File' : 'Upload'}
                          </span>
                        </label>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => { setEditGame(game); setShowGameForm(true); }}
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => handleDeleteGame(game.id, game.title)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.375rem', marginBottom: '1.5rem' }}>
            Users ({users.length})
          </h2>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ background: 'var(--bg-tertiary)' }}>
                  <tr>
                    {['User', 'Email', 'Balance', 'Library', 'Orders', 'Role', 'Joined'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.875rem 1rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{u.username}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--success)', fontWeight: 600 }}>{formatPrice(u.balance)}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>{u._count?.library || 0}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>{u._count?.orders || 0}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className={`badge badge-${u.isAdmin ? 'purple' : 'info'}`}>
                          {u.isAdmin ? '🛡️ Admin' : 'User'}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Game Form Modal */}
      <GameForm
        isOpen={showGameForm}
        game={editGame}
        onClose={() => { setShowGameForm(false); setEditGame(undefined); }}
        onSaved={() => {
          api.get('/admin/games').then((r) => setGames(r.data.data));
        }}
      />
    </div>
  );
}
