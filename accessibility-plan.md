# Accessibility Plan

**Author:** UX Lead  
**Date:** 2025-11-20  
**Status:** Active  
**Version:** 0.2.0  
**WCAG Target:** Level AA Compliance

---

## Executive Summary

This document defines the comprehensive accessibility strategy for MarkDeck v0.2, ensuring the application is usable by everyone, including people with disabilities. We target **WCAG 2.1 Level AA compliance** with select AAA achievements.

**Core Commitments:**
1. **Keyboard-First Design** - Every feature accessible without a mouse
2. **Screen Reader Compatible** - Meaningful experience for blind users
3. **Visual Clarity** - High contrast, clear typography, obvious affordances
4. **Inclusive Design** - Works for diverse abilities and assistive technologies
5. **Continuous Testing** - Accessibility validated throughout development

---

## WCAG 2.1 Compliance Matrix

### Perceivable

| Guideline | Level | Status | Implementation |
|-----------|-------|--------|----------------|
| **1.1.1** Text Alternatives | A | ✅ Target | All icons have aria-label, images have alt text |
| **1.2.5** Audio Description | AA | N/A | No video/audio content |
| **1.3.1** Info and Relationships | A | ✅ Target | Semantic HTML, ARIA roles, proper headings |
| **1.3.2** Meaningful Sequence | A | ✅ Target | Logical DOM order matches visual layout |
| **1.3.3** Sensory Characteristics | A | ✅ Target | Instructions don't rely on shape/color alone |
| **1.3.4** Orientation | AA | ✅ Target | No locked orientation, works portrait/landscape |
| **1.3.5** Identify Input Purpose | AA | ✅ Target | Autocomplete attributes on form inputs |
| **1.4.1** Use of Color | A | ✅ Target | Color + icon + text for all states |
| **1.4.3** Contrast (Minimum) | AA | ✅ Target | 4.5:1 for text, 3:1 for UI components |
| **1.4.4** Resize Text | AA | ✅ Target | Readable at 200% zoom without loss |
| **1.4.5** Images of Text | AA | ✅ Target | No images of text (except logo) |
| **1.4.10** Reflow | AA | ✅ Target | No horizontal scroll at 320px width |
| **1.4.11** Non-text Contrast | AA | ✅ Target | 3:1 for interactive elements |
| **1.4.12** Text Spacing | AA | ✅ Target | Works with custom spacing overrides |
| **1.4.13** Content on Hover/Focus | AA | ✅ Target | Tooltips dismissible, hoverable, persistent |

### Operable

| Guideline | Level | Status | Implementation |
|-----------|-------|--------|----------------|
| **2.1.1** Keyboard | A | ✅ Target | All functionality keyboard-accessible |
| **2.1.2** No Keyboard Trap | A | ✅ Target | Focus can always move away |
| **2.1.4** Character Key Shortcuts | A | ✅ Target | Single-key shortcuts require modifier (Cmd/Ctrl) |
| **2.2.1** Timing Adjustable | A | ✅ Target | Auto-dismiss toasts can be extended/disabled |
| **2.2.2** Pause, Stop, Hide | A | ✅ Target | Animations respect prefers-reduced-motion |
| **2.3.1** Three Flashes | A | ✅ Target | No flashing content |
| **2.4.1** Bypass Blocks | A | ✅ Target | Skip to main content link |
| **2.4.2** Page Titled | A | ✅ Target | Descriptive document title updates |
| **2.4.3** Focus Order | A | ✅ Target | Logical tab order |
| **2.4.4** Link Purpose | A | ✅ Target | Links describe destination |
| **2.4.5** Multiple Ways | AA | N/A | Single-page application |
| **2.4.6** Headings and Labels | AA | ✅ Target | Descriptive headings, unique labels |
| **2.4.7** Focus Visible | AA | ✅ Target | Visible focus indicators on all elements |
| **2.5.1** Pointer Gestures | A | ✅ Target | No multipoint/path-based gestures required |
| **2.5.2** Pointer Cancellation | A | ✅ Target | Down-event doesn't trigger, up-event can abort |
| **2.5.3** Label in Name | A | ✅ Target | Accessible name matches visible label |
| **2.5.4** Motion Actuation | A | ✅ Target | No device motion required |

### Understandable

