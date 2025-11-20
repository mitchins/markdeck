# UI Guidelines

**Author:** UX Lead  
**Date:** 2025-11-20  
**Status:** Active  
**Version:** 0.2.0

---

## Executive Summary

This document defines the complete visual design system for MarkDeck, including typography, spacing, color palette, light/dark modes, layout constraints, and responsive behavior. These guidelines ensure visual consistency, accessibility, and a professional developer-tool aesthetic throughout the application.

**Design Philosophy:**
1. **Developer-First** - Information-dense, minimal chrome, functional aesthetics
2. **Scanability** - Clear hierarchy, consistent spacing, obvious affordances
3. **Accessibility** - WCAG AA compliance, high contrast, keyboard-friendly
4. **Performance** - Optimized rendering, smooth animations, responsive layouts
5. **Consistency** - Reusable patterns, predictable interactions, unified voice

---

## Typography Scale

### Font Families

**UI Font: Inter**
- Usage: All interface text (headings, body, buttons, labels)
- Weights: Regular (400), Medium (500), Semibold (600), Bold (700)
- Download: [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- Fallback: `system-ui, -apple-system, 'Segoe UI', 'Roboto', sans-serif`

**Code Font: JetBrains Mono**
- Usage: Code snippets, markdown view, technical content
- Weights: Regular (400), Medium (500)
- Download: [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- Fallback: `'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace`

**Font Loading:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

| Name | Size | Line Height | Weight | Letter Spacing | Use Case |
|------|------|-------------|--------|----------------|----------|
| **H1** | 20px | 1.2 (24px) | Bold (700) | -0.02em | App title, page title |
| **H2** | 16px | 1.3 (21px) | Semibold (600) | 0em | Swimlane titles |
| **H3** | 12px | 1.2 (14px) | Medium (500) | 0.05em | Column headers (uppercase) |
| **Body** | 12px | 1.4 (17px) | Medium (500) | 0em | Card titles |
| **Body Small** | 12px | 1.6 (19px) | Regular (400) | 0em | Card descriptions, longer text |
| **Caption** | 11px | 1.6 (18px) | Regular (400) | 0.01em | Metadata, counts, timestamps |
| **Button** | 12px | 1 (12px) | Medium (500) | 0.02em | Button labels |
| **Code** | 12px | 1.5 (18px) | Regular (400) | 0em | Markdown, error codes |

### Text Styles (CSS)

```css
/* Headings */
.text-h1 {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.text-h2 {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: 0;
}

.text-h3 {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 12px;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Body */
.text-body {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 500;
  letter-spacing: 0;
}

.text-body-small {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 12px;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: 0;
}

/* Caption */
.text-caption {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 11px;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: 0.01em;
}

/* Button */
.text-button {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* Code */
.text-code {
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 400;
  letter-spacing: 0;
}
```

### Truncation and Overflow

**Single-line truncation:**
```css
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**Multi-line truncation (Webkit only):**
```css
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## Spacing Scale

### Base Unit: 4px Grid

All spacing values are multiples of 4px to ensure visual rhythm and consistency.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon-text gap, tight inline spacing |
| `space-2` | 8px | Card internal padding, button padding |
| `space-3` | 12px | Card padding, form field spacing |
| `space-4` | 16px | Swimlane padding, section gaps |
| `space-5` | 20px | Large section gaps |
| `space-6` | 24px | Modal padding, major layout gaps |
| `space-8` | 32px | Page padding, hero sections |
| `space-10` | 40px | Extra large spacing |
| `space-12` | 48px | Maximum spacing unit |

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    spacing: {
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '7': '28px',
      '8': '32px',
      '9': '36px',
      '10': '40px',
      '11': '44px',
      '12': '48px',
      // ... continue pattern
    }
  }
}
```

### Component Spacing

**Card:**
```css
.card {
  padding: 12px; /* p-3 */
  gap: 8px; /* gap-2 for internal elements */
  margin-bottom: 8px; /* mb-2 between cards */
}
```

**Swimlane:**
```css
.swimlane {
  padding: 16px; /* p-4 */
  margin-bottom: 16px; /* mb-4 between swimlanes */
}

