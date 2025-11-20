# Planning Guide

A visual Kanban board that parses and manages STATUS.md files from Git repositories or local projects, transforming markdown-based project trackers into interactive swimlane boards with bidirectional sync.

**Experience Qualities**:
1. **Efficient** - Parse complex STATUS.md files instantly with swimlane organization and provide immediate visual feedback on status changes
2. **Trustworthy** - Never lose data; preserve original markdown formatting including multi-line descriptions and provide clear sync status
3. **Focused** - Developer-centric interface with no unnecessary features—just what's needed for solo and agentic development

**Complexity Level**: Light Application (multiple features with basic state)
  - Handles markdown parsing with swimlanes, interactive Kanban UI with collapsible lanes, card editing drawer, GitHub sync, and file workflows while maintaining focus on a single-purpose tool

## Essential Features

### Three-Column Workflow System
- **Functionality**: Each swimlane contains exactly three workflow columns: TODO → IN PROGRESS → DONE, with blocked status as a boolean flag on cards
- **Purpose**: Provide a clear, unambiguous workflow progression without treating "blocked" as a workflow stage
- **Trigger**: Successfully parsed STATUS.md with status emojis (❗ for TODO, ⚠️ for IN PROGRESS, ✅ for DONE, ❌ as blocked flag)
- **Progression**: Parse emoji → Map to workflow status → Display in correct column → Blocked flag adds visual badge → Cards drag between columns
- **Success criteria**: Exactly 3 columns visible; blocked cards show red badge; drag-and-drop works between all columns; column order is TODO, IN PROGRESS, DONE

### Blocked as Boolean Flag
- **Functionality**: Cards can be marked as blocked regardless of their workflow status, shown with a red ❌ badge
- **Purpose**: Indicate blockers without disrupting the workflow progression model
- **Trigger**: Parser detects ❌ emoji alongside status emoji, or user toggles blocked flag in card drawer
- **Progression**: Parse ❌ flag → Set blocked boolean → Display red badge on card → Toggle in drawer → Persist to markdown
- **Success criteria**: Blocked flag independent of status; visual badge appears on all blocked cards; toggle switch in drawer; markdown round-trip preserves flag

### Mandatory Swimlanes
- **Functionality**: Every H2/H3 heading creates a collapsible swimlane with the same 3-column layout
- **Purpose**: Organize work by domain, feature area, or subsystem while maintaining consistent workflow
- **Trigger**: Parser encounters H2 or H3 markdown heading
- **Progression**: Parse H2/H3 → Create swimlane → Assign cards to lane → Display 3 columns per lane → Allow collapse/expand
- **Success criteria**: All H2/H3 become swimlanes; at least one default swimlane exists; each lane has 3 columns; collapse animation smooth

### GitHub Integration
- **Functionality**: Connect to GitHub via personal access token, list repos with STATUS.md, pull/push changes directly
- **Purpose**: Enable seamless sync with remote repositories without local filesystem dependencies
- **Trigger**: User clicks "Connect GitHub" button and enters token
- **Progression**: Enter token → Validate via API → List repos → Filter for STATUS.md → Select repo → Pull content → Make changes → Push back to GitHub
- **Success criteria**: Token stored securely; repo list loads; STATUS.md fetched correctly; push updates file on GitHub; error handling for auth failures

### Project Selector
- **Functionality**: Dropdown to switch between different repositories or local files with STATUS.md
- **Purpose**: Support multi-project workflows and easy switching between contexts
- **Trigger**: User has GitHub token configured or multiple files loaded
- **Progression**: Load repositories → Display in dropdown → User selects → Load STATUS.md → Parse and display → Switch preserves unsaved changes warning
- **Success criteria**: Dropdown shows all available repos; selection loads correctly; current repo persisted; switching prompts for unsaved changes

### Enhanced Card Structure with Multi-line Descriptions
- **Functionality**: Cards parse title from bullet line and indented content as description, with expand/collapse UI
- **Purpose**: Support rich task context without cluttering the board view
- **Trigger**: Parser detects indented lines following a status bullet
- **Progression**: Parse bullet title → Collect indented lines as description → Display title with expand arrow → Click arrow reveals description → Description supports markdown formatting
- **Success criteria**: Indented content correctly parsed; expand/collapse animation smooth; round-trip preserves formatting

### Card Detail Drawer
- **Functionality**: Side drawer for editing card title, description, status, and blocked flag with save/cancel actions
- **Purpose**: Enable inline editing without modal interruption to workflow
- **Trigger**: User clicks on any card
- **Progression**: Click card → Drawer slides from right → Edit fields → Toggle blocked switch → Save → Update card in-memory → Mark as changed
- **Success criteria**: Drawer opens smoothly; all fields editable; blocked toggle works; changes reflect immediately; original line reference preserved

