'use client';

import Link from 'next/link';
import { ShoppingCart, Check, Zap } from 'lucide-react';
import { Game } from '@/types';
import { formatPrice, getImageUrl, truncate } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { StarRating } from '@/components/reviews/StarRating';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  variant?: 'default' | 'compact' | 'featured';
}

export function GameCard({ game, variant = 'default' }: GameCardProps) {
  const user = useAuthStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addToCart);
  const cart = useCartStore((s) => s.cart);

  const isInCart = cart?.items.some((item) => item.gameId === game.id) || game.isInCart;
  const isOwned = game.isOwned;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    addToCart(game.id, game.title);
  };

  if (variant === 'featured') {
    return (
      <Link href={`/game/${game.slug}`} className={styles.featuredCard}>
        <div className={styles.featuredImg}>
          <img
            src={getImageUrl(game.imageUrl)}
            alt={game.title}
            loading="lazy"
          />
          <div className={styles.featuredOverlay} />
        </div>
        <div className={styles.featuredContent}>
          {game.featured && (
            <span className={`badge badge-purple ${styles.featuredBadge}`}>
              <Zap size={10} /> Featured
            </span>
          )}
          <h3 className={styles.featuredTitle}>{game.title}</h3>
          <p className={styles.featuredDesc}>{truncate(game.description, 80)}</p>
          <div className={styles.featuredBottom}>
            <StarRating rating={game.rating} size="sm" />
            <span className={styles.featuredPrice}>{formatPrice(game.price)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={`${styles.card} ${variant === 'compact' ? styles.compact : ''}`}>
      <Link href={`/game/${game.slug}`} className={styles.imageWrap}>
        <img
          src={getImageUrl(game.imageUrl)}
          alt={game.title}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.imageOverlay}>
          <span className="badge badge-purple">{game.category}</span>
        </div>
        {game.price === 0 && (
          <span className={styles.freeTag}>FREE</span>
        )}
      </Link>

      <div className={styles.content}>
        <Link href={`/game/${game.slug}`}>
          <h3 className={styles.title}>{truncate(game.title, 35)}</h3>
        </Link>
        <p className={styles.publisher}>{game.publisher}</p>

        <div className={styles.ratingRow}>
          <StarRating rating={game.rating} size="xs" />
          {game.reviewCount > 0 && (
            <span className={styles.reviewCount}>({game.reviewCount})</span>
          )}
        </div>

        <div className={styles.bottom}>
          <span className={styles.price}>{formatPrice(game.price)}</span>

          {isOwned ? (
            <span className={`btn btn-secondary btn-sm ${styles.ownedBtn}`}>
              <Check size={13} /> Owned
            </span>
          ) : isInCart ? (
            <Link href="/cart" className="btn btn-ghost btn-sm">
              In Cart
            </Link>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={13} />
              {game.price === 0 ? 'Get Free' : 'Add'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
