'use client';

import toast, { Toast, ToastOptions } from 'react-hot-toast';

// Custom toast wrappers to ensure consistency with our cyberpunk theme
const defaultOptions: ToastOptions = {
  style: {
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
  },
};

export const ToastService = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, {
      ...defaultOptions,
      ...options,
      iconTheme: {
        primary: '#10b981',
        secondary: 'var(--bg-card)',
        ...options?.iconTheme,
      },
    }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, {
      ...defaultOptions,
      ...options,
      iconTheme: {
        primary: '#ef4444',
        secondary: 'var(--bg-card)',
        ...options?.iconTheme,
      },
    }),

  loading: (message: string, options?: ToastOptions) =>
    toast.loading(message, {
      ...defaultOptions,
      ...options,
    }),

  dismiss: (toastId?: string) => toast.dismiss(toastId),

  custom: (message: any, options?: ToastOptions) =>
    toast(message, {
      ...defaultOptions,
      ...options,
    }),
};

export default ToastService;
export { toast };
