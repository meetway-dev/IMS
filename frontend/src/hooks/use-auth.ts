import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { STORAGE_KEYS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      setAuth(data);
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
      // Fetch user profile after login
      const user = await authService.getProfile();
      useAuthStore.getState().setUser(user);
      // Store user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
      router.push('/dashboard');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      // Registration successful, redirect to login
      router.push('/login?registered=true');
    },
  });
}

export function useLogout() {
  const { logout, tokens } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!tokens?.refreshToken) {
        return Promise.resolve({ ok: true });
      }
      return authService.logout(tokens.refreshToken);
    },
    onSuccess: () => {
      logout();
      // Clear tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
      // Clear all queries
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useProfile() {
  const { setUser, initializeAuth } = useAuthStore();
  const { isAuthenticated } = useAuthStore();

  // Initialize auth state on first render
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const query = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated && typeof window !== 'undefined',
    retry: false,
  });

  // Update store when profile data changes
  if (query.data) {
    setUser(query.data);
    // Store user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(query.data));
    }
  }

  return query;
}
