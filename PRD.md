# Planning Guide

A visual Kanban board that parses and manages STATUS.md files from Git repositories or local projects, transforming markdown-based project trackers into interactive boards with bidirectional sync.

**Experience Qualities**:
1. **Efficient** - Parse complex STATUS.md files instantly and provide immediate visual feedback on status changes
2. **Trustworthy** - Never lose data; preserve original markdown formatting and provide clear sync status
3. **Intelligent** - Automatically extract structure from existing documents and suggest improvements

**Complexity Level**: Light Application (multiple features with basic state)
  - Handles markdown parsing, Kanban UI, and file/Git sync but maintains focus on a single-purpose tool without user accounts or complex workflows

## Essential Features

### STATUS.md Parser
- **Functionality**: Parse markdown files with emoji status markers (✅ ⚠️ ❌) into structured Kanban data
- **Purpose**: Bridge human-readable markdown and visual project management
- **Trigger**: User uploads/pastes STATUS.md content or connects to a Git repository
- **Progression**: Parse markdown → Extract headings/bullets → Map emojis to statuses → Generate unique card IDs → Display in Kanban columns
- **Success criteria**: Correctly parse example document with 100% card extraction accuracy; preserve all non-card content

### Interactive Kanban Board
- **Functionality**: Three-column board (Done, In Progress, Blocked) with drag-and-drop card movement
- **Purpose**: Provide visual project overview and enable quick status updates
- **Trigger**: Successfully parsed STATUS.md loads
- **Progression**: Display grouped cards by section → User drags card to new column → Update emoji in-memory → Show visual feedback → Enable batch save
- **Success criteria**: Smooth drag operations; clear section grouping; responsive on mobile

### Markdown Round-Trip
- **Functionality**: Project UI changes back to markdown while preserving formatting
- **Purpose**: Maintain markdown as source of truth; enable Git workflows
- **Trigger**: User clicks "Save Changes" or "Commit"
- **Progression**: Collect schema changes → Map to original markdown locations → Replace emojis/text → Update timestamp → Generate preview → Write file
- **Success criteria**: Zero formatting loss; headings unchanged; dates auto-updated

### Local File & Git Modes
- **Functionality**: Toggle between local file editing and Git repository sync
- **Purpose**: Support different workflows (quick edits vs. collaborative projects)
- **Trigger**: User selects mode at startup or switches via settings
- **Progression**: Local: Upload file → Edit → Download | Git: Enter repo URL → Clone/fetch → Edit → Generate commit message → Push
- **Success criteria**: Clear mode indication; Git operations show progress; error handling for auth failures

### Notes Panel
- **Functionality**: Display non-card sections (architecture, commands) as read-only reference
- **Purpose**: Keep context accessible without cluttering the board
- **Trigger**: Parser detects sections without status bullets
- **Progression**: Extract markdown blocks → Render with syntax highlighting → Show in collapsible sidebar
- **Success criteria**: Clear visual distinction from cards; preserves code blocks and tables

## Edge Case Handling

- **Malformed emoji**: Missing or duplicate status icons → Flag with warning badge; default to In Progress
- **ID collisions**: Same section + title combination → Append `-1`, `-2` suffix; log for review
- **Large files**: 100+ cards → Virtual scrolling in columns; section filters
- **Git conflicts**: Concurrent edits to STATUS.md → Show diff view; require manual resolution
- **Network failures**: Git clone/push errors → Cache parsed state; retry with exponential backoff
- **Invalid markdown**: Unparseable structure → Show raw markdown view; highlight problematic lines

## Design Direction

The design should feel professional and focused—like a developer tool built by developers. Favor clarity and information density over decorative elements. The interface should feel fast and direct, with subtle animations that communicate state changes (card moves, saves) rather than drawing attention to themselves.

## Color Selection

Triadic color scheme anchored by status meanings: success green, warning amber, error red. Use muted, desaturated tones for the professional developer-tool aesthetic.

- **Primary Color**: Deep slate blue `oklch(0.35 0.05 250)` — Communicates technical professionalism and focus
- **Secondary Colors**: 
  - Success green `oklch(0.55 0.15 145)` for Done status
  - Warning amber `oklch(0.65 0.14 75)` for In Progress
  - Error red `oklch(0.55 0.18 25)` for Blocked
