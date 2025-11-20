# Board UX Specification

**Author:** UX Lead  
**Date:** 2025-11-20  
**Status:** Active  
**Version:** 0.2.0

---

## Executive Summary

This document defines the complete user experience for the MarkDeck board interface, covering visual layout, interaction patterns, keyboard navigation, and accessibility. The board is the primary workspace where users visualize and manage their tasks across swimlanes and workflow columns.

**Core Principles:**
1. **Developer-First Design** - Information-dense, minimal chrome, keyboard-accessible
2. **Scanability** - Users should instantly understand project status at a glance
3. **Direct Manipulation** - Drag-and-drop feels natural and responsive
4. **Progressive Disclosure** - Details revealed only when needed
5. **Accessibility-First** - Full keyboard navigation, screen reader support, WCAG compliance

---

## Layout Architecture

### Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│ App Header                                                      │
│ [MarkDeck] [Project: my-repo]  [Save] [Download] [GitHub] [•••]│
├─────────────────────────────────────────────────────────────────┤
│ Tabs: [Board*] [Notes] [Raw]                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ Swimlane: Feature Work ─────────────────────────[⌃] [—]┐  │
│ │                                                            │  │
│ │ ┌─TODO──────┐  ┌─IN PROGRESS┐  ┌─DONE──────┐            │  │
│ │ │• Card 1    │  │• Card 2     │  │• Card 3   │            │  │
│ │ │  [!]       │  │  [⚠] 🚫    │  │  [✓]      │            │  │
│ │ │            │  │             │  │           │            │  │
│ │ │• Card 4    │  │             │  │• Card 5   │            │  │
│ │ │  [!]       │  │             │  │  [✓]      │            │  │
│ │ └────────────┘  └─────────────┘  └───────────┘            │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│ ┌─ Swimlane: Bug Fixes ────────────────────────────[⌄] [—]┐   │
│ │ 3 TODO • 1 IN PROGRESS • 2 DONE • 1 BLOCKED               │   │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│ ┌─ Swimlane: Infrastructure ───────────────────────[⌄] [—]┐   │
│ │ 1 TODO • 0 IN PROGRESS • 4 DONE                           │   │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Legend:
[⌃] = Collapse (lane expanded)
[⌄] = Expand (lane collapsed)
[—] = More actions menu
[!] = TODO status indicator
[⚠] = IN PROGRESS status indicator
[✓] = DONE status indicator
🚫 = BLOCKED flag badge
* = Active tab
```

---

## Swimlane Layout

### Expanded Swimlane Structure

```
┌─ Swimlane Title ──────────────────────────────────[⌃] [—]┐
│                                                           │
│ Stats: 5 TODO • 2 IN PROGRESS • 8 DONE • 1 BLOCKED       │
│                                                           │
│ ┌─TODO──────────┐ ┌─IN PROGRESS──┐ ┌─DONE──────────┐    │
│ │               │ │               │ │               │    │
│ │  [Cards...]   │ │  [Cards...]   │ │  [Cards...]   │    │
│ │               │ │               │ │               │    │
│ └───────────────┘ └───────────────┘ └───────────────┘    │
└───────────────────────────────────────────────────────────┘
```

**Spacing:**
- Lane header: `padding: 16px` (p-4)
- Lane content area: `padding: 16px` (p-4)
- Column gap: `gap: 16px` (gap-4)
- Swimlane vertical spacing: `margin-bottom: 16px` (mb-4)

**Header Components:**
1. **Title** - H2 styled, Inter Semibold 16px, truncate with ellipsis at 60 chars
2. **Collapse button** - Right-aligned, icon-only, tooltip "Collapse lane"
3. **Actions menu** - Kebab menu for lane-specific actions
4. **Stats bar** - Muted text, counts by status + blocked count

**Visual Treatment:**
- Background: `bg-slate-50` (light mode) / `bg-slate-900` (dark mode)
- Border: `border border-slate-200` with `rounded-lg`
- Shadow: `shadow-sm` on hover → `shadow-md`
- Header has subtle bottom border to separate from content

### Collapsed Swimlane

```
┌─ Swimlane Title ──────────────────────────────────[⌄] [—]┐
│ 5 TODO • 2 IN PROGRESS • 8 DONE • 1 BLOCKED               │
└───────────────────────────────────────────────────────────┘
```

**Behavior:**
- Height animates from full → header-only (200ms ease-in-out)
- Stats remain visible to show progress at a glance
- Click anywhere on collapsed lane to expand
- Keyboard: `Enter` or `Space` to toggle

**Animation:**
```css
.swimlane {
  transition: height 200ms ease-in-out;
  overflow: hidden;
}

