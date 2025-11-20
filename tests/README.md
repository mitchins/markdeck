# MarkDeck v0.2 Tests

This directory contains the comprehensive test suite for MarkDeck v0.2.

## Directory Structure

```
tests/
├── unit/              # Fast, isolated unit tests (80% of tests)
├── integration/       # Multi-module integration tests (15% of tests)
├── e2e/               # End-to-end user workflow tests (5% of tests)
├── fixtures/          # Test data and mock STATUS.md files
├── helpers/           # Test utilities, factories, and custom matchers
├── setup.ts           # Global test setup (runs before all tests)
├── coverage-plan.md   # Detailed coverage targets by module
└── test-infra-setup.md # Setup instructions for testing infrastructure
```

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests in watch mode (development)
npm test

# Run all tests once (CI)
npm run test:run

# Run with coverage report
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Open visual test UI
npm run test:ui
```

## ⚠️ Current Status

**Test scaffolding is complete, but test implementations are pending.**

All test files currently contain placeholder tests (`expect(true).toBe(true)`) that pass by default. These need to be implemented with actual test logic during the refactoring phases (Phase 1-5).

### What's Ready

✅ Vitest configuration (`vitest.config.ts`)  
✅ Test setup file (`tests/vitest.setup.ts`)  
✅ MSW handlers for GitHub API (`tests/helpers/msw-handlers.ts`)  
✅ Test factories (`tests/helpers/factories.ts`)  
✅ Test fixtures (valid, invalid, complex STATUS.md)  
✅ Empty test files organized by layer  
✅ Snapshot infrastructure (`tests/__snapshots__/`)  
✅ GitHub Actions CI workflow (`.github/workflows/test.yml`)  

### What's Pending

❌ Actual test implementations (all marked with `// TODO: Implement test`)  
❌ React Testing Library render utilities  
❌ Custom test matchers  
❌ Performance benchmarking harness  

## Test Levels

### Unit Tests (`unit/`)

**Purpose:** Test individual functions and modules in isolation

**Characteristics:**
- No external dependencies
- Fast execution (<1ms per test)
- Pure functions only
- No React rendering
- No network calls

**Coverage Target:** 95%+ for core domain

**Example:**
```typescript
// tests/unit/core/parsers/card-parser.test.ts
describe('parseCard', () => {
  it('parses card with status emoji', () => {
    const line = '- ✅ Completed task'
    const card = parseCard(line, 'lane1', 5)
    
    expect(card.status).toBe('done')
    expect(card.title).toBe('Completed task')
  })
})
```

### Integration Tests (`integration/`)

**Purpose:** Test interactions between multiple modules

**Characteristics:**
- Tests multiple layers together
- Mocked external dependencies (GitHub API via MSW)
- React component testing
- State management testing
- Moderate execution time (10-100ms)

**Coverage Target:** 90%+

**Example:**
```typescript
// tests/integration/board-interactions.test.tsx
describe('Board integration', () => {
  it('displays cards in correct columns', () => {
    const { getByText } = render(<Board {...props} />)
    
    expect(getByText('Todo task')).toBeInTheDocument()
  })
})
```

### E2E Tests (`e2e/`)

**Purpose:** Test complete user workflows end-to-end

**Characteristics:**
- Full application integration
- Real browser interactions
- Network mocked with MSW
- Slow execution (1-10s)
- Critical paths only

**Coverage Target:** Critical user journeys

**Example:**
```typescript
// tests/e2e/local-mode.spec.ts
test('upload → edit → download workflow', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.setInputFiles('input[type="file"]', './fixtures/status.md')
  
  // Verify board loaded
  await expect(page.locator('h1')).toContainText('Example Project')
  
  // Edit a card
  await page.click('[data-testid="card-1"]')
  await page.fill('[data-testid="description"]', 'New description')
  await page.click('[data-testid="save"]')
  
  // Download
  await page.click('[data-testid="download"]')
})
```

## Fixtures (`fixtures/`)

Contains test data files:

- `valid-status.md` - Standard valid STATUS.md for testing
- `complex-status.md` - Edge cases (nested lanes, comments, notes)
- `invalid-status.md` - Malformed markdown for error handling tests
- `large-status.md` - Performance testing (500+ cards)
- `mock-responses.ts` - GitHub API mock responses

