import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { STORAGE_KEYS } from '@/lib/constants';
import { useRouter } from 'next/navigation';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);
      }
      router.push('/dashboard');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);
      }
      router.push('/dashboard');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      // Clear tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
      // Clear all queries
      queryClient.clear();
      router.push('/auth/login');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      router.push('/auth/login');
    },
  });
}

export function useProfile() {
  const { setUser } = useAuthStore();

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: authService.getProfile,
    enabled: typeof window !== 'undefined',
    onSuccess: (user) => {
      setUser(user);
    },
  });
}
