'use client';

import { formatRelativeTime, getImageUrl } from '@/lib/utils';
import { Review } from '@/types';
import { StarRating } from './StarRating';
import { Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface ReviewCardProps {
  review: Review;
  onDeleted?: (id: string) => void;
}

export function ReviewCard({ review, onDeleted }: ReviewCardProps) {
  const user = useAuthStore((s) => s.user);
  const [deleting, setDeleting] = useState(false);
  const isOwner = user?.id === review.userId;

  const handleDelete = async () => {
    if (!confirm('Delete your review?')) return;
    setDeleting(true);
    try {
      await api.delete(`/games/${review.gameId}/reviews/${review.id}`);
      toast.success('Review deleted');
      onDeleted?.(review.id);
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{
      padding: '1.25rem',
      background: 'var(--bg-tertiary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-light)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={getImageUrl(review.user.avatar, 'avatar')}
            alt={review.user.username}
            style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{review.user.username}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {formatRelativeTime(review.createdAt)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <StarRating rating={review.rating} size="sm" />
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                opacity: deleting ? 0.5 : 1,
                padding: '4px',
              }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {review.comment}
      </p>
    </div>
  );
}
