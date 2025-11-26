# MarkDeck Development Guide

This guide contains everything you need to build, test, debug, and contribute to MarkDeck.

## Repository Structure

MarkDeck follows a layered architecture with clear separation of concerns:

```
markdeck/
├── src/
│   ├── core/                          # Pure domain logic (framework-agnostic)
│   │   ├── domain/                    # Domain models and types
│   │   │   ├── types.ts              # Core domain types (Card, Swimlane, Status)
│   │   │   ├── errors.ts             # Domain-specific error types
│   │   │   └── validation.ts         # Domain validation rules (Zod schemas)
│   │   ├── parsers/                   # Markdown parsing and serialization
│   │   │   ├── markdown-parser.ts    # STATUS.md → domain model
│   │   │   ├── markdown-serializer.ts # domain model → STATUS.md
│   │   │   └── card-parser.ts        # Bullet points → cards
│   │   ├── services/                  # Business logic services
│   │   │   ├── card-service.ts       # Card CRUD operations
│   │   │   └── sync-service.ts       # Conflict resolution, merge logic
│   │   └── utils/                     # Pure utility functions
│   │       ├── id-generator.ts       # Stable ID generation
│   │       └── emoji-mapper.ts       # Status ↔ emoji mapping
│   ├── adapters/                      # External integrations (I/O boundary)
│   │   ├── providers/                 # Status source providers
│   │   │   ├── base-provider.ts      # Abstract provider interface
│   │   │   ├── file-provider.ts      # Local file upload/download
│   │   │   ├── github-provider.ts    # GitHub API integration
│   │   │   └── static-provider.ts    # Static/demo data
│   │   ├── api/                       # External API clients
│   │   │   └── github-client.ts      # Octokit wrapper with error handling
│   │   └── storage/                   # Client-side persistence
│   │       └── kv-storage.ts         # GitHub Spark KV wrapper
│   ├── application/                   # Application layer (use cases)
│   │   ├── state/                     # Global state management
│   │   │   ├── app-store.ts          # Zustand store
│   │   │   ├── actions.ts            # Dispatched actions
│   │   │   └── selectors.ts          # Derived state selectors
│   │   ├── hooks/                     # React hooks (domain → UI)
│   │   │   ├── use-project.ts        # Load/save project
│   │   │   ├── use-cards.ts          # Card operations
│   │   │   └── use-sync.ts           # Sync state management
│   │   └── use-cases/                 # Orchestration layer
│   │       ├── load-project.ts       # Load workflow
│   │       ├── save-project.ts       # Save workflow
│   │       └── sync-project.ts       # Sync and conflict resolution
│   └── ui/                            # React components
│       ├── components/                # UI components
│       │   ├── board/                # Kanban board
│       │   ├── card/                 # Card components
│       │   ├── modals/               # Dialogs and modals
│       │   ├── layout/               # Header, tabs, layout
│       │   ├── theme-provider.tsx    # Theme context (next-themes)
│       │   └── theme-toggle.tsx      # Dark mode toggle dropdown
│       └── styles/                    # Global styles
├── packages/
│   └── tui/                          # Terminal UI viewer
│       └── src/markdeck-tui.ts       # Standalone CLI tool
├── tests/
│   ├── unit/                         # Pure function tests
│   ├── integration/                  # Multi-module tests
│   └── e2e/                          # End-to-end tests
└── docs/                             # [REMOVED - consolidated into this file]
```

## Theme System (Dark Mode)

**Components:** `theme-provider.tsx` wraps app, `theme-toggle.tsx` provides UI  
**Implementation:** Uses `next-themes` (existing dep) with `prefers-color-scheme` detection  
**Storage:** User preference saved in localStorage as `theme` key  
**Styling:** CSS custom properties in `main.css` with `.dark` class overrides  
**Options:** Light | Dark | System (auto-detects OS preference)  
**Accessibility:** WCAG AA+ contrast, keyboard nav, ARIA labels, no FOUC

## Architecture Decisions

### Layered Architecture

MarkDeck follows a strict layered architecture:

**Core Domain (`src/core/`)** - Pure, framework-agnostic business logic
- ✅ CAN: Define types, validate data, parse/serialize markdown, implement business rules
- ❌ CANNOT: Import React, use DOM APIs, make HTTP calls, access localStorage

**Adapter Layer (`src/adapters/`)** - Interface with external systems (I/O boundary)
- ✅ CAN: Make HTTP calls, access file system, use localStorage, call external APIs
- ❌ CANNOT: Contain business logic, import React components

**Application Layer (`src/application/`)** - Orchestration and state management
- ✅ CAN: Use React hooks, manage state, coordinate use cases
- ❌ CANNOT: Implement business logic, make direct I/O calls

