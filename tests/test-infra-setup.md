# MarkDeck v0.2 Test Infrastructure Setup

**Author:** QE Lead  
**Date:** 2025-11-20  
**Status:** Implementation Guide  
**Version:** 0.2.0

---

## Overview

This document provides **step-by-step instructions** for setting up the complete testing infrastructure for MarkDeck v0.2, including tools, configuration, and best practices.

---

## Tooling Stack

### Core Testing Framework

**Vitest** - Modern, Vite-native test runner

**Why Vitest?**
- ✅ Native Vite integration (same config, plugins, aliases)
- ✅ Lightning-fast execution (ES modules, no transpilation)
- ✅ Jest-compatible API (easy migration if needed)
- ✅ Built-in TypeScript support
- ✅ Watch mode with HMR
- ✅ UI mode for debugging
- ✅ Native coverage reporting (v8/istanbul)

**Alternatives Considered:**
- Jest: Slower, requires separate config, less Vite integration
- Mocha/Chai: Older ecosystem, less integrated

---

### Supporting Libraries

| Library                      | Purpose                          | Why?                                    |
|------------------------------|----------------------------------|-----------------------------------------|
| `@testing-library/react`     | React component testing          | Best practice for React, user-centric   |
| `@testing-library/user-event`| User interaction simulation      | Realistic user events                   |
| `@testing-library/jest-dom`  | Custom DOM matchers              | Readable assertions                     |
| `msw` (Mock Service Worker)  | API mocking                      | Industry standard for network mocking   |
| `happy-dom`                  | Lightweight DOM environment      | Faster than jsdom                       |
| `vitest-ui` (optional)       | Visual test runner               | Great for debugging                     |
| `@vitest/coverage-v8`        | Code coverage                    | Built-in, fast                          |

---

## Installation

### Step 1: Install Dependencies

```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8 \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  happy-dom msw
```

**Estimated time:** 2-3 minutes

---

### Step 2: Create Vitest Configuration

Create `vitest.config.ts` in the project root:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'src/ui/primitives/', // shadcn/ui components
        'src/main.tsx',       // Entry point
      ],
      thresholds: {
        global: {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
        'src/core/': {
          lines: 95,
          functions: 95,
          branches: 90,
          statements: 95,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Key Configuration Points:**

- **globals: true** - Allows using `describe`, `it`, `expect` without imports
- **environment: 'happy-dom'** - Faster than jsdom for most use cases
- **setupFiles** - Runs before each test file (for global setup)
- **coverage.thresholds** - Enforces minimum coverage requirements

---

### Step 3: Create Test Setup File

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { server } from './helpers/msw-server'

// Extend Vitest matchers with jest-dom
// This gives us matchers like toBeInTheDocument(), toHaveClass(), etc.

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
  cleanup() // Clean up React Testing Library
})

// Clean up after all tests
afterAll(() => server.close())

// Mock window.matchMedia (for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver (for lazy loading)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}
```

---

### Step 4: Configure MSW (Mock Service Worker)

Create `tests/helpers/msw-server.ts`:

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './msw-handlers'

export const server = setupServer(...handlers)
```

Create `tests/helpers/msw-handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  // GitHub API mocks
  http.get('https://api.github.com/repos/:owner/:repo/contents/:path', ({ params }) => {
    const { owner, repo, path } = params
    
    // Default mock response
    return HttpResponse.json({
      content: btoa('# Test Project\n## Test Lane\n- ✅ Test Card'),
      sha: 'abc123def456',
      name: path,
      path: path,
      type: 'file',
    })
  }),

  http.put('https://api.github.com/repos/:owner/:repo/contents/:path', async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      content: {
        sha: 'new-sha-' + Date.now(),
      },
      commit: {
        message: body.message || 'Update via MarkDeck',
      },
    })
  }),

  http.get('https://api.github.com/user/repos', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'test-repo',
        full_name: 'test-owner/test-repo',
        owner: {
          login: 'test-owner',
        },
      },
    ])
  }),
]
```

---

### Step 5: Add Test Scripts to package.json

Update `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "vitest run tests/e2e",
    "test:watch": "vitest watch"
  }
}
```

**Script Descriptions:**

- `test` - Run tests in watch mode (for development)
- `test:ui` - Open Vitest UI for visual debugging
- `test:run` - Run all tests once (for CI)
- `test:coverage` - Run tests with coverage report
- `test:unit` - Run only unit tests
- `test:integration` - Run only integration tests
- `test:e2e` - Run only E2E tests
- `test:watch` - Explicitly run in watch mode

---

## Test Helper Utilities

### Custom Render Utility

Create `tests/helpers/render-utils.tsx`:

```typescript
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

**Usage:**

```typescript
import { render, screen } from '@/tests/helpers/render-utils'

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

---

### Test Data Factories

Create `tests/helpers/factories.ts`:

```typescript
import type { Card, Swimlane, Project, ProjectMetadata } from '@/core/domain/types'

let cardIdCounter = 0

export const createCard = (overrides?: Partial<Card>): Card => ({
  id: `card-${++cardIdCounter}`,
  title: 'Test Card',
  status: 'todo',
  laneId: 'lane-1',
  blocked: false,
  description: '',
  links: [],
  originalLine: 10,
  ...overrides,
})

export const createSwimlane = (overrides?: Partial<Swimlane>): Swimlane => ({
  id: 'lane-1',
  title: 'Test Lane',
  order: 0,
  ...overrides,
})

export const createProject = (overrides?: Partial<Project>): Project => ({
  metadata: createMetadata(),
  cards: [createCard()],
  swimlanes: [createSwimlane()],
  notes: [],
  rawMarkdown: '# Test Project\n## Test Lane\n- ❗ Test Card',
  ...overrides,
})

export const createMetadata = (overrides?: Partial<ProjectMetadata>): ProjectMetadata => ({
  title: 'Test Project',
  version: 'v1.0',
  lastUpdated: '2025-11-20',
  ...overrides,
})

// Helper to generate large datasets for performance testing
export const createLargeProject = (cardCount: number): Project => {
  const cards: Card[] = []
  const swimlanes: Swimlane[] = []
  
  const lanesCount = Math.ceil(cardCount / 50)
  
  for (let i = 0; i < lanesCount; i++) {
    swimlanes.push(createSwimlane({ id: `lane-${i}`, title: `Lane ${i}`, order: i }))
  }
  
  for (let i = 0; i < cardCount; i++) {
    const laneIndex = i % lanesCount
    cards.push(createCard({
      id: `card-${i}`,
      title: `Card ${i}`,
      laneId: `lane-${laneIndex}`,
      status: i % 3 === 0 ? 'done' : i % 3 === 1 ? 'in_progress' : 'todo',
    }))
  }
  
  return createProject({ cards, swimlanes })
}
```

**Usage:**

```typescript
import { createCard, createProject } from '@/tests/helpers/factories'

test('moves card', () => {
  const card = createCard({ status: 'todo' })
  const updated = CardService.moveCard(card, 'done')
  
  expect(updated.status).toBe('done')
})
```

---

### Custom Assertions

Create `tests/helpers/assertions.ts`:

```typescript
import { expect } from 'vitest'

// Custom matcher for checking if card is in specific status
expect.extend({
  toBeInStatus(received: Card, expectedStatus: CardStatus) {
    const pass = received.status === expectedStatus
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected card not to be in status ${expectedStatus}`
          : `Expected card to be in status ${expectedStatus}, but was ${received.status}`,
    }
  },
  
  toHaveCardCount(received: Project, expectedCount: number) {
    const pass = received.cards.length === expectedCount
    
    return {
      pass,
      message: () =>
        pass
          ? `Expected project not to have ${expectedCount} cards`
          : `Expected project to have ${expectedCount} cards, but had ${received.cards.length}`,
    }
  },
})

