'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', hoverable = false, glass = false, ...props }, ref) => {
    const cardClass = 'card';
    const hoverClass = hoverable ? 'card-hover' : '';
    const glassClass = glass ? 'glass' : '';

    const classes = `${cardClass} ${hoverClass} ${glassClass} ${className}`.trim();

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
