'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Library, Search, Gamepad2 } from 'lucide-react';
import api from '@/lib/api';
import { LibraryItem } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { LibraryCard } from '@/components/library/LibraryCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LibraryPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [filtered, setFiltered] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    api.get('/library')
      .then((r) => { setLibrary(r.data.data); setFiltered(r.data.data); })
      .finally(() => setLoading(false));
  }, [user, router]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(library.filter((item) =>
      item.game.title.toLowerCase().includes(q) ||
      item.game.category.toLowerCase().includes(q)
    ));
  }, [search, library]);

  if (!user) return null;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            <Library size={28} style={{ display: 'inline', marginRight: '0.625rem', color: 'var(--accent)' }} />
            My Library
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{library.length} game{library.length !== 1 ? 's' : ''} owned</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Input
            as="input"
            placeholder="Search library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
            style={{ width: 220, paddingLeft: '2.25rem' }}
            containerStyle={{ marginBottom: 0 }}
          />
        </div>
      </div>

      {loading ? (
        <div className="games-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} style={{ overflow: 'hidden' }}>
              <div className="skeleton" style={{ aspectRatio: '16/9' }} />
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="skeleton" style={{ height: 16, width: '80%' }} />
                <div className="skeleton" style={{ height: 13, width: '50%' }} />
                <div className="skeleton" style={{ height: 32, width: '100%', marginTop: '0.5rem', borderRadius: 'var(--radius-md)' }} />
              </div>
            </Card>
          ))}
        </div>
      ) : library.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <Gamepad2 size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', opacity: 0.3 }} />
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.375rem' }}>Your library is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Purchase games to add them to your library</p>
          <Link href="/" passHref legacyBehavior>
            <Button variant="primary" size="lg">Browse Store</Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          No games match "{search}"
        </div>
      ) : (
        <div className="games-grid">
          {filtered.map((item) => (
            <LibraryCard key={item.gameId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

