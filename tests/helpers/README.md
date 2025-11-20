# Test Helpers

Reusable utilities, factories, and custom matchers for tests.

## Files

### `test-providers.ts`

Mock implementations of StatusProvider for testing.

**Exports:**
- `MockFileProvider` - In-memory file provider
- `MockGitHubProvider` - Fake GitHub provider (no network)
- `MockFailingProvider` - Always returns errors

**Usage:**
```typescript
import { MockGitHubProvider } from '@/tests/helpers/test-providers'

const provider = new MockGitHubProvider({
  data: '# Test Project\n## Lane\n- ✅ Card'
})

const result = await provider.load({})
expect(result.success).toBe(true)
```

---

### `render-utils.tsx`

Custom render function with providers pre-configured.

**Exports:**
- `render()` - Custom render with QueryClient, etc.
- All exports from `@testing-library/react`

**Usage:**
```typescript
import { render, screen } from '@/tests/helpers/render-utils'

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

**Why?**
- Automatically wraps components with providers
- Consistent setup across all tests
- Easier to maintain

---

### `assertions.ts`

Custom Vitest matchers for domain-specific assertions.

**Exports:**
- `toBeInStatus(status)` - Check card status
- `toHaveCardCount(count)` - Check project card count
- `toBeBlocked()` - Check card blocked flag

**Usage:**
```typescript
import '@/tests/helpers/assertions'

const card = createCard({ status: 'done' })
expect(card).toBeInStatus('done')

const project = createProject({ cards: [card1, card2] })
expect(project).toHaveCardCount(2)
```

---

### `factories.ts`

Test data factories for creating domain objects.

**Exports:**
- `createCard(overrides?)` - Create Card
- `createSwimlane(overrides?)` - Create Swimlane
- `createProject(overrides?)` - Create Project
- `createMetadata(overrides?)` - Create ProjectMetadata
- `createLargeProject(cardCount)` - Generate large dataset

**Usage:**
```typescript
import { createCard, createProject } from '@/tests/helpers/factories'

// Create with defaults
const card = createCard()

// Override specific fields
const doneCard = createCard({ status: 'done' })

// Create complex structures
const project = createProject({
  cards: [
    createCard({ status: 'todo' }),
    createCard({ status: 'done' })
  ]
})

// Generate large datasets
const largeProject = createLargeProject(500)
```

**Why?**
- Consistent test data
- Less boilerplate in tests
- Easy to create variations
- Readable tests

---

### `msw-handlers.ts`

MSW (Mock Service Worker) request handlers for GitHub API.

**Exports:**
- `handlers` - Array of default handlers
- `createSuccessHandler()` - GitHub success response
- `createErrorHandler()` - GitHub error response

**Usage:**
```typescript
import { server } from './msw-server'
import { createErrorHandler } from './msw-handlers'

test('handles 404', async () => {
  // Override default handler
  server.use(createErrorHandler(404, 'Not Found'))
  
  const result = await provider.load({})
  expect(result.success).toBe(false)
})
```

---

### `msw-server.ts`

MSW server setup for Node environment.

**Exports:**
- `server` - Configured MSW server

**Usage:**
- Automatically started in `tests/setup.ts`
- Reset after each test
- Closed after all tests

**Manual usage (if needed):**
```typescript
import { server } from '@/tests/helpers/msw-server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## Adding New Helpers

### When to Add a Helper

1. **Code used in 3+ tests** → Extract to helper
2. **Complex setup** → Create factory or utility
3. **Domain-specific assertions** → Add custom matcher
4. **Recurring patterns** → Encapsulate in function

### How to Add a Helper

1. Create or update file in `helpers/`
2. Export the helper
3. Document in this README
4. Use in tests

**Example:**

```typescript
// helpers/test-utils.ts
export function waitForProjectLoad(timeout = 1000) {
  return waitFor(() => {
    expect(screen.getByTestId('board')).toBeInTheDocument()
  }, { timeout })
}

// Usage in test
import { waitForProjectLoad } from '@/tests/helpers/test-utils'

test('loads project', async () => {
  render(<App />)
  uploadFile('status.md')
  
  await waitForProjectLoad()
  expect(screen.getByText('Project Title')).toBeInTheDocument()
})
```

---

## Best Practices

1. **Keep helpers simple**
   - One responsibility per helper
   - Easy to understand
   - Well-documented

2. **Make helpers composable**
   - Small functions that can combine
   - Not monolithic setup functions

3. **Use TypeScript**
   - Type-safe helpers
   - Better IDE support

4. **Export only what's needed**
   - Clear public API
   - Hide internal details

5. **Test helpers (optional)**
   - Complex helpers can have their own tests
   - Most helpers are simple enough to not need tests

---

**Location:** `/tests/helpers/`