.swimlane[data-collapsed="true"] {
  height: 64px; /* Header + stats height */
}
```

---

## Column Ordering Rules

### Fixed Column Order

**Left to Right:**
1. **TODO** (Cyan accent)
2. **IN PROGRESS** (Amber warning)  
3. **DONE** (Green success)

**Rationale:**
- Matches natural left-to-right reading flow
- Represents linear workflow progression
- Industry standard (Kanban convention)
- Non-configurable to maintain consistency

### Column Visual Design

```
┌─ TODO ───────────────┐
│ [!] ListChecks icon  │
│ 5 tasks              │
│                      │
│ ┌──────────────────┐ │
│ │ Card 1           │ │
│ │ [!]              │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ Card 2    🚫     │ │
│ │ [!] Blocked      │ │
│ └──────────────────┘ │
│                      │
└──────────────────────┘
```

**Column Header:**
- Icon: 16px, muted color
- Title: Inter Medium 12px, uppercase, letter-spacing 0.05em
- Count: Inter Regular 11px, muted
- Background tint: Subtle status color (5% opacity)

**Empty Column State:**
```
┌─ IN PROGRESS ────────┐
│ [⚠] WarningCircle    │
│ 0 tasks              │
│                      │
│  No tasks in         │
│  progress            │
│                      │
│  ─ Drop here ─       │
│                      │
└──────────────────────┘
```

**Column Sizing:**
- Min width: `280px` (prevents cards from becoming too narrow)
- Max width: `400px` (maintains scanability)
- Equal width distribution within swimlane
- Flex-grow: 1 (columns expand to fill space)

---

## Card Ergonomics

### Card Visual Structure

```
┌────────────────────────────────────┐
│ [!] Fix authentication bug    🚫  │ ← Title + Blocked badge
│                                    │
│ ⌄ Description                     │ ← Expandable description
│                                    │
│ 🔗 2 links                        │ ← Link count (if any)
│                                    │
└────────────────────────────────────┘
  ↑                                  ↑
  Status                          Drag handle
  indicator                       (whole card)
```

**Card Dimensions:**
- Min height: `80px` (compact but readable)
- Max height: `240px` (prevents vertical sprawl)
- Width: Column width minus 16px horizontal gap
- Padding: `12px` (p-3)
- Gap between elements: `8px` (gap-2)

**Title Area:**
- Font: Inter Medium 12px, line-height 1.4
- Max lines: 3 (truncate with ellipsis)
- Color: `text-slate-900` (dark mode: `text-slate-50`)
- Status icon: 16px, inline-start, color-coded

**Blocked Badge:**
- Position: Absolute top-right
- Icon: `XCircle` filled, 16px
- Color: Red (`bg-red-600`)
- Tooltip: "Blocked"
- Z-index above card content

**Description Collapse/Expand:**
- Default: Collapsed (first 2 lines visible)
- Expand indicator: `⌄` chevron icon
- Expand action: Click chevron OR click anywhere on card body
- Expanded state: Shows full description, max-height 120px, scrollable
- Animation: 150ms ease-in-out height transition

**Description Styling:**
```
┌────────────────────────────────────┐
│ [!] Add user authentication        │
│                                    │
│ ⌄ Implement JWT-based auth with   │ ← Collapsed (2 lines max)
│   refresh tokens and...            │
└────────────────────────────────────┘