**UI Layer (`src/ui/`)** - React components and presentation
- ✅ CAN: Render UI, handle user interactions, use hooks
- ❌ CANNOT: Contain business logic, make direct API calls

### Key Design Decisions

1. **Pure Core Logic** - Domain logic separated from framework and UI
2. **Provider Abstraction** - Pluggable data sources (file, GitHub, future: Cloudflare D1/R2)
3. **Unidirectional Data Flow** - Predictable state management with Zustand
4. **Round-Trip Fidelity** - Lossless markdown parsing and serialization
5. **Test-First Design** - All core modules have comprehensive test coverage

## Local Development

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mitchins/markdeck.git
   cd markdeck
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Development Workflows

**Hot Reload Development:**
```bash
npm run dev              # Start Vite dev server with HMR
```

**Type Checking (watch mode):**
```bash
npx tsc --noEmit --watch
```

**Linting:**
```bash
npm run lint             # Run ESLint
npm run lint -- --fix    # Auto-fix issues
```

## Terminal UI (TUI) Viewer

MarkDeck includes a standalone terminal viewer for STATUS.md files.

### Building the TUI

```bash
# One-time build
npm run build:tui
```

This creates a standalone executable in `packages/tui/bin/markdeck-tui`.

### Using the TUI

```bash
# View STATUS.md in current directory
npm run markdeck-tui

# View a specific file
npm run markdeck-tui -- --file path/to/STATUS.md

# Show help
npm run markdeck-tui -- --help
```

The TUI is a lightweight, zero-dependency terminal tool that renders STATUS.md as a colorful Kanban board - perfect for quick status checks without leaving the command line.

## Testing

MarkDeck follows a comprehensive testing strategy with three test levels:

### Testing Pyramid

- **80% Unit Tests** - Fast, focused tests for pure logic (core domain, services, utilities)
- **15% Integration Tests** - Component interactions, provider system, state management  
- **5% E2E Tests** - Critical user workflows (file upload, GitHub sync, card operations)

### Running Tests

```bash
# Run all tests
npm test

# Run by test type
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # End-to-end tests only

# Run with coverage
npm run test:coverage       # Generates coverage/lcov.info and test-results/junit.xml

# Watch mode (for development)
npm test -- --watch

# Run specific test file
npm test -- card-parser.test.ts
```

### Coverage Targets

- **Core Domain:** 95%+ coverage
- **Adapters:** 90%+ coverage
- **Application Layer:** 90%+ coverage
- **UI Layer:** 85%+ coverage
- **Overall:** 90%+ coverage

### Unit Tests

**Location:** `tests/unit/`

Test pure functions, domain logic, parsers, services, and utilities with no external dependencies.

**Characteristics:**
- No network calls
- No file system access
- No React rendering
- Fast execution (<1ms per test)
- Deterministic (same input → same output)

**Example:**
```typescript
describe('Card Parser', () => {
  it('should parse TODO card with emoji', () => {
    const markdown = '- 🔵 Implement login'
    const card = parseCard(markdown)
    
    expect(card.status).toBe('todo')
    expect(card.title).toBe('Implement login')
    expect(card.blocked).toBe(false)
  })
})
```

### Integration Tests

**Location:** `tests/integration/`

Test interactions between multiple modules and components.

**Characteristics:**
- Tests multiple layers together
- Mocked external dependencies (GitHub API via MSW)
- React component testing with React Testing Library
- State management testing (Zustand store)
- Moderate execution time (10-100ms per test)

**Key Test Areas:**
- Provider factory and configuration
- Zustand store actions and selectors
- Board component with drag-and-drop
- GitHub provider with MSW mocking
- File upload/download workflow
- Custom hooks (useProject, useCards, etc.)

**Example:**
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Board } from '@/ui/components/board/Board'

describe('Board integration', () => {
  it('should move card when dragged to new column', async () => {
    const onCardMove = jest.fn()
    render(<Board cards={cards} onCardMove={onCardMove} />)
    
    // Drag card from TODO to DONE
    const card = screen.getByText('Implement login')
    const doneColumn = screen.getByTestId('column-done')
    
    await userEvent.drag(card, doneColumn)
    
    expect(onCardMove).toHaveBeenCalledWith('card-1', 'done')
  })
})
```

### E2E Tests

**Location:** `tests/e2e/`

Test complete user workflows with Playwright.

**Characteristics:**
- Real browser automation
- Full application stack
- User perspective testing
- Slower execution (1-10s per test)

**Critical Workflows:**
- Load STATUS.md from local file
- Connect to GitHub and sync
- Create, edit, and move cards
- Drag-and-drop between columns
- Save changes back to source

### MSW (Mock Service Worker)

All GitHub API mocking is configured in:
- `tests/helpers/msw-handlers.ts` - Request handlers
- `tests/helpers/msw-server.ts` - Server setup
- `tests/setup.ts` - Server lifecycle (start/stop)

Default handlers are loaded automatically. Override in specific tests:

```typescript
import { http, HttpResponse } from 'msw'
import { server } from '@/tests/helpers/msw-server'

