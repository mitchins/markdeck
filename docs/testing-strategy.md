# MarkDeck v0.2 Testing Strategy

**Author:** QE Lead  
**Date:** 2025-11-20  
**Status:** Active  
**Version:** 0.2.0

---

## Executive Summary

This document defines the comprehensive testing strategy for MarkDeck v0.2, aligned with the layered architecture (core, adapters, application, UI). Our testing approach prioritizes **quality gates**, **round-trip fidelity**, and **regression prevention** while maintaining fast feedback loops.

**Key Objectives:**
1. **90%+ overall code coverage**, with core domain at **95%+**
2. **100% round-trip fidelity** for markdown parsing/serialization
3. **Zero regressions** in core functionality
4. **Fast test execution** (<5s unit tests, <30s full suite)
5. **Deterministic tests** (no flakiness, no external dependencies in unit tests)

---

## Testing Pyramid

Our testing strategy follows the standard testing pyramid, adapted for MarkDeck's architecture:

```
           /\
          /  \
         / E2E \         ~10 tests (5%)
        /--------\
       /          \
      / Integration \    ~30 tests (15%)
     /--------------\
    /                \
   /   Unit Tests     \  ~160 tests (80%)
  /--------------------\
```

### Distribution Rationale

- **80% Unit Tests:** Fast, focused tests for pure logic (core domain, services, utilities)
- **15% Integration Tests:** Component interactions, provider system, state management
- **5% E2E Tests:** Critical user workflows (file upload, GitHub sync, card operations)

---

## Test Levels & Scope

### 1. Unit Tests (80% of tests)

**Target:** Pure functions, domain logic, parsers, services, utilities

**Characteristics:**
- ✅ No external dependencies
- ✅ No network calls
- ✅ No file system access
- ✅ No React rendering
- ✅ Fast execution (<1ms per test)
- ✅ Deterministic (same input → same output)

**Coverage Target:** 95%+ for core domain

**Test Subjects:**

#### 1.1 Core Domain Types & Validation
- **File:** `src/core/domain/validation.ts`
- **Tests:**
  - Zod schema validation (Card, Swimlane, Project, Note)
  - Invalid input rejection
  - Edge cases (empty strings, special characters, max lengths)
  - Type safety enforcement

#### 1.2 Markdown Parser
- **Files:** `src/core/parsers/markdown-parser.ts`, `card-parser.ts`, `swimlane-parser.ts`, etc.
- **Tests:**
  - Valid STATUS.md parsing
  - Malformed markdown handling
  - Unknown status emoji handling
  - Missing swimlanes
  - Multi-line descriptions
  - Blocked flag detection
  - Link extraction
  - Edge cases: empty sections, duplicate IDs, special characters

**Critical Test: Round-trip fidelity**
```typescript
describe('Round-trip fidelity', () => {
  it('preserves all non-card content exactly', () => {
    const original = readFixture('complex-status.md')
    const parsed = parseStatusMarkdown(original)
    const serialized = serializeProject(parsed)
    
    // Extract non-card lines from both
    const originalNonCardLines = extractNonCardLines(original)
    const serializedNonCardLines = extractNonCardLines(serialized)
    
    expect(serializedNonCardLines).toEqual(originalNonCardLines)
  })
})
```

#### 1.3 Markdown Serializer
- **File:** `src/core/parsers/markdown-serializer.ts`
- **Tests:**
  - Card status emoji updates
  - Blocked flag serialization
  - Timestamp updates
  - Line number preservation
  - New card insertion
  - Deleted card removal

#### 1.4 Core Services
- **Files:** `src/core/services/card-service.ts`, `swimlane-service.ts`, `sync-service.ts`
- **Tests:**
  - Card CRUD operations (create, move, update, delete)
  - Blocked flag toggle
  - Swimlane operations
  - Conflict detection
  - Merge resolution
  - Validation logic

#### 1.5 Utilities
- **Files:** `src/core/utils/id-generator.ts`, `emoji-mapper.ts`, `date-formatter.ts`
- **Tests:**
  - Stable ID generation (same title → same ID)
  - Duplicate ID handling with counters
  - Emoji ↔ status mapping (bidirectional)
  - Date parsing and formatting
  - Edge cases: empty inputs, special characters

---

### 2. Integration Tests (15% of tests)

**Target:** Component interactions, provider system, state management, UI hooks