.swimlane-header {
  padding: 16px; /* p-4 */
  margin-bottom: 12px; /* mb-3 before content */
}
```

**Column:**
```css
.column {
  padding: 12px; /* p-3 */
  gap: 8px; /* gap-2 between cards */
}
```

**Layout:**
```css
.board-container {
  padding: 16px; /* p-4 on all sides */
}

.header {
  padding: 16px 24px; /* py-4 px-6 */
}
```

---

## Color Palette

### Color System (OKLch)

Using OKLch color space for perceptually uniform colors and better dark mode support.

**Why OKLch:**
- Perceptually uniform (consistent lightness)
- Better color manipulation (lightness, chroma, hue)
- Future-proof (CSS Color Level 4)
- Excellent for dark mode (predictable inversions)

### Light Mode Palette

#### Base Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `oklch(0.98 0 0)` | Page background (near white) |
| `--color-bg-secondary` | `oklch(0.96 0 0)` | Card background |
| `--color-bg-muted` | `oklch(0.94 0.01 250)` | Swimlane background |
| `--color-bg-hover` | `oklch(0.92 0.01 250)` | Hover states |
| `--color-text-primary` | `oklch(0.25 0.02 250)` | Body text (dark slate) |
| `--color-text-secondary` | `oklch(0.45 0.02 250)` | Muted text |
| `--color-text-tertiary` | `oklch(0.6 0.02 250)` | Disabled text |
| `--color-border` | `oklch(0.85 0 0)` | Default borders |
| `--color-border-hover` | `oklch(0.75 0 0)` | Hover borders |

#### Semantic Colors

**Status Colors:**

| Status | Color | Value | Use Case |
|--------|-------|-------|----------|
| **TODO** | Cyan | `oklch(0.70 0.12 200)` | TODO status, accent |
| **IN PROGRESS** | Amber | `oklch(0.65 0.14 75)` | IN PROGRESS status, warnings |
| **DONE** | Green | `oklch(0.55 0.15 145)` | DONE status, success |
| **BLOCKED** | Red | `oklch(0.55 0.18 25)` | Blocked flag, errors |

**Interaction Colors:**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `oklch(0.35 0.05 250)` | Primary buttons, links |
| `--color-primary-hover` | `oklch(0.30 0.06 250)` | Primary hover |
| `--color-accent` | `oklch(0.70 0.12 200)` | Accent (same as TODO) |
| `--color-success` | `oklch(0.55 0.15 145)` | Success messages |
| `--color-warning` | `oklch(0.65 0.14 75)` | Warning messages |
| `--color-error` | `oklch(0.55 0.18 25)` | Error messages |
| `--color-info` | `oklch(0.60 0.12 250)` | Info messages |

#### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Base
        background: 'oklch(0.98 0 0)',
        foreground: 'oklch(0.25 0.02 250)',
        
        // Card
        card: 'oklch(0.96 0 0)',
        'card-foreground': 'oklch(0.25 0.02 250)',
        
        // Muted
        muted: 'oklch(0.94 0.01 250)',
        'muted-foreground': 'oklch(0.45 0.02 250)',
        
        // Primary
        primary: 'oklch(0.35 0.05 250)',
        'primary-foreground': 'oklch(0.98 0 0)',
        
        // Accent
        accent: 'oklch(0.70 0.12 200)',
        'accent-foreground': 'oklch(0.25 0.02 250)',
        
        // Status
        todo: 'oklch(0.70 0.12 200)',
        'in-progress': 'oklch(0.65 0.14 75)',
        done: 'oklch(0.55 0.15 145)',
        blocked: 'oklch(0.55 0.18 25)',
        
        // Semantic
        success: 'oklch(0.55 0.15 145)',
        warning: 'oklch(0.65 0.14 75)',
        error: 'oklch(0.55 0.18 25)',
        info: 'oklch(0.60 0.12 250)',
        
        // Border
        border: 'oklch(0.85 0 0)',
        input: 'oklch(0.85 0 0)',
        ring: 'oklch(0.70 0.12 200)',
      }
    }
  }
}
```

### Dark Mode Palette

**Dark Mode Strategy:**
- Invert lightness values
- Maintain same hue and chroma
- Slightly desaturate for eye comfort
- Avoid pure black (causes halation)

