'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Zap, Filter, ChevronDown, X } from 'lucide-react';
import api from '@/lib/api';
import { Game, PaginationMeta } from '@/types';
import { debounce } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GameGrid, GameSkeleton } from '@/components/games/GameGrid';
import { GameSearch } from '@/components/games/GameSearch';

const SORT_OPTIONS = [
  { value: '', label: 'Featured First' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

/* ─────────── Hero Slider ─────────── */
function HeroSection({ featuredGames }: { featuredGames: Game[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!featuredGames.length) return;
    const timer = setInterval(() => setActiveIdx((i) => (i + 1) % featuredGames.length), 5000);
    return () => clearInterval(timer);
  }, [featuredGames.length]);

  if (!featuredGames.length) {
    return (
      <div style={{
        height: 480,
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        marginBottom: '3rem',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-xl)' }} />
      </div>
    );
  }

  const game = featuredGames[activeIdx];
  const imgSrc = game.imageUrl
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${game.imageUrl}`
    : `https://placehold.co/1280x500/0f0f1a/7c3aed?text=${encodeURIComponent(game.title)}`;

  return (
    <section style={{
      position: 'relative',
      height: 480,
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      marginBottom: '3rem',
      border: '1px solid var(--border)',
    }}>
      {/* BG image */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src={imgSrc} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.8s' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,8,15,0.95) 35%, rgba(8,8,15,0.4) 70%, transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,0.8) 0%, transparent 50%)' }} />
      </div>
      {/* Cyber grid */}
      <div className="cyber-grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.25 }} />

      {/* Content */}
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2.5rem', maxWidth: 560 }}>
        <span className="badge badge-purple" style={{ marginBottom: '0.75rem', alignSelf: 'flex-start' }}>
          <Zap size={10} /> Featured
        </span>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: '0.75rem',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {game.title}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9375rem', marginBottom: '1.25rem', lineHeight: 1.6, maxWidth: 440 }}>
          {game.description.slice(0, 120)}...
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href={`/game/${game.slug}`} className="btn btn-primary btn-lg">View Game</a>
          <span style={{ color: 'var(--accent-lighter)', fontWeight: 700, fontSize: '1.125rem', fontFamily: 'var(--font-display)' }}>
            {game.price === 0 ? 'FREE' : `$${game.price}`}
          </span>
        </div>
      </div>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: '1.25rem', right: '1.5rem', display: 'flex', gap: '6px' }}>
        {featuredGames.map((_, i) => (
          <button key={i} onClick={() => setActiveIdx(i)} style={{
            width: i === activeIdx ? 24 : 8, height: 8, borderRadius: 99,
            background: i === activeIdx ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
            border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </section>
  );
}

/* ─────────── Inner page (uses useSearchParams) ─────────── */
function HomePageInner() {
  const searchParams = useSearchParams();

  const [games, setGames] = useState<Game[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchGames = useCallback(async (params: Record<string, string | number>) => {
    setLoading(true);
    try {
      const response = await api.get('/games', { params: { ...params, limit: 12 } });
      setGames(response.data.data);
      setMeta(response.data.meta);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(
    debounce((params: Record<string, string | number>) => fetchGames(params), 350),
    [fetchGames]
  );

  useEffect(() => {
    const params: Record<string, string | number> = { page };
    if (search) params.search = search;
    if (category) params.category = category;
    if (sortBy) params.sortBy = sortBy;
    debouncedFetch(params);
  }, [search, category, sortBy, page, debouncedFetch]);

  useEffect(() => {
    api.get('/games/featured').then((r) => setFeaturedGames(r.data.data)).catch(() => {});
    api.get('/games/categories').then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  const clearFilters = () => { setSearch(''); setCategory(''); setSortBy(''); setPage(1); };
  const hasFilters = search || category || sortBy;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <HeroSection featuredGames={featuredGames} />

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {search ? `Results for "${search}"` : category || 'All Games'}
          </h2>
          {meta && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {meta.total} game{meta.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <GameSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          
          <Button
            variant={showFilters ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}
          >
            <Filter size={14} /> Filters
          </Button>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              <X size={14} /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{
          display: 'flex', gap: '1rem', padding: '1.25rem',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', flex: 1 }}>
            {['', ...categories].map((cat) => (
              <Button
                key={cat || 'all'}
                variant={category === cat ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => { setCategory(cat); setPage(1); }}
              >
                {cat || 'All'}
              </Button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Input
              as="select"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              options={SORT_OPTIONS}
              style={{ paddingRight: '2rem', minWidth: 180 }}
              containerStyle={{ marginBottom: 0 }}
            />
            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
        </div>
      )}

      {/* Games grid */}
      <GameGrid games={games} loading={loading} />

      {/* Empty state */}
      {!loading && games.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎮</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No games found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Try adjusting your search or filters</p>
          <Button variant="primary" onClick={clearFilters}>Clear Filters</Button>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</Button>
          {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={page === p ? 'primary' : 'ghost'} size="sm" onClick={() => setPage(p)}>{p}</Button>
          ))}
          <Button variant="ghost" size="sm" disabled={page === meta.totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      )}
    </div>
  );
}

/* ─────────── Default export wrapped in Suspense ─────────── */
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div className="skeleton" style={{ height: 480, borderRadius: 'var(--radius-xl)', marginBottom: '3rem' }} />
        <div className="games-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ aspectRatio: '16/10' }} />
              <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="skeleton" style={{ height: 16, width: '80%' }} />
                <div className="skeleton" style={{ height: 13, width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <HomePageInner />
    </Suspense>
  );
}

