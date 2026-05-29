'use client';

import React from 'react';

interface BaseInputProps {
  label?: string;
  error?: string;
  as?: 'input' | 'textarea' | 'select';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  options?: Array<{ value: string | number; label: string }>;
  containerStyle?: React.CSSProperties;
}

// Combine all possible element types' native props
type InputElementProps = React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  React.SelectHTMLAttributes<HTMLSelectElement>;

export interface InputProps extends BaseInputProps, Omit<InputElementProps, 'as'> {}

export const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  InputProps
>(
  (
    {
      label,
      error,
      as = 'input',
      icon,
      iconPosition = 'left',
      options,
      className = '',
      style,
      containerStyle,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const uniqueId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const renderElement = () => {
      const elementClass = `input ${className}`.trim();
      const elementStyle: React.CSSProperties = {
        ...style,
        ...(icon && iconPosition === 'left' ? { paddingLeft: '2.25rem' } : {}),
        ...(icon && iconPosition === 'right' ? { paddingRight: '2.25rem' } : {}),
      };

      if (as === 'textarea') {
        return (
          <textarea
            id={uniqueId}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={elementClass}
            style={elementStyle}
            {...props}
          />
        );
      }

      if (as === 'select') {
        return (
          <select
            id={uniqueId}
            ref={ref as React.Ref<HTMLSelectElement>}
            className={elementClass}
            style={{ ...elementStyle, appearance: 'none', cursor: 'pointer' }}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
        );
      }

      return (
        <input
          id={uniqueId}
          ref={ref as React.Ref<HTMLInputElement>}
          className={elementClass}
          style={elementStyle}
          {...props}
        />
      );
    };

    return (
      <div className="form-group" style={containerStyle}>
        {label && (
          <label htmlFor={uniqueId} className="label">
            {label}
          </label>
        )}
        <div style={{ position: 'relative', width: '100%' }}>
          {icon && (
            <span
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                ...(iconPosition === 'left' ? { left: 10 } : { right: 10 }),
              }}
            >
              {icon}
            </span>
          )}
          {renderElement()}
        </div>
        {error && <div className="form-error">{error}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