### STATUS.md Parser with New Emoji System
- **Functionality**: Parse markdown with emoji status markers (✅ ⚠️ ❗) and blocked flag (❌), capture multi-line indented descriptions
- **Purpose**: Bridge human-readable markdown and visual project management with full fidelity
- **Trigger**: User uploads/pastes STATUS.md content or connects to a Git repository
- **Progression**: Parse markdown → Extract H2/H3 as swimlanes → Map bullets to cards → Parse status and blocked emojis → Capture indented lines as descriptions → Generate unique card IDs
- **Success criteria**: Correctly parse example document with 100% card extraction; distinguish status from blocked; preserve all non-card content

### Interactive Kanban Board with Drag & Drop
- **Functionality**: Swimlane-based board with drag-and-drop card movement between the three workflow columns
- **Purpose**: Provide visual project overview and enable quick status updates across domains
- **Trigger**: Successfully parsed STATUS.md loads
- **Progression**: Display cards in swimlanes by status → User drags card to new column → Update status in-memory → Show visual feedback → Blocked flag persists
- **Success criteria**: Smooth drag operations; clear visual feedback; blocked badge visible during drag; responsive on tablet/mobile

### Markdown Round-Trip with Blocked Flag
- **Functionality**: Project UI changes back to markdown while preserving indentation, multi-line descriptions, and blocked flags
- **Purpose**: Maintain markdown as source of truth; enable Git workflows with proper formatting
- **Trigger**: User clicks "Save Changes", "Download", or "Push to GitHub"
- **Progression**: Collect schema changes → Map to original markdown locations → Replace status emojis → Add ❌ if blocked → Write indented descriptions → Update timestamp
- **Success criteria**: Zero formatting loss; blocked flag correctly placed; headings unchanged; descriptions properly indented; dates auto-updated

## Edge Case Handling

- **Malformed emoji**: Missing status icon or only blocked flag → Default to TODO; allow manual correction in drawer
- **ID collisions**: Same lane + title combination → Append `-1`, `-2` suffix; maintain stable IDs across edits
- **Large swimlanes**: 50+ cards per lane → Virtual scrolling in columns; smooth collapse animations
- **Empty swimlanes**: No cards in a lane → Show empty state message; allow collapse to hide
- **Multi-line descriptions**: Complex indented content → Parse all indented lines; preserve formatting in round-trip; render with expand/collapse
- **Missing H2/H3 headers**: Bullets without section context → Group in "default" swimlane labeled "All Items"
- **Invalid markdown**: Unparseable structure → Show raw markdown view; highlight problematic lines; allow manual correction
- **GitHub auth failures**: Invalid token or network errors → Clear error messaging; allow retry; preserve local changes
- **Merge conflicts**: Remote changes while editing → Warn user before push; allow force push or cancel

## Design Direction

The design should feel professional, focused, and information-dense—like a developer tool built by developers for developers. Swimlanes create clear visual hierarchy without sacrificing information density. The interface should feel fast and direct, with purposeful animations that communicate state changes (lane collapse, card moves, drawer slide) rather than drawing attention to themselves. Cards are compact but expandable, prioritizing scanability while supporting rich context. Blocked cards should be immediately recognizable with a distinct red badge.

## Color Selection

Triadic color scheme anchored by status meanings: TODO (cyan/accent), in-progress (amber/warning), done (green/success), blocked (red badge). Use muted, desaturated tones for the professional developer-tool aesthetic with subtle background tints to distinguish swimlanes.

- **Primary Color**: Deep slate blue `oklch(0.35 0.05 250)` — Communicates technical professionalism and focus
- **Secondary Colors**: 
  - Success green `oklch(0.55 0.15 145)` for Done status
  - Warning amber `oklch(0.65 0.14 75)` for In Progress  
  - Accent cyan `oklch(0.70 0.12 200)` for TODO status and interactive elements
  - Destructive red `oklch(0.55 0.18 25)` for Blocked badge
- **Accent Color**: Bright cyan `oklch(0.70 0.12 200)` for TODO status, unsaved changes indicator, and CTAs
- **Foreground/Background Pairings**:
  - Background (White `oklch(0.98 0 0)`): Dark slate text `oklch(0.25 0.02 250)` - Ratio 11.2:1 ✓
  - Card (Light gray `oklch(0.96 0 0)`): Dark slate text `oklch(0.25 0.02 250)` - Ratio 10.5:1 ✓
  - Muted (Swimlane header `oklch(0.94 0.01 250)`): Dark slate text `oklch(0.25 0.02 250)` - Ratio 9.8:1 ✓
  - Primary (Deep slate `oklch(0.35 0.05 250)`): White text `oklch(0.98 0 0)` - Ratio 8.9:1 ✓
  - Success (Green `oklch(0.55 0.15 145)`): White text `oklch(0.98 0 0)` - Ratio 4.7:1 ✓
  - Warning (Amber `oklch(0.65 0.14 75)`): Dark slate text `oklch(0.25 0.02 250)` - Ratio 5.2:1 ✓
  - Accent (Cyan `oklch(0.70 0.12 200)`): Dark slate text `oklch(0.25 0.02 250)` - Ratio 6.1:1 ✓
  - Destructive (Red `oklch(0.55 0.18 25)`): White text `oklch(0.98 0 0)` - Ratio 4.8:1 ✓