| Guideline | Level | Status | Implementation |
|-----------|-------|--------|----------------|
| **3.1.1** Language of Page | A | ✅ Target | `<html lang="en">` |
| **3.1.2** Language of Parts | AA | ✅ Target | Language changes marked (if any) |
| **3.2.1** On Focus | A | ✅ Target | No unexpected context changes on focus |
| **3.2.2** On Input | A | ✅ Target | No auto-submit forms |
| **3.2.3** Consistent Navigation | AA | ✅ Target | Navigation consistent across app |
| **3.2.4** Consistent Identification | AA | ✅ Target | Icons/controls have same function throughout |
| **3.3.1** Error Identification | A | ✅ Target | Errors clearly described in text |
| **3.3.2** Labels or Instructions | A | ✅ Target | All inputs labeled, instructions provided |
| **3.3.3** Error Suggestion | AA | ✅ Target | Errors include fix suggestions |
| **3.3.4** Error Prevention | AA | ✅ Target | Confirm before destructive actions |

### Robust

| Guideline | Level | Status | Implementation |
|-----------|-------|--------|----------------|
| **4.1.1** Parsing | A | ✅ Target | Valid HTML5 |
| **4.1.2** Name, Role, Value | A | ✅ Target | ARIA roles, states, properties |
| **4.1.3** Status Messages | AA | ✅ Target | role="status" and role="alert" |

---

## ARIA Roles for Board Components

### Semantic Structure

```html
<main role="main" aria-label="Kanban Board">
  
  <!-- Swimlane -->
  <section 
    role="region" 
    aria-labelledby="swimlane-1-heading"
    data-swimlane-id="feature-work"
  >
    <header>
      <h2 id="swimlane-1-heading">Feature Work</h2>
      <button 
        aria-label="Collapse Feature Work swimlane"
        aria-expanded="true"
        aria-controls="swimlane-1-content"
      >
        <span aria-hidden="true">⌃</span>
      </button>
    </header>
    
    <div id="swimlane-1-content" aria-live="polite">
      
      <!-- Column (Status) -->
      <div 
        role="list" 
        aria-label="TODO cards"
        data-column="todo"
      >
        
        <!-- Card -->
        <article 
          role="listitem"
          aria-labelledby="card-1-title"
          aria-describedby="card-1-desc"
          tabindex="0"
          draggable="true"
          aria-grabbed="false"
        >
          <h3 id="card-1-title">Fix authentication bug</h3>
          
          <!-- Status indicator -->
          <span 
            aria-label="TODO status"
            class="status-icon"
          >
            <span aria-hidden="true">❗</span>
          </span>
          
          <!-- Blocked badge -->
          <span 
            role="status"
            aria-label="Blocked"
            class="blocked-badge"
          >
            <span aria-hidden="true">🚫</span>
          </span>
          
          <!-- Description -->
          <div 
            id="card-1-desc"
            class="card-description"
            aria-expanded="false"
          >
            <button 
              aria-label="Expand description"
              aria-controls="card-1-desc-content"
            >
              <span aria-hidden="true">⌄</span>
            </button>
            <div id="card-1-desc-content" hidden>
              JWT refresh tokens failing intermittently
            </div>
          </div>
          
        </article>
        
      </div>
      
    </div>
    
  </section>
  
</main>
```

### ARIA Live Regions

**Dynamic Updates:**
```html
<!-- Status messages (non-interruptive) -->
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  class="sr-only"
>
  <!-- Announces: "Card moved to IN PROGRESS" -->
</div>

<!-- Critical alerts (immediate) -->
<div 
  role="alert" 
  aria-live="assertive" 
  aria-atomic="true"
  class="sr-only"
>
  <!-- Announces: "Error: Failed to save changes" -->
</div>
```

**Screen Reader Announcements:**

| Action | Announcement |
|--------|--------------|
| Card moved | "Card '{title}' moved to {status}" |
| Card blocked | "Card '{title}' marked as blocked" |
| Card unblocked | "Card '{title}' unblocked" |
| Swimlane collapsed | "{Swimlane name} collapsed. {count} cards hidden" |
| Swimlane expanded | "{Swimlane name} expanded. {count} cards visible" |
| Project loaded | "Project loaded. {card count} cards across {lane count} swimlanes" |
| Save success | "Changes saved successfully" |
| Save error | "Error: Failed to save. {error message}" |

### ARIA Attributes for Drag-and-Drop

**Draggable Card:**
```html
<article
  draggable="true"
  aria-grabbed="false"  <!-- Changes to "true" when picked up -->
  aria-dropeffect="move"
  role="listitem"
  tabindex="0"
>
  <h3>Card Title</h3>
</article>
```