server.use(
  http.get('*/STATUS.md', () => {
    return HttpResponse.json({ custom: 'response' })
  })
)
```

### Round-Trip Fidelity Testing

Critical test to ensure markdown parsing and serialization is lossless:

```typescript
describe('Round-trip fidelity', () => {
  it('preserves all non-card content exactly', () => {
    const original = readFixture('complex-status.md')
    const parsed = parseStatusMarkdown(original)
    const serialized = serializeProject(parsed)
    
    const originalNonCardLines = extractNonCardLines(original)
    const serializedNonCardLines = extractNonCardLines(serialized)
    
    expect(serializedNonCardLines).toEqual(originalNonCardLines)
  })
})
```

## Building for Production

### Web Application

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

Output is in `dist/` directory, ready for deployment.

### Production Deployment

**Cloudflare Pages:**
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: Configure in Cloudflare dashboard

## Coding Standards

### TypeScript

- Use strict TypeScript mode
- Avoid `any` types - use `unknown` with type guards if necessary
- Prefer interfaces over types for object shapes
- Use Zod for runtime validation

### React

- Use functional components with hooks
- Prefer composition over prop drilling
- Use React.memo() for expensive components
- Keep components small and focused (< 200 lines)

### Testing

- Follow AAA pattern: Arrange, Act, Assert
- Use descriptive test names: `it('should X when Y')`
- One assertion per test (when practical)
- Test behavior, not implementation

### Code Organization

- One component/module per file
- Group related functionality in directories
- Export from index.ts files for clean imports
- Keep files under 300 lines

## CI/CD

### GitHub Actions

The CI pipeline runs on every push and PR:

1. **Lint** - ESLint checks
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Fast test suite
4. **Integration Tests** - Component interaction tests
5. **E2E Tests** - Playwright browser tests
6. **Coverage** - Upload to Codecov
7. **SonarCloud** - Code quality analysis
8. **Build** - Verify production build works

### Running CI Locally

You can run the same checks locally before pushing:

```bash
# Run full CI suite
npm run lint && npx tsc --noEmit && npm run test:coverage && npm run build

# Or individually
npm run lint                  # Linting
npx tsc --noEmit             # Type checking
npm run test:unit -- --run   # Unit tests
npm run test:integration -- --run  # Integration tests
npm run test:e2e -- --run    # E2E tests
npm run build                # Production build
```

## Release Process

1. Update version in `package.json`
2. Update `STATUS.md` with release notes
3. Run full test suite: `npm run test:coverage`
4. Build and verify: `npm run build && npm run preview`
5. Create git tag: `git tag v0.2.0`
6. Push with tags: `git push --tags`
7. Deploy to Cloudflare Pages (automatic on tag push)

## Troubleshooting

### Build Issues

**Module not found errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Type errors after dependency update:**
```bash
npx tsc --noEmit
# Fix errors, then rebuild
```

### Test Issues

**Tests hanging:**
- Check for missing `await` in async tests
- Verify MSW server is properly configured
- Ensure cleanup in `afterEach` hooks

**Flaky tests:**
- Add proper `waitFor` for async operations
- Use `screen.debug()` to inspect DOM state
- Check for race conditions

### Development Server Issues

**HMR not working:**
- Clear browser cache
- Restart dev server
- Check browser console for errors

## Security

**Reporting vulnerabilities:**

If you find a security vulnerability, please report it privately:

1. **Do not** open a public GitHub issue
2. Email the details to the maintainer (contact via GitHub profile)
3. Include:
   - Type of vulnerability (e.g., XSS, CSRF, injection)
   - File paths and affected code
   - Steps to reproduce
   - Potential impact

**Security best practices:**

- Never commit tokens or secrets
- Use environment variables for sensitive data
- Scope GitHub PATs to minimum required permissions
- Validate and sanitize all user input
- Keep dependencies updated (Dependabot enabled)

## Contributing

Contributions are welcome! This project follows a minimal process:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Run the full test suite: `npm run test:coverage`
6. Commit with clear messages: `git commit -m "feat: add card filtering"`
7. Push and create a Pull Request

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `test:` - Adding or fixing tests
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `chore:` - Maintenance tasks

## Additional Resources

- **Live Demo:** Coming soon (Cloudflare Pages deployment in progress)
- **STATUS.md:** See the project roadmap and current status
- **GitHub Issues:** Report bugs or request features
