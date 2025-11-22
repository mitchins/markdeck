# MarkDeck

A focused Kanban board that visualizes `STATUS.md` files with round-trip safe editing and GitHub sync.

## Quick Start

**Install dependencies:**
```bash
npm ci
```

**Run the dev server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

## Key Features

- **Dual Format Support**: Works with both emoji-based (RYGBO) and simple checkbox formats
- **Simple Mode**: Two-column workflow (TODO → DONE) for checkbox-based lists
- **Full Mode**: Three-column workflow (TODO → IN PROGRESS → DONE) with blocked status modifier
- **Easy Upgrade**: Convert simple checkbox mode to full emoji mode with one click
- Round-trip safe: preserves all non-card markdown when saving
- GitHub integration with personal access tokens
- Local file mode for offline work
- Drag-and-drop card movement
- Terminal viewer for quick status checks

## STATUS.md Format

MarkDeck supports two formats for creating Kanban cards:

### Simple Checkbox Format (2-column mode)

For basic TODO lists compatible with most markdown editors:

```markdown
- [ ] Task to do
- [x] Completed task
- [ ] Another task
```

**Checkbox Syntax:**
- `[ ]` = TODO
- `[x]` or `[X]` = DONE

This creates a simple 2-column board (TODO | DONE) perfect for quick checklists.

### Full Emoji Format (3-column mode)

For advanced project tracking with the RYGBO (5-color) status system:

```markdown
- 🟢 Completed task
    Optional indented description
- 🟡 In progress task
- 🔵 TODO task
- 🔴 Blocked TODO task
- 🟧 Blocked in progress task
```

**Status Emojis (RYGBO System):**
- 🔵 = TODO (default if no emoji)
- 🟡 = IN PROGRESS
- 🔴 = Blocked TODO (blocked modifier)
- 🟧 = Blocked IN PROGRESS (blocked modifier)
- 🟢 = DONE

**Note:** Blocked is a modifier, not a separate column. Blocked cards remain in their TODO or IN PROGRESS column but are visually distinguished.

### Common Features

**Swimlanes:**
Any H2 (`##`) or H3 (`###`) heading creates a swimlane.

**Preservation:**
Non-card markdown (paragraphs, code blocks, etc.) is preserved exactly when saving.

**Format Detection:**
MarkDeck automatically detects which format you're using and preserves it during round-trips.

**Upgrading:**
When using checkbox format, MarkDeck displays an upgrade banner allowing you to permanently switch to the full 3-column emoji format.

**Example:** See [STATUS.md](STATUS.md) for a complete working example.

## Board Layout

MarkDeck uses a **table-style layout** with a single header row shared across all swimlanes:

- **Single Header Row**: At the top of the board, one row displays all column headers (TODO, IN PROGRESS, DONE)
- **Swimlanes as Rows**: Each swimlane appears as a row beneath the shared headers
- **Grid Structure**: Cards are positioned in the appropriate column for their status
- **Empty States**: Empty columns show "—" or "No items" to maintain the grid structure

This layout applies to both the **Web UI** and **Terminal (TUI)** viewer, providing a consistent experience across interfaces. The underlying STATUS.md format and domain model remain unchanged—this is purely a presentation layer improvement.

## Architecture

MarkDeck follows a layered architecture:
- **Core Domain** (`src/core/`) - Pure business logic, parsers, validation
- **Adapters** (`src/adapters/`) - External I/O (GitHub API, file system, storage)
- **Application** (`src/application/`) - State management, orchestration
- **UI** (`src/ui/`) - React components, presentation

Tech stack: React 19, TypeScript, Vite, TailwindCSS 4, Zustand, Vitest.

## Terminal Viewer

View STATUS.md directly in your terminal:

```bash
# One-time build
npm run build:tui

# View STATUS.md in current directory
npm run markdeck-tui

# View a specific file
npm run markdeck-tui -- --file path/to/STATUS.md
```

## Testing

```bash
npm test                    # Run all tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # E2E tests with Playwright
npm run test:coverage       # With coverage reports
npm run lint                # ESLint
```

## Documentation

- **[STATUS.md](STATUS.md)** - Project roadmap and current status
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Developer guide: setup, architecture, testing, contributing

## Troubleshooting

**Build fails:**
```bash
rm -rf node_modules package-lock.json && npm install
```

**Tests hang:**
- Check for missing `await` in async tests
- Verify proper cleanup in test hooks

**Port 5173 in use:**
```bash
lsof -ti:5173 | xargs kill -9
```

For more help, see [DEVELOPMENT.md](DEVELOPMENT.md).