**Drop Target Column:**
```html
<div
  role="list"
  aria-dropeffect="move"
  aria-label="TODO cards - drop zone"
  data-accepts-drops="true"
>
  <!-- Cards here -->
</div>
```

**Keyboard Drag State:**
```html
<!-- When card is "grabbed" via keyboard -->
<article
  aria-grabbed="true"
  aria-describedby="drag-instructions"
>
  <h3>Card Title</h3>
</article>

<div id="drag-instructions" class="sr-only">
  Use arrow keys to move. Enter to drop. Escape to cancel.
</div>
```

---

## Keyboard-First Workflow

### Global Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Tab` | Next focusable element | Global |
| `Shift + Tab` | Previous focusable element | Global |
| `?` | Open keyboard shortcuts help | Global |
| `Escape` | Close modal/drawer, cancel action | Global |
| `Cmd/Ctrl + S` | Save changes | Global |
| `Cmd/Ctrl + K` | Command palette (future) | Global |

### Board Navigation

| Shortcut | Action | Context |
|----------|--------|---------|
| `↓` / `↑` | Navigate cards in same column | Card focused |
| `→` / `←` | Navigate to adjacent column | Card focused |
| `Home` | Jump to first card in column | Column |
| `End` | Jump to last card in column | Column |
| `Enter` | Open card detail drawer | Card focused |
| `Space` | Pick up card (enter drag mode) | Card focused |

### Drag Mode (Keyboard-Driven)

| Shortcut | Action | Context |
|----------|--------|---------|
| `Space` | Pick up card | Card focused (not grabbed) |
| `→` | Move to next column | Card grabbed |
| `←` | Move to previous column | Card grabbed |
| `↓` | Move down in column | Card grabbed |
| `↑` | Move up in column | Card grabbed |
| `Enter` | Drop card at current position | Card grabbed |
| `Escape` | Cancel, return card to origin | Card grabbed |

**Visual Feedback During Keyboard Drag:**
```css
/* Card being moved */
.card[aria-grabbed="true"] {
  outline: 3px solid oklch(0.7 0.12 200);
  outline-offset: 4px;
  box-shadow: 0 0 0 8px oklch(0.7 0.12 200 / 0.2);
}

/* Target column */
.column[data-drop-target="true"] {
  background: oklch(0.7 0.12 200 / 0.1);
  border: 2px dashed oklch(0.7 0.12 200);
}
```

### Drawer Navigation

| Shortcut | Action | Context |
|----------|--------|---------|
| `Tab` | Next form field | Drawer open |
| `Shift + Tab` | Previous form field | Drawer open |
| `Cmd/Ctrl + Enter` | Save and close | Drawer open |
| `Escape` | Cancel and close | Drawer open |

### Swimlane Management

| Shortcut | Action | Context |
|----------|--------|---------|
| `↓` / `↑` | Navigate between swimlanes | Swimlane header focused |
| `Enter` / `Space` | Toggle collapse/expand | Swimlane header focused |
| `Home` | Jump to first swimlane | Board |
| `End` | Jump to last swimlane | Board |

### Focus Management

**Skip Links:**
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
<a href="#board" class="skip-link">
  Skip to board
</a>
```

**CSS for Skip Links:**
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: oklch(0.35 0.05 250);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  z-index: 10000;
}

.skip-link:focus {
  top: 0;
}
```

**Focus Trap in Modals:**
```typescript
// When modal opens
const focusableElements = modal.querySelectorAll(
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
);

const firstElement = focusableElements[0];
const lastElement = focusableElements[focusableElements.length - 1];

// Trap focus within modal
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
});

// Auto-focus first element
firstElement.focus();
```

**Focus Return:**
- When drawer/modal closes, focus returns to trigger element
- When deleting focused card, focus moves to next card (or previous if last)
- When collapsing swimlane, focus moves to swimlane header

---

## Screen Reader Strategy

### Semantic HTML First

**Principle:** Use native HTML elements before ARIA

✅ **Good:**
```html
<button>Save</button>
<a href="/docs">Learn More</a>
<input type="checkbox" id="blocked">
<label for="blocked">Blocked</label>
```

❌ **Bad:**
```html
<div role="button" tabindex="0" onclick="save()">Save</div>
<span role="link" tabindex="0" onclick="navigate()">Learn More</span>
```

### Descriptive Labels

**Buttons:**
```html
<!-- Icon-only buttons need labels -->
<button aria-label="Collapse swimlane">
  <CaretUpIcon aria-hidden="true" />
</button>

<!-- Text buttons don't need extra labels -->
<button>Save Changes</button>
```