**Characteristics:**
- ✅ Tests multiple modules together
- ✅ Mocked external dependencies (HTTP, file system)
- ✅ React Testing Library for UI components
- ✅ MSW for GitHub API mocking
- ✅ Moderate execution time (10-100ms per test)

**Coverage Target:** 90%+

**Test Subjects:**

#### 2.1 Provider System Integration
- **Files:** `src/adapters/providers/*`, `src/config/provider-config.ts`
- **Tests:**
  - Provider factory creation
  - FileProvider: upload/download flow
  - GitHubProvider: load/save with mocked GitHub API
  - StaticProvider: demo data loading
  - Provider error handling
  - Provider configuration validation

**Example: GitHub Provider Test**
```typescript
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('https://api.github.com/repos/:owner/:repo/contents/:path', (req, res, ctx) => {
    return res(ctx.json({
      content: btoa('# Test Project\n## Lane 1\n- ✅ Card 1'),
      sha: 'abc123'
    }))
  })
)

describe('GitHubProvider integration', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('loads STATUS.md from GitHub', async () => {
    const provider = new GitHubProvider({
      token: 'test-token',
      owner: 'test-owner',
      repo: 'test-repo'
    })
    
    const result = await provider.load({})
    
    expect(result.success).toBe(true)
    expect(result.data).toContain('# Test Project')
  })
})
```

#### 2.2 State Management Integration
- **Files:** `src/application/state/app-store.ts`, `src/application/hooks/*`
- **Tests:**
  - Zustand store actions
  - State updates and immutability
  - Derived selectors
  - Persistence middleware
  - Hook integration (useProject, useCards, useProvider, useUI)

**Example: State Integration Test**
```typescript
import { renderHook, act } from '@testing-library/react'
import { useCards } from '@/application/hooks/use-cards'

describe('useCards integration', () => {
  it('moves card and updates state', () => {
    const { result } = renderHook(() => useCards())
    
    // Set up initial state
    act(() => {
      useAppStore.setState({
        project: {
          cards: [{ id: 'card1', status: 'todo', ... }]
        }
      })
    })
    
    // Move card
    act(() => {
      result.current.moveCard('card1', 'done')
    })
    
    // Verify state updated
    expect(result.current.cards[0].status).toBe('done')
  })
})
```

#### 2.3 UI Component Integration
- **Files:** `src/ui/components/*`
- **Tests:**
  - Board component with cards and swimlanes
  - Drag-and-drop interactions
  - Card detail drawer
  - File uploader
  - GitHub connector modal
  - Tabs navigation

**Example: Board Integration Test**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Board } from '@/ui/components/board/Board'

