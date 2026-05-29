'use client';

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  className?: string;
  style?: React.CSSProperties;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
  style,
}) => {
  const dimensions = {
    sm: 16,
    md: 24,
    lg: 36,
  }[size];

  const borderThickness = size === 'sm' ? 2 : size === 'md' ? 2.5 : 3;

  const color = variant === 'primary' ? 'var(--accent)' : '#ffffff';
  const trackColor = variant === 'primary' ? 'var(--border)' : 'rgba(255, 255, 255, 0.2)';

  const customStyle: React.CSSProperties = {
    width: dimensions,
    height: dimensions,
    border: `${borderThickness}px solid ${trackColor}`,
    borderTopColor: color,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
    ...style,
  };

  return (
    <span
      className={`animate-spin ${className}`}
      style={customStyle}
      role="status"
      aria-label="loading"
    />
  );
};