**Links:**
```html
<!-- Generic text needs context -->
<a href="/docs" aria-label="Learn more about STATUS.md format">
  Learn More
</a>

<!-- Descriptive text is self-explanatory -->
<a href="/docs">
  Read the STATUS.md Format Guide
</a>
```

**Form Inputs:**
```html
<!-- Explicit label association -->
<label for="card-title">Card Title</label>
<input 
  id="card-title" 
  type="text"
  aria-required="true"
  aria-describedby="title-help"
>
<span id="title-help" class="help-text">
  Brief, descriptive name for this task
</span>
```

### Screen Reader-Only Text

**Utility Class:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Usage Examples:**
```html
<!-- Status indicator -->
<div class="status-icon">
  <span class="sr-only">TODO status</span>
  <span aria-hidden="true">❗</span>
</div>

<!-- Card count -->
<div class="swimlane-stats">
  <span aria-hidden="true">5 TODO • 2 IN PROGRESS • 8 DONE</span>
  <span class="sr-only">
    5 cards in TODO, 2 cards in IN PROGRESS, 8 cards in DONE
  </span>
</div>

<!-- Loading state -->
<div role="status" aria-live="polite">
  <span class="sr-only">Loading project, please wait</span>
  <div aria-hidden="true" class="spinner"></div>
</div>
```

### Card Reading Order

**Optimal Announcement:**
```
"Card: Fix authentication bug.
Status: TODO.
Blocked.
Description: JWT refresh tokens failing intermittently.
2 links attached.
Press Enter to edit."
```

**Implementation:**
```html
<article aria-label="Card: Fix authentication bug">
  <h3 id="card-1-title">Fix authentication bug</h3>
  
  <span class="sr-only">Status:</span>
  <span aria-label="TODO">❗</span>
  
  <span role="status" aria-label="Blocked">🚫</span>
  
  <div aria-label="Description">
    JWT refresh tokens failing intermittently
  </div>
  
  <span class="sr-only">2 links attached</span>
  <span aria-hidden="true">🔗 2</span>
  
  <span class="sr-only">Press Enter to edit</span>
</article>
```

### Testing with Screen Readers

**Recommended Tools:**
- **NVDA** (Windows) - Free, widely used
- **JAWS** (Windows) - Industry standard, paid
- **VoiceOver** (macOS/iOS) - Built-in, accessible
- **TalkBack** (Android) - Mobile testing
- **Narrator** (Windows) - Basic testing

**Test Scenarios:**
1. Navigate board using only screen reader
2. Move cards between columns
3. Edit card in drawer
4. Connect to GitHub
5. Understand error messages
6. Use keyboard shortcuts

---

## Color Contrast Rules

### WCAG AA Requirements

**Text Contrast:**
- Normal text (12-18px): **4.5:1** minimum
- Large text (18px+ or 14px+ bold): **3:1** minimum
- UI components: **3:1** minimum

**AAA Goals (Where Achievable):**
- Normal text: **7:1**
- Large text: **4.5:1**

### Color Palette Compliance

| Use Case | Foreground | Background | Ratio | WCAG |
|----------|------------|------------|-------|------|
| **Body text** | `oklch(0.25 0.02 250)` | `oklch(0.98 0 0)` | **11.2:1** | ✅ AAA |
| **Muted text** | `oklch(0.45 0.02 250)` | `oklch(0.98 0 0)` | **5.1:1** | ✅ AA |
| **Card text** | `oklch(0.25 0.02 250)` | `oklch(0.96 0 0)` | **10.5:1** | ✅ AAA |
| **Primary button** | `oklch(0.98 0 0)` | `oklch(0.35 0.05 250)` | **8.9:1** | ✅ AAA |
| **Success text** | `oklch(0.98 0 0)` | `oklch(0.55 0.15 145)` | **4.7:1** | ✅ AA |
| **Warning text** | `oklch(0.25 0.02 250)` | `oklch(0.65 0.14 75)` | **5.2:1** | ✅ AA |
| **Error text** | `oklch(0.98 0 0)` | `oklch(0.55 0.18 25)` | **4.8:1** | ✅ AA |
| **Link text** | `oklch(0.45 0.15 250)` | `oklch(0.98 0 0)` | **4.7:1** | ✅ AA |
| **Icon (muted)** | `oklch(0.6 0.02 250)` | `oklch(0.98 0 0)` | **3.2:1** | ✅ AA (UI) |
| **Border** | `oklch(0.85 0 0)` | `oklch(0.98 0 0)` | **1.5:1** | ⚠️ Decorative |

