# Theme System Documentation

## Overview

All colors used throughout the application are now centralized in a global theme system. This makes it easy to update colors across the entire codebase by modifying a single file.

## File Structure

- `src/theme/colors.ts` - Main theme file containing all color definitions
- `src/theme/index.ts` - Theme exports for easy importing
- `tailwind.css` - CSS variables for all theme colors
- `tailwind.config.js` - Tailwind configuration with theme color classes

## Usage

### 1. Using Colors in TypeScript/React Components

```typescript
import { colors, getColor } from '@/theme';

// Direct access
const primaryBg = colors.background.primary;
const primaryText = colors.text.primary;

// Using helper function
const color = getColor('text.primary');
const bgColor = getColor('background.card');
```

### 2. Using Colors in Tailwind Classes

All theme colors are available as Tailwind utility classes:

```tsx
// Background colors
<div className="bg-bg-primary">...</div>
<div className="bg-bg-card">...</div>
<div className="bg-bg-dark">...</div>

// Text colors
<p className="text-text-primary">...</p>
<p className="text-text-muted">...</p>
<p className="text-text-gray">...</p>

// Border colors
<div className="border border-border-primary">...</div>
<div className="border border-border-white-10">...</div>

// Accent colors
<span className="text-accent-cyan">...</span>
<span className="bg-accent-yellow">...</span>
```

### 3. Using CSS Variables Directly

You can also use CSS variables directly in your styles:

```css
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

## Color Categories

### Background Colors
- `bg-primary` - Main background (#050505)
- `bg-secondary` - Secondary background (#070707)
- `bg-card` - Card background (#070707)
- `bg-dark`, `bg-darker`, `bg-darkest` - Dark backgrounds
- `bg-gray`, `bg-gray-light`, `bg-gray-medium` - Gray backgrounds

### Text Colors
- `text-primary` - Primary text (white)
- `text-secondary` - Secondary text (white 80% opacity)
- `text-muted` - Muted text (white 70% opacity)
- `text-gray`, `text-gray-light`, etc. - Gray text variants
- `text-dark`, `text-dark-medium`, `text-dark-light` - Dark text

### Border Colors
- `border-primary` - Primary border (white 10% opacity)
- `border-secondary` - Secondary border (white 20% opacity)
- `border-white-*` - Various white border opacities
- `border-gray`, `border-gray-80`, `border-gray-33` - Gray borders

### Accent Colors
- `accent-cyan`, `accent-cyan-light` - Cyan accents
- `accent-yellow` - Yellow accent
- `accent-gray`, `accent-gray-light` - Gray accents

### Shadow Colors
- `shadow-black-*` - Black shadow variants
- `shadow-white-*` - White shadow variants
- `shadow-blue-*`, `shadow-purple-*` - Colored shadows

### Overlay Colors
- `overlay-white-*` - White overlay variants (05, 08, 10, 15, 20, 26, 40, 60, 80, 95)
- `overlay-black-*` - Black overlay variants (05, 10, 20, 30, 40, 50)
- `overlay-gray-80` - Gray overlay

## Updating the Theme

To update colors across the entire application:

1. **Update the theme file**: Edit `src/theme/colors.ts`
2. **Update CSS variables**: Edit `tailwind.css` if needed
3. **Update Tailwind config**: Edit `tailwind.config.js` if adding new colors

### Example: Changing Primary Background

1. In `src/theme/colors.ts`:
```typescript
background: {
  primary: "#0a0a0a", // Changed from #050505
  // ...
}
```

2. In `tailwind.css`:
```css
--bg-primary: #0a0a0a; /* Updated */
```

3. All components using `bg-bg-primary` or `colors.background.primary` will automatically use the new color!

## Migration Guide

### Before (Hardcoded Colors)
```tsx
<div className="bg-[#050505] text-[#ffffff] border-[#ffffff1a]">
  Content
</div>
```

### After (Theme Colors)
```tsx
<div className="bg-bg-primary text-text-primary border-border-primary">
  Content
</div>
```

Or using the theme object:
```tsx
import { colors } from '@/theme';

<div style={{ 
  backgroundColor: colors.background.primary,
  color: colors.text.primary,
  borderColor: colors.border.primary 
}}>
  Content
</div>
```

## Best Practices

1. **Always use theme colors** - Avoid hardcoded color values
2. **Use semantic names** - Choose colors based on their purpose (primary, secondary, muted, etc.)
3. **Update in one place** - All color changes should be made in `src/theme/colors.ts`
4. **Use Tailwind classes when possible** - They're more performant and easier to maintain
5. **Document custom colors** - If you add new colors, document their purpose

## Available Tailwind Classes

All theme colors are available as Tailwind classes. Use the format:
- Backgrounds: `bg-{color-name}`
- Text: `text-{color-name}`
- Borders: `border-{color-name}`
- Accents: `{color-name}` (can be used with bg-, text-, border-)

Example: `bg-bg-primary`, `text-text-primary`, `border-border-primary`, `text-accent-cyan`