// Extend TypeScript types
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInStatus(status: CardStatus): T
    toHaveCardCount(count: number): T
  }
}
```

**Usage:**

```typescript
import '@/tests/helpers/assertions'

test('card is in done status', () => {
  const card = createCard({ status: 'done' })
  expect(card).toBeInStatus('done')
})
```

---

## Test Fixtures

### Create Fixture Files

Create `tests/fixtures/valid-status.md`:

```markdown
# Example Project

**Last Updated:** 2025-11-20  
**Version:** Alpha 3

## Feature Work

### Authentication
- ✅ Implement login page
    Basic email/password form with validation
    [PR #123](https://github.com/example/repo/pull/123)

- ⚠️ Add OAuth providers
    Support Google, GitHub login
    
- ❗ Implement 2FA
    TOTP-based two-factor authentication

### API Development
- ❌ Design REST API
    OpenAPI specification
    
- ❗ Implement endpoints
    CRUD for all resources

## Bug Fixes

- ⚠️ ❌ Fix memory leak in card rendering
    Investigate React re-render cycles
    **BLOCKED:** Waiting for React 19

## Notes

This is a note section that should be preserved exactly.

<!-- This is a comment -->
```

Create `tests/fixtures/invalid-status.md`:

```markdown
No H1 title

## Lane without cards

Random text

- Bullet without emoji
- 🔥 Unknown emoji
```

Create `tests/fixtures/complex-status.md`:

```markdown
# Complex Project

Custom section before lanes

## Lane 1
- ✅ Card 1
- ❗ Card 2
    Multi-line
    description

<!-- Comment to preserve -->

## Lane 2
### Nested Lane
- ⚠️ Card 3

Random notes here

## Lane 3

Another note
```

---

## Test Organization Best Practices

### File Naming Convention

```
[module-name].test.ts   - For TypeScript/pure logic
[module-name].test.tsx  - For React components
[feature].spec.ts       - For E2E tests (Playwright convention)
```

### Test Structure Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('ModuleName', () => {
  describe('functionName', () => {
    // Setup
    let testData: SomeType
    
    beforeEach(() => {
      testData = createTestData()
    })
    
    afterEach(() => {
      // Cleanup if needed
    })
    
    it('should do something when condition is met', () => {
      // GIVEN: Setup preconditions
      const input = { ... }
      
      // WHEN: Execute the code under test
      const result = functionName(input)
      
      // THEN: Assert the outcome
      expect(result).toBe(expected)
    })
    
    it('should handle error when invalid input provided', () => {
      // Test error cases
      expect(() => functionName(null)).toThrow()
    })
  })
})
```

---

## Running Tests

### Local Development

```bash
# Watch mode (auto-runs on file changes)
npm test

# Run all tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Open UI mode
npm run test:ui
```

### Debugging Tests

#### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test:run"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

#### Using Vitest UI

```bash
npm run test:ui
```

This opens a browser-based UI where you can:
- Run individual tests
- See test output
- View coverage
- Debug with breakpoints (in browser DevTools)

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npx tsc --noEmit
      
      - name: Run unit tests
        run: npm run test:unit -- --run
      
      - name: Run integration tests
        run: npm run test:integration -- --run
      
      - name: Run E2E tests
        run: npm run test:e2e -- --run
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: true
      
      - name: Upload coverage to SonarCloud
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

## SonarCloud Integration

### Configuration File

Create `sonar-project.properties`:

```properties
sonar.projectKey=mitchins_markdeck
sonar.organization=mitchins

sonar.sources=src
sonar.tests=tests
sonar.test.inclusions=tests/**/*.test.ts,tests/**/*.test.tsx

sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.testExecutionReportPaths=test-results/sonar-report.xml

sonar.coverage.exclusions=\
  src/ui/primitives/**,\
  src/**/*.d.ts,\
  src/**/*.config.*,\
  src/main.tsx

sonar.qualitygate.wait=true
```

### Quality Gate Configuration

Set up in SonarCloud UI:
- Coverage on New Code: ≥90%
- Duplicated Lines on New Code: ≤3%
- Maintainability Rating: A
- Reliability Rating: A
- Security Rating: A

---

## Performance Testing

### Benchmarking Tests

Create `tests/performance/benchmarks.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseStatusMarkdown } from '@/core/parsers/markdown-parser'
import { serializeProject } from '@/core/parsers/markdown-serializer'
import { createLargeProject } from '@/tests/helpers/factories'

describe('Performance benchmarks', () => {
  it('should parse 500-card file in under 100ms', () => {
    const largeMarkdown = generateLargeMarkdown(500)
    
    const start = performance.now()
    const result = parseStatusMarkdown(largeMarkdown)
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(100)
    expect(result.cards.length).toBe(500)
  })
  
  it('should serialize 500-card project in under 100ms', () => {
    const largeProject = createLargeProject(500)
    
    const start = performance.now()
    const markdown = serializeProject(largeProject)
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(100)
  })
})
```

---

## Snapshot Testing

### Configuration

Vitest has built-in snapshot support.

**Usage:**

```typescript
import { describe, it, expect } from 'vitest'
import { parseStatusMarkdown } from '@/core/parsers/markdown-parser'

describe('Snapshot tests', () => {
  it('should match markdown serialization snapshot', () => {
    const project = createProject()
    const output = serializeProject(project)
    
    expect(output).toMatchSnapshot()
  })
})
```

**Updating Snapshots:**

```bash
# Update all snapshots
npm run test -- -u

# Update specific test file
npm run test markdown-serializer.test.ts -- -u
```

**Best Practices:**
- Use snapshots for output stability (markdown format)
- Review snapshot diffs carefully in PRs
- Don't use for testing logic (use explicit assertions)
- Keep snapshots small and focused

---

## Code Coverage Analysis

### Viewing Coverage Reports

After running `npm run test:coverage`:

1. **Terminal Output:** Shows summary
2. **HTML Report:** Open `coverage/index.html` in browser
3. **LCOV Report:** `coverage/lcov.info` (for CI tools)

### Interpreting Coverage

**Line Coverage:** % of lines executed  
**Branch Coverage:** % of if/else branches taken  
**Function Coverage:** % of functions called  
**Statement Coverage:** % of statements executed

**Target:** All metrics ≥90% for core, ≥85% for UI

---

## Troubleshooting

### Common Issues

#### 1. Tests timeout

```typescript
// Increase timeout for slow tests
it('slow test', async () => {
  // ... 
}, { timeout: 10000 }) // 10 seconds
```

#### 2. MSW handlers not working

Check that server is started in `tests/setup.ts`:

```typescript
beforeAll(() => server.listen())
```

#### 3. TypeScript errors in tests

Ensure `vitest/globals` is in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

#### 4. Module path aliases not working

Verify `vitest.config.ts` has correct aliases:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

---

## Next Steps

1. ✅ **Install dependencies** (Step 1)
2. ✅ **Configure Vitest** (Step 2)
3. ✅ **Set up test helpers** (Step 4-6)
4. ✅ **Create fixtures** (Step 7)
5. [ ] **Write first test** (Start with parsers)
6. [ ] **Set up CI/CD** (GitHub Actions)
7. [ ] **Integrate SonarCloud**
8. [ ] **Achieve coverage targets**

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/docs/)
- [Jest-DOM Matchers](https://github.com/testing-library/jest-dom)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Status:** Ready for implementation  
**Approved by:** QE Lead  
**Date:** 2025-11-20
