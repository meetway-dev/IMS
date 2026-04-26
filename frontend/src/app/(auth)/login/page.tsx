'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '@/hooks/use-auth';
import { loginSchema } from '@/schemas/auth.schema';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth-store';

type LoginFormValues = yup.InferType<typeof loginSchema>;

function LoginPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const login = useLogin({ redirect });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, router, redirect]);

  // Show success message if user just registered
  React.useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast({
        title: 'Registration successful',
        description: 'Please login with your credentials.',
      });
    }
  }, [searchParams, toast]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login.mutateAsync(data);
      // Success toast is handled in the useLogin hook
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      <Card className="w-full max-w-md border shadow-2xl backdrop-blur-xl bg-background/95">
        <CardHeader className="space-y-2 px-8 pt-8 pb-6">
          <div className="flex flex-col items-center text-center mb-2">
            <div className="mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <span className="text-white font-bold text-lg">IMS</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Sign in to your inventory management account
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email')}
                  className="h-11 rounded-lg border-border/50 bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {errors.email && (
                  <p className="text-sm text-destructive px-3 py-1.5 bg-destructive/5 rounded-lg border border-destructive/20 mt-1.5">
                    {errors.email.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="h-11 rounded-lg border-border/50 bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {errors.password && (
                  <p className="text-sm text-destructive px-3 py-1.5 bg-destructive/5 rounded-lg border border-destructive/20 mt-1.5">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground px-2">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 rounded-lg border-border/50 hover:bg-accent/50 transition-all"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
            <Button
              type="submit"
              className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium shadow-lg shadow-primary/20 transition-all"
              disabled={isSubmitting || login.isPending}
            >
              {isSubmitting || login.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : 'Sign in'}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-primary font-medium hover:text-primary/80 hover:underline transition-colors"
              >
                Create an account
              </Link>
            </p>
            
            <div className="text-xs text-center text-muted-foreground/70 pt-2">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-primary/70 hover:text-primary hover:underline">Terms</Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary/70 hover:text-primary hover:underline">Privacy Policy</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
