# MarkDeck

MarkDeck turns a `STATUS.md` file into a focused, three-column Kanban board. It preserves the Markdown source of each project lane, lets you drag cards between TODO/IN PROGRESS/DONE, and syncs changes back to GitHub or local files without losing formatting.

## Key features
- Parse H2/H3 headings into swimlanes with TODO → IN PROGRESS → DONE columns and a separate blocked flag.
- Round-trip safe serialization that keeps non-card Markdown intact when saving.
- GitHub provider for pulling and pushing `STATUS.md` content with personal access tokens alongside local file support.
- Keyboard-friendly, accessible React UI with card drawers, drag-and-drop, and inline editing.

## STATUS.md Format Specification

MarkDeck parses a specific markdown format to create Kanban cards. Here's the exact schema:

### Card Format
Cards are markdown bullet points with status emojis:

```markdown
- ✅ Completed task
    Optional description lines
    Indented under the task
- ⚠️ In progress task
- ❗ TODO task
- ❌ ⚠️ Blocked task (combine status + ❌)
- ❌ Only blocked emoji (defaults to TODO + blocked)
```

### Status Emojis
- **✅** = DONE
- **⚠️** = IN PROGRESS  
- **❗** = TODO
- **❌** = BLOCKED flag (can be combined with any status, or used alone to default to TODO)

**Important**: If a bullet has only ❌ without a status emoji, it defaults to TODO status and is marked as blocked. This ensures all tracked work appears on the board.

### Swimlanes
Any H2 (`##`) or H3 (`###`) heading creates a swimlane:

```markdown
## 🚀 DEPLOYMENT & INFRASTRUCTURE

- ✅ Vite build configuration
- ❌ Custom domain setup

## 🧪 TESTING & QUALITY

- ⚠️ Accessibility testing
```

### Multi-line Descriptions
Indent content under a card bullet to add description:

```markdown
- ⚠️ GitHub provider integration
    Basic pull/push functionality works
    Need better error handling
    Rate limiting not implemented
```

### Non-Card Content
Any markdown that doesn't match the card format is preserved as-is:
- Regular bullet points without emojis
- Paragraphs, code blocks, tables, etc.
- Comments and documentation

**Example**: See [STATUS.md](STATUS.md) for a complete working example.

## Tech stack
- React 19 + TypeScript, Vite, TailwindCSS 4
- State management with Zustand and React Query for async data
- Markdown parsing/serialization in `src/core/parsers` and adapters in `src/adapters`
- Testing with Vitest, Testing Library, and Happy DOM

## Getting started
1. Install dependencies (Node.js 20+):
   ```bash
   npm ci
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

### Terminal Viewer (Developer Easter Egg!)

View your STATUS.md directly in the terminal with the built-in TUI viewer:

```bash
# Build the TUI package (one-time setup)
npm run build:tui

# View STATUS.md in current directory
npm run markdeck-tui

# View a specific file
npm run markdeck-tui -- --file path/to/STATUS.md

# Show help
npm run markdeck-tui -- --help
```

The TUI viewer is a lightweight, zero-dependency terminal tool that renders your STATUS.md as a colorful Kanban board right in your terminal - perfect for quick status checks without leaving the command line!

## Testing and quality
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit`
- Unit tests: `npm run test:unit -- --run`
- Integration tests: `npm run test:integration -- --run`
- End-to-end tests: `npm run test:e2e -- --run`
- Coverage + Sonar reports: `npm run test:coverage` generates `coverage/lcov.info` and `test-results/junit.xml` for SonarCloud.

CI runs the lint/typecheck/test suite, uploads coverage and test results, and then triggers SonarCloud analysis using `sonar-project.properties`.

## Documentation
- [STATUS.md](STATUS.md) - Live project roadmap (viewable with MarkDeck itself!)
- [docs/](docs/) - Architecture, UX specifications, and implementation details
- [SECURITY.md](SECURITY.md) - Security policies and vulnerability reporting

## Live demo
Coming soon! Cloudflare Pages deployment in progress.