describe('Board integration', () => {
  it('displays swimlanes with cards', () => {
    const swimlanes = [
      { id: 'lane1', title: 'Feature Work', order: 0 }
    ]
    const cards = [
      { id: 'card1', title: 'Implement login', laneId: 'lane1', status: 'todo' }
    ]
    
    render(
      <Board 
        swimlanes={swimlanes} 
        cards={cards}
        onCardMove={jest.fn()}
        onCardClick={jest.fn()}
      />
    )
    
    expect(screen.getByText('Feature Work')).toBeInTheDocument()
    expect(screen.getByText('Implement login')).toBeInTheDocument()
  })
  
  it('calls onCardClick when card is clicked', () => {
    const onCardClick = jest.fn()
    
    render(<Board {...props} onCardClick={onCardClick} />)
    
    fireEvent.click(screen.getByText('Implement login'))
    
    expect(onCardClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'card1' })
    )
  })
})
```

#### 2.4 Use Case Orchestration
- **Files:** `src/application/use-cases/*`
- **Tests:**
  - Load project use case (provider → parser → validation → state)
  - Save project use case (state → serializer → provider)
  - GitHub sync workflow
  - Error handling and recovery

---

### 3. End-to-End Tests (5% of tests)

**Target:** Critical user workflows, full system integration

**Characteristics:**
- ✅ Full application flow
- ✅ Real browser (or headless)
- ✅ Network mocked (MSW for GitHub API)
- ✅ Slow execution (1-10s per test)
- ✅ Focuses on happy paths and critical scenarios

**Coverage Target:** Critical user journeys only

**Tool:** Playwright (or Vitest + happy-dom for lightweight E2E)

**Test Subjects:**

#### 3.1 Local Mode (File Upload/Download)
```typescript
test('local mode: upload → edit → download', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:5173')
  
  // Upload STATUS.md file
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('./EXAMPLE-STATUS.md')
  
  // Verify board displays
  await expect(page.locator('h1')).toContainText('Example Project')
  await expect(page.locator('[data-testid="card"]')).toHaveCount(3)
  
  // Move a card
  await page.dragAndDrop(
    '[data-testid="card-1"]',
    '[data-testid="column-done"]'
  )
  
  // Save changes
  await page.click('[data-testid="save-button"]')
  
  // Verify download triggered
  const download = await page.waitForEvent('download')
  expect(download.suggestedFilename()).toBe('STATUS.md')
})
```

#### 3.2 GitHub Mode (Mocked Network)
```typescript
test('github mode: connect → load → edit → save', async ({ page }) => {
  // Mock GitHub API
  await page.route('https://api.github.com/**', route => {
    if (route.request().url().includes('/contents/STATUS.md')) {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          content: btoa('# Project\n## Lane\n- ❗ Todo'),
          sha: 'abc123'
        })
      })
    }
  })
  
  // Connect to GitHub
  await page.goto('http://localhost:5173')
  await page.click('[data-testid="github-connect"]')
  await page.fill('[data-testid="github-token"]', 'test-token')
  await page.fill('[data-testid="github-repo"]', 'owner/repo')
  await page.click('[data-testid="connect-submit"]')
  
  // Verify project loaded
  await expect(page.locator('h1')).toContainText('Project')
  
  // Edit card description
  await page.click('[data-testid="card-1"]')
  await page.fill('[data-testid="description-input"]', 'Updated description')
  await page.click('[data-testid="drawer-save"]')
  
  // Save to GitHub
  await page.click('[data-testid="save-button"]')
  
  // Verify success toast
  await expect(page.locator('.sonner')).toContainText('Saved successfully')
})
```

#### 3.3 UI Interactions
```typescript
test('drag and drop cards between columns', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.setInputFiles('input[type="file"]', './fixtures/status.md')
  
  // Get initial card count in TODO column
  const todoCount = await page.locator('[data-testid="column-todo"] [data-testid="card"]').count()
  
  // Drag card from TODO to IN PROGRESS
  await page.dragAndDrop(
    '[data-testid="column-todo"] [data-testid="card"]:first-child',
    '[data-testid="column-in-progress"]'
  )
  
  // Verify card moved
  const newTodoCount = await page.locator('[data-testid="column-todo"] [data-testid="card"]').count()
  expect(newTodoCount).toBe(todoCount - 1)
})
```

---

## Failure Mode Testing

Critical to test failure scenarios to ensure graceful degradation.

### Malformed Markdown Tests

```typescript
describe('Malformed markdown handling', () => {
  it('handles missing H1 title', () => {
    const markdown = '## Lane\n- ✅ Card'
    const result = parseStatusMarkdown(markdown)
    
    expect(result.metadata.title).toBe('Untitled Project')
  })
  
  it('handles unknown status emoji', () => {
    const markdown = '# Project\n## Lane\n- 🔥 Unknown status'
    const result = parseStatusMarkdown(markdown)
    
    // Should default to TODO or skip card
    expect(result.cards[0].status).toBe('todo')
  })
  
  it('handles missing swimlanes', () => {
    const markdown = '# Project\n- ✅ Orphan card'
    const result = parseStatusMarkdown(markdown)
    
    // Should create default swimlane or skip
    expect(result.cards.length).toBeGreaterThanOrEqual(0)
  })
  
  it('handles extremely long descriptions', () => {
    const longDescription = 'a'.repeat(10000)
    const markdown = `# Project\n## Lane\n- ✅ Card\n    ${longDescription}`
    
    const result = parseStatusMarkdown(markdown)
    
    // Should truncate or handle gracefully
    expect(result.cards[0].description.length).toBeLessThanOrEqual(5000)
  })
})
```

### Provider Error Handling Tests

```typescript
describe('Provider error handling', () => {
  it('handles GitHub 404 (file not found)', async () => {
    server.use(
      rest.get('*/contents/STATUS.md', (req, res, ctx) => {
        return res(ctx.status(404), ctx.json({ message: 'Not Found' }))
      })
    )
    
    const provider = new GitHubProvider(config)
    const result = await provider.load({})
    
    expect(result.success).toBe(false)
    expect(result.error.code).toBe('GITHUB_LOAD_ERROR')
    expect(result.error.message).toContain('Not Found')
  })
  
  it('handles GitHub 403 (permissions error)', async () => {
    server.use(
      rest.put('*/contents/STATUS.md', (req, res, ctx) => {
        return res(ctx.status(403), ctx.json({ message: 'Forbidden' }))
      })
    )
    
    const provider = new GitHubProvider(config)
    const result = await provider.save('# Updated', { message: 'Save' })
    
    expect(result.success).toBe(false)
    expect(result.error.code).toBe('GITHUB_SAVE_ERROR')
  })
  
  it('handles network timeout', async () => {
    server.use(
      rest.get('*/contents/STATUS.md', (req, res, ctx) => {
        return res(ctx.delay('infinite'))
      })
    )
    
    // Provider should have timeout
    const provider = new GitHubProvider({ ...config, timeout: 1000 })
    const result = await provider.load({})
    
    expect(result.success).toBe(false)
    expect(result.error.code).toBe('TIMEOUT')
  })
})
```

### Round-trip Conflict Tests

```typescript
describe('Round-trip conflict scenarios', () => {
  it('detects remote changes (hash mismatch)', () => {
    const localProject = parseStatusMarkdown('# V1\n## Lane\n- ✅ Card')
    const remoteProject = parseStatusMarkdown('# V2\n## Lane\n- ❗ Card')
    
    const conflicts = detectConflicts(localProject, remoteProject)
    
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0].type).toBe('STATUS_CHANGE')
  })
  
  it('merges non-conflicting changes', () => {
    const base = parseStatusMarkdown('# Base\n## Lane\n- ❗ Card A\n- ❗ Card B')
    const local = parseStatusMarkdown('# Base\n## Lane\n- ✅ Card A\n- ❗ Card B')
    const remote = parseStatusMarkdown('# Base\n## Lane\n- ❗ Card A\n- ✅ Card B')
    
    const merged = mergeChanges(base, local, remote)
    
    expect(merged.cards[0].status).toBe('done') // Local wins
    expect(merged.cards[1].status).toBe('done') // Remote applied
  })
})
```

---

## Performance Tests

### Large File Performance

```typescript
describe('Performance tests', () => {
  it('parses 500-card file in <100ms', () => {
    const largeFile = generateStatusMd({ cardCount: 500, swimlanes: 10 })
    
    const start = performance.now()
    const result = parseStatusMarkdown(largeFile)
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(100)
    expect(result.cards.length).toBe(500)
  })
  
  it('serializes 500-card project in <100ms', () => {
    const project = createLargeProject(500)
    
    const start = performance.now()
    const markdown = serializeProject(project)
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(100)
  })
  
  it('handles virtualized board scroll with 1000 cards', async () => {
    // This would be an E2E test
    const largeFile = generateStatusMd({ cardCount: 1000 })
    
    render(<App initialFile={largeFile} />)
    
    // Verify only visible cards are rendered (virtualization)
    const renderedCards = screen.getAllByTestId('card')
    expect(renderedCards.length).toBeLessThan(100) // Only viewport cards
    
    // Scroll and verify lazy loading
    fireEvent.scroll(screen.getByTestId('board'), { target: { scrollTop: 1000 } })
    
    await waitFor(() => {
      const newCards = screen.getAllByTestId('card')
      expect(newCards.length).toBeGreaterThan(0)
    })
  })
})
```

---

## Snapshot Testing

### Use Cases for Snapshots

1. **Markdown Output Stability:** Ensure serializer doesn't change format unexpectedly
2. **UI Component Structure:** Catch unintended UI changes
3. **Swimlane Detection:** Verify header parsing consistency

```typescript
describe('Snapshot tests', () => {
  it('matches markdown serialization snapshot', () => {
    const project = {
      metadata: { title: 'Test Project' },
      cards: [
        { id: 'card1', title: 'Task 1', status: 'todo', laneId: 'lane1' }
      ],
      swimlanes: [{ id: 'lane1', title: 'Lane 1', order: 0 }],
      notes: [],
      rawMarkdown: '# Test Project\n## Lane 1\n- ❗ Task 1'
    }
    
    const output = serializeProject(project)
    
    expect(output).toMatchSnapshot()
  })
  
  it('matches swimlane detection snapshot', () => {
    const markdown = `
# Project
## Feature Work
### Authentication
- ✅ Login
### API
- ❗ Endpoints
## Bug Fixes
- ⚠️ Fix crash
    `
    
    const result = parseStatusMarkdown(markdown)
    
    expect(result.swimlanes).toMatchSnapshot()
  })
  
  it('matches Card component snapshot', () => {
    const card = {
      id: 'card1',
      title: 'Implement feature',
      status: 'in_progress',
      blocked: true,
      description: 'This is a description',
      links: ['https://example.com']
    }
    
    const { container } = render(<Card card={card} />)
    
    expect(container).toMatchSnapshot()
  })
})
```

---

## Test Infrastructure

### Tooling Selection

**Primary Test Framework: Vitest**

**Rationale:**
- ✅ Vite-native (already using Vite)
- ✅ Fast execution (ES modules, no transpilation)
- ✅ Compatible with Vite config (aliases, etc.)
- ✅ Jest-compatible API (easy migration path)
- ✅ Built-in TypeScript support
- ✅ Watch mode optimized
- ✅ UI mode for debugging

**Alternative Considered: Jest**
- ❌ Slower (needs transpilation)
- ❌ Requires separate config
- ❌ Less Vite integration
- ✅ More mature ecosystem
- ✅ Better mocking APIs

**Verdict:** Vitest wins for Vite-based projects

### Supporting Libraries

1. **React Testing Library** - UI component testing
2. **MSW (Mock Service Worker)** - Network mocking
3. **@testing-library/user-event** - User interaction simulation
4. **happy-dom** - Lightweight DOM environment (faster than jsdom)
5. **Playwright** - E2E tests (optional, for critical paths)

---

## Coverage Targets

### Overall Coverage: 90%+

| Layer                 | Target | Rationale                                  |
|-----------------------|--------|--------------------------------------------|
| Core Domain           | 95%+   | Business-critical, pure logic              |
| Parsers               | 95%+   | Round-trip fidelity is critical            |
| Services              | 95%+   | Business rules must be tested              |
| Utilities             | 90%+   | Pure functions, edge cases important       |
| Adapters (Providers)  | 90%+   | I/O boundary, error handling critical      |
| Application (State)   | 90%+   | State management is central                |
| Application (Hooks)   | 85%+   | Bridge layer, some UI-specific logic       |
| UI Components         | 85%+   | Presentation logic, snapshot tests         |
| E2E Workflows         | N/A    | Coverage measured by user journey coverage |

### Exclusions

- Third-party library code (shadcn/ui components)
- Configuration files (Vite, Tailwind)
- Demo/fixture data
- Type-only files

---

## Test Organization

```
markdeck/
├── tests/
│   ├── unit/                          # Fast, isolated unit tests
│   │   ├── core/
│   │   │   ├── domain/
│   │   │   │   └── validation.test.ts
│   │   │   ├── parsers/
│   │   │   │   ├── markdown-parser.test.ts
│   │   │   │   ├── card-parser.test.ts
│   │   │   │   ├── swimlane-parser.test.ts
│   │   │   │   ├── notes-parser.test.ts
│   │   │   │   ├── markdown-serializer.test.ts
│   │   │   │   └── round-trip.test.ts    # Critical
│   │   │   ├── services/
│   │   │   │   ├── card-service.test.ts
│   │   │   │   ├── swimlane-service.test.ts
│   │   │   │   └── sync-service.test.ts
│   │   │   └── utils/
│   │   │       ├── id-generator.test.ts
│   │   │       ├── emoji-mapper.test.ts
│   │   │       └── date-formatter.test.ts
│   │   │
│   │   └── adapters/
│   │       └── providers/
│   │           ├── file-provider.test.ts
│   │           ├── github-provider.test.ts
│   │           └── static-provider.test.ts
│   │
│   ├── integration/                   # Multi-module integration tests
│   │   ├── provider-system.test.ts
│   │   ├── state-management.test.ts
│   │   ├── board-interactions.test.tsx
│   │   ├── github-sync.test.tsx
│   │   ├── file-operations.test.tsx
│   │   └── use-cases.test.ts
│   │
│   ├── e2e/                           # End-to-end user workflows
│   │   ├── local-mode.spec.ts
│   │   ├── github-mode.spec.ts
│   │   ├── ui-interactions.spec.ts
│   │   └── performance.spec.ts
│   │
│   ├── fixtures/                      # Test data
│   │   ├── valid-status.md           # Standard valid file
│   │   ├── complex-status.md         # Edge cases
│   │   ├── invalid-status.md         # Malformed examples
│   │   ├── large-status.md           # Performance testing
│   │   └── mock-responses.ts         # GitHub API mocks
│   │
│   ├── helpers/                       # Test utilities
│   │   ├── test-providers.ts         # Mock provider implementations
│   │   ├── render-utils.tsx          # Custom render with providers
│   │   ├── assertions.ts             # Custom matchers
│   │   ├── factories.ts              # Test data factories
│   │   └── msw-handlers.ts           # MSW request handlers
│   │
│   └── setup.ts                       # Global test setup
│
├── vitest.config.ts                   # Vitest configuration
└── playwright.config.ts               # Playwright E2E config (optional)
```

---

## Quality Gates

### Pre-commit Checks

```bash
# Run before every commit
npm run lint           # ESLint
npm run type-check     # TypeScript
npm run test:unit      # Fast unit tests only
```

### Pre-push Checks

```bash
# Run before push
npm run test           # Full test suite
npm run build          # Verify build succeeds
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Unit tests
        run: npm run test:unit -- --coverage
      
      - name: Integration tests
        run: npm run test:integration
      
      - name: E2E tests
        run: npm run test:e2e
      
      - name: Build
        run: npm run build
      
      - name: Upload coverage to SonarCloud
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### SonarCloud Quality Gates