## Font Selection

Use a clean, modern sans-serif that emphasizes readability in dense information layouts, with excellent monospace support for code/markdown. Inter for UI and JetBrains Mono for code blocks.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/20px/tight letter spacing (-0.02em)
  - H2 (Swimlane Titles): Inter Semibold/16px/normal letter spacing
  - H3 (Column Headers): Inter Medium/12px/uppercase/wide letter spacing (0.05em)
  - Body (Card Title): Inter Medium/12px/normal line height (1.4)
  - Caption (Metadata, Counts): Inter Regular/11px/muted color/loose line height (1.6)
  - Description (Card Body): Inter Regular/12px/relaxed line height (1.6)
  - Code (Markdown): JetBrains Mono Regular/12px/normal letter spacing

## Animations

Animations should feel instantaneous and purposeful—swimlanes collapse smoothly with height transitions, cards glide between columns with physics-based easing, and the drawer slides elegantly from the right.

- **Purposeful Meaning**: 
  - Swimlane collapse uses height animation (200ms) to show/hide content fluidly
  - Card drag uses subtle elevation and scale (1.01) to communicate "lifting"
  - Drawer slide-in (250ms) from right feels natural and non-blocking
  - Card expand/collapse for descriptions (150ms) feels responsive
  - Blocked badge appears with subtle fade-in
- **Hierarchy of Movement**: 
  1. Drawer open/close (primary interaction) - 250ms ease-out slide from right
  2. Swimlane collapse/expand - 200ms ease-in-out height transition
  3. Card drag/drop - 150ms ease-out with scale 1.01
  4. Card description expand - 150ms ease-in-out height reveal
  5. Status indicator changes - 100ms color transition

## Component Selection

- **Components**: 
  - `Sheet` (drawer) for card detail editing with slide-from-right animation
  - `Card` for Kanban items with compact styling and status indicators
  - `Button` for primary actions (Save, Download, Collapse, Connect GitHub) with icon support
  - `Input` for card title editing and GitHub token entry
  - `Textarea` for description editing with monospace font
  - `Select` for status dropdown and repository selector with icon rendering
  - `Switch` for blocked flag toggle in drawer
  - `Dialog` for GitHub connection modal
  - `Badge` for blocked status indicator on cards
  - `Tabs` for switching between Board/Raw Markdown/Notes views
  - `ScrollArea` for column and lane scrolling with proper overflow
  - `Skeleton` for loading states during GitHub operations
  - `Label` for form fields in drawer
  - Framer Motion for animations (AnimatePresence for collapse/expand)

- **Customizations**: 
  - Custom Swimlane component with collapsible lanes and embedded 3-column layout
  - Enhanced KanbanCard with blocked badge and expand/collapse for descriptions
  - CardDetailDrawer using Sheet for slide-from-right editing with blocked toggle
  - GitHubConnector dialog for token entry and validation
  - ProjectSelector dropdown for repository switching
  - FileUploader with drag-and-drop visual feedback
  - Status icons integrated into selects and cards

- **States**: 
  - Buttons: Default/Hover (scale 1.01)/Active (scale 0.98)/Disabled (opacity 0.5)
  - Cards: Resting/Hover (shadow-md)/Dragging (shadow-2xl + rotate-1)/Expanded (description visible)/Blocked (red border)
  - Swimlanes: Expanded (full height)/Collapsed (header only with stats including blocked count)
  - Drawer: Closed (off-screen right)/Open (slide-in with overlay)
  - Save button: Idle/Has Changes (accent color)/Saving (disabled)/GitHub Push mode
  - GitHub connection: Disconnected/Connecting/Connected/Error
  - Repository selector: Loading (skeleton)/Loaded (dropdown)/Selected

- **Icon Selection**: 
  - `Kanban` for app branding and board view
  - `Download` for file download
  - `Upload` for GitHub push  
  - `ArrowsClockwise` for reset/new file
  - `FileText` for notes and raw markdown tabs
  - `Eye` for board view tab
  - `ListChecks` for TODO status indicator
  - `WarningCircle` for In Progress status indicator (filled weight)
  - `CheckCircle` for Done status indicator (filled weight)
  - `XCircle` for Blocked badge (filled weight)
  - `CaretDown`, `CaretUp` for expand/collapse controls
  - `FloppyDisk` for save action in drawer
  - `Link` for card link indicators
  - `GithubLogo` for GitHub connection button (filled weight)
  - `Key` for token input label
  - `FolderOpen` for project selector
  - `SignOut` for disconnect action

- **Spacing**: Consistent 4px grid. Swimlanes have p-4 headers, cards p-3, columns gap-2, lanes gap-4 vertical stacking

- **Mobile**: 
  - Desktop (1024px+): Full swimlane layout with 3 columns per lane
  - Tablet (768px): 2 columns per lane, swimlanes stack
  - Mobile (<768px): Single column per lane with tabs, swipe between lanes, drawer becomes full-screen modal
