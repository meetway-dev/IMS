/**
 * Theme Configuration for IMS
 * 
 * This file extends the base theme with additional design options,
 * gradients, animations, and component-specific styles.
 */

import { designTokens } from './design-tokens';

export const themeConfig = {
  // Extended color palette
  extendedColors: {
    gradients: {
      primary: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)',
      success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      premium: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.08)',
      dark: 'rgba(0, 0, 0, 0.25)',
    },
  },

  // Component-specific styles
  components: {
    card: {
      base: 'rounded-xl border bg-card text-card-foreground shadow-soft',
      elevated: 'rounded-xl border bg-card text-card-foreground shadow-elevated',
      glass: 'rounded-xl border border-white/20 bg-white/5 backdrop-blur-md',
      interactive: 'transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5',
    },
    button: {
      sizes: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-6 text-base',
        xl: 'h-12 px-8 text-lg',
      },
      variants: {
        gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20',
        premium: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      },
    },
    badge: {
      sizes: {
        xs: 'px-1.5 py-0.5 text-[10px]',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
    },
    input: {
      sizes: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-3 text-base',
        lg: 'h-12 px-4 text-lg',
      },
      variants: {
        glass: 'bg-white/5 backdrop-blur-sm border-white/20',
        filled: 'bg-muted border-transparent',
      },
    },
  },

  // Animation configurations
  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    keyframes: {
      slideIn: {
        from: { transform: 'translateY(10px)', opacity: '0' },
        to: { transform: 'translateY(0)', opacity: '1' },
      },
      fadeIn: {
        from: { opacity: '0' },
        to: { opacity: '1' },
      },
      scaleIn: {
        from: { transform: 'scale(0.95)', opacity: '0' },
        to: { transform: 'scale(1)', opacity: '1' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
      shimmer: {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
    },
  },

  // Layout configurations
  layout: {
    container: {
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '2.5rem',
        xl: '3rem',
      },
      maxWidth: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
        '3xl': '1600px',
      },
    },
    sidebar: {
      width: {
        collapsed: '5rem',
        expanded: '16rem',
      },
    },
    header: {
      height: '4rem',
    },
  },

  // Typography scale
  typography: {
    headings: {
      h1: 'text-3xl md:text-4xl font-bold tracking-tight',
      h2: 'text-2xl md:text-3xl font-semibold tracking-tight',
      h3: 'text-xl md:text-2xl font-semibold',
      h4: 'text-lg md:text-xl font-semibold',
      h5: 'text-base md:text-lg font-semibold',
      h6: 'text-sm md:text-base font-semibold',
    },
    body: {
      small: 'text-sm leading-relaxed',
      base: 'text-base leading-relaxed',
      large: 'text-lg leading-relaxed',
    },
    utility: {
      caption: 'text-xs text-muted-foreground',
      label: 'text-sm font-medium',
      code: 'font-mono text-sm bg-muted px-1 py-0.5 rounded',
    },
  },

  // Spacing system
  spacing: designTokens.spacing,

  // Border radius system
  borderRadius: designTokens.borderRadius,

  // Shadow system
  shadows: designTokens.shadows,
} as const;

/**
 * Utility functions for theme configuration
 */
export const themeUtils = {
  // Generate CSS classes
  cls: (...classes: (string | false | null | undefined)[]): string => 
    classes.filter(Boolean).join(' '),

  // Responsive helper
  responsive: (breakpoint: keyof typeof designTokens.breakpoints, styles: string): string =>
    `@media (min-width: ${designTokens.breakpoints[breakpoint]}) { ${styles} }`,

  // Color opacity helper
  withOpacity: (color: string, opacity: number): string => {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    if (color.startsWith('hsl')) {
      return color.replace(')', `, ${opacity})`).replace('hsl', 'hsla');
    }
    return color;
  },

  // Animation helper
  animation: (name: keyof typeof themeConfig.animations.keyframes, duration: string = '300ms', timing: string = 'ease-out'): string =>
    `${name} ${duration} ${timing}`,
};

export type ThemeConfig = typeof themeConfig;
export type ThemeUtils = typeof themeUtils;