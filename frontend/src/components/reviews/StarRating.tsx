import { generateStars } from '@/lib/utils';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  value?: number;
  onChange?: (rating: number) => void;
}

const sizeMap = { xs: 10, sm: 13, md: 16, lg: 20 };

export function StarRating({ rating, size = 'md', interactive, value, onChange }: StarRatingProps) {
  const stars = generateStars(rating);
  const iconSize = sizeMap[size];

  if (interactive && onChange !== undefined) {
    return (
      <div style={{ display: 'flex', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              color: star <= (value || 0) ? '#f59e0b' : 'var(--text-muted)',
              transition: 'color var(--transition-fast), transform var(--transition-fast)',
              transform: star <= (value || 0) ? 'scale(1.1)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              // Highlight up to this star
              const parent = el.parentElement;
              if (parent) {
                Array.from(parent.children).forEach((child, i) => {
                  (child as HTMLElement).style.color = i < star ? '#f59e0b' : 'var(--text-muted)';
                });
              }
            }}
            onMouseLeave={(e) => {
              const parent = e.currentTarget.parentElement;
              if (parent) {
                Array.from(parent.children).forEach((child, i) => {
                  (child as HTMLElement).style.color = i < (value || 0) ? '#f59e0b' : 'var(--text-muted)';
                });
              }
            }}
          >
            <Star size={iconSize} fill={star <= (value || 0) ? '#f59e0b' : 'none'} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {stars.map((type, i) => (
        <Star
          key={i}
          size={iconSize}
          fill={type === 'full' ? '#f59e0b' : type === 'half' ? '#f59e0b' : 'none'}
          color={type === 'empty' ? 'var(--text-muted)' : '#f59e0b'}
          opacity={type === 'half' ? 0.6 : 1}
        />
      ))}
      {size !== 'xs' && (
        <span style={{
          fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
          color: 'var(--text-secondary)',
          marginLeft: '3px',
          fontWeight: 500,
        }}>
          {rating > 0 ? rating.toFixed(1) : 'No ratings'}
        </span>
      )}
    </div>
  );
}
