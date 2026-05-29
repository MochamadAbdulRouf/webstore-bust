'use client';

import React from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  iconOnly = false,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ref,
  ...props
}) => {
  // Generate class names matching globals.css
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const iconClass = iconOnly ? 'btn-icon' : '';
  const classes = `btn ${variantClass} ${sizeClass} ${iconClass} ${className}`.trim();

  const customStyle: React.CSSProperties = {
    ...(fullWidth ? { width: '100%', justifyContent: 'center' } : {}),
    ...style,
  };

  return (
    <button
      ref={ref}
      className={classes}
      style={customStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" variant={variant === 'primary' ? 'secondary' : 'primary'} />}
      {children}
    </button>
  );
};

Button.displayName = 'Button';
export default Button;
