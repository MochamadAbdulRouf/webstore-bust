'use client';

import { create } from 'zustand';
import { Cart, CartItem } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (gameId: string, gameTitle?: string) => Promise<void>;
  removeFromCart: (gameId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  reset: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/cart');
      set({ cart: response.data.data });
    } catch {
      // Ignore if not logged in
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (gameId, gameTitle = 'Game') => {
    try {
      const response = await api.post('/cart', { gameId });
      set({ cart: response.data.data });
      toast.success(`${gameTitle} added to cart!`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  },

  removeFromCart: async (gameId) => {
    try {
      const response = await api.delete(`/cart/${gameId}`);
      set({ cart: response.data.data });
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove from cart');
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart');
      set({ cart: { items: [], total: 0, count: 0 } });
    } catch {
      toast.error('Failed to clear cart');
    }
  },

  reset: () => set({ cart: null }),
}));