### Dark Mode Considerations

**Inverted Palette (Future):**
- Background: `oklch(0.18 0.02 250)` (dark slate)
- Text: `oklch(0.95 0 0)` (near white)
- Maintain same contrast ratios
- Avoid pure black (#000) backgrounds (eye strain)

**Automatic Switching:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: oklch(0.18 0.02 250);
    --text-primary: oklch(0.95 0 0);
    /* ... other tokens */
  }
}
```

### Non-Color Indicators

**Never rely on color alone:**

✅ **Good:**
```
Status: TODO
Icon: ❗ (visual)
Label: "TODO" (text)
Background: Subtle cyan tint (reinforcement)
```

❌ **Bad:**
```
Status: TODO
Color: Cyan background (only indicator)
No icon, no text label
```

**Blocked Status (Multi-Modal):**
- Color: Red border (`border-left: 4px solid red`)
- Icon: 🚫 (visual symbol)
- Text: "Blocked" label (screen reader)
- Pattern: Diagonal stripes (future, additional visual)

---

## Focus Ring Guidelines

### Focus Indicator Requirements

**WCAG 2.4.7 (AA):** Focus must be visible

**WCAG 2.4.11 (AAA, future):** Focus indicator must:
- Have 3:1 contrast against adjacent colors
- Be at least 2px thick
- Encompass the entire focused element

### MarkDeck Focus Styles

**Default Focus Ring:**
```css
*:focus-visible {
  outline: 2px solid oklch(0.7 0.12 200); /* Cyan accent */
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default browser outline */
*:focus:not(:focus-visible) {
  outline: none;
}
```

**Enhanced Focus for Cards:**
```css
.card:focus-visible {
  outline: 2px solid oklch(0.7 0.12 200);
  outline-offset: 2px;
  box-shadow: 
    0 0 0 4px oklch(0.7 0.12 200 / 0.2), /* Outer glow */
    0 4px 8px rgba(0, 0, 0, 0.1);         /* Elevation */
}
```

**Button Focus:**
```css
button:focus-visible {
  outline: 2px solid oklch(0.7 0.12 200);
  outline-offset: 2px;
}

/* Primary button (dark background) */
button.primary:focus-visible {
  outline: 2px solid oklch(0.98 0 0); /* White outline */
  outline-offset: 2px;
}
```

**Input Focus:**
```css
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid oklch(0.7 0.12 200);
  outline-offset: 0;
  border-color: oklch(0.7 0.12 200);
  box-shadow: 0 0 0 3px oklch(0.7 0.12 200 / 0.1);
}

/* Error state */
input:invalid:focus-visible {
  outline-color: oklch(0.55 0.18 25); /* Red */
  border-color: oklch(0.55 0.18 25);
  box-shadow: 0 0 0 3px oklch(0.55 0.18 25 / 0.1);
}
```

### Windows High Contrast Mode

**Transparent Borders:**
```css
/* Add transparent borders that become visible in High Contrast */
.card {
  border: 1px solid transparent;
}

.card:focus {
  /* Browser replaces transparent with system color */
  border-color: transparent;
}

@media (prefers-contrast: high) {
  .card {
    border: 2px solid ButtonText;
  }
  
  .card:focus {
    border-color: Highlight;
    background: HighlightBackground;
  }
}
```

---

## Reduced Motion Support

### Respect User Preferences

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Essential Motion Only

**Keep for usability:**
- Focus indicator transitions (help track focus)
- Loading spinners (indicate progress)
- Immediate state changes (expand/collapse)

**Remove for reduced motion:**
- Decorative animations
- Card drag rotation
- Swimlane collapse height transition
- Drawer slide-in
- Toast slide-in

**Implementation:**
```css
/* Normal motion */
.drawer {
  transform: translateX(100%);
  transition: transform 250ms ease-out;
}

.drawer.open {
  transform: translateX(0);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .drawer {
    transition: none;
  }
  
  .drawer.open {
    /* Instantly appear */
    transform: translateX(0);
  }
}
```

### Motion Settings Toggle (Future)

**User Override:**
```html
<label>
  <input type="checkbox" id="reduce-motion">
  Reduce motion and animations
</label>
```

```typescript
const reduceMotion = localStorage.getItem('reduce-motion') === 'true';

if (reduceMotion) {
  document.documentElement.classList.add('reduce-motion');
}
```

```css
.reduce-motion * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

