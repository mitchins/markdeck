# MarkDeck

MarkDeck turns a `STATUS.md` file into a focused, three-column Kanban board. It preserves the Markdown source of each project lane, lets you drag cards between TODO/IN PROGRESS/DONE, and syncs changes back to GitHub or local files without losing formatting.

## Key features
- Parse H2/H3 headings into swimlanes with TODO → IN PROGRESS → DONE columns and a separate blocked flag.
- Round-trip safe serialization that keeps non-card Markdown intact when saving.
- GitHub provider for pulling and pushing `STATUS.md` content with personal access tokens alongside local file support.
- Keyboard-friendly, accessible React UI with card drawers, drag-and-drop, and inline editing.

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