#### Dark Mode Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `oklch(0.18 0.02 250)` | Page background (dark slate) |
| `--color-bg-secondary` | `oklch(0.22 0.02 250)` | Card background |
| `--color-bg-muted` | `oklch(0.25 0.02 250)` | Swimlane background |
| `--color-bg-hover` | `oklch(0.28 0.02 250)` | Hover states |
| `--color-text-primary` | `oklch(0.95 0 0)` | Body text (near white) |
| `--color-text-secondary` | `oklch(0.70 0.01 250)` | Muted text |
| `--color-text-tertiary` | `oklch(0.50 0.01 250)` | Disabled text |
| `--color-border` | `oklch(0.35 0.01 250)` | Default borders |
| `--color-border-hover` | `oklch(0.45 0.02 250)` | Hover borders |

**Status Colors (Dark Mode):**
- Slightly reduce chroma (saturation) for eye comfort
- Increase lightness for better contrast on dark background

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: oklch(0.18 0.02 250);
    --color-bg-secondary: oklch(0.22 0.02 250);
    --color-text-primary: oklch(0.95 0 0);
    --color-text-secondary: oklch(0.70 0.01 250);
    
    --color-todo: oklch(0.75 0.10 200);
    --color-in-progress: oklch(0.70 0.12 75);
    --color-done: oklch(0.65 0.13 145);
    --color-blocked: oklch(0.65 0.15 25);
    
    --color-border: oklch(0.35 0.01 250);
  }
}
```

### Color Usage Guidelines

**Never use color alone:**
- Always pair with icon or text label
- Ensure sufficient contrast (4.5:1 minimum)
- Use patterns or textures for additional differentiation

**Status Indicators:**
```html
<!-- Good: Color + Icon + Text -->
<div class="status-indicator">
  <span class="icon" aria-hidden="true">✅</span>
  <span class="text">DONE</span>
  <span class="badge bg-done"></span>
</div>

<!-- Bad: Color only -->
<div class="status-indicator bg-done"></div>
```

---

## Light and Dark Mode

### Mode Switching

**System Preference (Default):**
```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
}
```

**User Override (Future):**
```html
<button aria-label="Toggle dark mode">
  <MoonIcon class="dark:hidden" />
  <SunIcon class="hidden dark:block" />
</button>
```

```typescript
// Toggle dark mode
function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Initialize on load
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
  document.documentElement.classList.add('dark');
}
```

### Dark Mode Best Practices

**Avoid Pure Black:**
- Use `oklch(0.18 0.02 250)` instead of `#000`
- Pure black causes halation and eye strain on OLED screens

**Reduce Saturation:**
- Slightly desaturate colors in dark mode
- Prevents oversaturation on dark backgrounds

**Adjust Shadows:**
```css
/* Light mode */
.card {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .card {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
}
```

**Invert Images (if needed):**
```css
@media (prefers-color-scheme: dark) {
  img.invert-dark {
    filter: invert(1) hue-rotate(180deg);
  }
}
```

---

## Layout Constraints

### Container Widths

| Breakpoint | Container Max-Width | Usage |
|------------|---------------------|-------|
| Mobile | 100% | Full width |
| Tablet | 768px | Centered content |
| Desktop | 1280px | Optimal reading width |
| Wide | 1536px | Maximum width |

### Swimlane Constraints

**Min/Max Widths:**
```css
.swimlane {
  width: 100%;
  min-height: 200px; /* Collapsed height */
}
```

**Column Widths:**
```css
.column {
  min-width: 280px; /* Prevent cards from becoming too narrow */
  max-width: 400px; /* Prevent cards from becoming too wide */
  flex: 1; /* Equal width distribution */
}
```

**Card Dimensions:**
```css
.card {
  min-height: 80px; /* Compact but readable */
  max-height: 240px; /* Prevent excessive vertical sprawl */
  width: 100%; /* Fill column */
  padding: 12px;
}
```

### Grid Layouts

**Board Grid (Desktop):**
```css
.board {
  display: grid;
  gap: 16px; /* gap-4 */
  padding: 16px; /* p-4 */
}

.swimlane-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 equal columns */
  gap: 16px; /* gap-4 */
}
```

**Header Layout:**
```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px; /* py-4 px-6 */
  border-bottom: 1px solid var(--color-border);
}
```

---

## Mobile Breakdown

