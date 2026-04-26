# Theming System

This document describes the theming system implemented in the IMS application.

## Overview

The application uses a comprehensive theming system built on:
- **next-themes** for theme management
- **Tailwind CSS** with CSS custom properties
- **5 theme modes**: Light, Dark, Ocean, Sunset, and System (auto-detect)
- **Smooth transitions** between themes

## Available Themes

| Theme | Key | Description |
|-------|-----|-------------|
| Light | `light` | Clean, modern, professional — default light palette |
| Dark | `dark` | Premium dark theme with deep blues |
| Ocean | `ocean` | Cool, deep-sea blues and teals |
| Sunset | `sunset` | Warm oranges, ambers, and golden hues |
| System | `system` | Follows OS preference (light/dark) |

## Theme Structure

### Theme Provider
Located at `src/components/providers/theme-provider.tsx`:
- Provides theme context to the entire application
- Supports `light`, `dark`, `ocean`, `sunset`, and `system` themes
- Persists theme preference in localStorage (`ims-theme` key)
- Exports `THEMES` constant, `THEME_META`, and `THEME_LIST` for consistent usage
- Custom `useTheme` hook with `isDark`, `isLight`, `isOcean`, `isSunset`, `isSystem` helpers

### Theme Toggle Component
Located at `src/components/ui/theme-toggle.tsx`:
- **`ThemeToggle`** — Dropdown menu with all theme options and visual indicators
- **`ThemeToggleInline`** — Cycle toggle that rotates through all themes on click
- **`ThemePicker`** — Compact variant with color dot indicators
- Each theme has a unique icon: Sun (Light), Moon (Dark), Waves (Ocean), Sunset (Sunset), Monitor (System)
- Accessible with proper ARIA labels

### CSS Variables
Defined in `src/styles/globals.css`:
- Comprehensive color palette using HSL values
- Separate class definitions: `:root` (light), `.dark`, `.ocean`, `.sunset`
- Semantic color tokens (primary, secondary, destructive, success, warning, info)
- Sidebar-specific color tokens
- Chart colors for data visualization

## Usage

### Using the Theme Toggle
The theme toggle is automatically added to the topbar. Users can:
1. Click the theme icon to open dropdown
2. Select from Light, Dark, Ocean, Sunset, or System themes
3. The theme changes immediately with smooth transitions

### Programmatic Theme Control
```tsx
import { useTheme, THEMES } from '@/components/providers/theme-provider';

function MyComponent() {
  const { theme, setTheme, isDark, isLight, isOcean, isSunset, isSystem, toggleTheme } = useTheme();
  
  return (
    <div>
      <button onClick={() => setTheme(THEMES.OCEAN)}>Set Ocean</button>
      <button onClick={() => setTheme(THEMES.SUNSET)}>Set Sunset</button>
      <button onClick={toggleTheme}>Cycle Theme</button>
      <p>Current theme: {theme}</p>
    </div>
  );
}
```

### Using Theme Constants
```tsx
import { THEMES, THEME_META, THEME_LIST } from '@/components/providers/theme-provider';

// THEME_LIST — all non-system theme keys: ['light', 'dark', 'ocean', 'sunset']
// THEME_META — labels and icon identifiers for each theme
// THEMES — individual constants: THEMES.LIGHT, THEMES.DARK, THEMES.OCEAN, THEMES.SUNSET, THEMES.SYSTEM
```

### Styling with Theme-Aware Classes
```tsx
// Use Tailwind's dark: variant (works for dark theme only)
<div className="bg-background text-foreground dark:bg-card dark:text-card-foreground">
  Content
</div>

// Use CSS variables directly (works for ALL themes automatically)
<style jsx>{`
  .custom-element {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
`}</style>
```

## Theme Colors

### Light Theme (`:root`)
- Background: `hsl(0 0% 99%)`
- Foreground: `hsl(224 71.4% 4.1%)`
- Primary: `hsl(220.9 39.3% 11%)`
- Secondary: `hsl(220 14.3% 95.9%)`
- Border: `hsl(220 13% 91%)`

### Dark Theme (`.dark`)
- Background: `hsl(224 71.4% 4.1%)`
- Foreground: `hsl(210 20% 98%)`
- Primary: `hsl(210 20% 98%)`
- Secondary: `hsl(215 27.9% 16.9%)`
- Border: `hsl(215 27.9% 16.9%)`

### Ocean Theme (`.ocean`)
- Background: `hsl(210 40% 97%)` — Cool light blue
- Foreground: `hsl(213 68% 8%)` — Deep navy
- Primary: `hsl(210 100% 36%)` — Deep Ocean Blue
- Secondary: `hsl(190 30% 92%)` — Seafoam
- Accent: `hsl(185 40% 90%)` — Teal
- Border: `hsl(210 20% 88%)`

### Sunset Theme (`.sunset`)
- Background: `hsl(30 40% 97%)` — Warm cream
- Foreground: `hsl(20 60% 8%)` — Rich brown
- Primary: `hsl(24 95% 40%)` — Warm Amber
- Secondary: `hsl(25 60% 92%)` — Peach
- Accent: `hsl(10 60% 90%)` — Coral
- Border: `hsl(25 25% 87%)`

## Adding a New Theme

1. Add CSS variables in `globals.css`:
```css
.mytheme {
  --background: 220 83% 97%;
  --foreground: 220 83% 8%;
  --primary: 220 83% 53%;
  --primary-foreground: 220 83% 98%;
  /* ... all other variables ... */
}
```

2. Register in `theme-provider.tsx`:
```ts
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  OCEAN: 'ocean',
  SUNSET: 'sunset',
  MYTHEME: 'mytheme',  // Add here
  SYSTEM: 'system',
} as const;

export const THEME_META = {
  // ... existing ...
  mytheme: { label: 'My Theme', icon: 'mytheme' },
};

export const THEME_LIST = [
  THEMES.LIGHT,
  THEMES.DARK,
  THEMES.OCEAN,
  THEMES.SUNSET,
  THEMES.MYTHEME,  // Add here
];
```

3. Add icon mapping in `theme-toggle.tsx`:
```ts
import { MyIcon } from 'lucide-react';

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  ocean: Waves,
  sunset: Sunset,
  mytheme: MyIcon,  // Add here
};
```

4. Add the theme to the dropdown menu items array in `ThemeToggle` and `ThemePicker`.

## Best Practices

1. **Always use semantic color tokens** (`primary`, `secondary`, etc.) instead of hardcoded colors
2. **Test all themes** (light, dark, ocean, sunset) for every component
3. **Use the `useTheme` hook** for programmatic theme control
4. **Respect user preferences** by defaulting to `system` theme
5. **Ensure sufficient contrast** between foreground and background colors in every theme
6. **Never hardcode HSL values** in components — always use CSS variables

## Browser Support

- All modern browsers with CSS custom properties support
- Automatic fallback for older browsers (graceful degradation)
- Respects `prefers-color-scheme` media query for system theme

## Performance Considerations

- Theme changes are optimized with `disableTransitionOnChange`
- CSS variables are compiled at build time
- No runtime CSS injection
- Minimal bundle size impact