After expand:

┌────────────────────────────────────┐
│ [!] Add user authentication        │
│                                    │
│ ⌃ Implement JWT-based auth with   │
│   refresh tokens and secure        │
│   storage. Include:                │
│   - Login/logout endpoints         │
│   - Password reset flow            │
│   - 2FA support                    │ ← Full description visible
│                                    │
│ 🔗 2 links                        │
└────────────────────────────────────┘
```

**Link Indicators:**
- Show count only: `🔗 2 links`
- Muted color
- Clicking opens detail drawer to see/manage links

### Card States

**1. Resting State**
```css
.card {
  background: white;
  border: 1px solid oklch(0.9 0 0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: grab;
  transition: all 150ms ease-out;
}
```

**2. Hover State**
```css
.card:hover {
  border-color: oklch(0.85 0 0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}
```

**3. Dragging State**
```css
.card[data-dragging="true"] {
  cursor: grabbing;
  opacity: 0.8;
  transform: rotate(1deg) scale(1.01);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
```

**4. Drop Target (Column Highlight)**
```css
.column[data-drop-target="true"] {
  background: oklch(0.7 0.12 200 / 0.1); /* Cyan tint */
  border: 2px dashed oklch(0.7 0.12 200);
  border-radius: 8px;
}
```

**5. Blocked State**
```css
.card[data-blocked="true"] {
  border-left: 4px solid oklch(0.55 0.18 25); /* Red accent */
}
```

**6. Focus State (Keyboard Navigation)**
```css
.card:focus-visible {
  outline: 2px solid oklch(0.7 0.12 200);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px oklch(0.7 0.12 200 / 0.2);
}
```

---

## Blocked Content Indicator

### Visual Treatment

**Badge Design:**
```
Position: Top-right corner of card
Size: 20px × 20px
Icon: XCircle (filled)
Color: bg-red-600
Shadow: 0 2px 4px rgba(220, 38, 38, 0.3)
Z-index: 10 (above card content)
```

**ASCII Representation:**
```
┌────────────────────────────────────┐
│ [!] Implement SSO          [🚫]   │ ← Badge floats top-right
│                                    │
│ Waiting on vendor API              │
│ credentials                        │
└────────────────────────────────────┘
```

**Collapsed Lane Stats:**
- Include blocked count: `5 TODO • 2 IN PROGRESS • 8 DONE • 1 BLOCKED`
- Blocked count in red: `text-red-600`
- Visually distinct from status counts

**Accessibility:**
- ARIA label: "Blocked"
- Screen reader announcement: "Card title, TODO status, blocked"
- Tooltip on hover: "Blocked - click to view details"

---

## Drag-and-Drop Interactions

### Drag Initiation

**Mouse/Touch:**
1. User presses down on card
2. Cursor changes to `grab`
3. After 100ms or 5px movement, drag begins
4. Card lifts (shadow, scale, rotate)
5. Cursor changes to `grabbing`

**Visual Feedback During Drag:**
- Dragged card: 80% opacity, rotated 1deg, elevated shadow
- Source column: No visual change
- Target column: Cyan dashed border, subtle background tint
- Other cards: Shift to make space for drop (animate 150ms)

**Drop Zones:**
- Any column in any swimlane (cross-lane moves allowed)
- Empty column areas
- Between existing cards (insertion point line appears)

### Drop Behavior

**Valid Drop:**
1. Card animates to drop position (200ms ease-out)
2. Status updates immediately in UI
3. Change flag set (unsaved changes indicator)
4. Success toast (optional): "Card moved to IN PROGRESS"

**Invalid Drop:**
1. Card snaps back to origin (spring animation, 300ms)
2. Subtle shake effect (5px left-right, 2 iterations)
3. No status change

**Keyboard Drop:**
- Press `Enter` to pick up card
- Arrow keys to select target column
- `Enter` again to drop
- `Escape` to cancel

### Multi-Card Selection (Future Enhancement)

**Not in v0.2, but designed for:**
- `Cmd/Ctrl + Click` to multi-select
- Drag any selected card to move all
- Visual indication of selection count

---

## Keyboard Navigation Mapping

### Global Navigation

| Key                | Action                                      |
|--------------------|---------------------------------------------|
| `Tab`              | Next focusable element (cards, buttons)     |
| `Shift + Tab`      | Previous focusable element                  |
| `Cmd/Ctrl + K`     | Open command palette (future)               |
| `Cmd/Ctrl + S`     | Save changes                                |
| `Cmd/Ctrl + /`     | Toggle keyboard shortcuts help              |
| `Escape`           | Close drawer/modal, cancel drag             |

### Swimlane Navigation

| Key                | Action                                      |
|--------------------|---------------------------------------------|
| `↑` / `↓`          | Navigate between swimlanes                  |
| `Space` / `Enter`  | Toggle swimlane collapse/expand             |
| `Home`             | Jump to first swimlane                      |
| `End`              | Jump to last swimlane                       |

### Card Navigation

| Key                | Action                                      |
|--------------------|---------------------------------------------|
| `Tab`              | Next card (top-to-bottom, left-to-right)    |
| `Shift + Tab`      | Previous card                               |
| `→`                | Move focus to next column                   |
| `←`                | Move focus to previous column               |
| `↓`                | Next card in same column                    |
| `↑`                | Previous card in same column                |
| `Enter`            | Open card detail drawer                     |
| `Space`            | Pick up card for drag (enter move mode)     |

### Drag Mode (Keyboard)

| Key                | Action                                      |
|--------------------|---------------------------------------------|
| `Space`            | Pick up card (enters drag mode)             |
| `→`                | Move to next column                         |
| `←`                | Move to previous column                     |
| `↓`                | Move down one position in column            |
| `↑`                | Move up one position in column              |
| `Enter`            | Drop card at current position               |
| `Escape`           | Cancel drag, return card to origin          |

**Visual Feedback in Drag Mode:**
- Focus outline on card being moved
- Drop target column highlighted
- Screen reader announces column name as user navigates

### Drawer Navigation

| Key                | Action                                      |
|--------------------|---------------------------------------------|
| `Tab`              | Next form field                             |
| `Shift + Tab`      | Previous form field                         |
| `Cmd/Ctrl + Enter` | Save and close                              |
| `Escape`           | Cancel and close                            |

---

## Scroll and Virtualization Behavior

### Viewport Management

**Vertical Scrolling:**
- Board container: `overflow-y: auto`
- Smooth scroll behavior enabled
- Scroll padding: 16px top/bottom
- Swimlanes stack vertically, scroll independently

**Horizontal Scrolling:**
- Columns within swimlane: `overflow-x: auto` (only if needed)
- Typically not needed due to responsive column sizing
- Mobile: Horizontal scroll for column navigation

**Column Scrolling:**
- Each column independently scrollable: `overflow-y: auto`
- Max height: `calc(100vh - 240px)` (viewport minus headers/padding)
- Sticky column headers (remain visible during scroll)
- Scroll shadows to indicate more content above/below

### Large Board Optimization

**Virtualization Trigger:**
- Activate when swimlane has 50+ cards
- Use virtual scrolling library (e.g., `react-virtual`)

**Virtualized Rendering:**
```
Visible viewport: 6 cards
Render buffer: ±3 cards (9 total rendered)
Total cards: 100
Memory footprint: ~5 MB (vs 50+ MB without virtualization)
```

**Implementation:**
```typescript
// Column with virtualization
<VirtualScroller
  height={600}
  itemCount={cards.length}
  itemSize={96} // Card height
  overscan={3}  // Render 3 extra above/below
>
  {({ index, style }) => (
    <Card 
      key={cards[index].id}
      card={cards[index]}
      style={style}
    />
  )}
</VirtualScroller>
```

**Scroll Performance:**
- `will-change: transform` on cards during scroll
- `contain: layout style paint` on columns
- Debounced scroll events (16ms, requestAnimationFrame)
- Intersection Observer for lazy loading card images/metadata

### Scroll Restoration

**Behavior:**
- Save scroll position when navigating away from board
- Restore scroll position when returning
- Per-swimlane scroll position memory
- Persisted to localStorage (cleared on project switch)

**Edge Cases:**
- New cards added: Don't auto-scroll, show notification
- Card moved: Scroll to new position if out of viewport
- Swimlane collapsed: Preserve scroll for when re-expanded

---

## Responsive Behavior

### Desktop (1024px+)

```
┌─────────────────────────────────────────────────────┐
│                  Full Layout                        │
│  ┌────────┐ ┌────────┐ ┌────────┐                  │
│  │  TODO  │ │  IN    │ │  DONE  │                  │
│  │        │ │ PROGRESS│ │        │                  │
│  └────────┘ └────────┘ └────────┘                  │
└─────────────────────────────────────────────────────┘
```

- All 3 columns visible side-by-side
- Swimlanes stack vertically
- Drawer slides from right (400px width)

### Tablet (768px - 1023px)

```
┌──────────────────────────────────┐
│        2-Column Layout           │
│  ┌────────┐ ┌────────┐          │
│  │  TODO  │ │  IN    │          │
│  │        │ │ PROGRESS│          │
│  └────────┘ └────────┘          │
│                                  │
│  ┌────────────────────┐          │
│  │       DONE         │          │
│  │                    │          │
│  └────────────────────┘          │
└──────────────────────────────────┘
```

- Columns wrap: TODO + IN PROGRESS on first row, DONE on second
- Swimlanes still collapsible
- Drawer slides from right (320px width)

### Mobile (<768px)

```
┌─────────────────────┐
│   Tabs: TODO | IN P │
│                     │
│  ┌────────────────┐ │
│  │  Card 1        │ │
│  │  [!]           │ │
│  └────────────────┘ │
│                     │
│  ┌────────────────┐ │
│  │  Card 2   🚫  │ │
│  │  [!]           │ │
│  └────────────────┘ │
└─────────────────────┘
   [TODO] [IN PROG] [DONE]
```

- Single column view with tabs for status
- Swipe gesture to switch between statuses
- Swimlanes become accordion (only one expanded at a time)
- Drawer becomes full-screen modal
- Drag-and-drop replaced with tap-to-select + move menu

**Mobile Interactions:**
- Tap card → Select
- Long press → Show context menu
- Swipe left/right on card → Quick status change
- Bottom action bar: [Move to...] [Edit] [Mark Blocked]

---

## Animation Details

### Swimlane Collapse/Expand

```css
@keyframes collapse {
  from {
    height: var(--full-height);
    opacity: 1;
  }
  to {
    height: 64px;
    opacity: 0.9;
  }
}

.swimlane {
  transition: height 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Timing:** 200ms ease-in-out  
**Transform:** Height from full → 64px (header + stats)  
**Opacity:** Content fades slightly (1 → 0.9)

### Card Drag Lifecycle

**1. Pickup (0-100ms):**
```css
transform: scale(1.01) rotate(1deg);
box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
```

**2. Move (continuous):**
- Follow cursor with `translate3d`
- Hardware-accelerated (GPU)
- Clamp to viewport bounds

**3. Drop (200ms):**
```css
transition: transform 200ms ease-out;
transform: translate(0, 0) scale(1) rotate(0);
```

### Card Description Expand

```css
@keyframes expand-description {
  from {
    max-height: 40px; /* 2 lines */
    opacity: 0.8;
  }
  to {
    max-height: 120px;
    opacity: 1;
  }
}

.card-description {
  transition: max-height 150ms ease-in-out;
  overflow: hidden;
}
```

### Focus Ring Animation

```css
.card:focus-visible {
  outline: 2px solid oklch(0.7 0.12 200);
  outline-offset: 2px;
  animation: pulse-focus 1.5s ease-in-out infinite;
}

@keyframes pulse-focus {
  0%, 100% {
    box-shadow: 0 0 0 4px oklch(0.7 0.12 200 / 0.2);
  }
  50% {
    box-shadow: 0 0 0 6px oklch(0.7 0.12 200 / 0.1);
  }
}
```

---

## Touch Interactions

### Touch Gestures

| Gesture                    | Action                                      |
|----------------------------|---------------------------------------------|
| Tap                        | Select card / open drawer                   |
| Long press (500ms)         | Enter drag mode / show context menu         |
| Swipe left on card         | Move to next status                         |
| Swipe right on card        | Move to previous status                     |
| Swipe down on swimlane     | Collapse swimlane                           |
| Swipe up on swimlane       | Expand swimlane                             |
| Pinch on board             | Zoom (density adjustment, future)           |

### Touch Targets

**Minimum Size:** 44×44px (WCAG AAA)  
**Spacing:** 8px minimum between targets  
**Hit Area:** Extend beyond visible boundary by 4px

---

## Empty States

### Empty Swimlane

```
┌─ Feature Work ──────────────────────────────[⌃] [—]┐
│                                                     │
│ ┌─TODO──────┐ ┌─IN PROGRESS┐ ┌─DONE──────┐        │
│ │           │ │             │ │           │        │
│ │  No tasks │ │  No tasks   │ │  No tasks │        │
│ │  yet      │ │  yet        │ │  yet      │        │
│ │           │ │             │ │           │        │
│ └───────────┘ └─────────────┘ └───────────┘        │
└─────────────────────────────────────────────────────┘
```

**Message:** Muted text, centered, Inter Regular 12px  
**Action:** No explicit CTA (cards added via markdown editing)

### Empty Board

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                  No Project Loaded              │
│                                                 │
│  Upload a STATUS.md file or connect to GitHub  │
│                                                 │
│         [Upload File]   [Connect GitHub]       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Performance Targets

| Metric                           | Target      | Method                        |
|----------------------------------|-------------|-------------------------------|
| Swimlane collapse animation      | 60 FPS      | CSS transitions, GPU accel    |
| Card drag smoothness             | 60 FPS      | `transform`, `will-change`    |
| Card render time                 | <16ms       | Memoization, virtual scroll   |
| Scroll performance (100 cards)   | 60 FPS      | `contain`, `will-change`      |
| Initial board paint              | <200ms      | Code splitting, lazy load     |
| Largest Contentful Paint (LCP)   | <1.5s       | Optimize images, fonts        |
| First Input Delay (FID)          | <100ms      | Minimize main thread work     |
| Cumulative Layout Shift (CLS)    | <0.1        | Reserve space for cards       |

---

## Accessibility Compliance

See `accessibility-plan.md` for complete details. Key board-specific requirements:

- **ARIA Roles:** `region` for swimlanes, `list` for columns, `listitem` for cards
- **Keyboard Navigation:** Full keyboard control without mouse
- **Focus Management:** Clear focus indicators, logical tab order
- **Screen Reader:** Meaningful announcements for drag-drop, status changes
- **Color Contrast:** All text meets WCAG AA (4.5:1 minimum)
- **Motion:** Respect `prefers-reduced-motion` for animations

---

## Future Enhancements (Not in v0.2)

1. **Card Filtering:** Filter by blocked status, search titles
2. **Column Customization:** User-defined column order (if requested)
3. **Density Settings:** Compact / Comfortable / Spacious view modes
4. **Card Templates:** Quick-add cards from templates
5. **Multi-Select:** Bulk move multiple cards
6. **Swimlane Reordering:** Drag swimlanes to reorder
7. **Card Coloring:** User-defined card colors by tag/label
8. **Board Views:** List view, calendar view, timeline view

---

**Approved by:** UX Lead  
**Date:** 2025-11-20  
**Version:** 1.0
