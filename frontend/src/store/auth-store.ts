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
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
      initializeAuth: () => {
        // Check if tokens exist in localStorage and restore auth state
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
          
          if (accessToken && refreshToken) {
            const tokens: TokenResponse = {
              accessToken,
              refreshToken,
              tokenType: 'Bearer',
              expiresIn: 900,
              refreshTokenId: '',
              sessionId: '',
            };
            
            const user = storedUser ? JSON.parse(storedUser) : null;
            
            set({
              tokens,
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        }
      },
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