### Breakpoints

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet portrait
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Extra large desktop
    }
  }
}
```

### Responsive Behavior

#### Mobile (<768px)

**Layout:**
- Single column view
- Swimlanes become accordions (only one expanded)
- Tabs for status columns (TODO | IN PROGRESS | DONE)
- Drawer becomes full-screen modal

**Typography:**
```css
@media (max-width: 767px) {
  .text-h1 { font-size: 18px; }
  .text-h2 { font-size: 15px; }
  .text-body { font-size: 14px; } /* Slightly larger for mobile readability */
}
```

**Spacing:**
```css
@media (max-width: 767px) {
  .board { padding: 12px; } /* p-3 */
  .swimlane { padding: 12px; } /* p-3 */
  .header { padding: 12px 16px; } /* py-3 px-4 */
}
```

**Touch Targets:**
```css
@media (max-width: 767px) {
  button,
  a {
    min-height: 44px; /* WCAG AAA touch target */
    min-width: 44px;
  }
  
  .card {
    min-height: 60px; /* Larger tap area */
    padding: 16px; /* p-4 */
  }
}
```

**Board Layout (Mobile):**
```
┌─────────────────────┐
│   Header            │
│ [≡] MarkDeck  [•]   │
├─────────────────────┤
│ Tabs                │
│ [TODO*] [IN P] [✓]  │
├─────────────────────┤
│ Swimlane: Features  │ ← Collapsed by default
├─────────────────────┤
│ ⌄ Swimlane: Bugs    │ ← Expanded
│                     │
│ ┌─────────────────┐ │
│ │ Card 1          │ │
│ │ [!]             │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Card 2     🚫  │ │
│ │ [!]             │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│ Swimlane: Infra     │
└─────────────────────┘
```

#### Tablet (768px - 1023px)

**Layout:**
- 2 columns per swimlane (TODO + IN PROGRESS on row 1, DONE on row 2)
- Swimlanes remain collapsible
- Drawer slides from right (320px width)

**Board Layout (Tablet):**
```
┌────────────────────────────────┐
│ Header                         │
├────────────────────────────────┤
│ Swimlane: Feature Work         │
│                                │
│ ┌─────────┐ ┌─────────┐        │
│ │ TODO    │ │ IN PROG │        │
│ └─────────┘ └─────────┘        │
│                                │
│ ┌───────────────────┐          │
│ │       DONE        │          │
│ └───────────────────┘          │
└────────────────────────────────┘
```

#### Desktop (1024px+)

**Layout:**
- 3 columns side-by-side
- All swimlanes visible
- Full-featured drawer (400px width)

**Board Layout (Desktop):**
```
┌──────────────────────────────────────────┐
│ Header                                   │
├──────────────────────────────────────────┤
│ Swimlane: Feature Work                   │
│                                          │
│ ┌────────┐ ┌────────┐ ┌────────┐        │
│ │ TODO   │ │ IN PROG│ │ DONE   │        │
│ └────────┘ └────────┘ └────────┘        │
└──────────────────────────────────────────┘
```

### Mobile Interactions

**Swipe Gestures:**
```typescript
// Swipe between status columns (mobile)
let touchStartX = 0;

element.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});

element.addEventListener('touchend', (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) > 50) { // 50px threshold
    if (diff > 0) {
      // Swipe left → Next column
      navigateToNextColumn();
    } else {
      // Swipe right → Previous column
      navigateToPreviousColumn();
    }
  }
});
```

**Long Press for Context Menu:**
```typescript
let pressTimer;

card.addEventListener('touchstart', (e) => {
  pressTimer = setTimeout(() => {
    showContextMenu(card);
  }, 500); // 500ms long press
});

card.addEventListener('touchend', () => {
  clearTimeout(pressTimer);
});

card.addEventListener('touchmove', () => {
  clearTimeout(pressTimer);
});
```

---

## Component Patterns

### Buttons

**Primary Button:**
```css
.button-primary {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  padding: 8px 16px; /* py-2 px-4 */
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: all 150ms ease-out;
}

.button-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.button-primary:active {
  transform: translateY(0);
}

.button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Secondary Button:**
```css
.button-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 150ms ease-out;
}

.button-secondary:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg-hover);
}
```

**Icon Button:**
```css
.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: 4px;
  transition: all 150ms ease-out;
}

.button-icon:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}
```

### Form Inputs

