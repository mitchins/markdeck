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

- Three-column workflow (TODO → IN PROGRESS → DONE) with swimlanes
- Round-trip safe: preserves all non-card markdown when saving
- GitHub integration with personal access tokens
- Local file mode for offline work
- Drag-and-drop card movement
- Terminal viewer for quick status checks

## STATUS.md Format

MarkDeck parses a simple markdown format to create Kanban cards:

**Card Format:**
```markdown
- ✅ Completed task
    Optional indented description
- ⚠️ In progress task
- ❗ TODO task
- ❌ ⚠️ Blocked task (combine status + ❌)
```

**Status Emojis:**
- ✅ = DONE
- ⚠️ = IN PROGRESS  
- ❗ = TODO
- ❌ = BLOCKED flag

**Swimlanes:**
Any H2 (`##`) or H3 (`###`) heading creates a swimlane.

**Preservation:**
Non-card markdown (paragraphs, code blocks, etc.) is preserved exactly when saving.

**Example:** See [STATUS.md](STATUS.md) for a complete working example.

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