---

## Testing Strategy

### Automated Testing

**Tools:**
- **axe DevTools** - Browser extension, CI integration
- **pa11y** - Command-line accessibility tester
- **Lighthouse** - Chrome DevTools accessibility audit
- **WAVE** - Web accessibility evaluation tool

**CI/CD Integration:**
```yaml
# .github/workflows/a11y.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Start dev server
        run: npm run preview &
      
      - name: Wait for server
        run: npx wait-on http://localhost:4173
      
      - name: Run axe tests
        run: npm run test:a11y
      
      - name: Upload results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: a11y-violations
          path: a11y-results/
```

### Manual Testing

**Test Plan:**

1. **Keyboard-Only Navigation**
   - Unplug mouse
   - Navigate entire application
   - Complete all tasks
   - Verify focus indicators
   - Test keyboard shortcuts

2. **Screen Reader Testing**
   - NVDA (Windows) or VoiceOver (Mac)
   - Navigate board
   - Move cards
   - Edit card details
   - Understand error messages

3. **Zoom Testing**
   - 200% zoom (WCAG requirement)
   - No horizontal scroll
   - All content readable
   - No overlapping text

4. **Color Blindness Simulation**
   - Chrome DevTools: Rendering > Emulate vision deficiencies
   - Test Protanopia (red-blind)
   - Test Deuteranopia (green-blind)
   - Test Tritanopia (blue-blind)
   - Verify icons/text still convey meaning

5. **High Contrast Mode**
   - Windows High Contrast
   - Verify borders visible
   - Verify focus indicators
   - Verify icons have outlines

6. **Mobile Accessibility**
   - VoiceOver (iOS) or TalkBack (Android)
   - Touch target sizes (44×44px min)
   - Swipe gestures work
   - Screen reader navigation

### User Testing with Disabilities

**Recruit participants:**
- Blind users (screen reader)
- Low vision users (magnification, high contrast)
- Motor disability users (keyboard-only, voice control)
- Cognitive disability users (simplified interface preference)

**Test Scenarios:**
1. Load a project from GitHub
2. Move 3 cards to DONE status
3. Mark a card as blocked
4. Edit card description
5. Save changes
6. Understand and recover from an error

**Success Metrics:**
- Task completion rate: **>90%**
- Time on task: Within **2x** of mouse users
- Error recovery: **100%** successful
- Satisfaction rating: **>4/5**

---

## Accessibility Statement

**Public Commitment (on website):**

```markdown
# Accessibility Statement for MarkDeck

**Updated:** 2025-11-20

## Our Commitment

MarkDeck is committed to ensuring digital accessibility for people with 
disabilities. We are continually improving the user experience for everyone 
and applying the relevant accessibility standards.

## Conformance Status

MarkDeck aims to conform to WCAG 2.1 Level AA standards. We regularly 
audit the application and address issues as they arise.

## Feedback

We welcome your feedback on the accessibility of MarkDeck. Please contact us:

- Email: accessibility@markdeck.dev
- GitHub: https://github.com/username/markdeck/issues/new?labels=accessibility

We aim to respond to accessibility feedback within 3 business days.

## Known Limitations

While we strive for full accessibility, some third-party components may 
have limitations. We're actively working to improve these areas:

- [Any current known issues]

## Technical Specifications

MarkDeck relies on the following technologies:
- HTML5
- ARIA (Accessible Rich Internet Applications)
- CSS3
- JavaScript (required for core functionality)

## Assessment Approach

MarkDeck has been assessed using:
- Automated testing (axe, Lighthouse, pa11y)
- Manual testing with screen readers (NVDA, VoiceOver)
- Keyboard-only navigation testing
- User testing with people with disabilities

Last reviewed: [Date of last audit]

## Compatibility

MarkDeck is designed to be compatible with:
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Screen readers (NVDA, JAWS, VoiceOver, Narrator)
- Browser zoom up to 200%
- Operating system accessibility features
```

---

## Resources and References

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)
- [How to Meet WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

### ARIA Authoring Practices
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA Roles](https://www.w3.org/TR/wai-aria-1.2/#role_definitions)
- [Drag and Drop Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/drag-and-drop/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Pa11y](https://pa11y.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Color Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colorblind Web Page Filter](https://www.toptal.com/designers/colorfilter)
- [Accessible Colors](https://accessible-colors.com/)

---

**Approved by:** UX Lead  
**Date:** 2025-11-20  
**Version:** 1.0  
**Next Review:** 2026-02-20
