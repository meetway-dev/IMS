'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

// All available themes in the application
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  OCEAN: 'ocean',
  SUNSET: 'sunset',
  SYSTEM: 'system',
} as const;

export type Theme = typeof THEMES[keyof typeof THEMES];

// Theme metadata for UI rendering
export const THEME_META: Record<Exclude<Theme, 'system'>, { label: string; icon: string }> = {
  light: { label: 'Light', icon: 'sun' },
  dark: { label: 'Dark', icon: 'moon' },
  ocean: { label: 'Ocean', icon: 'ocean' },
  sunset: { label: 'Sunset', icon: 'sunset' },
};

// All non-system theme keys for the provider
export const THEME_LIST: string[] = [
  THEMES.LIGHT,
  THEMES.DARK,
  THEMES.OCEAN,
  THEMES.SUNSET,
];

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
      storageKey="ims-theme"
      themes={[...THEME_LIST, THEMES.SYSTEM]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// Custom hook for theme with additional utilities
export function useTheme() {
  const context = useNextTheme();

  const isDark = React.useMemo(() => {
    return context.theme === 'dark';
  }, [context.theme]);

  const isLight = React.useMemo(() => {
    return context.theme === 'light';
  }, [context.theme]);

  const isOcean = React.useMemo(() => {
    return context.theme === 'ocean';
  }, [context.theme]);

  const isSunset = React.useMemo(() => {
    return context.theme === 'sunset';
  }, [context.theme]);

  const isSystem = React.useMemo(() => {
    return context.theme === 'system';
  }, [context.theme]);

  const toggleTheme = React.useCallback(() => {
    const themeOrder = [THEMES.LIGHT, THEMES.DARK, THEMES.OCEAN, THEMES.SUNSET, THEMES.SYSTEM] as const;
    const currentIndex = themeOrder.indexOf((context.theme ?? 'system') as Theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    context.setTheme(themeOrder[nextIndex]);
  }, [context.theme, context.setTheme]);

  return {
    ...context,
    isDark,
    isLight,
    isOcean,
    isSunset,
    isSystem,
    toggleTheme,
  };
}
