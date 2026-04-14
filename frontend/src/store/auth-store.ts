import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, TokenResponse } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface AuthState {
  user: User | null;
  tokens: TokenResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (tokens: TokenResponse) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: TokenResponse) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (tokens) =>
        set({
          tokens,
          isAuthenticated: true,
          isLoading: false,
        }),
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
