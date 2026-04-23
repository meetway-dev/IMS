'use client';

import * as React from 'react';
import { useChangePassword } from '@/hooks/use-auth';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Eye, EyeOff, Check, X, AlertTriangle, Loader2 } from 'lucide-react';

export default function SecurityPage() {
  const changePassword = useChangePassword();
  const [showPasswords, setShowPasswords] = React.useState(false);

  const [passwords, setPasswords] = React.useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return;
    if (passwords.new.length < 8) return;

    changePassword.mutate(
      {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      },
      {
        onSuccess: () => {
          setPasswords({ current: '', new: '', confirm: '' });
        },
      },
    );
  };

  const passwordsMatch = passwords.new === passwords.confirm;
  const isValid =
    passwords.current.length > 0 &&
    passwords.new.length >= 8 &&
    /[A-Z]/.test(passwords.new) &&
    /[0-9]/.test(passwords.new) &&
    passwordsMatch;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title="Security"
        description="Manage your password and security settings"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-4 w-4" /> Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <div className="relative">
                <Input
                  id="current"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <Input
                  id="new"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input
                  id="confirm"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            {passwords.confirm && !passwordsMatch && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Password requirements:</p>
                <ul className="mt-1 space-y-0.5">
                  <li className="flex items-center gap-1">
                    {passwords.new.length >= 8 ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-1">
                    {/[A-Z]/.test(passwords.new) ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-1">
                    {/[0-9]/.test(passwords.new) ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
                    One number
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={changePassword.isPending || !isValid}>
                {changePassword.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                {changePassword.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
