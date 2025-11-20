# Test Fixtures

Test data files used across the test suite.

## Files

### `valid-status.md`

Standard, well-formed STATUS.md file for testing happy paths.

**Contains:**
- H1 title
- Metadata (Last Updated, Version)
- Multiple swimlanes (H2 and H3)
- Cards with all status emojis (✅ ⚠️ ❗ ❌)
- Multi-line descriptions
- Embedded links
- Blocked cards
- Notes sections
- Comments

**Usage:**
```typescript
import { readFileSync } from 'fs'

const validMarkdown = readFileSync('./tests/fixtures/valid-status.md', 'utf-8')
const parsed = parseStatusMarkdown(validMarkdown)
```

---

### `invalid-status.md`

Malformed markdown for testing error handling.

**Contains:**
- Missing H1 title
- Bullets without emojis
- Unknown emojis (not in status mapping)
- Empty sections
- Orphan cards (no swimlane)

**Usage:**
```typescript
const invalidMarkdown = readFileSync('./tests/fixtures/invalid-status.md', 'utf-8')

// Should handle gracefully, not crash
expect(() => parseStatusMarkdown(invalidMarkdown)).not.toThrow()
```

---

### `complex-status.md`

Edge cases and complex scenarios for round-trip testing.

**Contains:**
- Nested H3 swimlanes
- Custom sections (not H2/H3)
- HTML comments to preserve
- Mixed content (cards + notes)
- Special characters in titles
- Very long descriptions
- Multiple links per card

**Usage:**
```typescript
const complexMarkdown = readFileSync('./tests/fixtures/complex-status.md', 'utf-8')
const parsed = parseStatusMarkdown(complexMarkdown)
const serialized = serializeProject(parsed)

// Should preserve all non-card content
expect(extractNonCardLines(serialized)).toEqual(extractNonCardLines(complexMarkdown))
```

---

### `large-status.md`

Performance testing with 500+ cards.

**Contains:**
- 500 cards across 10 swimlanes
- Realistic data distribution

**Usage:**
```typescript
const largeMarkdown = readFileSync('./tests/fixtures/large-status.md', 'utf-8')

const start = performance.now()
const parsed = parseStatusMarkdown(largeMarkdown)
const duration = performance.now() - start

expect(duration).toBeLessThan(100) // <100ms
expect(parsed.cards.length).toBe(500)
```

---

### `mock-responses.ts`

TypeScript file with GitHub API mock responses.

**Contains:**
- `mockGetFileResponse` - GitHub GET file response
- `mockUpdateFileResponse` - GitHub PUT file response
- `mockListReposResponse` - GitHub list repos response
- `mockErrorResponse` - Various error responses (404, 403, 500)

**Usage:**
```typescript
import { mockGetFileResponse } from './tests/fixtures/mock-responses'

server.use(
  http.get('*/STATUS.md', () => {
    return HttpResponse.json(mockGetFileResponse)
  })
)
```

---

## Adding New Fixtures

1. Create new `.md` or `.ts` file in `fixtures/`
2. Document what it tests in this README
3. Use in relevant tests

**Example:**

```typescript
// fixtures/edge-case-status.md
# Edge Case Project
## Lane with 🔥 emoji in title
- ✅ Card with [broken link](invalid)
```

---

## Fixture Guidelines

1. **Keep fixtures realistic**
   - Based on real-world usage
   - Representative of actual STATUS.md files

2. **Document edge cases**
   - Explain what each fixture tests
   - Why it's important

3. **Version control**
   - Commit all fixtures
   - Don't generate dynamically (except large files)

4. **Minimal fixtures**
   - Don't add redundant fixtures
   - Combine related edge cases

5. **Update fixtures when format changes**
   - If markdown format changes, update fixtures
   - Run round-trip tests to verify

---

**Location:** `/tests/fixtures/`