- **Code Coverage:** ≥90%
- **Duplicated Lines:** <3%
- **Maintainability Rating:** A
- **Reliability Rating:** A
- **Security Rating:** A
- **Technical Debt Ratio:** ≤5%

---

## Test Best Practices

### GIVEN-WHEN-THEN Structure

```typescript
describe('CardService', () => {
  describe('moveCard', () => {
    it('moves card from TODO to DONE', () => {
      // GIVEN: A card in TODO status
      const card: Card = {
        id: 'card1',
        title: 'Implement feature',
        status: 'todo',
        laneId: 'lane1',
        blocked: false,
        description: '',
        links: [],
        originalLine: 5
      }
      
      // WHEN: Moving card to DONE
      const updated = CardService.moveCard(card, 'done')
      
      // THEN: Card status is updated
      expect(updated.status).toBe('done')
      expect(updated.id).toBe(card.id) // ID unchanged
      expect(updated).not.toBe(card)   // Immutability
    })
  })
})
```

### Test Naming Convention

```
[Unit/Function/Method] should [expected behavior] when [condition]

✅ Good:
- "parseStatusMarkdown should extract cards when valid markdown provided"
- "GitHubProvider should return error when GitHub API returns 404"
- "useCards should update state when moveCard is called"

❌ Bad:
- "test1"
- "it works"
- "card parsing"
```

