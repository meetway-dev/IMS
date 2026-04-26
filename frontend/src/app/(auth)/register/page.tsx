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
import { useRegister } from '@/hooks/use-auth';
import { registerSchema } from '@/schemas/auth.schema';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { ArrowRight } from 'lucide-react';

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
    <div className="flex min-h-screen">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.03]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-background w-full">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-foreground">
              <span className="text-sm font-bold tracking-tight">IM</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">IMS</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h2 className="text-4xl font-bold tracking-tight leading-tight">
              Start managing your inventory today
            </h2>
            <p className="text-lg text-background/60 leading-relaxed">
              Create your account and get started with our comprehensive 
              inventory management platform in minutes.
            </p>
            <div className="flex flex-col gap-4 pt-4">
              <Feature text="Free to start, no credit card required" />
              <Feature text="Set up in under 5 minutes" />
              <Feature text="Invite your team with flexible roles" />
              <Feature text="Import your existing inventory data" />
            </div>
          </div>

          <p className="text-sm text-background/40">
            Inventory Management System
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <span className="text-xs font-bold tracking-tight">IM</span>
            </div>
            <span className="text-base font-semibold tracking-tight">IMS</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Get started with your inventory management
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    {...register('firstName')}
                    className="h-10"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    {...register('lastName')}
                    className="h-10"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email')}
                  className="h-10"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  {...register('password')}
                  className="h-10"
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  At least 8 characters with letters and numbers
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  className="h-10"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring/20 mt-0.5"
                required
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-foreground hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-foreground hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-10"
              disabled={isSubmitting || registerUser.isPending}
            >
              {isSubmitting || registerUser.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>
            
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-foreground font-medium hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-background/10">
        <div className="h-1.5 w-1.5 rounded-full bg-background/60" />
      </div>
      <span className="text-sm text-background/70">{text}</span>
    </div>
  );
}
