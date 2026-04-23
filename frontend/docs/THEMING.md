# Theming System

This document describes the theming system implemented in the IMS application.

## Overview

The application uses a comprehensive theming system built on:
- **next-themes** for theme management
- **Tailwind CSS** with CSS custom properties
- **Dark mode** support with system preference detection
- **Smooth transitions** between themes

## Theme Structure

### Theme Provider
Located at `src/components/providers/theme-provider.tsx`:
- Provides theme context to the entire application
- Supports `light`, `dark`, and `system` themes
- Persists theme preference in localStorage (`ims-theme` key)
- Enables smooth transitions with `disableTransitionOnChange`

### Theme Toggle Component
Located at `src/components/ui/theme-toggle.tsx`:
- Dropdown menu with theme options (Light, Dark, System)
- Visual indicators for current theme
- Accessible with proper ARIA labels
- Two variants: `ThemeToggle` (dropdown) and `ThemeToggleInline` (cycle toggle)

### CSS Variables
Defined in `src/styles/globals.css`:
- Comprehensive color palette using HSL values
- Separate definitions for `:root` (light) and `.dark` (dark)
- Semantic color tokens (primary, secondary, destructive, etc.)
- Chart colors for data visualization

## Usage

### Using the Theme Toggle
The theme toggle is automatically added to the topbar. Users can:
1. Click the theme icon to open dropdown
2. Select from Light, Dark, or System themes
3. The theme changes immediately with smooth transitions

### Programmatic Theme Control
```tsx
import { useTheme, THEMES } from '@/components/providers/theme-provider';

function MyComponent() {
  const { theme, setTheme, isDark, isLight, isSystem, toggleTheme } = useTheme();
  
  return (
    <div>
      <button onClick={() => setTheme(THEMES.DARK)}>Set Dark</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <p>Current theme: {theme}</p>
    </div>
  );
}
```

### Styling with Theme-Aware Classes
```tsx
// Use Tailwind's dark: variant
<div className="bg-background text-foreground dark:bg-card dark:text-card-foreground">
  Content
</div>

// Use CSS variables directly
<style jsx>{`
  .custom-element {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
`}</style>
```

## Theme Colors

### Light Theme (`:root`)
- Background: `hsl(0 0% 100%)`
- Foreground: `hsl(240 10% 3.9%)`
- Primary: `hsl(240 5.9% 10%)`
- Secondary: `hsl(240 4.8% 95.9%)`
- Border: `hsl(240 5.9% 90%)`

### Dark Theme (`.dark`)
- Background: `hsl(240 10% 3.9%)`
- Foreground: `hsl(0 0% 98%)`
- Primary: `hsl(0 0% 98%)`
- Secondary: `hsl(240 3.7% 15.9%)`
- Border: `hsl(240 3.7% 15.9%)`

## Adding New Theme Colors

1. Add CSS variable in `globals.css`:
```css
:root {
  --custom-color: 220 83% 53%;
}

.dark {
  --custom-color: 217 91% 60%;
}
```

2. Add to Tailwind config in `tailwind.config.ts`:
```ts
colors: {
  custom: {
    DEFAULT: 'hsl(var(--custom-color))',
  },
}
```

3. Use in components:
```tsx
<div className="bg-custom text-custom-foreground">
```

## Best Practices

1. **Always use semantic color tokens** (`primary`, `secondary`, etc.) instead of hardcoded colors
2. **Test both light and dark themes** for all components
3. **Use the `useTheme` hook** for programmatic theme control
4. **Respect user preferences** by defaulting to `system` theme
5. **Ensure sufficient contrast** between foreground and background colors

## Browser Support

- All modern browsers with CSS custom properties support
- Automatic fallback for older browsers (graceful degradation)
- Respects `prefers-color-scheme` media query for system theme

## Performance Considerations

- Theme changes are optimized with `disableTransitionOnChange`
- CSS variables are compiled at build time
- No runtime CSS injection
- Minimal bundle size impact