**Text Input:**
```css
.input {
  width: 100%;
  padding: 8px 12px; /* py-2 px-3 */
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 12px;
  line-height: 1.4;
  transition: all 150ms ease-out;
}

.input:focus {
  outline: 2px solid var(--color-ring);
  outline-offset: 0;
  border-color: var(--color-ring);
}

.input:invalid {
  border-color: var(--color-error);
}

.input::placeholder {
  color: var(--color-text-tertiary);
}
```

**Textarea:**
```css
.textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: 'JetBrains Mono', monospace; /* Code font for descriptions */
  font-size: 12px;
  line-height: 1.5;
  resize: vertical;
}
```

**Select:**
```css
.select {
  width: 100%;
  padding: 8px 32px 8px 12px; /* Extra right padding for chevron */
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-primary);
  background-image: url("data:image/svg+xml,..."); /* Chevron icon */
  background-repeat: no-repeat;
  background-position: right 8px center;
  appearance: none;
  cursor: pointer;
}
```

### Cards

**Base Card:**
```css
.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px; /* p-3 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 150ms ease-out;
  cursor: pointer;
}

.card:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.card[data-blocked="true"] {
  border-left: 4px solid var(--color-blocked);
}
```

### Modals and Drawers

**Modal Overlay:**
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 50;
  animation: fadeIn 150ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Modal Content:**
```css
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 32px; /* p-8 */
  max-width: 520px;
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  z-index: 51;
  animation: slideUp 200ms ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, -45%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
```

**Drawer:**
```css
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  max-width: 90vw;
  background: var(--color-bg-primary);
  border-left: 1px solid var(--color-border);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 51;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 250ms ease-out;
}

.drawer[data-open="true"] {
  transform: translateX(0);
}

@media (max-width: 767px) {
  .drawer {
    width: 100vw; /* Full-screen on mobile */
  }
}
```

---

## Icons and Graphics

### Icon System

**Icon Library: Phosphor Icons**
- Style: Regular weight for most, Fill weight for status indicators
- Size: 16px standard, 20px for headers, 14px for inline
- Color: Inherits text color

**Icon Usage:**
```tsx
import { ListChecks, WarningCircle, CheckCircle } from '@phosphor-icons/react';

// Status icons (filled)
<CheckCircle weight="fill" size={16} className="text-done" />
<WarningCircle weight="fill" size={16} className="text-in-progress" />
<ListChecks size={16} className="text-todo" />
```

**Icon + Text Pattern:**
```html
<button class="flex items-center gap-2">
  <DownloadIcon size={16} />
  <span>Save</span>
</button>
```

### Logo

**MarkDeck Logo:**
- Text: "MarkDeck" in Inter Bold 20px
- Icon: Kanban board icon (3 columns, simplified)
- Color: Primary color or full-color variant

```html
<div class="logo flex items-center gap-2">
  <KanbanIcon size={24} weight="duotone" />
  <span class="text-h1">MarkDeck</span>
</div>
```

---

## Animations and Transitions

### Timing Functions

```css
:root {
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Standard Transitions

| Element | Duration | Easing | Property |
|---------|----------|--------|----------|
| Button hover | 150ms | ease-out | transform, box-shadow |
| Card hover | 150ms | ease-out | transform, box-shadow |
| Drawer open/close | 250ms | ease-out | transform |
| Modal open | 200ms | ease-out | opacity, transform |
| Focus ring | 100ms | ease-out | outline, box-shadow |
| Swimlane collapse | 200ms | ease-in-out | height |
| Card description expand | 150ms | ease-in-out | max-height |

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Performance Optimization

### CSS Performance

**Use CSS Variables:**
```css
:root {
  --color-primary: oklch(0.35 0.05 250);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.button-primary {
  background: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
```

**Optimize Repaints:**
```css
/* GPU-accelerated properties only */
.card:hover {
  transform: translateY(-1px) translateZ(0); /* Force GPU */
}

/* Avoid expensive properties */
.card {
  will-change: transform; /* Hint to browser */
}
```

**Contain Layout:**
```css
.card,
.swimlane {
  contain: layout style paint; /* Isolate rendering */
}
```

### Font Loading

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
  font-weight: 400 700; /* Variable font */
}
```

---

**Approved by:** UX Lead  
**Date:** 2025-11-20  
**Version:** 1.0
