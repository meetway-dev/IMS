'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';

const forgotPasswordSchema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
});

type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      // TODO: Implement forgot-password API call
      // await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      toast({
        title: 'Reset link sent',
        description: 'If an account exists with that email, you will receive a password reset link.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset link. Please try again.',
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
              Reset your password
            </h2>
            <p className="text-lg text-background/60 leading-relaxed">
              Don't worry, it happens to the best of us. Enter your email and we'll send you a link to reset your password.
            </p>
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

          {!isSubmitted ? (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Check your email</h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  If an account exists with that email, you will receive a password reset link shortly.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full h-10"
                onClick={() => setIsSubmitted(false)}
              >
                Try a different email
              </Button>
            </div>
          )}

          <p className="text-sm text-center text-muted-foreground">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-foreground font-medium hover:underline transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
