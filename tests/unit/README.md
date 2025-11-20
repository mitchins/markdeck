# Unit Tests

Pure, fast, isolated tests for individual functions and modules.

## Characteristics

- ✅ No external dependencies
- ✅ No network calls
- ✅ No file system access
- ✅ No React rendering (for non-UI code)
- ✅ Fast execution (<1ms per test)
- ✅ 100% deterministic

## Coverage Target

**95%+** for core domain modules

## Directory Structure

```
unit/
├── core/
│   ├── domain/
│   │   └── validation.test.ts        # Zod schema validation tests
│   ├── parsers/
│   │   ├── markdown-parser.test.ts   # Main parser orchestration
│   │   ├── card-parser.test.ts       # Card parsing logic
│   │   ├── swimlane-parser.test.ts   # Swimlane detection
│   │   ├── notes-parser.test.ts      # Notes extraction
│   │   ├── markdown-serializer.test.ts # Project → markdown
│   │   └── round-trip.test.ts        # ⭐ Critical: round-trip fidelity
│   ├── services/
│   │   ├── card-service.test.ts      # Card CRUD operations
│   │   ├── swimlane-service.test.ts  # Swimlane management
│   │   └── sync-service.test.ts      # Conflict detection/resolution
│   └── utils/
│       ├── id-generator.test.ts      # ID generation and collision handling
│       ├── emoji-mapper.test.ts      # Emoji ↔ status mapping
│       └── date-formatter.test.ts    # Date utilities
│
└── adapters/
    └── providers/
        ├── file-provider.test.ts     # File upload/download
        ├── static-provider.test.ts   # Demo data provider
        └── ...                       # (GitHub provider is integration test)
```

## What to Test

### Core Domain

**Focus:** Business logic, pure functions, data transformations

**Examples:**
- Parsing markdown to domain models
- Validating data with Zod schemas
- Transforming domain models back to markdown
- ID generation and collision handling
- Emoji mapping

### Adapters (Unit Tests Only)

**Focus:** Simple providers without network calls

**Examples:**
- FileProvider (no actual file I/O, mocked)
- StaticProvider (returns hardcoded data)

**Note:** GitHubProvider is an integration test (requires MSW)

## Example Test

```typescript
import { describe, it, expect } from 'vitest'
import { parseCard } from '@/core/parsers/card-parser'

describe('parseCard', () => {
  it('should parse card with status emoji', () => {
    // GIVEN: A markdown line with a status emoji
    const line = '- ✅ Completed task'
    const laneId = 'lane-1'
    const lineNumber = 5
    
    // WHEN: Parsing the card
    const card = parseCard(line, laneId, lineNumber)
    
    // THEN: Card has correct properties
    expect(card).toEqual({
      id: expect.any(String),
      title: 'Completed task',
      status: 'done',
      laneId: 'lane-1',
      blocked: false,
      description: '',
      links: [],
      originalLine: 5,
    })
  })
  
  it('should parse blocked card', () => {
    const line = '- ⚠️ ❌ Blocked task'
    const card = parseCard(line, 'lane-1', 10)
    
    expect(card.blocked).toBe(true)
    expect(card.status).toBe('todo') // ❌ is todo status
  })
})
```

## Running Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific file
npm test card-parser.test.ts

# Watch mode
npm test -- --watch unit/

# Coverage
npm run test:coverage -- unit/
```

## Best Practices

1. **Pure Functions Only**
   - No side effects
   - Same input → same output
   - No global state

2. **Fast Execution**
   - Each test should complete in <1ms
   - No async operations (unless testing async pure functions)

3. **Comprehensive Coverage**
   - Happy path
   - Edge cases (empty strings, null, undefined)
   - Error cases (invalid input)
   - Boundary conditions (min/max values)

4. **Deterministic**
   - No random data (use seeded generators)
   - No current date/time (use fixed dates)
   - No external dependencies

5. **Use Test Factories**
   ```typescript
   import { createCard } from '@/tests/helpers/factories'
   
   const card = createCard({ status: 'done' })
   ```

## Critical Tests

### Round-trip Fidelity (Highest Priority)

**File:** `parsers/round-trip.test.ts`

These tests are **business-critical** because they ensure we never lose user data.

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
  
  it('updates only card status emojis', () => {
    const original = '# Project\n## Lane\n- ❗ Todo\nComment'
    const parsed = parseStatusMarkdown(original)
    
    // Change card status
    parsed.cards[0].status = 'done'
    
    const serialized = serializeProject(parsed)
    
    expect(serialized).toContain('- ✅ Todo') // Emoji updated
    expect(serialized).toContain('Comment')   // Comment preserved
  })
})
```

---

**Next:** Write integration tests in `integration/`
