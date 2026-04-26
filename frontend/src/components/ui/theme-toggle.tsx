'use client';

import * as React from 'react';
import { Moon, Sun, Monitor, Waves, Sunset } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { THEME_META, THEMES, type Theme } from '@/components/providers/theme-provider';

// Icon mapping for each theme
const THEME_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  light: Sun,
  dark: Moon,
  ocean: Waves,
  sunset: Sunset,
  system: Monitor,
};

// Color dot indicators for each theme
const THEME_COLORS: Record<string, string> = {
  light: 'bg-yellow-400',
  dark: 'bg-slate-700',
  ocean: 'bg-sky-500',
  sunset: 'bg-orange-500',
  system: 'bg-gradient-to-r from-yellow-400 via-slate-500 to-sky-500',
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        className="h-8 w-8"
        aria-label="Toggle theme"
        disabled
      >
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  const resolvedTheme = theme ?? 'system';
  const CurrentIcon = THEME_ICONS[resolvedTheme] ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 relative"
          aria-label={`Switch theme (current: ${THEME_META[resolvedTheme as Exclude<Theme, 'system'>]?.label ?? 'System'})`}
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Switch theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {([
          [THEMES.LIGHT, 'Light'],
          [THEMES.DARK, 'Dark'],
          [THEMES.OCEAN, 'Ocean'],
          [THEMES.SUNSET, 'Sunset'],
        ] as [Theme, string][]).map(([value, label]) => {
          const Icon = THEME_ICONS[value];
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {resolvedTheme === value && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {resolvedTheme === 'system' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple inline toggle variant (cycles through all themes)
export function ThemeToggleInline() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const resolvedTheme = theme ?? 'system';

  const toggleTheme = () => {
    const themeOrder = [THEMES.LIGHT, THEMES.DARK, THEMES.OCEAN, THEMES.SUNSET, THEMES.SYSTEM] as const;
    const currentIndex = themeOrder.indexOf(resolvedTheme as Theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const Icon = THEME_ICONS[resolvedTheme] ?? Monitor;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      className="h-8 w-8"
      aria-label={`Switch theme (current: ${THEME_META[resolvedTheme as Exclude<Theme, 'system'>]?.label ?? 'System'})`}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Switch theme</span>
    </Button>
  );
}

// Theme picker with color dots — compact variant for topbar
export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 px-1">
        {Object.keys(THEME_COLORS).map((key) => (
          <div
            key={key}
            className="h-4 w-4 rounded-full opacity-30"
          />
        ))}
      </div>
    );
  }

  const resolvedTheme = theme ?? 'system';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 relative"
          aria-label={`Switch theme (current: ${THEME_META[resolvedTheme as Exclude<Theme, 'system'>]?.label ?? 'System'})`}
        >
          <div className="flex items-center gap-0.5">
            <div className={`h-2.5 w-2.5 rounded-full ${THEME_COLORS[resolvedTheme] ?? 'bg-muted'}`} />
          </div>
          <span className="sr-only">Switch theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {([
          [THEMES.LIGHT, 'Light'],
          [THEMES.DARK, 'Dark'],
          [THEMES.OCEAN, 'Ocean'],
          [THEMES.SUNSET, 'Sunset'],
        ] as [Theme, string][]).map(([value, label]) => {
          const Icon = THEME_ICONS[value];
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className={`h-3 w-3 rounded-full ${THEME_COLORS[value]}`} />
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {resolvedTheme === value && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-yellow-400 via-slate-500 to-sky-500" />
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {resolvedTheme === 'system' && (
            <span className="ml-auto text-xs text-muted-foreground">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