## Helpers (`helpers/`)

Test utilities:

- `test-providers.ts` - Mock provider implementations
- `render-utils.tsx` - Custom render with providers
- `assertions.ts` - Custom matchers (e.g., `toBeInStatus()`)
- `factories.ts` - Test data factories
- `msw-handlers.ts` - MSW request handlers for GitHub API
- `msw-server.ts` - MSW server setup

## Coverage Targets

| Layer                 | Target | Min Acceptable |
|-----------------------|--------|----------------|
| Core Domain           | 95%    | 90%            |
| Adapters (Providers)  | 90%    | 85%            |
| Application (State)   | 90%    | 85%            |
| UI Components         | 85%    | 75%            |
| **Overall Project**   | 90%    | 85%            |

## Running Specific Tests

```bash
# Run tests for a specific file
npm test markdown-parser.test.ts

# Run tests matching a pattern
npm test -- --grep "round-trip"

# Run tests in a specific directory
npm run test:unit -- parsers/

# Watch a specific file
npm test -- --watch card-parser.test.ts
```

## Debugging Tests

### VS Code

1. Set breakpoints in test or source files
2. Run "Debug Vitest Tests" from Run menu
3. Tests will pause at breakpoints

### Vitest UI

```bash
npm run test:ui
```

Opens browser UI with:
- Test list and status
- Console output
- Coverage visualization
- Re-run on file changes

### Console Debugging

```typescript
it('debug test', () => {
  console.log('Debug:', someValue)
  // or
  debugger // Pauses if running in debug mode
})
```

## Writing Tests

### Best Practices

1. **GIVEN-WHEN-THEN Structure**
   ```typescript
   it('should do X when Y', () => {
     // GIVEN: Setup preconditions
     const input = createTestData()
     
     // WHEN: Execute code under test
     const result = functionUnderTest(input)
     
     // THEN: Assert outcome
     expect(result).toBe(expected)
   })
   ```

2. **One Assertion Per Test** (when practical)
   - Makes failures easier to diagnose
   - Clearer test intent

3. **Descriptive Test Names**
   - ✅ "should move card to done when drag-dropped to done column"
   - ❌ "test1", "it works"

4. **Use Factories for Test Data**
   ```typescript
   import { createCard } from '@/tests/helpers/factories'
   
   const card = createCard({ status: 'todo' })
   ```

5. **Avoid Test Interdependencies**
   - Each test should run independently
   - Use `beforeEach` for setup, not shared state

6. **Mock External Dependencies**
   - Use MSW for network requests
   - Mock file system operations
   - Don't hit real APIs in tests

## Coverage Reports

### Generating Reports

```bash
npm run test:coverage
```

### Viewing Reports

- **Terminal:** Summary printed to console
- **HTML:** Open `coverage/index.html` in browser
- **CI:** Uploaded to SonarCloud/Codecov

### Interpreting Coverage

- **Green (>90%):** Good coverage
- **Yellow (80-90%):** Needs improvement
- **Red (<80%):** Critical, add tests

**Focus on:**
- Uncovered lines (red in HTML report)
- Uncovered branches (yellow highlights)
- Functions never called

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request

**Quality Gates:**
- All tests must pass
- Coverage must not decrease
- SonarCloud quality gate must pass

## Troubleshooting

### Tests timing out

Increase timeout:
```typescript
it('slow test', async () => {
  // ...
}, { timeout: 10000 }) // 10 seconds
```

### Mock not working

Ensure MSW server is started in `setup.ts`:
```typescript
beforeAll(() => server.listen())
```

### Import errors

Check path aliases in `vitest.config.ts`:
```typescript
alias: {
  '@': path.resolve(__dirname, './src'),
}
```

### Type errors

Add types to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

## Contributing Tests

When adding new code:

1. Write tests **before** or **alongside** implementation
2. Aim for coverage target (95% for core, 85% for UI)
3. Include both happy path and error cases
4. Add edge case tests
5. Update fixtures if needed
6. Ensure tests pass locally before pushing

## Resources

- [Testing Strategy](../testing-strategy.md) - Overall testing philosophy
- [Coverage Plan](./coverage-plan.md) - Detailed coverage targets
- [Test Infra Setup](./test-infra-setup.md) - Setup instructions
- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**Questions?** See test-infra-setup.md or ask the QE Lead.