### Arrange-Act-Assert Pattern

1. **Arrange:** Set up test data and preconditions
2. **Act:** Execute the code under test
3. **Assert:** Verify the outcome

### Isolation & Independence

- Each test runs independently
- No shared mutable state between tests
- Use `beforeEach` for setup, `afterEach` for cleanup
- No test should depend on another test's execution

### Determinism

- No reliance on current date/time (use fixed dates)
- No random data (use seeded generators)
- No external network calls (mock everything)
- No file system dependencies (use in-memory fixtures)

---

## Continuous Improvement

### Test Metrics to Track

1. **Code Coverage:** Track trends, aim for 90%+
2. **Test Execution Time:** Keep <5s for unit, <30s full suite
3. **Flaky Test Rate:** Aim for 0% (no flaky tests)
4. **Test Maintenance Cost:** Time spent fixing tests vs. fixing bugs
5. **Bug Escape Rate:** Bugs found in production that tests missed

### Quarterly Review

- Review test coverage gaps
- Identify flaky tests and fix or remove
- Update fixtures to match real-world data
- Add regression tests for production bugs
- Refactor slow tests
- Update documentation

---

## Next Steps

1. **Implement Test Infrastructure** → See `tests/test-infra-setup.md`
2. **Define Coverage Plan** → See `tests/coverage-plan.md`
3. **Write Core Tests First** → Start with parsers and round-trip
4. **Add Provider Tests** → Mock GitHub API with MSW
5. **Add UI Integration Tests** → React Testing Library
6. **Add E2E Tests** → Critical user workflows only
7. **Set Up CI/CD** → Automated testing on every commit
8. **Integrate SonarCloud** → Continuous quality monitoring

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Trophy Philosophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Given-When-Then Style](https://martinfowler.com/bliki/GivenWhenThen.html)

---

**Approved by:** QE Lead  
**Date:** 2025-11-20  
**Version:** 1.0
