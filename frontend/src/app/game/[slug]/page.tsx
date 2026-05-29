'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart, Heart, Download, Star, Tag, Users, Calendar,
  ArrowLeft, Check, Share2, MessageSquare,
} from 'lucide-react';
import api from '@/lib/api';
import { Game, ReviewsData } from '@/types';
import { formatPrice, formatDate, getImageUrl, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { StarRating } from '@/components/reviews/StarRating'; 
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addToCart);
  const cart = useCartStore((s) => s.cart);

  const [game, setGame] = useState<Game | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isInCart = cart?.items.some((item) => item.gameId === game?.id) || game?.isInCart;

  const fetchReviews = async (gameId: string) => {
    try {
      const res = await api.get(`/games/${gameId}/reviews`);
      setReviewsData(res.data.data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/games/slug/${slug}`);
        const g = response.data.data;
        setGame(g);
        setWishlisted(g.isWishlisted || false);

        await fetchReviews(g.id);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [slug]);

  const handleAddToCart = () => {
    if (!user) { router.push('/auth/login'); return; }
    if (game) addToCart(game.id, game.title);
  };

  const handleWishlist = async () => {
    if (!user) { router.push('/auth/login'); return; }
    setWishlistLoading(true);
    try {
      await api.post('/users/wishlist', { gameId: game?.id });
      setWishlisted(!wishlisted);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div className="skeleton" style={{ height: 40, width: 200, marginBottom: '2rem', borderRadius: 'var(--radius-md)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }}>
          <div>
            <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 'var(--radius-xl)', marginBottom: '1.5rem' }} />
            <div className="skeleton" style={{ height: 36, width: '60%', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: 120, marginBottom: '1rem' }} />
          </div>
          <div className="skeleton" style={{ height: 420, borderRadius: 'var(--radius-xl)' }} />
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😔</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Game not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <Link href="/" className="btn btn-primary">Back to Store</Link>
      </div>
    );
  }

  const alreadyReviewed = reviewsData?.reviews.some((r) => r.userId === user?.id);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Back */}
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', transition: 'color var(--transition-fast)' }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-lighter)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={16} /> Back to Store
      </Link>

      <div className="game-detail-grid">
        {/* Left column */}
        <div>
          {/* Hero Image */}
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--border)', position: 'relative' }}>
            <img
              src={getImageUrl(game.imageUrl)}
              alt={game.title}
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,15,0.6) 0%, transparent 40%)' }} />
          </div>

          {/* Game Info */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <span className="badge badge-purple">{game.category}</span>
              {game.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{tag}</span>
              ))}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
              {game.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <StarRating rating={game.rating} size="md" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {game.reviewCount} review{game.reviewCount !== 1 ? 's' : ''}
              </span>
              <span style={{ color: 'var(--border)' }}>•</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>by {game.publisher}</span>
            </div>
          </div>

          {/* Description */}
          <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.875rem', fontSize: '1.125rem' }}>About This Game</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {game.longDesc || game.description}
            </p>
          </Card>

          {/* Details */}
          <Card style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1rem', fontSize: '1.125rem' }}>Game Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { icon: <Tag size={15} />, label: 'Category', value: game.category },
                { icon: <Users size={15} />, label: 'Developer', value: game.developer || game.publisher },
                { icon: <Users size={15} />, label: 'Publisher', value: game.publisher },
                { icon: <Calendar size={15} />, label: 'Released', value: game.createdAt ? formatDate(game.createdAt) : 'N/A' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent)', marginTop: '2px' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Reviews */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
                Reviews ({reviewsData?.total || 0})
              </span>
            </h2>

            {/* Review Form Component */}
            {user && game.isOwned && !alreadyReviewed && (
              <ReviewForm gameId={game.id} onReviewSubmitted={() => fetchReviews(game.id)} />
            )}

            {user && !game.isOwned && (
              <div style={{
                padding: '1rem 1.25rem',
                background: 'var(--purple-50)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
              }}>
                <Star size={14} style={{ display: 'inline', marginRight: '0.375rem', color: 'var(--accent)' }} />
                Purchase this game to leave a review
              </div>
            )}

            {/* Review List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {reviewsData?.reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  <Star size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                  <p>No reviews yet. Be the first!</p>
                </div>
              ) : (
                reviewsData?.reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onDeleted={(id) =>
                      setReviewsData((prev) => prev ? {
                        ...prev,
                        reviews: prev.reviews.filter((r) => r.id !== id),
                        total: prev.total - 1,
                      } : prev)
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column — Buy Card */}
        <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + 1.5rem)' }}>
          <Card style={{ padding: '1.75rem' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              marginBottom: '1.25rem',
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {formatPrice(game.price)}
            </div>

            {game.isOwned ? (
              <div>
                <Button variant="secondary" disabled style={{ width: '100%', marginBottom: '0.75rem', justifyContent: 'center' }}>
                  <Check size={16} /> In Your Library
                </Button>
                <Link href="/library" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <Download size={16} /> Go to Library
                </Link>
              </div>
            ) : isInCart ? (
              <div>
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--purple-100)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.75rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: 'var(--accent-lighter)',
                }}>
                  <Check size={14} style={{ display: 'inline', marginRight: '0.375rem' }} />
                  Added to cart
                </div>
                <Link href="/cart" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <ShoppingCart size={16} /> View Cart
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button variant="primary" size="lg" onClick={handleAddToCart} style={{ width: '100%' }}>
                  <ShoppingCart size={18} />
                  {game.price === 0 ? 'Get for Free' : 'Add to Cart'}
                </Button>
                {user && (
                  <Button
                    variant="ghost"
                    onClick={handleWishlist}
                    disabled={wishlistLoading}
                    style={{ width: '100%' }}
                  >
                    <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} style={{ color: wishlisted ? 'var(--danger)' : undefined }} />
                    {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                  </Button>
                )}
              </div>
            )}

            <div className="divider" />

            {/* Quick stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Rating</span>
                <span style={{ fontWeight: 600 }}>{game.rating > 0 ? `${game.rating}/5.0` : 'No ratings'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category</span>
                <span className="badge badge-purple">{game.category}</span>
              </div>
              {game.fileSize && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>File Size</span>
                  <span>{game.fileSize}</span>
                </div>
              )}
            </div>

            <div className="divider" />

            {/* Tags */}
            {game.tags.length > 0 && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {game.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/?search=${tag}`}
                      className="badge badge-purple"
                      style={{ cursor: 'pointer' }}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <Button
              variant="ghost"
              size="sm"
              style={{ width: '100%' }}
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success('Link copied!');
              }}
            >
              <Share2 size={14} /> Share Game
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