- **Accent Color**: Bright cyan `oklch(0.70 0.12 200)` for interactive elements and CTAs
- **Foreground/Background Pairings**:
  - Background (White `oklch(0.98 0 0)`): Dark slate text `oklch(0.25 0.02 250)` - Ratio 11.2:1 ✓
  - Card (Light gray `oklch(0.96 0 0)`): Dark slate text `oklch(0.25 0.02 250)` - Ratio 10.5:1 ✓
  - Primary (Deep slate `oklch(0.35 0.05 250)`): White text `oklch(0.98 0 0)` - Ratio 8.9:1 ✓
  - Success (Green `oklch(0.55 0.15 145)`): White text `oklch(0.98 0 0)` - Ratio 4.7:1 ✓
  - Warning (Amber `oklch(0.65 0.14 75)`): Dark slate text `oklch(0.25 0.02 250)` - Ratio 5.2:1 ✓
  - Accent (Cyan `oklch(0.70 0.12 200)`): Dark slate text `oklch(0.25 0.02 250)` - Ratio 6.1:1 ✓

## Font Selection

Use a clean, modern sans-serif that emphasizes readability in dense information layouts, with excellent monospace support for code/markdown. Inter for UI and JetBrains Mono for code blocks.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/24px/tight letter spacing (-0.02em)
  - H2 (Section Headers): Inter Semibold/18px/normal letter spacing
  - H3 (Column Headers): Inter Medium/14px/uppercase/wide letter spacing (0.05em)
  - Body (Card Title): Inter Regular/14px/normal line height (1.5)
  - Caption (Metadata): Inter Regular/12px/muted color/loose line height (1.6)
  - Code (Markdown): JetBrains Mono Regular/13px/normal letter spacing

## Animations

Animations should feel instantaneous and purposeful—cards should glide smoothly between columns with slight physics-based easing, reflecting the satisfaction of completing a task.

- **Purposeful Meaning**: Drag operations use subtle elevation and scale to communicate "lifting" a card; successful saves pulse the affected cards briefly
- **Hierarchy of Movement**: 
  1. Card drag/drop (primary interaction) - 200ms ease-out with scale 1.02
  2. Column reflows - 150ms ease-in-out for smooth repositioning
  3. Status badge changes - 100ms color transition
  4. Save confirmation - 300ms fade-in toast notification

## Component Selection

- **Components**: 
  - `Card` for Kanban items with custom styling for status indicators
  - `Badge` for section tags and status labels
  - `Button` for primary actions (Save, Commit, Upload)
  - `Textarea` for markdown editing with monospace font
  - `Tabs` for switching between Board/Raw Markdown/Notes views
  - `Dialog` for commit messages and conflict resolution
  - `ScrollArea` for long column lists
  - `Separator` for visual section grouping within columns
  - `Alert` for warnings (malformed emojis, ID collisions)
  - `Skeleton` for loading states during parsing

- **Customizations**: 
  - Custom drag-and-drop card component (framer-motion for gestures)
  - Markdown syntax highlighting component for notes panel
  - Diff viewer for Git conflicts
  - File upload drop zone with visual feedback

- **States**: 
  - Buttons: Default/Hover (scale 1.02)/Active (scale 0.98)/Disabled (opacity 0.5)
  - Cards: Resting/Hover (shadow-lg)/Dragging (shadow-2xl + rotate-1)/Dropped (pulse animation)
  - Inputs: Empty (border-input)/Focused (border-accent ring-2)/Error (border-destructive)
  - Save button: Idle/Has Changes (accent color + pulse)/Saving (spinner)/Saved (checkmark 2s)

- **Icon Selection**: 
  - `CloudArrowUp` for Git push
  - `Download` for file download
  - `Upload` for file upload  
  - `GitBranch` for Git mode indicator
  - `FileText` for local file mode
  - `Eye` for preview
  - `CheckCircle`, `WarningCircle`, `XCircle` for status badges
  - `DotsThreeVertical` for card menu
  - `ArrowsClockwise` for sync/refresh

- **Spacing**: Consistent 4px grid (gap-2/4/6 for tight/normal/loose). Cards have p-4, columns gap-3, board grid gap-6

- **Mobile**: 
  - Desktop: 3-column grid layout with fixed Notes sidebar
  - Tablet (768px): 2-column grid, Notes in collapsible drawer
  - Mobile (<640px): Single column with tabs for Done/In Progress/Blocked, swipe gestures for column switching, bottom sheet for Notes
