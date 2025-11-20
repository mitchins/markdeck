# MarkDeck v0.2 Test Coverage Plan

**Author:** QE Lead  
**Date:** 2025-11-20  
**Status:** Active  
**Target:** 90%+ overall coverage, 95%+ core domain

---

## Coverage Overview

This document provides a **detailed, module-by-module coverage plan** aligned with MarkDeck v0.2's layered architecture.

### Coverage Formula

```
Coverage % = (Lines Executed by Tests / Total Lines of Code) × 100
```

### Coverage Targets by Layer

| Layer                      | Target | Min Acceptable | Current |
|----------------------------|--------|----------------|---------|
| **Core Domain (Total)**   | 95%    | 90%            | TBD     |
| - domain/validation.ts     | 100%   | 95%            | TBD     |
| - parsers/*                | 95%    | 90%            | TBD     |
| - services/*               | 95%    | 90%            | TBD     |
| - utils/*                  | 90%    | 85%            | TBD     |
| **Adapters (Total)**       | 90%    | 85%            | TBD     |
| - providers/*              | 90%    | 85%            | TBD     |
| - api/*                    | 85%    | 80%            | TBD     |
| - storage/*                | 85%    | 80%            | TBD     |
| **Application (Total)**    | 90%    | 85%            | TBD     |
| - state/*                  | 95%    | 90%            | TBD     |
| - hooks/*                  | 85%    | 80%            | TBD     |
| - use-cases/*              | 90%    | 85%            | TBD     |
| **UI (Total)**             | 85%    | 75%            | TBD     |
| - components/board/*       | 85%    | 75%            | TBD     |
| - components/drawers/*     | 80%    | 70%            | TBD     |
| - components/modals/*      | 80%    | 70%            | TBD     |
| - components/layout/*      | 85%    | 75%            | TBD     |
| **Config**                 | 90%    | 85%            | TBD     |
| **Overall Project**        | 90%    | 85%            | TBD     |

---

## Layer 1: Core Domain (95%+ Coverage)

### 1.1 Domain Validation (`src/core/domain/validation.ts`)

**Target: 100%**

**Complexity: Low**  
**Risk: Critical** (Data integrity depends on validation)

#### Test Requirements

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Valid Card schema passes                     | P0       | Positive validation     |
| Invalid Card (missing required fields)       | P0       | Negative validation     |
| Card with invalid status enum                | P0       | Enum validation         |
| Card with invalid URL in links               | P1       | URL validation          |
| Card with negative originalLine              | P1       | Number constraints      |
| Valid Swimlane schema passes                 | P0       | Positive validation     |
| Invalid Swimlane (empty ID)                  | P0       | String constraints      |
| Valid Project schema passes                  | P0       | Nested validation       |
| Project with invalid nested cards            | P0       | Nested error handling   |
| Edge case: Empty arrays                      | P1       | Boundary conditions     |
| Edge case: Very long strings (>1000 chars)   | P2       | Performance             |

**Test File:** `tests/unit/core/domain/validation.test.ts`

**Estimated Test Count:** 15-20 tests

---

### 1.2 Parsers (`src/core/parsers/`)

**Target: 95%**

**Complexity: High**  
**Risk: Critical** (Round-trip fidelity is business-critical)

#### 1.2.1 Markdown Parser (`markdown-parser.ts`)

**Target: 95%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Parse valid STATUS.md with all sections      | P0       | Happy path              |
| Parse file with single swimlane              | P0       | Minimal valid input     |
| Parse file with multiple swimlanes           | P0       | Multiple entities       |
| Parse file with nested H3 swimlanes          | P1       | Hierarchical parsing    |
| Parse file with no H1 title                  | P1       | Missing metadata        |
| Parse file with empty sections               | P1       | Edge cases              |
| Parse file with special characters in titles | P1       | Character encoding      |
| Parse file with Unicode emojis               | P0       | Emoji handling          |
| Parse extremely large file (1000+ cards)     | P2       | Performance             |
| Parse file with Windows line endings (CRLF)  | P2       | Cross-platform          |

**Test File:** `tests/unit/core/parsers/markdown-parser.test.ts`

**Estimated Test Count:** 12-15 tests

---

#### 1.2.2 Card Parser (`card-parser.ts`)

**Target: 95%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Parse card with status emoji (✅ ⚠️ ❗ ❌)   | P0       | Status detection        |
| Parse card with blocked emoji (❌)           | P0       | Blocked flag            |
| Parse card with multi-line description       | P0       | Description parsing     |
| Parse card with embedded links               | P0       | Link extraction         |
| Parse card with no description               | P1       | Optional fields         |
| Parse card with mixed emoji (blocked + status)| P0      | Multiple emojis         |
| Parse card with unknown emoji                | P1       | Error handling          |
| Parse card with very long title (>200 chars) | P2       | Validation              |
| Parse card with indented description (4 spaces)| P0     | Indentation rules       |
| Parse card with code blocks in description   | P2       | Markdown preservation   |

**Test File:** `tests/unit/core/parsers/card-parser.test.ts`

**Estimated Test Count:** 12-15 tests

---

#### 1.2.3 Swimlane Parser (`swimlane-parser.ts`)

**Target: 95%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Parse H2 swimlanes                           | P0       | H2 detection            |
| Parse H3 nested swimlanes                    | P1       | H3 detection            |
| Parse mixed H2 and H3                        | P1       | Hierarchy               |
| Parse swimlane with special characters       | P1       | Character handling      |
| Parse swimlane with emojis in title          | P1       | Unicode handling        |
| Generate stable IDs from titles              | P0       | ID generation           |
| Handle duplicate swimlane titles             | P1       | Collision handling      |
| Parse empty swimlane (no cards)              | P1       | Edge case               |

**Test File:** `tests/unit/core/parsers/swimlane-parser.test.ts`

**Estimated Test Count:** 10-12 tests

---

#### 1.2.4 Notes Parser (`notes-parser.ts`)

**Target: 90%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Parse notes sections (non-card content)      | P0       | Note extraction         |
| Parse comments (HTML comments)               | P1       | Comment preservation    |
| Parse custom sections (not H2/H3)            | P1       | Custom content          |
| Preserve formatting in notes                 | P1       | Formatting preservation |
| Parse notes with code blocks                 | P2       | Markdown preservation   |

**Test File:** `tests/unit/core/parsers/notes-parser.test.ts`

**Estimated Test Count:** 6-8 tests

---

#### 1.2.5 Markdown Serializer (`markdown-serializer.ts`)

**Target: 95%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Serialize project to markdown                | P0       | Happy path              |
| Update card status emoji                     | P0       | Emoji update            |
| Update blocked flag                          | P0       | Blocked emoji           |
| Preserve non-card content exactly            | P0       | Round-trip fidelity     |
| Update "Last Updated" timestamp              | P1       | Metadata update         |
| Insert new cards at end of swimlane          | P1       | Card insertion          |
| Remove deleted cards                         | P1       | Card deletion           |
| Handle card with updated description         | P0       | Description update      |
| Handle moved cards (status change)           | P0       | Status update           |
| Preserve original line numbers               | P1       | Line tracking           |

**Test File:** `tests/unit/core/parsers/markdown-serializer.test.ts`

**Estimated Test Count:** 12-15 tests

---

#### 1.2.6 Round-Trip Tests (`round-trip.test.ts`)

**Target: 100% (Critical)**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| **Parse → Serialize → Parse → Same result** | **P0**   | **Round-trip fidelity** |
| Preserve all non-card lines exactly          | P0       | Content preservation    |
| Preserve comments                            | P0       | Comment preservation    |
| Preserve custom sections                     | P0       | Section preservation    |
| Preserve whitespace and formatting           | P0       | Formatting preservation |
| Update only card status emojis               | P0       | Selective updates       |
| Handle large files (500+ cards)              | P1       | Performance             |
| Multiple round-trips (parse → serialize × 3) | P1       | Idempotence             |

**Test File:** `tests/unit/core/parsers/round-trip.test.ts`

**Estimated Test Count:** 10-12 tests

**Special Notes:**  
- These tests are **snapshot-based** to catch unintended changes
- Use real EXAMPLE-STATUS.md as fixture
- Create complex fixtures with edge cases

---

### 1.3 Services (`src/core/services/`)

**Target: 95%**

#### 1.3.1 Card Service (`card-service.ts`)

**Target: 95%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Create new card                              | P0       | CRUD - Create           |
| Move card to new status                      | P0       | CRUD - Update           |
| Update card title                            | P0       | CRUD - Update           |
| Update card description                      | P0       | CRUD - Update           |
| Toggle blocked flag                          | P0       | State toggle            |
| Delete card (if implemented)                 | P1       | CRUD - Delete           |
| Validate card before operations              | P0       | Validation              |
| Handle invalid status transition             | P1       | Error handling          |
| Ensure immutability (card not mutated)       | P0       | Immutability            |

**Test File:** `tests/unit/core/services/card-service.test.ts`

**Estimated Test Count:** 10-12 tests

---

#### 1.3.2 Swimlane Service (`swimlane-service.ts`)

**Target: 95%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Create new swimlane                          | P0       | CRUD - Create           |
| Reorder swimlanes                            | P1       | Order management        |
| Delete swimlane (move cards or error)        | P1       | CRUD - Delete           |
| Get cards in swimlane                        | P0       | Query                   |
| Validate swimlane operations                 | P1       | Validation              |

**Test File:** `tests/unit/core/services/swimlane-service.test.ts`

**Estimated Test Count:** 6-8 tests

---

#### 1.3.3 Sync Service (`sync-service.ts`)

**Target: 90%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Detect no conflicts (identical projects)     | P0       | Happy path              |
| Detect status change conflict                | P0       | Conflict detection      |
| Detect description change conflict           | P1       | Conflict detection      |
| Merge non-conflicting changes                | P0       | Merge logic             |
| Local change wins strategy                   | P1       | Conflict resolution     |
| Remote change wins strategy                  | P1       | Conflict resolution     |
| Three-way merge (base, local, remote)        | P2       | Advanced merge          |

**Test File:** `tests/unit/core/services/sync-service.test.ts`

**Estimated Test Count:** 8-10 tests

---

### 1.4 Utilities (`src/core/utils/`)

**Target: 90%**

#### 1.4.1 ID Generator (`id-generator.ts`)

**Target: 95%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Generate stable ID from title (slugify)      | P0       | ID generation           |
| Same title → same ID                         | P0       | Determinism             |
| Handle special characters                    | P0       | Character sanitization  |
| Handle duplicate IDs (add counter)           | P0       | Collision handling      |
| Handle empty string                          | P1       | Edge case               |
| Handle very long titles (>100 chars)         | P1       | Truncation              |
| Handle Unicode characters                    | P1       | Internationalization    |

**Test File:** `tests/unit/core/utils/id-generator.test.ts`

**Estimated Test Count:** 8-10 tests

---

#### 1.4.2 Emoji Mapper (`emoji-mapper.ts`)

**Target: 95%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Map status to emoji (todo → ❗)              | P0       | Status → Emoji          |
| Map emoji to status (✅ → done)              | P0       | Emoji → Status          |
| Handle unknown emoji                         | P1       | Error handling          |
| Detect blocked emoji (❌)                    | P0       | Blocked detection       |
| Bidirectional mapping consistency            | P0       | Round-trip              |

**Test File:** `tests/unit/core/utils/emoji-mapper.test.ts`

**Estimated Test Count:** 6-8 tests

---

#### 1.4.3 Date Formatter (`date-formatter.ts`)

**Target: 85%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Format date to ISO string                    | P0       | Formatting              |
| Parse ISO date string                        | P0       | Parsing                 |
| Handle invalid date strings                  | P1       | Error handling          |
| Format relative dates (e.g., "2 hours ago")  | P2       | Human-readable          |

**Test File:** `tests/unit/core/utils/date-formatter.test.ts`

**Estimated Test Count:** 5-6 tests

---

## Layer 2: Adapters (90%+ Coverage)

### 2.1 Providers (`src/adapters/providers/`)

**Target: 90%**

#### 2.1.1 Base Provider (`base-provider.ts`)

**Target: N/A (Interface only)**

No tests needed for TypeScript interfaces.

---

#### 2.1.2 File Provider (`file-provider.ts`)

**Target: 85%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Load returns content from context            | P0       | Load operation          |
| Load returns error if no content             | P1       | Error handling          |
| Save triggers browser download               | P0       | Save operation          |
| Save uses custom filename if provided        | P1       | Configuration           |
| isConfigured returns true (always)           | P1       | Configuration check     |

**Test File:** `tests/unit/adapters/providers/file-provider.test.ts`

**Estimated Test Count:** 6-8 tests

**Mocking Requirements:**
- Mock `document.createElement`, `URL.createObjectURL`

---

#### 2.1.3 GitHub Provider (`github-provider.ts`)

**Target: 90%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Load fetches file from GitHub API            | P0       | Load operation          |
| Load stores file SHA for later save          | P0       | State management        |
| Load returns error on 404                    | P0       | Error handling          |
| Load returns error on 403 (permissions)      | P1       | Error handling          |
| Load returns error on network timeout        | P2       | Error handling          |
| Save updates file with commit message        | P0       | Save operation          |
| Save returns error if no file SHA            | P1       | Validation              |
| Save returns error on 403 (permissions)      | P1       | Error handling          |
| isConfigured checks token, owner, repo       | P0       | Configuration check     |

**Test File:** `tests/integration/adapters/github-provider.test.ts` (Integration, uses MSW)

**Estimated Test Count:** 10-12 tests

**Mocking Requirements:**
- Use MSW to mock GitHub API
- Mock successful responses (200)
- Mock error responses (404, 403, 500)
- Mock network timeouts

---

#### 2.1.4 Static Provider (`static-provider.ts`)

**Target: 90%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Load returns demo data                       | P0       | Load operation          |
| Save returns error (read-only)               | P0       | Save restriction        |
| isConfigured returns true                    | P1       | Configuration check     |

**Test File:** `tests/unit/adapters/providers/static-provider.test.ts`

**Estimated Test Count:** 4-5 tests

---

### 2.2 API Clients (`src/adapters/api/`)

**Target: 85%**

#### 2.2.1 GitHub Client (`github-client.ts`)

**Target: 85%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| getFileContent fetches and decodes base64    | P0       | API call                |
| updateFile commits with base64 encoding      | P0       | API call                |
| listRepos returns user repositories          | P1       | API call                |
| Handles API errors gracefully                | P1       | Error handling          |

**Test File:** `tests/integration/adapters/api/github-client.test.ts` (Integration, uses MSW)

**Estimated Test Count:** 6-8 tests

---

### 2.3 Storage (`src/adapters/storage/`)

**Target: 85%**

#### 2.3.1 KV Storage (`kv-storage.ts`)

**Target: 85%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Wrapper around GitHub Spark KV               | P1       | Delegation              |
| Store and retrieve data                      | P0       | CRUD operations         |

**Test File:** `tests/unit/adapters/storage/kv-storage.test.ts`

**Estimated Test Count:** 4-5 tests

**Mocking Requirements:**
- Mock GitHub Spark KV

---

## Layer 3: Application (90%+ Coverage)

### 3.1 State Management (`src/application/state/`)

**Target: 95%**

#### 3.1.1 App Store (`app-store.ts`)

**Target: 95%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Initial state is correct                     | P0       | Initialization          |
| setProject updates project state             | P0       | Action                  |
| moveCard updates card status                 | P0       | Action                  |
| updateCard updates card fields               | P0       | Action                  |
| toggleBlocked toggles card blocked flag      | P0       | Action                  |
| setProviderType updates provider config      | P1       | Action                  |
| State updates are immutable                  | P0       | Immutability            |
| Persistence middleware saves to storage      | P1       | Middleware              |
| hasChanges flag updates correctly            | P0       | Computed state          |

**Test File:** `tests/integration/state-management.test.ts`

**Estimated Test Count:** 12-15 tests

---

### 3.2 Hooks (`src/application/hooks/`)

**Target: 85%**

#### Hooks to Test

- `use-project.ts`
- `use-cards.ts`
- `use-provider.ts`
- `use-ui.ts`

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| useProject returns project state             | P0       | State access            |
| useCards returns cards and actions           | P0       | State access            |
| useProvider creates provider instance        | P0       | Factory integration     |
| useUI returns UI state and actions           | P0       | State access            |
| Hooks trigger re-renders on state change     | P1       | React integration       |

**Test File:** `tests/integration/hooks.test.ts`

**Estimated Test Count:** 10-12 tests

**Testing Tool:** `@testing-library/react-hooks` or `renderHook` from RTL

---

### 3.3 Use Cases (`src/application/use-cases/`)

**Target: 90%**

#### 3.3.1 Load Project (`load-project.ts`)

**Target: 90%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Load project from provider → parse → validate → success | P0 | Happy path       |
| Load returns error if provider fails         | P0       | Error handling          |
| Load returns error if parsing fails          | P1       | Error handling          |
| Load returns error if validation fails       | P1       | Error handling          |

**Test File:** `tests/integration/use-cases.test.ts`

**Estimated Test Count:** 5-6 tests per use case

---

#### 3.3.2 Save Project (`save-project.ts`)

**Target: 90%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Save project: state → serialize → provider → success | P0 | Happy path         |
| Save returns error if serialization fails    | P1       | Error handling          |
| Save returns error if provider fails         | P0       | Error handling          |

**Test File:** `tests/integration/use-cases.test.ts`

**Estimated Test Count:** 4-5 tests per use case

---

## Layer 4: UI Components (85%+ Coverage)

### 4.1 Board Components (`src/ui/components/board/`)

**Target: 85%**

#### Components to Test

- `Board.tsx`
- `Swimlane.tsx`
- `Column.tsx`
- `Card.tsx`

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Board renders swimlanes                      | P0       | Rendering               |
| Board renders cards in correct columns       | P0       | Rendering               |
| Card displays title, status, blocked flag    | P0       | Rendering               |
| Card click triggers onCardClick              | P0       | Events                  |
| Drag-and-drop calls onCardDrop               | P1       | DnD (complex)           |
| Swimlane collapse/expand                     | P1       | Interaction             |
| Empty state displayed when no cards          | P1       | Edge case               |

**Test File:** `tests/integration/board-interactions.test.tsx`

**Estimated Test Count:** 15-20 tests

**Testing Tool:** React Testing Library + `@testing-library/user-event`

---

### 4.2 Drawer Components (`src/ui/components/drawers/`)

**Target: 80%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| CardDetailDrawer displays card details       | P0       | Rendering               |
| Edit card title and save                     | P0       | Form handling           |
| Edit card description and save               | P0       | Form handling           |
| Toggle blocked flag                          | P0       | Interaction             |
| Close drawer on save                         | P1       | Navigation              |

**Test File:** `tests/integration/card-drawer.test.tsx`

**Estimated Test Count:** 6-8 tests

---

### 4.3 Modal Components (`src/ui/components/modals/`)

**Target: 80%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| GitHubConnector displays form                | P0       | Rendering               |
| Submit GitHub credentials                    | P0       | Form submission         |
| Validate required fields                     | P1       | Validation              |
| ProviderSelector displays provider options   | P1       | Rendering               |

**Test File:** `tests/integration/modals.test.tsx`

**Estimated Test Count:** 6-8 tests

---

### 4.4 Layout Components (`src/ui/components/layout/`)

**Target: 85%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Header displays project title                | P0       | Rendering               |
| Header shows save button when hasChanges     | P0       | Conditional rendering   |
| Tabs switch between board/notes/raw          | P0       | Navigation              |

**Test File:** `tests/integration/layout.test.tsx`

**Estimated Test Count:** 6-8 tests

---

## Configuration (`src/config/`)

**Target: 90%**

| Test Case                                    | Priority | Coverage Area           |
|----------------------------------------------|----------|-------------------------|
| Provider factory creates correct provider    | P0       | Factory pattern         |
| Provider factory throws on unknown type      | P1       | Error handling          |
| Constants are correctly defined              | P1       | Smoke test              |

**Test File:** `tests/unit/config/provider-config.test.ts`

**Estimated Test Count:** 4-5 tests

---

## Test Count Summary

| Category                  | Estimated Tests | Actual Tests | Coverage % |
|---------------------------|-----------------|--------------|------------|
| Core Domain               | 80-100          | TBD          | TBD        |
| - Validation              | 15-20           | TBD          | TBD        |
| - Parsers                 | 50-60           | TBD          | TBD        |
| - Services                | 24-30           | TBD          | TBD        |
| - Utilities               | 19-25           | TBD          | TBD        |
| Adapters                  | 30-40           | TBD          | TBD        |
| - Providers               | 20-25           | TBD          | TBD        |
| - API Clients             | 6-8             | TBD          | TBD        |
| - Storage                 | 4-5             | TBD          | TBD        |
| Application               | 35-45           | TBD          | TBD        |
| - State Management        | 12-15           | TBD          | TBD        |
| - Hooks                   | 10-12           | TBD          | TBD        |
| - Use Cases               | 13-18           | TBD          | TBD        |
| UI Components             | 40-50           | TBD          | TBD        |
| - Board                   | 15-20           | TBD          | TBD        |
| - Drawers                 | 6-8             | TBD          | TBD        |
| - Modals                  | 6-8             | TBD          | TBD        |
| - Layout                  | 6-8             | TBD          | TBD        |
| - File                    | 4-6             | TBD          | TBD        |
| Config                    | 4-5             | TBD          | TBD        |
| **Total**                 | **189-240**     | **TBD**      | **TBD**    |

**E2E Tests:** ~10 critical path tests (not included in count above)

---

## Uncovered Areas (Acceptable Gaps)

The following areas are **excluded** from coverage targets:

1. **Third-party UI components** (shadcn/ui primitives)
2. **Configuration files** (Vite, Tailwind, TypeScript config)
3. **Type-only files** (.d.ts files)
4. **Demo/fixture data**
5. **Error boundary components** (simple pass-through)
6. **Main entry point** (main.tsx - just bootstrapping)

---

## Coverage Monitoring

### Tools

- **Vitest Coverage:** Built-in coverage via `v8` or `istanbul`
- **SonarCloud:** Cloud-based code quality and coverage tracking
- **Codecov (optional):** Additional coverage visualization

### CI/CD Integration

```yaml
# .github/workflows/coverage.yml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload to SonarCloud
  uses: SonarSource/sonarcloud-github-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Coverage Reports

- **HTML Report:** `coverage/index.html` (local development)
- **LCOV:** `coverage/lcov.info` (for CI tools)
- **JSON:** `coverage/coverage-final.json` (for analysis)

---

## Coverage Improvement Plan

### Phase 1: Core Domain (Week 1)
**Goal:** Achieve 95%+ coverage on core domain

- Write all parser tests
- Write all service tests
- Write all utility tests
- Achieve round-trip test coverage

**Success Metric:** Core domain coverage ≥95%

---

### Phase 2: Adapters (Week 2)
**Goal:** Achieve 90%+ coverage on adapters

- Write provider tests (with MSW)
- Write GitHub client tests
- Write storage tests

**Success Metric:** Adapters coverage ≥90%

---

### Phase 3: Application Layer (Week 2-3)
**Goal:** Achieve 90%+ coverage on application layer

- Write state management tests
- Write hook tests
- Write use case tests

**Success Metric:** Application coverage ≥90%

---

### Phase 4: UI Components (Week 3)
**Goal:** Achieve 85%+ coverage on UI

- Write board component tests
- Write drawer/modal tests
- Write layout tests

**Success Metric:** UI coverage ≥85%

---

### Phase 5: E2E Tests (Week 3)
**Goal:** Cover critical user journeys

- Local mode workflow
- GitHub mode workflow
- Drag-and-drop interactions

**Success Metric:** All critical paths covered

---

## Maintaining Coverage

### Rules for New Code

1. **No PR merges without tests** for new features
2. **Coverage must not decrease** from baseline
3. **Core domain code requires tests** before PR approval
4. **Regression tests required** for all bug fixes

### Quarterly Review

- Review coverage reports
- Identify low-coverage modules
- Add tests to bring coverage up
- Remove flaky or obsolete tests

---

## Appendix: Coverage Configuration

### Vitest Coverage Config

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'src/ui/primitives/', // shadcn/ui components
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
})
```

---

**Status:** Ready for implementation  
**Next Steps:** Begin Phase 1 (Core Domain tests)

