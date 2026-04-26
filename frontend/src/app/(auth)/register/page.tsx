'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegister } from '@/hooks/use-auth';
import { registerSchema } from '@/schemas/auth.schema';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth-store';

type RegisterFormValues = yup.InferType<typeof registerSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const registerUser = useRegister();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser.mutateAsync({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
      });
      toast({
        title: 'Registration successful',
        description: 'Please login with your credentials.',
      });
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to create account. Please try again.',
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
            <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Join our inventory management platform
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    {...register('firstName')}
                    className="h-11 rounded-lg border-border/50 bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive px-3 py-1.5 bg-destructive/5 rounded-lg border border-destructive/20 mt-1.5">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    {...register('lastName')}
                    className="h-11 rounded-lg border-border/50 bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive px-3 py-1.5 bg-destructive/5 rounded-lg border border-destructive/20 mt-1.5">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              
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
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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
                <p className="text-xs text-muted-foreground mt-1.5">
                  Must be at least 8 characters with letters and numbers
                </p>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="h-11 rounded-lg border-border/50 bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive px-3 py-1.5 bg-destructive/5 rounded-lg border border-destructive/20 mt-1.5">
                    {errors.confirmPassword.message}
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
            
            <div className="flex items-start space-x-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                  required
                />
              </div>
              <label htmlFor="terms" className="text-xs text-muted-foreground">
                I agree to the{' '}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
            <Button
              type="submit"
              className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium shadow-lg shadow-primary/20 transition-all"
              disabled={isSubmitting || registerUser.isPending}
            >
              {isSubmitting || registerUser.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating account...
                </>
              ) : 'Create account'}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary font-medium hover:text-primary/80 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
