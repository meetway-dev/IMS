import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { STORAGE_KEYS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import * as React from 'react';

export function useLogin(options?: { redirect?: string }) {
  const { setAuth, setUser } = useAuthStore();
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
        
        // Also set access token in a cookie for middleware
        document.cookie = `access_token=${data.accessToken}; path=/; max-age=${data.expiresIn || 900}; SameSite=Strict`;
      }
      
      // Try to fetch user profile after login, but don't block redirection if it fails
      try {
        const user = await authService.getProfile();
        setUser(user);
        // Store user in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        }
      } catch (error) {
        console.warn('Failed to fetch user profile after login:', error);
        // Continue with redirection even if profile fetch fails
        // User can be fetched later via useProfile hook
      }
      
      // Redirect to specified path or dashboard after successful login
      router.push(options?.redirect || '/dashboard');
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
        localStorage.removeItem(STORAGE_KEYS.USER);
        // Clear the access token cookie
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
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
  React.useEffect(() => {
    if (query.data) {
      setUser(query.data);
      // Store user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(query.data));
      }
    }
  }, [query.data, setUser]);

  return query;
}

export function useUpdateProfile() {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      setUser(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
      }
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast({ title: 'Success', description: 'Profile updated successfully.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    },
  });
}

export function useChangePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Password changed successfully.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to change password.',
        variant: 'destructive',
      });
    },
  });
}

export function useActivity(params?: { page?: number; limit?: number; action?: string }) {
  return useQuery({
    queryKey: ['user', 'activity', params],
    queryFn: () => authService.getActivity(params),
  });
}
