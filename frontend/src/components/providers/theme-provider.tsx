'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
      storageKey="ims-theme"
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
  
  const isSystem = React.useMemo(() => {
    return context.theme === 'system';
  }, [context.theme]);
  
  const toggleTheme = React.useCallback(() => {
    if (context.theme === 'light') {
      context.setTheme('dark');
    } else if (context.theme === 'dark') {
      context.setTheme('system');
    } else {
      context.setTheme('light');
    }
  }, [context.theme, context.setTheme]);
  
  return {
    ...context,
    isDark,
    isLight,
    isSystem,
    toggleTheme,
  };
}

// Theme constants for consistent usage
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type Theme = typeof THEMES[keyof typeof THEMES];
